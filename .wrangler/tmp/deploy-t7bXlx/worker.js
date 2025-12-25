var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.js
var NotesBackend = class {
  static {
    __name(this, "NotesBackend");
  }
  constructor(state, env) {
    this.state = state;
    this.sessions = /* @__PURE__ */ new Set();
    this.notes = [];
    this.state.blockConcurrencyWhile(async () => {
      let stored = await this.state.storage.get("notes");
      this.notes = stored || [];
    });
  }
  // Handle HTTP requests for Auth and WebSocket upgrades
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname.startsWith("/auth/")) {
      const body = await request.json();
      const users = await this.state.storage.get("users") || {};
      if (url.pathname === "/auth/signup") {
        const { email, password, name, avatar } = body;
        if (users[email] && users[email].verified) return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
        const code = Math.floor(1e5 + Math.random() * 9e5).toString();
        users[email] = { password, code, verified: false, created: Date.now(), name: name || "Explorer", avatar: avatar || "\u{1F331}", saved: [] };
        await this.state.storage.put("users", users);
        return new Response(JSON.stringify({ success: true, debug_code: code }));
      }
      if (url.pathname === "/auth/verify") {
        const { email, code } = body;
        if (!users[email]) return new Response(JSON.stringify({ error: "User not found" }), { status: 400 });
        if (users[email].code !== code) return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400 });
        users[email].verified = true;
        delete users[email].code;
        await this.state.storage.put("users", users);
        return new Response(JSON.stringify({ success: true, user: { email, name: users[email].name, avatar: users[email].avatar, saved: users[email].saved || [] } }));
      }
      if (url.pathname === "/auth/login") {
        const { email, password } = body;
        const user = users[email];
        if (!user || !user.verified || user.password !== password) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        return new Response(JSON.stringify({ success: true, user: { email, name: user.name, avatar: user.avatar, saved: user.saved || [] } }));
      }
    }
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Not found", { status: 404 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.sessions.add(server);
    server.send(JSON.stringify({ type: "SYNC_ALL", notes: this.notes }));
    server.addEventListener("message", async (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "CREATE") this.notes.push(data.note);
      if (data.type === "UPDATE") this.notes = this.notes.map((n) => n.id === data.id ? { ...n, ...data.updates } : n);
      if (data.type === "DELETE") this.notes = this.notes.filter((n) => n.id !== data.id);
      await this.state.storage.put("notes", this.notes);
      this.sessions.forEach((s) => {
        if (s !== server && s.readyState === 1) s.send(msg.data);
      });
    });
    server.addEventListener("close", () => this.sessions.delete(server));
    return new Response(null, { status: 101, webSocket: client });
  }
};
var worker_default = {
  async fetch(request, env) {
    const id = env.NOTES_ROOM.idFromName("global");
    const stub = env.NOTES_ROOM.get(id);
    return stub.fetch(request);
  }
};
export {
  NotesBackend,
  worker_default as default
};
//# sourceMappingURL=worker.js.map
