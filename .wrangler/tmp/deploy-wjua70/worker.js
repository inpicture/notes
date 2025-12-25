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
  async fetch(request) {
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
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }
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
