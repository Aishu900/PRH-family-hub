// PRH Family Hub - single-page app (no framework). Routes live in the URL hash.
(function () {
  const { PROGRAMS, FAMILIES } = window.PRH;
  const $app = document.getElementById("app");
  const KEY = "prh-hub-state-v1";

  // ---------- state (saved in the browser when possible) ----------
  let S = { role: "parent", story: "", ref: null, result: null, done: {}, stepDone: false, reminder: { channel: "text", time: "7:00 pm" } };
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(S, JSON.parse(raw)); } catch (e) { /* private mode: memory only */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  const isDone = (pid, i) => (S.done[pid] || []).includes(i);
  function setDone(pid, i, v) {
    const arr = new Set(S.done[pid] || []);
    v ? arr.add(i) : arr.delete(i);
    S.done[pid] = [...arr];
    save();
  }

  // ---------- helpers ----------
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const go = (h) => { location.hash = h; };
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }
  const ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    check: '<path d="M5 13l4 4L19 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    clip: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 13l2 2 4-4"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    sprout: '<path d="M7 20h10M12 20v-8"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 10c0-3 2.5-5 6-5 0 3-2.5 5-6 5z"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  };
  const ic = (n, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const PICON = { grow: "sprout", iinteract: "heart", r2r: "home", tops: "users" };
  const pIcon = (pid, size = 44) => `<span class="ic" style="width:${size}px;height:${size}px;border-radius:12px;display:grid;place-items:center;background:${PROGRAMS[pid].color};color:#fff;flex:none">${ic(PICON[pid], size > 40 ? "lg" : "")}</span>`;
  const STAGES = ["Invited", "First step done", "Started session 1", "Active"];
  const stageBadge = (s) => `<span class="badge ${["gray", "rasp", "teal", "green"][s]}">${STAGES[s]}</span>`;
  const needsNudge = (f) => f.stage < 2 && f.days >= 3;
  const ago = (d) => (d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);

  const HERO = `<svg viewBox="0 0 520 420" role="img" aria-label="Illustration of a parent and child walking together">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6f3f5"/><stop offset="1" stop-color="#fbeff3"/></linearGradient></defs>
    <rect x="10" y="10" width="500" height="400" rx="40" fill="url(#sky)"/>
    <circle cx="400" cy="110" r="48" fill="#f6dce5"/><circle cx="400" cy="110" r="30" fill="#ca3d6a" opacity=".85"/>
    <path d="M10 300 C120 250 220 290 300 270 S 460 230 510 260 V370 a40 40 0 0 1-40 40H50a40 40 0 0 1-40-40z" fill="#99cfd9"/>
    <path d="M10 330 C140 300 260 340 360 320 S 480 300 510 315 V370 a40 40 0 0 1-40 40H50a40 40 0 0 1-40-40z" fill="#00738c"/>
    <path d="M150 410 C 200 360 260 330 330 300" stroke="#e6f3f5" stroke-width="16" fill="none" stroke-linecap="round" opacity=".7"/>
    <g transform="translate(205 168)">
      <circle cx="30" cy="0" r="22" fill="#8f4469"/><circle cx="30" cy="4" r="17" fill="#f2c9a5"/>
      <rect x="8" y="26" width="44" height="76" rx="20" fill="#005f73"/>
      <rect x="12" y="96" width="14" height="52" rx="7" fill="#303c42"/><rect x="34" y="96" width="14" height="52" rx="7" fill="#303c42"/>
      <path d="M50 46 Q 78 66 92 74" stroke="#005f73" stroke-width="13" stroke-linecap="round" fill="none"/>
    </g>
    <g transform="translate(290 222)">
      <circle cx="22" cy="0" r="16" fill="#303c42"/><circle cx="22" cy="4" r="13" fill="#e8b48c"/>
      <rect x="6" y="20" width="32" height="52" rx="15" fill="#ca3d6a"/>
      <rect x="9" y="66" width="11" height="30" rx="5.5" fill="#303c42"/><rect x="24" y="66" width="11" height="30" rx="5.5" fill="#303c42"/>
      <path d="M8 32 Q 0 30 -6 22" stroke="#ca3d6a" stroke-width="10" stroke-linecap="round" fill="none"/>
    </g>
    <path d="M270 150 c-6-10 -22-6 -18 6 c3 8 18 16 18 16 s15-8 18-16 c4-12 -12-16 -18-6z" fill="#ca3d6a"/>
    <g fill="#ffffff" opacity=".9"><ellipse cx="120" cy="90" rx="38" ry="14"/><ellipse cx="150" cy="80" rx="26" ry="14"/></g>
  </svg>`;

  function playerArt(color) {
    return `<svg class="bg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="800" height="400" fill="${color}"/>
      <circle cx="650" cy="80" r="140" fill="#ffffff" opacity=".08"/><circle cx="120" cy="360" r="180" fill="#ffffff" opacity=".07"/>
      <path d="M0 300 C200 250 400 330 800 260 V400 H0z" fill="#000" opacity=".12"/></svg>`;
  }

  const EXAMPLES = [
    { label: "Bike fall, bedtime meltdowns", text: "My son is 8. He fell off his bike in June and hit his head. We went to the ER but he wasn't admitted. Since then he has meltdowns at bedtime and gets frustrated with homework." },
    { label: "Teen, hospital stay after a crash", text: "My daughter is 14 and was in the hospital for a week after a car crash with a brain injury. She just came home and is tired all the time." },
    { label: "Toddler, sleep changes", text: "My 2 year old had a bad fall at daycare last month. We saw the doctor but she wasn't admitted. Her sleep has changed and she is fussier than before." },
    { label: "Teen, anger since injury", text: "My 15 year old has trouble controlling his anger since his concussion this spring, and he is struggling to keep up at school." },
  ];

  // ---------- views ----------
  function viewHome(q) {
    const ref = q.get("ref");
    const refBanner = ref && PROGRAMS[ref]
      ? `<div class="banner">${ic("clip")} <span>Your care team recommended <b>${esc(PROGRAMS[ref].name)}</b> for your family. Tell us a little more and we'll set up your first steps.</span></div>` : "";
    return `
      <section class="hero">
        <div>
          ${refBanner}
          <div class="eyebrow">Parent Resource Hub · Start here</div>
          <h1>Proven support for your family, starting with one small step.</h1>
          <p class="muted" style="font-size:18px">Tell us what's going on with your child, in your own words. We'll match you to the right program, pick three sessions for you, and give you one thing to try tonight.</p>
          <div class="card mt">
            <label for="story" class="small" style="font-weight:700">What's been happening?</label>
            <textarea id="story" class="mt" placeholder="For example: My 8-year-old fell off his bike in June. Since then he melts down at bedtime and I don't know what to do.">${esc(S.story && !ref ? S.story : "")}</textarea>
            <div class="row mt">${EXAMPLES.map((e, i) => `<button class="chip" data-ex="${i}" type="button">${esc(e.label)}</button>`).join("")}</div>
            <div class="row mt">
              <button class="btn lg" id="go" type="button">Find my program ${ic("arrow")}</button>
              <span class="tiny muted row" style="gap:6px">${ic("lock", "sm")} Private. We never diagnose. We only point you to PRH programs.</span>
            </div>
          </div>
        </div>
        <div class="hero-art">${HERO}</div>
      </section>
      <section class="mt2 steps3">
        <div class="step3"><span class="num">1</span><div><b>Tell us</b><div class="small muted">In your own words, about 1 minute</div></div></div>
        <div class="step3"><span class="num">2</span><div><b>Get your plan</b><div class="small muted">The right program and 3 sessions, not 29</div></div></div>
        <div class="step3"><span class="num rasp">3</span><div><b>Start tonight</b><div class="small muted">One 5-minute step, plus gentle reminders</div></div></div>
      </section>
      <section class="doors mt2">
        <a class="door" href="#/programs"><span class="ic" style="background:var(--teal-50);color:var(--teal-700)">${ic("book")}</span><span><b>Browse all programs</b><br><span class="small muted">GROW, I-InTERACT, Road to Recovery and TOPS</span></span></a>
        <a class="door" href="#/clinician-signin"><span class="ic" style="background:var(--ink);color:#fff">${ic("clip")}</span><span><b>I'm a clinician</b><br><span class="small muted">Refer families and see who started</span></span></a>
      </section>`;
  }
  function bindHome(q) {
    const ref = q.get("ref");
    const ta = document.getElementById("story");
    document.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { ta.value = EXAMPLES[+b.dataset.ex].text; ta.focus(); }));
    document.getElementById("go").addEventListener("click", async () => {
      const story = ta.value.trim();
      if (story.length < 10) { toast("Tell us a little more about your child first."); ta.focus(); return; }
      S.story = story; S.ref = ref && PROGRAMS[ref] ? ref : null; S.result = null; S.stepDone = false; save();
      runGuide();
    });
  }

  async function runGuide() {
    const story = S.story;
    $app.innerHTML = `<div class="loading"><div class="spinner"></div><h2>Reading your story…</h2><p class="muted">Matching it to the Parent Resource Hub programs. This takes a few seconds.</p></div>`;
    try {
      const r = await fetch("/api/guide", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ story, referredProgram: S.ref }) });
      S.result = await r.json(); save();
      showMode(S.result.mode);
      if (location.hash === "#/match") render(); else go("/match");
    } catch (e) {
      $app.innerHTML = `<div class="card narrow"><h2>We couldn't reach the guide</h2><p class="muted">Please check that the app is running, then try again.</p><a class="btn" href="#/">Try again</a></div>`;
    }
  }

  function emptyState(title = "Let's start with your story") {
    return `<div class="card pad-lg narrow" style="text-align:center"><div style="max-width:220px;margin:0 auto 12px">${HERO}</div><h2>${title}</h2><p class="muted">Tell us a little about your child and we'll build your plan.</p><a class="btn" href="#/">Start here ${ic("arrow")}</a></div>`;
  }

  function viewMatch() {
    const r = S.result;
    if (!r) return emptyState();
    if (r.urgent) return `
      <div class="card alert pad-lg narrow">
        <div class="row" style="color:var(--red)">${ic("alert", "lg")}<h2 style="color:var(--red);margin:0">This sounds urgent</h2></div>
        <p class="mt" style="font-size:18px">Please contact your child's doctor now. <b>If this is an emergency, call 911.</b></p>
        <p class="muted">FamilyGuide can't help with emergencies or give medical advice. It only helps families find PRH programs.</p>
        <div class="row mt"><a class="btn red" href="tel:911">${ic("phone")} Call 911</a><a class="btn ghost" href="#/">Back</a></div>
      </div>`;
    const c = r.child || {};
    const facts = [
      c.age != null ? `<span class="chip teal">Age ${esc(c.age)}</span>` : "",
      c.hospitalized === "yes" ? `<span class="chip teal">Hospitalized</span>` : c.hospitalized === "no" ? `<span class="chip teal">Not hospitalized</span>` : "",
      ...(c.concerns || []).map((x) => `<span class="chip rasp">${esc(x)}</span>`),
    ].join("");
    const understood = `<div class="card soft"><div class="eyebrow">Here's what we understood</div><div class="row">${facts || '<span class="muted">Not much yet</span>'}</div><a href="#/" class="small mt" style="display:inline-flex;gap:6px;align-items:center">${ic("edit", "sm")} Not quite right? Edit my story</a></div>`;
    if (r.needsClinician && (r.child || {}).age == null) return `<div class="narrow">${understood}
      <div class="card pad-lg mt">
        <h2 style="margin:0">One quick question: how old is your child?</h2>
        <p class="muted mt">Age helps us pick the right program.</p>
        <div class="row mt" style="flex-wrap:wrap">${[["Under 3", "2"], ["3 to 9", "6"], ["10 to 11", "10"], ["12 or older", "14"]].map(([l, n]) => `<button class="btn" data-age="${n}">${l}</button>`).join("")}</div>
        <div class="row mt"><button class="btn ghost small" id="callback">${ic("phone")} Request a call back</button></div>
      </div></div>`;
    if (r.needsClinician || !r.program) return `<div class="narrow">${understood}
      <div class="card pad-lg mt">
        <div class="row">${ic("users", "lg")}<h2 style="margin:0">Let's connect you with the PRH team</h2></div>
        <p class="mt">${esc(r.reason)}</p>
        <p class="muted">A team member can look at your situation and help you choose. We've saved what you told us, so you won't have to repeat it.</p>
        <div class="row mt"><button class="btn" id="callback">${ic("phone")} Request a call back</button><a class="btn ghost" href="#/programs">Explore programs myself</a></div>
      </div></div>`;
    const p = PROGRAMS[r.program.id];
    return `<div class="narrow">
      <a href="#/" class="small row" style="gap:6px">${ic("back", "sm")} Change my story</a>
      <div class="mt">${understood}</div>
      <div class="card pad-lg mt">
        <div class="eyebrow">Your program</div>
        <div class="row" style="gap:14px;align-items:center">${pIcon(p.id, 56)}<div><h1 style="font-size:30px;margin:0">${esc(p.name)}</h1><span class="badge teal">${esc(p.tag)}</span> ${S.ref ? '<span class="badge rasp">Recommended by your care team</span>' : ""}</div></div>
        <h3 class="mt2">Why this program</h3><p>${esc(r.reason)}</p>
        <div class="grid g2 mt"><div class="card" style="box-shadow:none"><div class="tiny muted" style="font-weight:700">WHO IT'S FOR</div>${esc(p.who)}</div><div class="card" style="box-shadow:none"><div class="tiny muted" style="font-weight:700">WHAT'S INSIDE</div>${esc(p.what)}</div></div>
        <div class="row mt2"><a class="btn lg" href="#/plan">See my plan ${ic("arrow")}</a><a class="btn ghost" href="#/course/${p.id}">See the full program</a></div>
        <p class="tiny muted mt">Matched using PRH program criteria shared by Cincinnati Children's clinicians. Not sure? You can always ask the PRH team.</p>
      </div></div>`;
  }
  function bindMatch() {
    document.querySelectorAll("[data-age]").forEach((x) => x.addEventListener("click", () => { S.story = (S.story + " My child is " + x.dataset.age + " years old.").trim(); S.result = null; save(); runGuide(); }));
    const b = document.getElementById("callback");
    if (b) b.addEventListener("click", () => { b.disabled = true; b.innerHTML = `${ic("check")} Request sent`; toast("Thanks! The PRH team will reach out within 2 business days."); });
  }

  function planDoneCount() {
    const r = S.result; if (!r || !r.program) return 0;
    return r.sessions.filter((s) => isDone(r.program.id, s.idx)).length;
  }
  function viewPlan() {
    const r = S.result;
    if (!r || !r.program || r.urgent) return emptyState();
    const pid = r.program.id, p = PROGRAMS[pid];
    const n = planDoneCount(), total = r.sessions.reduce((a, s) => a + (s.minutes || 0), 0);
    return `<div class="narrow">
      <a href="#/match" class="small row" style="gap:6px">${ic("back", "sm")} Back to my match</a>
      <div class="row mt" style="gap:10px">${pIcon(pid, 36)}<span class="eyebrow" style="margin:0">My plan · ${esc(p.name)}</span></div>
      <h1 class="mt">Three sessions, picked for your family</h1>
      <p class="muted">About ${total} minutes in total, at your own pace. The full program is always there when you're ready.</p>
      <div class="card mt"><div class="row"><b>Your progress</b><span class="spacer"></span><span class="small muted">${n} of 3 sessions</span></div><div class="bar mt"><span style="width:${(n / 3) * 100}%"></span></div></div>
      ${r.foundationWhy ? `<div class="card warm mt"><div class="row" style="color:var(--rasp-700)">${ic("spark")}<b>Why start with the first lesson?</b></div><p class="mt" style="margin-bottom:0;font-size:17px">${esc(r.foundationWhy)}</p></div>` : ""}
      <div class="mt">${r.sessions.map((s, i) => {
        const d = isDone(pid, s.idx);
        return `<div class="session"><span class="num ${d ? "done" : ""}">${d ? "✓" : i + 1}</span><div style="flex:1">
          <div class="row" style="gap:8px"><h3 style="margin:0">${esc(s.title)}</h3>${i === 0 ? '<span class="badge rasp">Start here</span>' : ""}</div>
          <p class="muted" style="margin:6px 0 0">${esc(s.why)}</p>
          <div class="meta"><span class="chip gray">${ic("clock", "sm")} about ${s.minutes} min</span><a class="btn ${d ? "ghost" : ""}" style="padding:8px 16px;font-size:14px" href="#/lesson/${pid}/${s.idx}">${d ? "Review" : "Open lesson"} ${ic("arrow", "sm")}</a></div>
        </div></div>`;
      }).join("")}</div>
      <div class="row mt2"><a class="btn lg rasp" href="#/first-step">Start tonight's small step ${ic("arrow")}</a></div>
      <p class="tiny muted mt">Sessions come from the Parent Resource Hub program. We only help you choose where to begin.</p>
    </div>`;
  }

  function viewFirstStep() {
    const r = S.result;
    if (!r || !r.program || r.urgent) return emptyState();
    const times = ["8:00 am", "12:00 pm", "7:00 pm", "8:30 pm"];
    return `<div class="narrow">
      <a href="#/plan" class="small row" style="gap:6px">${ic("back", "sm")} Back to my plan</a>
      <div class="eyebrow mt">Tonight's small step</div>
      <h1>One thing to try today</h1>
      <div class="card pad-lg mt" style="border-left:6px solid var(--rasp)">
        <div class="row"><span class="num rasp">${ic("heart", "sm")}</span><span class="badge rasp">About 5 minutes</span></div>
        <p class="mt" style="font-size:22px;font-weight:700;margin-bottom:12px">${esc(r.firstStep)}</p>
        <button class="btn ${S.stepDone ? "ghost" : ""}" id="stepdone">${S.stepDone ? `${ic("check")} Done. Nice work!` : "I did it"}</button>
      </div>
      <div class="card mt">
        <h2>Gentle reminders</h2>
        <p class="muted small">Short, personal messages, never more than 3 a week. You can stop anytime.</p>
        <div class="row mt"><div class="seg" id="chan"><button data-c="text" class="${S.reminder.channel === "text" ? "on" : ""}">Text</button><button data-c="email" class="${S.reminder.channel === "email" ? "on" : ""}">Email</button></div>
          <select id="time" aria-label="Reminder time">${times.map((t) => `<option ${S.reminder.time === t ? "selected" : ""}>${t}</option>`).join("")}</select>
          <button class="btn" id="saverem">${ic("bell")} Set reminders</button></div>
      </div>
      <div class="grid g2 mt" style="align-items:center">
        <div><h2>Your week, in three messages</h2><p class="muted">Written for your family, based on what you told us. Your goal also goes into the PRH Problem Solving Tool, so the reminders you already get stay in sync.</p><a class="btn ghost mt" href="#/my">Go to my hub ${ic("arrow")}</a></div>
        <div class="phone">${(r.weekTexts || []).map((t) => `<div class="msg"><div class="from">PRH · ${esc(t.day)} · ${t.kind === "fact" ? "Did you know" : t.kind === "tip" ? "Quick tip" : "Check-in"}</div>${esc(t.text)}</div>`).join("")}</div>
      </div>
    </div>`;
  }
  function bindFirstStep() {
    const sd = document.getElementById("stepdone");
    if (!sd) return;
    sd.addEventListener("click", () => { S.stepDone = !S.stepDone; save(); render(); if (S.stepDone) toast("First step done. That's how progress starts."); });
    document.querySelectorAll("#chan button").forEach((b) => b.addEventListener("click", () => { S.reminder.channel = b.dataset.c; save(); document.querySelectorAll("#chan button").forEach((x) => x.classList.toggle("on", x === b)); }));
    document.getElementById("time").addEventListener("change", (e) => { S.reminder.time = e.target.value; save(); });
    document.getElementById("saverem").addEventListener("click", () => toast(`Reminders set by ${S.reminder.channel} at ${S.reminder.time}. Goal added to your Problem Solving Tool.`));
  }

  function viewMy() {
    const r = S.result;
    if (!r || !r.program || r.urgent) return emptyState("Your hub starts with your story");
    const pid = r.program.id, p = PROGRAMS[pid];
    const n = planDoneCount();
    const next = r.sessions.find((s) => !isDone(pid, s.idx));
    const courseDone = (S.done[pid] || []).length;
    return `
      <div class="row"><div><div class="eyebrow">My hub</div><h1 style="margin:0">Welcome back</h1></div><span class="spacer"></span><a class="btn ghost" href="#/">${ic("edit", "sm")} Update my story</a></div>
      <div class="grid g3 mt">
        <div class="card row" style="gap:16px"><div class="ring" style="--p:${Math.round((n / 3) * 100)}" data-label="${n}/3"></div><div><b>My plan</b><div class="small muted">${n === 3 ? "All 3 done. Amazing!" : `${3 - n} session${3 - n === 1 ? "" : "s"} to go`}</div></div></div>
        <div class="card"><div class="tiny muted" style="font-weight:700">MY PROGRAM</div><div class="row mt" style="gap:10px">${pIcon(pid, 36)}<b>${esc(p.name)}</b></div><div class="small muted mt">${courseDone} of ${p.sessions.length} sessions completed</div></div>
        <div class="card"><div class="tiny muted" style="font-weight:700">TONIGHT'S STEP</div><p class="mt" style="margin-bottom:6px"><b>${esc(r.firstStep)}</b></p><span class="badge ${S.stepDone ? "green" : "rasp"}">${S.stepDone ? "Done" : "Not yet"}</span></div>
      </div>
      <div class="grid g2 mt">
        <div>
          ${next ? `<a class="card link" href="#/lesson/${pid}/${next.idx}" style="background:var(--teal);color:#fff;border-color:var(--teal)"><div class="tiny" style="font-weight:700;opacity:.85">UP NEXT</div><h2 style="color:#fff;margin:6px 0">${esc(next.title)}</h2><div class="row small" style="opacity:.9">${ic("clock", "sm")} about ${next.minutes} min · ${ic("play", "sm")} Continue</div></a>`
            : `<div class="card soft"><h2>You finished your plan 🎉</h2><p class="muted">Keep going with the rest of ${esc(p.name)} whenever you're ready.</p><a class="btn" href="#/course/${pid}">Open the full program</a></div>`}
          <div class="card mt"><h3>My plan</h3>${r.sessions.map((s, i) => `<a class="row course-side" href="#/lesson/${pid}/${s.idx}" style="padding:8px 0;color:inherit"><span class="num ${isDone(pid, s.idx) ? "done" : ""}" style="width:26px;height:26px;font-size:12px">${isDone(pid, s.idx) ? "✓" : i + 1}</span><span style="flex:1">${esc(s.title)}</span><span class="tiny muted">${s.minutes} min</span></a>`).join("")}
            <a href="#/course/${pid}" class="small">See all ${p.sessions.length} sessions in ${esc(p.name)} →</a></div>
        </div>
        <div>
          <div class="card"><h3>This week's messages</h3>${(r.weekTexts || []).map((t) => `<div class="msg" style="border:1px solid var(--line)"><div class="from">${esc(t.day)}</div>${esc(t.text)}</div>`).join("")}
            <div class="small muted">${ic("bell", "sm")} By ${esc(S.reminder.channel)} at ${esc(S.reminder.time)} · <a href="#/first-step">change</a></div></div>
          <div class="card warm mt"><div class="row">${ic("msg")}<b>Questions? Talk to the PRH team</b></div><p class="small muted mt">Real people from the Parent Resource Hub, not a chatbot. We'll get back to you within 2 business days.</p><button class="btn rasp" id="ask">Send a question</button></div>
        </div>
      </div>`;
  }
  function bindMy() { const a = document.getElementById("ask"); if (a) a.addEventListener("click", () => toast("Message sent to the PRH team (demo).")); }

  function viewPrograms() {
    return `<div class="eyebrow">All programs</div><h1>Parent Resource Hub programs</h1>
      <p class="muted" style="max-width:680px">Validated online programs from Cincinnati Children's for families of children with a brain injury or brain condition. Not sure which fits? <a href="#/">Tell us about your child</a> and we'll match you.</p>
      <div class="grid g2 mt">${Object.values(PROGRAMS).map((p) => {
        const d = (S.done[p.id] || []).length;
        return `<a class="card link" href="#/course/${p.id}"><div class="row" style="gap:14px">${pIcon(p.id, 52)}<div><h2 style="margin:0">${esc(p.name)}</h2><span class="badge teal">${esc(p.tag)}</span></div></div>
          <p class="mt" style="margin-bottom:6px"><b>Who it's for:</b> ${esc(p.who)}</p><p class="muted small">${esc(p.what)}</p>
          <div class="row"><span class="chip gray">${ic("book", "sm")} ${p.sessions.length} sessions</span>${d ? `<span class="chip green">${d} completed</span>` : ""}<span class="spacer"></span><span class="small" style="font-weight:700;color:var(--teal)">View course →</span></div></a>`;
      }).join("")}</div>
      <div class="card soft mt"><div class="row">${ic("clip")}<b>Looking for MeHealth for TBI?</b></div><p class="small muted mt" style="margin:0">MeHealth for TBI is for care teams. Ask your clinician about it.</p></div>`;
  }

  function viewCourse(pid) {
    const p = PROGRAMS[pid]; if (!p) return emptyState("Program not found");
    const inPlan = S.result && S.result.program && S.result.program.id === pid ? S.result.sessions.map((s) => s.idx) : [];
    const d = (S.done[pid] || []).length;
    return `<a href="#/programs" class="small row" style="gap:6px">${ic("back", "sm")} All programs</a>
      <div class="card pad-lg mt" style="background:${p.color};color:#fff;border-color:${p.color};position:relative;overflow:hidden">
        <svg viewBox="0 0 400 200" style="position:absolute;right:-40px;top:-20px;width:360px;opacity:.12" aria-hidden="true"><circle cx="300" cy="80" r="120" fill="#fff"/></svg>
        <div class="row" style="gap:14px;position:relative">${pIcon(pid, 56)}<div><div class="tiny" style="font-weight:700;opacity:.85">PARENT RESOURCE HUB PROGRAM</div><h1 style="color:#fff;margin:0">${esc(p.name)}</h1></div></div>
        <p class="mt" style="opacity:.92;position:relative;max-width:640px">${esc(p.who)}. ${esc(p.what)}.</p>
        <div style="max-width:420px;position:relative"><div class="row small"><span>${d} of ${p.sessions.length} sessions completed</span></div><div class="bar mt" style="background:rgba(255,255,255,.3)"><span style="width:${(d / p.sessions.length) * 100}%;background:#fff"></span></div></div>
      </div>
      <h2 class="mt2">Sessions</h2>
      ${p.sessions.map((s, i) => {
        const dn = isDone(pid, i);
        return `<div class="session"><span class="num ${dn ? "done" : ""}">${dn ? "✓" : i + 1}</span><div style="flex:1">
          <div class="row" style="gap:8px"><h3 style="margin:0">${esc(s.title)}</h3>${i === 0 ? '<span class="badge rasp">Start here</span>' : ""}${inPlan.includes(i) ? '<span class="badge teal">In your plan</span>' : ""}</div>
          <p class="muted" style="margin:6px 0 0">${esc(s.summary)}</p>
          <div class="meta"><span class="chip gray">${ic("clock", "sm")} ${s.minutes} min</span><span class="chip gray">${ic("play", "sm")} Video</span><span class="chip gray">${ic("check", "sm")} Quick check</span><span class="spacer"></span><a class="btn ${dn ? "ghost" : ""}" style="padding:8px 16px;font-size:14px" href="#/lesson/${pid}/${i}">${dn ? "Review" : "Start"} ${ic("arrow", "sm")}</a></div>
        </div></div>`;
      }).join("")}
      <p class="tiny muted mt">Lesson text in this prototype is sample content. The validated PRH course content plugs in here unchanged.</p>`;
  }

  function viewLesson(pid, idx) {
    const p = PROGRAMS[pid]; const s = p && p.sessions[idx];
    if (!s) return emptyState("Lesson not found");
    const dn = isDone(pid, idx);
    const nxt = p.sessions[idx + 1];
    return `<div class="small row" style="gap:6px"><a href="#/programs">Programs</a> / <a href="#/course/${pid}">${esc(p.name)}</a> / <span class="muted">Session ${idx + 1}</span></div>
      <div class="lesson-grid mt">
        <div>
          <div class="player">${playerArt(p.color)}<button class="play" id="play" aria-label="Play video">${ic("play", "lg")}</button><div class="cap">${esc(s.title)}</div><div class="prog"><span id="vprog"></span></div></div>
          <div class="tiny muted mt">Video preview (sample). The real PRH session video plays here.</div>
          <div class="card mt">
            <div class="row"><span class="badge teal">Session ${idx + 1} of ${p.sessions.length}</span><span class="chip gray">${ic("clock", "sm")} ${s.minutes} min</span>${dn ? '<span class="badge green">Completed</span>' : ""}</div>
            <h1 class="mt" style="font-size:28px">${esc(s.title)}</h1><p class="muted">${esc(s.summary)}</p>
            <h3 class="mt">Key points</h3>
            <ul class="points">${s.points.map((pt) => `<li><span class="tick">${ic("check")}</span><span>${esc(pt)}</span></li>`).join("")}</ul>
          </div>
          <div class="card mt"><div class="eyebrow">Quick check</div><h3>${esc(s.check.q)}</h3>
            <div id="opts">${s.check.options.map((o, i) => `<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div>
            <div id="explain" class="mt small" style="display:none"></div></div>
          <div class="card mt row"><div style="flex:1"><b>${dn ? "You completed this session" : "Finished this session?"}</b><div class="small muted">Your progress is saved to your hub.</div></div>
            <button class="btn ${dn ? "ghost" : ""}" id="complete">${dn ? "Mark as not done" : `${ic("check")} Mark complete`}</button>
            ${nxt ? `<a class="btn ghost" href="#/lesson/${pid}/${idx + 1}">Next: ${esc(nxt.title)} ${ic("arrow", "sm")}</a>` : `<a class="btn ghost" href="#/my">Back to my hub</a>`}</div>
        </div>
        <aside class="card course-side"><div class="row" style="gap:10px">${pIcon(pid, 32)}<b>${esc(p.name)}</b></div><div class="mt">
          ${p.sessions.map((x, i) => `<a class="item ${i === idx ? "cur" : ""}" href="#/lesson/${pid}/${i}"><span class="num ${isDone(pid, i) ? "done" : ""}" style="width:24px;height:24px;font-size:11px">${isDone(pid, i) ? "✓" : i + 1}</span><span style="flex:1">${esc(x.title)}</span></a>`).join("")}
        </div></aside>
      </div>`;
  }
  function bindLesson(pid, idx) {
    const s = PROGRAMS[pid] && PROGRAMS[pid].sessions[idx]; if (!s) return;
    const play = document.getElementById("play");
    play.addEventListener("click", () => { play.style.display = "none"; requestAnimationFrame(() => { document.getElementById("vprog").style.width = "100%"; }); setTimeout(() => toast("Video preview finished (sample)."), 3100); });
    let answered = false;
    document.querySelectorAll("#opts .opt").forEach((b) => b.addEventListener("click", () => {
      if (answered) return; answered = true;
      const o = +b.dataset.o, ok = o === s.check.answer;
      document.querySelectorAll("#opts .opt").forEach((x) => { if (+x.dataset.o === s.check.answer) x.classList.add("right"); });
      if (!ok) b.classList.add("wrong");
      const ex = document.getElementById("explain"); ex.style.display = "block";
      ex.innerHTML = `<b style="color:${ok ? "var(--green)" : "var(--rasp-700)"}">${ok ? "That's right." : "Not quite."}</b> ${esc(s.check.explain)}`;
    }));
    document.getElementById("complete").addEventListener("click", () => {
      const v = !isDone(pid, idx); setDone(pid, idx, v); render();
      if (v) toast("Session complete. Saved to your hub.");
    });
  }

  // ---------- clinician ----------
  function allFamilies() {
    const list = FAMILIES.slice();
    const r = S.result;
    if (r && r.program && !r.urgent) {
      const pid = r.program.id; const d = (S.done[pid] || []).length;
      list.unshift({ id: "demo", name: "Demo family (this session)", age: r.child && r.child.age, program: pid, stage: d >= 2 ? 3 : d >= 1 ? 2 : S.stepDone ? 1 : 0,
        sessions: d, days: 0, concerns: (r.child && r.child.concerns) || [], step: r.firstStep, demo: true });
    }
    return list;
  }
  function viewClinician(q) {
    const fam = allFamilies();
    const filter = q.get("p") || "all";
    const shown = filter === "all" ? fam : fam.filter((f) => f.program === filter);
    const n = fam.length, s1 = fam.filter((f) => f.stage >= 1).length, s2 = fam.filter((f) => f.stage >= 2).length, s3 = fam.filter((f) => f.stage >= 3).length;
    const nudge = fam.filter(needsNudge);
    const stages = [["Referred by clinician", n], ["Did their first step", s1], ["Started session 1", s2], ["Active (2+ sessions)", s3]];
    return `<div class="row"><div><div class="eyebrow" style="color:var(--ink)">Clinician view · MeHealth side</div><h1 style="margin:0">Your referred families</h1><p class="muted" style="margin:4px 0 0">See who started after your referral, and who needs a nudge. Sample data, made-up names.</p></div></div>
      <div class="grid g4 mt">
        <div class="card kpi"><div class="l">Families referred</div><div class="v">${n}</div><div class="tiny muted">last 30 days</div></div>
        <div class="card kpi"><div class="l">Started session 1</div><div class="v">${Math.round((s2 / n) * 100)}%</div><div class="tiny muted">${s2} of ${n} families</div></div>
        <div class="card kpi"><div class="l">Sessions completed</div><div class="v">${fam.reduce((a, f) => a + (f.sessions || 0), 0)}</div><div class="tiny muted">across all families</div></div>
        <div class="card kpi" style="background:var(--rasp-50);border-color:var(--rasp-100)"><div class="l">Need a nudge</div><div class="v" style="color:var(--rasp-700)">${nudge.length}</div><div class="tiny muted">no progress in 3+ days</div></div>
      </div>
      <div class="grid g2 mt">
        <div class="card"><h2>Did referred families actually start?</h2><div class="funnel mt">${stages.map(([l, v], i) => `<div class="stage"><div class="top"><span>${l}</span><span><b>${v}</b>${i ? ` <span class="muted">(${stages[i - 1][1] - v} stopped here)</span>` : ""}</span></div><div class="fbar"><span style="width:${Math.max(8, (v / n) * 100)}%;background:${["#99cfd9", "#339eb2", "#00738c", "#004b5b"][i]}">${Math.round((v / n) * 100)}%</span></div></div>`).join("")}</div>
          <p class="tiny muted" style="margin:0">Before: clinicians had no feedback after a referral. Now they can see exactly where families stop.</p></div>
        <div>
          <div class="card"><h2>${ic("link")} Refer a family</h2><p class="small muted">Pick a program. The family opens the link, tells their story, and starts in that program.</p>
            <div class="row mt"><select id="refp">${Object.values(PROGRAMS).map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select><button class="btn" id="mk">Create link</button></div>
            <div id="reflink" class="mt" style="display:none"></div></div>
          <div class="card warm mt"><div class="row"><h3 style="margin:0;color:var(--rasp-700)">${nudge.length} families haven't moved in 3+ days</h3></div>
            <div class="row mt">${nudge.slice(0, 6).map((f) => `<span class="chip rasp">${esc(f.name.replace("'s family", ""))}</span>`).join("")}${nudge.length > 6 ? `<span class="chip">+${nudge.length - 6}</span>` : ""}</div>
            <p class="small muted mt">Each nudge uses the family's own first step and next session, so it feels personal, not generic.</p>
            <button class="btn rasp" id="nudgeall">${ic("send")} Send personal nudges</button></div>
        </div>
      </div>
      <div class="row mt2"><h2 style="margin:0">Families</h2><span class="spacer"></span>
        <div class="seg" id="pf">${[["all", "All"], ...Object.values(PROGRAMS).map((p) => [p.id, p.id === "tops" ? "TOPS" : p.name])].map(([k, l]) => `<button data-p="${k}" class="${filter === k ? "on" : ""}">${esc(l)}</button>`).join("")}</div></div>
      <div class="table-wrap mt"><table><thead><tr><th>Family</th><th>Child age</th><th>Program</th><th>Status</th><th>Sessions</th><th>Last active</th></tr></thead><tbody>
        ${shown.map((f) => `<tr class="clickable" data-f="${f.id}"><td><b>${esc(f.name)}</b>${f.demo ? ' <span class="badge dark">Live</span>' : ""}${needsNudge(f) ? ' <span class="badge rasp">Needs nudge</span>' : ""}</td><td>${f.age != null ? esc(f.age) : "–"}</td><td>${esc(PROGRAMS[f.program].name.replace("Teen Online Problem Solving (TOPS)", "TOPS"))}</td><td>${stageBadge(f.stage)}</td><td>${f.sessions}</td><td class="muted">${ago(f.days)}</td></tr>`).join("")}
      </tbody></table></div>`;
  }
  function bindClinician() {
    document.querySelectorAll("#pf button").forEach((b) => b.addEventListener("click", () => go(`/clinician${b.dataset.p === "all" ? "" : "?p=" + b.dataset.p}`)));
    document.querySelectorAll("tr[data-f]").forEach((tr) => tr.addEventListener("click", () => go(`/clinician/family/${tr.dataset.f}`)));
    document.getElementById("mk").addEventListener("click", () => {
      const pid = document.getElementById("refp").value;
      const url = `${location.origin}/#/?ref=${pid}`;
      const box = document.getElementById("reflink"); box.style.display = "block";
      box.innerHTML = `<div class="card soft" style="padding:12px"><div class="small" style="word-break:break-all"><b>${esc(url)}</b></div><div class="row mt"><button class="btn ghost" id="cp" style="padding:8px 14px">Copy</button><a class="btn" id="asfam" style="padding:8px 14px" href="#/?ref=${pid}">Open as the family ${ic("arrow", "sm")}</a></div></div>`;
      document.getElementById("asfam").addEventListener("click", () => { S.role = "parent"; save(); });
      document.getElementById("cp").addEventListener("click", async () => { try { await navigator.clipboard.writeText(url); toast("Referral link copied."); } catch (e) { toast("Copy blocked by the browser. Select the link to copy it."); } });
    });
    const na = document.getElementById("nudgeall");
    na.addEventListener("click", () => { na.disabled = true; na.innerHTML = `${ic("check")} Nudges sent`; toast("Personal nudges sent to families who stalled (demo)."); });
  }

  function viewFamily(id) {
    const f = allFamilies().find((x) => x.id === id);
    if (!f) return `<div class="card narrow"><h2>Family not found</h2><a href="#/clinician">Back to clinician view</a></div>`;
    const p = PROGRAMS[f.program];
    const nextIdx = Math.min(f.sessions, p.sessions.length - 1);
    const first = f.name.replace("'s family", "").replace("Demo family (this session)", "your child");
    const nudgeText = f.stage === 0
      ? `Hi! Your care team set up ${p.name} for your family. It takes about 1 minute to get your personal plan. Start here: [link]`
      : `Hi! Checking in on ${first}. Your next step: "${p.sessions[nextIdx].title}" (about ${p.sessions[nextIdx].minutes} min). Small steps count. You've got this.`;
    const tl = [["Referred by clinician", "Link sent from MeHealth", true], ["Told their story and got a plan", f.stage >= 1 ? "Matched to " + p.name : "Not yet", f.stage >= 1], ["Did their first step", f.step || "Not yet", f.stage >= 1], ["Started session 1", f.stage >= 2 ? p.sessions[0].title : "Not yet", f.stage >= 2], ["Active (2+ sessions)", f.stage >= 3 ? `${f.sessions} sessions completed` : "Not yet", f.stage >= 3]];
    return `<a href="#/clinician" class="small row" style="gap:6px">${ic("back", "sm")} All families</a>
      <div class="row mt" style="gap:14px">${pIcon(f.program, 52)}<div><h1 style="margin:0">${esc(f.name)}</h1><div class="row small muted">${f.age != null ? `Child age ${esc(f.age)} · ` : ""}${esc(p.name)} · ${stageBadge(f.stage)} ${needsNudge(f) ? '<span class="badge rasp">Needs nudge</span>' : ""}</div></div></div>
      <div class="grid g2 mt">
        <div class="card"><h2>Journey</h2><ul class="timeline mt">${tl.map(([a, b, on]) => `<li class="${on ? "" : "off"}"><b>${esc(a)}</b><div class="small muted">${esc(b)}</div></li>`).join("")}</ul></div>
        <div>
          <div class="card"><h3>What the family shared</h3><div class="row mt">${(f.concerns || []).length ? f.concerns.map((c) => `<span class="chip rasp">${esc(c)}</span>`).join("") : '<span class="muted small">Nothing shared yet</span>'}</div>
            <p class="tiny muted mt" style="margin:0">Only what the family chose to share in FamilyGuide. No diagnosis is made.</p></div>
          <div class="card mt"><h3>Personal nudge</h3><div class="msg" style="border:1px solid var(--line);margin-top:10px"><div class="from">PRH · to ${esc(first)}'s family</div>${esc(nudgeText)}</div>
            <button class="btn rasp" id="send1">${ic("send")} Send nudge</button></div>
        </div>
      </div>`;
  }
  function bindFamily() { const b = document.getElementById("send1"); if (b) b.addEventListener("click", () => { b.disabled = true; b.innerHTML = `${ic("check")} Sent`; toast("Nudge sent (demo)."); }); }

  // ---------- router ----------
  function parse() {
    const h = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = h.split("?");
    return { parts: path.split("/").filter(Boolean), q: new URLSearchParams(qs || "") };
  }
  function render() {
    const { parts, q } = parse();
    const [a, b, c] = parts;
    let html, bind = () => {}, nav = "home";
    if (!a) { html = viewHome(q); bind = () => bindHome(q); }
    else if (a === "match") { html = viewMatch(); bind = bindMatch; }
    else if (a === "plan") { html = viewPlan(); nav = "my"; }
    else if (a === "first-step") { html = viewFirstStep(); bind = bindFirstStep; nav = "my"; }
    else if (a === "my") { html = viewMy(); bind = bindMy; nav = "my"; }
    else if (a === "programs") { html = viewPrograms(); nav = "programs"; }
    else if (a === "course") { html = viewCourse(b); nav = "programs"; }
    else if (a === "lesson") { html = viewLesson(b, +c); bind = () => bindLesson(b, +c); nav = "programs"; }
    else if (a === "clinician-signin" || (a === "clinician" && S.role !== "clinician")) { html = viewSignin(); bind = bindSignin; nav = ""; }
    else if (a === "clinician" && b === "family") { html = viewFamily(c); bind = bindFamily; nav = "clinician"; }
    else if (a === "clinician") { html = viewClinician(q); bind = bindClinician; nav = "clinician"; }
    else { html = emptyState("Page not found"); }
    $app.innerHTML = html;
    const clin = S.role === "clinician";
    document.getElementById("nav").innerHTML = (clin
      ? `<a href="#/clinician" data-nav="clinician" class="clin">MeHealth (clinician)</a><a href="#/programs" data-nav="programs">Programs</a><a href="#" id="signout">Sign out</a>`
      : `<a href="#/" data-nav="home">Families</a><a href="#/programs" data-nav="programs">Programs</a><a href="#/my" data-nav="my">My hub</a><a href="#/clinician-signin" data-nav="clinician" class="clin">Clinician sign-in</a>`)
      + `<span class="rolebadge ${clin ? "clin" : ""}">${clin ? "Clinician · MeHealth" : "Parent view"}</span>`;
    const so = document.getElementById("signout");
    if (so) so.addEventListener("click", (e) => { e.preventDefault(); S.role = "parent"; save(); if (location.hash === "#/") render(); else go("/"); });
    document.querySelectorAll("#nav a").forEach((el) => el.classList.toggle("active", el.dataset.nav === nav));
    bind();
    window.scrollTo(0, 0);
  }
  function viewSignin() {
    return `<div class="card pad-lg narrow" style="text-align:center"><div class="eyebrow">Care team access</div><h1 style="font-size:28px">MeHealth for TBI · Care team access</h1><h2 style="display:none">Clinician sign-in</h2><p class="muted">This area is for Cincinnati Children's care teams. In the real product, clinicians sign in with hospital single sign-on.</p><div class="row mt" style="justify-content:center"><button class="btn" id="asclin">Continue as clinician (demo)</button></div><p class="mt"><a href="#/">I'm a parent</a></p></div>`;
  }
  function bindSignin() { document.getElementById("asclin").addEventListener("click", () => { S.role = "clinician"; save(); if (location.hash === "#/clinician") render(); else go("/clinician"); }); }
  function showMode(m) {
    const el = document.getElementById("mode");
    if (el) el.textContent = m === "ai" ? "· AI guide: on" : m === "rules" ? "· AI guide: rules mode" : "";
  }
  window.addEventListener("hashchange", render);
  fetch("/api/health").then((r) => r.json()).then((h) => showMode(h.ai ? "ai" : "rules")).catch(() => {});
  render();
})();
