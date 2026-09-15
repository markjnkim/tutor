/* ============================================================
   TutorStore — shared localStorage for ALL Tutor apps.
   - One store: "tutorApp.v1"
   - Usernames are CASE-INSENSITIVE ("Robin" = "robin" = "ROBIN");
     the first spelling entered is kept as the display name.
   - Each user has per-app data: { history:[records], best }
   - Records include full per-question answers.
   - Deleting requires the caller to confirm; deleted data is
     archived in store.deleted, never silently erased.
   Apps: include with a script tag pointing at tutor-store.js
   before the app's own script.
   ============================================================ */
(function (global) {
  const KEY = "tutorApp.v1";

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.users) return s;
    } catch (e) {}
    return { users: {}, deleted: [], lastUser: null };
  }
  let store = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(store)); }
  function keyOf(name) { return String(name || "").trim().toLowerCase(); }

  /* ---- one-time migration from the old pandaMath.v1 store ----
     Merges case-variant names (e.g. "Robin" + "robin") into one user. */
  (function migrate() {
    let old = null;
    try { old = JSON.parse(localStorage.getItem("pandaMath.v1")); } catch (e) {}
    if (!old || !old.users) return;
    Object.entries(old.users).forEach(([name, u]) => {
      const k = keyOf(name);
      if (!k) return;
      const usr = store.users[k] = store.users[k] ||
        { displayName: String(name).trim(), created: u.created || new Date().toISOString(), apps: {} };
      const app = usr.apps["panda-math"] = usr.apps["panda-math"] || { history: [], best: 0 };
      app.history = app.history.concat(u.history || []);
      app.best = Math.max(app.best || 0, u.best || 0);
    });
    (old.deleted || []).forEach(d =>
      store.deleted.push({ name: d.name, app: "panda-math", deletedAt: d.deletedAt, data: d.data }));
    localStorage.removeItem("pandaMath.v1");
    save();
  })();

  const TutorStore = {
    keyOf,

    /* Log a user in (creates them if new). Case-insensitive. */
    login(name) {
      const k = keyOf(name);
      if (!k) return null;
      if (!store.users[k]) {
        store.users[k] = { displayName: String(name).trim(), created: new Date().toISOString(), apps: {} };
      }
      store.lastUser = k;
      save();
      return Object.assign({ key: k }, store.users[k]);
    },
    lastUser() { return store.lastUser && store.users[store.lastUser] ? store.lastUser : null; },
    exists(name) { return !!store.users[keyOf(name)]; },
    displayName(name) {
      const u = store.users[keyOf(name)];
      return u ? u.displayName : String(name || "").trim();
    },
    users() {
      return Object.entries(store.users).map(([k, u]) => ({ key: k, displayName: u.displayName }));
    },

    /* Per-app data for a user: { history:[], best } */
    app(name, appId) {
      const u = store.users[keyOf(name)];
      return (u && u.apps[appId]) || { history: [], best: 0 };
    },

    /* Save a test record. record.answers should hold the per-question detail. */
    saveResult(name, appId, record) {
      const k = keyOf(name);
      if (!store.users[k]) this.login(name);
      const u = store.users[k];
      const app = u.apps[appId] = u.apps[appId] || { history: [], best: 0 };
      record.date = record.date || new Date().toISOString();
      app.history.push(record);
      if (typeof record.pct === "number") app.best = Math.max(app.best || 0, record.pct);
      save();
      return app;
    },

    /* Set a persistent app-level field for a user (e.g. cumulative XP). */
    setAppField(name, appId, key, value) {
      const k = keyOf(name);
      if (!store.users[k]) this.login(name);
      const u = store.users[k];
      const app = u.apps[appId] = u.apps[appId] || { history: [], best: 0 };
      app[key] = value;
      save();
      return app;
    },

    /* All records for an app across every user (for leaderboards). */
    allResults(appId) {
      const out = [];
      Object.values(store.users).forEach(u => {
        (((u.apps || {})[appId] || {}).history || []).forEach(h =>
          out.push(Object.assign({ name: u.displayName }, h)));
      });
      return out;
    },

    /* Delete individual test records rather than a whole app's history.
       `dates` is a list of record.date values (each record's unique stamp).
       Removed records are archived exactly like a full delete, so nothing
       disappears silently. Returns how many were removed. */
    deleteResults(name, appId, dates) {
      const k = keyOf(name);
      const u = store.users[k];
      if (!u || !u.apps[appId]) return 0;
      const want = new Set(dates || []);
      if (!want.size) return 0;
      const app = u.apps[appId];
      const keep = [], drop = [];
      (app.history || []).forEach(h => (want.has(h.date) ? drop : keep).push(h));
      if (!drop.length) return 0;
      store.deleted.push({
        name: u.displayName, app: appId, deletedAt: new Date().toISOString(),
        partial: true, data: { history: drop, best: app.best || 0 }
      });
      app.history = keep;
      // Best score must be recomputed — the deleted run may have held it.
      app.best = keep.reduce((m, h) => Math.max(m, typeof h.pct === "number" ? h.pct : 0), 0);
      save();
      return drop.length;
    },

    /* Archive-then-remove. appId limits deletion to one app's data. */
    deleteUser(name, appId) {
      const k = keyOf(name);
      const u = store.users[k];
      if (!u) return false;
      if (appId) {
        if (u.apps[appId]) {
          store.deleted.push({ name: u.displayName, app: appId, deletedAt: new Date().toISOString(), data: u.apps[appId] });
          delete u.apps[appId];
        }
        if (!Object.keys(u.apps).length) delete store.users[k];
      } else {
        store.deleted.push({ name: u.displayName, app: "all apps", deletedAt: new Date().toISOString(), data: u });
        delete store.users[k];
      }
      if (store.lastUser === k && !store.users[k]) store.lastUser = null;
      save();
      return true;
    },
    deleted() { return store.deleted.slice(); },

    _raw() { return store; }
  };

  global.TutorStore = TutorStore;
})(typeof window !== "undefined" ? window : globalThis);
