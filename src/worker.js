
export class NotesBackend {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Set();
    this.notes = [];
    // Load from storage on startup
    this.state.blockConcurrencyWhile(async () => {
      let stored = await this.state.storage.get("notes");
      this.notes = stored || [];
    });
  }

  // Handle HTTP requests for Auth and WebSocket upgrades
  async fetch(request) {
    const url = new URL(request.url);

    // --- AUTH ENDPOINTS ---
    if (request.method === "POST" && url.pathname.startsWith("/auth/")) {
      const body = await request.json();
      const users = await this.state.storage.get("users") || {};

      if (url.pathname === "/auth/signup") {
        const { email, password, name, avatar } = body;
        if (users[email] && users[email].verified) return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
        
        // Generate Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        users[email] = { password, code, verified: false, created: Date.now(), name: name || "Explorer", avatar: avatar || "🌱", saved: [] };
        await this.state.storage.put("users", users);
        
        // RESEND.COM API SENDING
        try {
            await this.sendViaResend(email, code);
            return new Response(JSON.stringify({ success: true })); 
        } catch (e) { return new Response(JSON.stringify({ error: "Email failed: " + e.message }), { status: 500 }); }
      }

      if (url.pathname === "/auth/verify") {
        const { email, code } = body;
        if (!users[email]) return new Response(JSON.stringify({ error: "User not found" }), { status: 400 });
        if (users[email].code !== code) return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400 });
        
        users[email].verified = true;
        delete users[email].code; // Remove code after use
        await this.state.storage.put("users", users);
        return new Response(JSON.stringify({ success: true, user: { email, name: users[email].name, avatar: users[email].avatar, saved: users[email].saved || [] } }));
      }

      if (url.pathname === "/auth/login") {
        const { email, password } = body;
        const user = users[email];
        if (!user || !user.verified || user.password !== password) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        return new Response(JSON.stringify({ success: true, user: { email, name: user.name, avatar: user.avatar, saved: user.saved || [] } }));
      }

      if (url.pathname === "/auth/update") {
        const { email, updates } = body;
        if (!users[email]) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        if (updates.name) users[email].name = updates.name;
        await this.state.storage.put("users", users);
        return new Response(JSON.stringify({ success: true }));
      }
    }

    // --- WEBSOCKET ---
    if (request.headers.get("Upgrade") !== "websocket") {
        // If not auth and not websocket, 404
        return new Response("Not found", { status: 404 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    
    server.accept();
    this.sessions.add(server);

    // Send initial state
    server.send(JSON.stringify({ type: 'SYNC_ALL', notes: this.notes }));

    server.addEventListener('message', async msg => {
      const data = JSON.parse(msg.data);
      
      // Update local state
      if (data.type === 'CREATE') this.notes.push(data.note);
      if (data.type === 'UPDATE') this.notes = this.notes.map(n => n.id === data.id ? { ...n, ...data.updates } : n);
      if (data.type === 'DELETE') this.notes = this.notes.filter(n => n.id !== data.id);

      // Save to Durable Object Storage
      await this.state.storage.put("notes", this.notes);

      // Broadcast to others
      this.sessions.forEach(s => {
        if (s !== server && s.readyState === 1) s.send(msg.data);
      });
    });

    server.addEventListener('close', () => this.sessions.delete(server));
    return new Response(null, { status: 101, webSocket: client });
  }

  async sendViaResend(to, code) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_FnjXRdQC_Mqa6GvYQ31e2DnXk56nKPqBd',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: to,
        subject: 'Leaf Notes Verification Code',
        html: `<div style="font-family:sans-serif; padding:20px; text-align:center;"><h1>Welcome to Leaf Notes</h1><p>Your code is:</p><h2 style="background:#f0fdf4; color:#166534; display:inline-block; padding:10px 20px; border-radius:10px;">${code}</h2></div>`
      })
    });
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error("Resend API Error: " + text);
    }
  }
}

export default {
  async fetch(request, env) {
    // Route everyone to the same "global" room for this demo
    const id = env.NOTES_ROOM.idFromName("global");
    const stub = env.NOTES_ROOM.get(id);
    return stub.fetch(request);
  }
};
