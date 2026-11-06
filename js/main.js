(function () {
  const data = window.PORTFOLIO || { tools: [], categories: [] };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const body = document.body;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = n => String(n).padStart(2, "0");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function addHandles(scope) {
    $$("[data-handles]", scope).forEach(el => {
      if (el.querySelector(":scope > .h")) return;
      const order = el.dataset.handles === "4" ? [1, 3, 5, 7] : [1, 2, 3, 4, 5, 6, 7, 8];
      order.forEach((n, i) => {
        const h = document.createElement("i");
        h.className = "h h-" + n;
        h.style.setProperty("--hi", i);
        h.setAttribute("aria-hidden", "true");
        el.appendChild(h);
      });
    });
  }

  function ytId(url) {
    if (!url) return null;
    const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
    return m ? m[1] : null;
  }
  function vimeoId(url) {
    const m = String(url || "").match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  }
  const isFile = url => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url || "");

  function renderTools() {
    const ul = $("#tools");
    if (!ul) return;
    ul.innerHTML = data.tools.map(t => `
      <li class="tool">
        <span class="tool-ico${t.icon ? " has-img" : ""}" aria-hidden="true">${t.icon ? `<img src="${esc(t.icon)}" alt="" data-mark="${esc(t.mark)}">` : esc(t.mark)}</span>
        <span class="tool-name">${esc(t.name)}</span>
      </li>`).join("");
    $$("img[data-mark]", ul).forEach(img => img.addEventListener("error", () => {
      if (/\.svg$/i.test(img.src)) { img.src = img.src.replace(/\.svg$/i, ".png"); return; }
      const box = img.parentNode;
      box.classList.remove("has-img");
      box.textContent = img.dataset.mark;
    }));
  }

  const folderSvg = `<svg class="folder" viewBox="0 0 24 20" aria-hidden="true"><rect class="paper" x="4.5" y="4.5" width="15" height="9" rx=".5"/><path d="M2 3.5c0-.8.7-1.5 1.5-1.5h5l2 2.2h10c.8 0 1.5.7 1.5 1.5V17c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3.5Z"/><path class="flap" d="M2 18 4 8.5h18L22 18"/></svg>`;
  const playSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17L20.5 12 6 3.5Z"/></svg>`;
  const arrowSvg = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>`;

  function cardHTML(cat, item, i) {
    const id = ytId(item.video);
    const thumb = item.thumb || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
    const fill = thumb
      ? `<img src="${esc(thumb)}" alt="" loading="lazy" decoding="async">`
      : (item.preview && isFile(item.preview) ? `<video src="${esc(item.preview)}" muted loop playsinline preload="none" data-preview></video>` : "");
    const code = `${cat.code}-${pad(i + 1)}`;
    const tail = item.video
      ? `<a class="card-arrow" href="${esc(item.video)}" target="_blank" rel="noopener" aria-label="Watch ${esc(item.title)} on YouTube">${arrowSvg}</a>`
      : cat.layout === "motion"
        ? `<span class="card-arrow" aria-hidden="true">${arrowSvg}</span>`
        : `<span class="card-meta">${esc(item.meta || "")}</span>`;
    return `
      <article class="card" style="--i:${i}" data-cat="${esc(cat.id)}" data-index="${i}">
        <button class="card-play" type="button" aria-label="Play ${esc(item.title)}">
        <span class="media">
          <span class="media-fill" style="--fx:${(i * 97) % 360}px;--fy:${(i * 53) % 360}px">${fill}</span>
          <span class="brk tl"></span><span class="brk tr"></span><span class="brk bl"></span><span class="brk br"></span>
          <span class="chip chip-code">${code}</span>
          <span class="chip chip-rec">Play</span>
          <span class="chip chip-ratio">${esc(cat.ratio)}</span>
          <span class="play">${playSvg}</span>
        </span>
        </button>
        <span class="card-info">
          <span class="card-title">${esc(item.title)}</span>
          ${tail}
          <span class="card-desc">${esc(item.description || "")}</span>
        </span>
      </article>`;
  }

  const tabsEl = $("#tabs");
  const panelsEl = $("#panels");
  let current = 0;
  let switching = false;

  function renderWork() {
    if (!tabsEl || !panelsEl) return;
    tabsEl.innerHTML = data.categories.map((c, i) => `
      <button class="tab" role="tab" id="tab-${esc(c.id)}" aria-controls="panel-${esc(c.id)}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
        ${folderSvg}
        <span class="tab-code">${esc(c.code)}</span>
        <span>${esc(c.label)}</span>
        <span class="tab-n">${pad(c.items.length)}</span>
      </button>`).join("");
    panelsEl.innerHTML = data.categories.map((c, i) => `
      <div class="panel grid-${esc(c.layout)}" role="tabpanel" id="panel-${esc(c.id)}" aria-labelledby="tab-${esc(c.id)}" ${i === 0 ? "" : "hidden"}>
        ${c.items.map((it, k) => cardHTML(c, it, k)).join("")}
      </div>`).join("");
    $("#count-all").textContent = pad(data.categories.length);
    updateFoot();
  }

  function updateFoot() {
    const c = data.categories[current];
    $("#count-now").textContent = pad(current + 1);
    $("#progress").style.setProperty("--p", (current + 1) / data.categories.length);
    $("#cat-now").textContent = `${c.code} — ${c.label} · ${c.ratio} · ${pad(c.items.length)} files`;
  }

  function selectTab(i, focus) {
    const n = data.categories.length;
    i = (i + n) % n;
    if (i === current || switching) return;
    const tabs = $$(".tab", tabsEl);
    const panels = $$(".panel", panelsEl);
    tabs.forEach((t, k) => {
      t.setAttribute("aria-selected", k === i);
      t.tabIndex = k === i ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    tabs[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
    const out = panels[current];
    const inn = panels[i];
    current = i;
    updateFoot();
    const swap = () => {
      out.hidden = true;
      out.classList.remove("is-leaving");
      inn.hidden = false;
      $$(".card", inn).forEach(c => { c.style.animation = "none"; c.offsetHeight; c.style.animation = ""; });
      switching = false;
    };
    if (reduced) return swap();
    switching = true;
    panelsEl.style.minHeight = out.offsetHeight + "px";
    out.classList.add("is-leaving");
    setTimeout(() => { swap(); panelsEl.style.minHeight = ""; }, 280);
  }

  function bindWork() {
    if (!tabsEl) return;
    tabsEl.addEventListener("click", e => {
      const t = e.target.closest(".tab");
      if (t) selectTab(+t.dataset.i);
    });
    tabsEl.addEventListener("keydown", e => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (keys[e.key]) { e.preventDefault(); selectTab(current + keys[e.key], true); }
      if (e.key === "Home") { e.preventDefault(); selectTab(0, true); }
      if (e.key === "End") { e.preventDefault(); selectTab(data.categories.length - 1, true); }
    });
    $("#prev").addEventListener("click", () => selectTab(current - 1));
    $("#next").addEventListener("click", () => selectTab(current + 1));
    panelsEl.addEventListener("click", e => {
      const card = e.target.closest(".card-play") && e.target.closest(".card");
      if (!card) return;
      const cat = data.categories.find(c => c.id === card.dataset.cat);
      openPlayer(cat, cat.items[+card.dataset.index], +card.dataset.index, card);
    });
    panelsEl.addEventListener("pointerover", e => {
      const v = e.target.closest(".card") && e.target.closest(".card").querySelector("video[data-preview]");
      if (v) v.play().catch(() => {});
    });
    panelsEl.addEventListener("pointerout", e => {
      const card = e.target.closest(".card");
      if (!card || card.contains(e.relatedTarget)) return;
      const v = card.querySelector("video[data-preview]");
      if (v) v.pause();
    });
  }

  const player = $("#player");
  const plFrame = $("#pl-frame");
  let lastFocus = null;

  function openPlayer(cat, item, i, from) {
    lastFocus = from || document.activeElement;
    const vertical = cat.ratio === "9:16";
    player.classList.toggle("is-vertical", vertical);
    $("#pl-code").textContent = `${cat.code}-${pad(i + 1)} / ${cat.label}`;
    $("#pl-title").textContent = item.title;
    $("#pl-desc").textContent = item.description || "";
    const yt = ytId(item.video);
    const vm = vimeoId(item.video);
    let html;
    if (yt) {
      html = `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(item.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else if (vm) {
      html = `<iframe src="https://player.vimeo.com/video/${vm}?autoplay=1" title="${esc(item.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    } else if (isFile(item.video)) {
      html = `<video src="${esc(item.video)}" controls autoplay playsinline></video>`;
    } else if (item.video) {
      html = `<div class="player-empty"><b>${esc(item.title)}</b><a class="btn" href="${esc(item.video)}" target="_blank" rel="noopener" style="margin:12px auto 0">Watch ${arrowSvg}</a></div>`;
    } else {
      html = `<div class="player-empty"><b>Coming soon</b><span class="mono">Video link not added yet</span></div>`;
    }
    plFrame.innerHTML = html;
    player.hidden = false;
    body.style.overflow = "hidden";
    $(".player-close", player).focus();
  }

  function closePlayer() {
    if (player.hidden) return;
    player.hidden = true;
    plFrame.innerHTML = "";
    body.style.overflow = "";
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function bindPlayer() {
    player.addEventListener("click", e => { if (e.target.closest("[data-close]")) closePlayer(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { closePlayer(); setMenu(false); }
      if (e.key === "Tab" && !player.hidden) {
        const f = $$("button, a, iframe, video", player).filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  const hdr = $("#hdr");
  const mark = $("#mark");
  const navInd = $(".nav-ind");
  const mobile = window.matchMedia("(max-width: 900px)");

  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    mark.setAttribute("aria-expanded", open);
    mark.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    body.style.overflow = open ? "hidden" : "";
  }

  function moveIndicator() {
    const a = $(".nav a.is-active");
    if (!a || !navInd) return;
    navInd.style.setProperty("--l", a.offsetLeft + "px");
    navInd.style.setProperty("--w", a.offsetWidth + "px");
  }

  function setActive(id) {
    $$("[data-nav]").forEach(a => a.classList.toggle("is-active", a.dataset.nav === id));
    moveIndicator();
  }

  function bindNav() {
    mark.addEventListener("click", () => {
      if (mobile.matches) setMenu(!body.classList.contains("menu-open"));
      else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    $$("[data-nav], a[href^='#']").forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      const top = id === "home" ? 0 : target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      if (a.dataset.nav) setActive(a.dataset.nav);
    }));
    mobile.addEventListener("change", () => { if (!mobile.matches) setMenu(false); });

    const onScroll = () => hdr.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = $$("[data-section]");
    const spy = () => {
      const mid = window.innerHeight * 0.4;
      let id = "home";
      sections.forEach(s => { if (s.getBoundingClientRect().top <= mid) id = s.id; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = sections[sections.length - 1].id;
      if (!$(`.nav a.is-active[data-nav="${id}"]`)) setActive(id);
    };
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("resize", moveIndicator);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
    spy();
    moveIndicator();
  }

  function bindReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduced) { els.forEach(el => el.classList.add("in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(el => io.observe(el));
    setTimeout(() => els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); }), 50);
  }

  function bindCursor() {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reduced) return;
    const cur = $(".cursor");
    const dot = $(".cursor-dot");
    body.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
    window.addEventListener("pointermove", e => {
      x = e.clientX; y = e.clientY;
      if (!shown) { rx = x; ry = y; shown = true; cur.classList.remove("is-out"); }
      const t = e.target.closest && e.target.closest("a, button, .tool, .skills span");
      cur.classList.toggle("is-hover", !!t);
    }, { passive: true });
    document.addEventListener("pointerleave", () => { cur.classList.add("is-out"); shown = false; });
    const loop = () => {
      rx += (x - rx) * 0.35;
      ry += (y - ry) * 0.35;
      dot.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();

    const target = $("#target");
    const hero = $("#home");
    if (target && hero) {
      hero.addEventListener("pointermove", e => {
        const r = hero.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        target.style.setProperty("--tx", (dx * 26).toFixed(1) + "px");
        target.style.setProperty("--ty", (dy * 26).toFixed(1) + "px");
      });
    }
  }

  function bindClock() {
    const el = $("#clock");
    const tc = $("#tc");
    let fmt;
    try { fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }); } catch (e) { fmt = null; }
    const start = performance.now();
    const tick = () => {
      if (el && fmt) el.textContent = "IST " + fmt.format(new Date());
    };
    tick();
    setInterval(tick, 1000);
    if (tc && !reduced) {
      const loop = () => {
        const ms = performance.now() - start;
        const f = Math.floor(ms / (1000 / 25)) % 25;
        const s = Math.floor(ms / 1000);
        tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`;
        requestAnimationFrame(loop);
      };
      loop();
    }
  }

  function bindContact() {
    const email = data.email || "";
    const btn = $("#connect");
    const txt = $("#email-text");
    const copy = $("#copy");
    const state = $("#copy-state");
    if (btn && email) btn.href = "mailto:" + email;
    if (txt) txt.textContent = email;
    if (copy) copy.addEventListener("click", () => {
      const done = ok => { state.textContent = ok ? "Copied" : "Select"; setTimeout(() => state.textContent = "Copy", 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => done(true)).catch(() => { selectText(txt); done(false); });
      } else { selectText(txt); done(false); }
    });
  }
  function selectText(node) {
    const r = document.createRange();
    r.selectNodeContents(node);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }

  function renderPortrait() {
    if (!data.portrait) return;
    const m = $("#portrait-media");
    m.innerHTML = `<img src="${esc(data.portrait)}" alt="Portrait of ${esc(data.name || "Abhinaba Roy")}" loading="lazy">`;
  }

  function intro() {
    const loader = $(".loader");
    const count = $(".loader-count");
    const finish = () => {
      if (loader) loader.classList.add("done");
      body.classList.add("ready");
    };
    if (!loader || reduced) return finish();
    const dur = 1100;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(e * 100);
      count.textContent = String(v).padStart(3, "0");
      loader.style.setProperty("--p", v + "%");
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(finish, 180);
    };
    requestAnimationFrame(step);
    setTimeout(finish, 3000);
  }


  function bindTimeline() {
    const root = $("#tl");
    if (!root) return;
    const LEN = 30, FPS = 25;
    const tracks = [
      { id: "V3", kind: "video" }, { id: "V2", kind: "video" }, { id: "V1", kind: "video" },
      { id: "A1", kind: "audio" }, { id: "A2", kind: "audio" }, { id: "A3", kind: "audio" }
    ];
    const clips = [
      { track: "V3", s: 0, d: 5.6, label: "Video Layer 1" },
      { track: "V2", s: 5.2, d: 8, label: "Video Layer 2" },
      { track: "V1", s: 11.6, d: 7, label: "Video Layer 3" },
      { track: "V3", s: 20.3, d: 5.4, label: "Video Layer 4" },
      { track: "V2", s: 24.3, d: 5.7, label: "Video Layer 5" },
      { track: "A1", s: 0, d: 14.6, label: "Music 1" },
      { track: "A1", s: 15, d: 15, label: "Music 2" },
      { track: "A2", s: 15.4, d: 6.6, label: "SFX" },
      { track: "A3", s: 2, d: 28, label: "Voice Over" }
    ];
    const eye = '<svg viewBox="0 0 24 24"><g class="on"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></g><g class="off"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><path d="M4 20 20 4"/></g></svg>';
    const spk = '<svg viewBox="0 0 24 24"><path d="M4 9.5h4L13 5v14l-5-4.5H4z"/><g class="on"><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></g><g class="off"><path d="m16 9 5 6M21 9l-5 6"/></g></svg>';
    const wave = seed => {
      let bars = "";
      for (let i = 0; i < 240; i++) {
        const n = Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
        const env = 0.35 + 0.35 * Math.abs(Math.sin(i / 17 + seed)) + 0.3 * Math.abs(Math.sin(i / 5.3 + seed * 2));
        const h = Math.max(2, (0.25 + n * 0.75) * env * 40);
        bars += `<rect x="${i}" y="${(40 - h) / 2}" width="0.55" height="${h.toFixed(1)}"/>`;
      }
      return `<svg viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
    };
    const ruler = $("#tl-ruler");
    ruler.innerHTML = [0, 5, 10, 15, 20, 25, 30].map(t => `<span style="left:${t / LEN * 100}%">00:00:${pad(t)}:00</span>`).join("");
    const box = $("#tl-tracks");
    box.innerHTML = tracks.map(t => `
      <div class="tl-label${t.id === "V1" ? " is-sel" : ""}"><span>${t.id}</span><button type="button" aria-pressed="true" aria-label="${t.kind === "video" ? "Toggle" : "Mute"} track ${t.id}" data-toggle="${t.id}">${t.kind === "video" ? eye : spk}</button></div>
      <div class="tl-lane ${t.kind}${t.id === "V1" ? " v1" : ""}" data-track="${t.id}" data-kind="${t.kind}"></div>`).join("");
    const lanes = {};
    $$(".tl-lane", box).forEach(l => { lanes[l.dataset.track] = l; });
    const kindOf = id => tracks.find(t => t.id === id).kind;
    clips.forEach((c, i) => {
      const el = document.createElement("div");
      el.className = "tl-clip " + kindOf(c.track);
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `${c.label} clip on ${c.track}. Drag to move, or use arrow keys.`);
      el.innerHTML = "<i></i><i></i><i></i><i></i>" + (kindOf(c.track) === "audio" ? wave(i + 1) : `<span>${esc(c.label)}</span>`);
      c.el = el;
      place(c);
    });
    function place(c) {
      c.el.style.setProperty("--s", c.s);
      c.el.style.setProperty("--d", c.d);
      if (c.el.parentNode !== lanes[c.track]) lanes[c.track].appendChild(c.el);
    }
    const overlaps = c => clips.some(o => o !== c && o.track === c.track && c.s < o.s + o.d - 0.001 && o.s < c.s + c.d - 0.001);
    const snap = v => Math.round(v * FPS) / FPS;

    let t = 0, playing = false, last = 0;
    const head = $("#tl-head"), now = $("#tl-now");
    const tc = v => {
      const f = Math.round(v * FPS), s = Math.floor(f / FPS);
      return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f % FPS)}`;
    };
    $("#tl-total").textContent = tc(LEN);
    function seek(v) {
      t = Math.min(LEN, Math.max(0, v));
      head.style.setProperty("--t", t);
      now.textContent = tc(t);
      ruler.setAttribute("aria-valuenow", t.toFixed(2));
      ruler.setAttribute("aria-valuetext", tc(t));
    }
    function play(on) {
      playing = on;
      root.classList.toggle("is-playing", on);
      $("#tl-play").setAttribute("aria-label", on ? "Pause" : "Play");
      if (on) { if (t >= LEN) seek(0); last = performance.now(); requestAnimationFrame(tick); }
    }
    function tick(ts) {
      if (!playing) return;
      seek(t + (ts - last) / 1000);
      last = ts;
      if (t >= LEN) return play(false);
      requestAnimationFrame(tick);
    }
    const edges = () => [...new Set([0, LEN, ...clips.flatMap(c => [c.s, c.s + c.d])])].sort((a, b) => a - b);
    $("#tl-play").addEventListener("click", () => play(!playing));
    $("#tl-stop").addEventListener("click", () => { play(false); seek(0); });
    $("#tl-prev").addEventListener("click", () => seek([...edges()].reverse().find(e => e < t - 0.01) ?? 0));
    $("#tl-next").addEventListener("click", () => seek(edges().find(e => e > t + 0.01) ?? LEN));
    $("#tl-full").addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    });

    const timeAt = x => { const r = ruler.getBoundingClientRect(); return (x - r.left) / r.width * LEN; };
    function scrub(e) {
      e.preventDefault();
      play(false);
      seek(snap(timeAt(e.clientX)));
      const move = ev => seek(snap(timeAt(ev.clientX)));
      const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    }
    ruler.addEventListener("pointerdown", scrub);
    $("#tl-head i").addEventListener("pointerdown", scrub);
    ruler.addEventListener("keydown", e => {
      const step = e.shiftKey ? 1 : 1 / FPS;
      if (e.key === "ArrowRight") { e.preventDefault(); seek(t + step); }
      if (e.key === "ArrowLeft") { e.preventDefault(); seek(t - step); }
      if (e.key === " ") { e.preventDefault(); play(!playing); }
    });

    box.addEventListener("click", e => {
      const b = e.target.closest("[data-toggle]");
      if (!b) return;
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      lanes[b.dataset.toggle].classList.toggle("is-off", !on);
    });

    box.addEventListener("pointerdown", e => {
      const el = e.target.closest(".tl-clip");
      if (!el) return;
      e.preventDefault();
      const c = clips.find(x => x.el === el);
      const from = { s: c.s, track: c.track };
      const x0 = e.clientX, s0 = c.s, kind = kindOf(c.track);
      const w = lanes[c.track].getBoundingClientRect().width;
      el.classList.add("is-drag");
      el.focus({ preventScroll: true });
      const move = ev => {
        c.s = snap(Math.min(LEN - c.d, Math.max(0, s0 + (ev.clientX - x0) / w * LEN)));
        const over = document.elementsFromPoint(ev.clientX, ev.clientY).find(n => n.classList && n.classList.contains("tl-lane"));
        Object.values(lanes).forEach(l => l.classList.remove("is-drop"));
        if (over && over.dataset.kind === kind) { c.track = over.dataset.track; over.classList.add("is-drop"); }
        place(c);
        el.classList.toggle("is-bad", overlaps(c));
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        Object.values(lanes).forEach(l => l.classList.remove("is-drop"));
        el.classList.remove("is-drag", "is-bad");
        if (overlaps(c)) { c.s = from.s; c.track = from.track; place(c); }
        el.focus({ preventScroll: true });
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
    box.addEventListener("keydown", e => {
      const el = e.target.closest(".tl-clip");
      if (!el) return;
      const c = clips.find(x => x.el === el);
      const prev = { s: c.s, track: c.track };
      const same = tracks.filter(x => x.kind === kindOf(c.track)).map(x => x.id);
      const i = same.indexOf(c.track);
      if (e.key === "ArrowLeft") c.s = snap(Math.max(0, c.s - (e.shiftKey ? 1 : 0.2)));
      else if (e.key === "ArrowRight") c.s = snap(Math.min(LEN - c.d, c.s + (e.shiftKey ? 1 : 0.2)));
      else if (e.key === "ArrowUp" && i > 0) c.track = same[i - 1];
      else if (e.key === "ArrowDown" && i < same.length - 1) c.track = same[i + 1];
      else return;
      e.preventDefault();
      if (overlaps(c)) { c.s = prev.s; c.track = prev.track; }
      place(c);
      el.focus({ preventScroll: true });
    });
    seek(12 + 18 / FPS);
  }

  renderTools();
  renderWork();
  renderPortrait();
  addHandles(document);
  bindWork();
  bindPlayer();
  bindNav();
  bindReveal();
  bindCursor();
  bindClock();
  bindContact();
  bindTimeline();
  intro();
})();
