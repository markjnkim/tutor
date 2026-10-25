/* ============================================================
   TutorNav — shared sidebar navigation for all Tutor apps.

   Include with a script tag after tutor-store.js. The sidebar
   builds itself; no markup needed in the host page.

     TutorNav.init({ app: "panda-math" });

   The `app` id must match the APP_ID the page uses, so the nav
   can mark the current app and link to the others. Depth is
   detected automatically, so a page in tests/ resolves links
   through ../ without being told.
   ============================================================ */
(function (global) {

  // The registry every app appears in. Add a row here and the
  // link shows up in every sidebar automatically.
  const APPS = [
    { id: "home",        label: "Home",          icon: "🏠", href: "index.html" },
    { id: "panda-math",  label: "Panda Math",    icon: "🐼", href: "panda-math.html",
      sub: "Grades 2–8" },
    { id: "spelling",    label: "Spelling Bee",  icon: "🐝", href: "spelling-bee.html",
      sub: "Grades 3–8" },
    { id: "geometry",    label: "Shape Quest",   icon: "📐", href: "geometry.html",
      sub: "Geometry, step by step" },
    { id: "watts-up",    label: "Watt’s Up",     icon: "⚡", href: "watts-up.html",
      sub: "SciOly circuits practice" },
    { id: "typing",      label: "Wind Courier",  icon: "🕊️", href: "typing.html",
      sub: "Learn to type" },
    { id: "korean",      label: "한글 Adventure", icon: "🌿", href: "korean.html",
      sub: "Learn to read Korean" },
    { id: "math7",       label: "Math Grade 7",  icon: "🧮", href: "tests/daily-test-2026-05-23-math7.html",
      sub: "Daily test" }
  ];

  const CSS = `
  #tnav-toggle{position:fixed; top:14px; left:14px; z-index:120; width:44px; height:44px;
    border:none; border-radius:12px; background:#4a8f3c; color:#fff; font-size:1.25rem;
    cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,.25); line-height:1; padding:0;}
  #tnav-toggle:hover{background:#2e6323;}
  #tnav-scrim{position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:118; opacity:0;
    pointer-events:none; transition:opacity .25s;}
  #tnav-scrim.open{opacity:1; pointer-events:auto;}
  #tnav{position:fixed; top:0; left:0; bottom:0; width:240px; z-index:119;
    background:#2e6323; color:#fff; transform:translateX(-100%); transition:transform .25s;
    overflow-y:auto; box-shadow:2px 0 12px rgba(0,0,0,.2);
    font-family:"Trebuchet MS","Comic Sans MS",Verdana,sans-serif;}
  #tnav.open{transform:translateX(0);}
  #tnav .tnav-head{padding:20px 18px 14px; border-bottom:1px solid rgba(255,255,255,.18);}
  #tnav .tnav-title{font-size:1.15rem; font-weight:bold; display:flex; align-items:center; gap:8px;}
  #tnav .tnav-who{font-size:.78rem; opacity:.8; margin-top:6px;}
  #tnav .tnav-list{padding:10px 0;}
  #tnav a{display:flex; align-items:center; gap:11px; padding:12px 18px; color:#fff;
    text-decoration:none; font-size:.95rem; border-left:4px solid transparent;}
  #tnav a:hover{background:rgba(255,255,255,.12);}
  #tnav a.current{background:rgba(255,255,255,.18); border-left-color:#f5c542; font-weight:bold;}
  #tnav a .tnav-ico{font-size:1.25rem; width:26px; text-align:center; flex-shrink:0;}
  #tnav a .tnav-sub{display:block; font-size:.7rem; opacity:.72; font-weight:normal;}
  #tnav a.current .tnav-here{font-size:.66rem; background:#f5c542; color:#4a3800;
    border-radius:999px; padding:2px 7px; margin-left:auto; flex-shrink:0;}
  #tnav .tnav-foot{padding:14px 18px; font-size:.7rem; opacity:.65;
    border-top:1px solid rgba(255,255,255,.18); margin-top:8px;}
  @media (max-width:640px){ #tnav{width:82%; max-width:280px;} }
  @media print{ #tnav, #tnav-toggle, #tnav-scrim{display:none !important;} }
  `;

  /* Pages live at the repo root except the ones under tests/.
     Work out the prefix from the current path rather than hardcoding it. */
  function prefix() {
    const parts = location.pathname.split("/").filter(Boolean);
    // drop the filename, then count remaining folders below the repo root
    const inTests = parts.length >= 2 && parts[parts.length - 2] === "tests";
    return inTests ? "../" : "";
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  const TutorNav = {
    init(opts) {
      opts = opts || {};
      const current = opts.app || "";
      if (document.getElementById("tnav")) return;   // already mounted

      const style = document.createElement("style");
      style.textContent = CSS;
      document.head.appendChild(style);

      const p = prefix();

      const toggle = document.createElement("button");
      toggle.id = "tnav-toggle";
      toggle.setAttribute("aria-label", "Open navigation menu");
      toggle.textContent = "☰";

      const scrim = document.createElement("div");
      scrim.id = "tnav-scrim";

      const nav = document.createElement("nav");
      nav.id = "tnav";
      nav.setAttribute("aria-label", "Tutor apps");

      // Show who's signed in, when the store knows.
      let who = "";
      try {
        if (global.TutorStore) {
          const k = TutorStore.lastUser && TutorStore.lastUser();
          if (k) who = "👤 " + TutorStore.displayName(k);
        }
      } catch (e) {}

      const links = APPS.map(a => {
        const isCur = a.id === current;
        return `<a href="${p}${a.href}" class="${isCur ? "current" : ""}"
                   ${isCur ? 'aria-current="page"' : ""}>
                  <span class="tnav-ico">${a.icon}</span>
                  <span>${esc(a.label)}${a.sub ? `<span class="tnav-sub">${esc(a.sub)}</span>` : ""}</span>
                  ${isCur ? '<span class="tnav-here">HERE</span>' : ""}
                </a>`;
      }).join("");

      nav.innerHTML = `
        <div class="tnav-head">
          <div class="tnav-title">🎓 Tutor</div>
          <div class="tnav-who" id="tnav-who">${esc(who)}</div>
        </div>
        <div class="tnav-list">${links}</div>
        <div class="tnav-foot">Progress is saved per name on this computer.</div>`;

      document.body.appendChild(scrim);
      document.body.appendChild(nav);
      document.body.appendChild(toggle);

      const open  = () => { nav.classList.add("open"); scrim.classList.add("open"); };
      const close = () => { nav.classList.remove("open"); scrim.classList.remove("open"); };
      toggle.addEventListener("click", () => {
        nav.classList.contains("open") ? close() : open();
      });
      scrim.addEventListener("click", close);
      document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

      this._close = close;
    },

    /* Apps call this after login so the sidebar shows the current player. */
    setUser(name) {
      const el = document.getElementById("tnav-who");
      if (el) el.textContent = name ? "👤 " + name : "";
    }
  };

  global.TutorNav = TutorNav;
})(typeof window !== "undefined" ? window : globalThis);
