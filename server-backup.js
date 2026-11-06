// PRH Family Hub - tiny local server (no npm install needed).
// Serves the app from /public and provides POST /api/guide.
// AI: uses OpenAI if OPENAI_API_KEY is set (in .env.local or the environment).
// If the key is missing or the call fails, it falls back to a built-in rules mode, so the demo never breaks.
// Run:  node server.js   (or double-click start.cmd on Windows)

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 4000;
const ROOT = path.join(__dirname, "public");
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ---- load .env.local (KEY=value lines) ----
for (const envPath of [path.join(__dirname, ".env.local"), path.join(__dirname, "..", ".env.local")]) {
  try {
    const envText = fs.readFileSync(envPath, "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* not found: try the next one, or run in rules-only mode */ }
}

const { PROGRAMS } = require("./public/data.js");

// ---------- Rules (from the PRH clinicians, Nov 6) ----------
// Road to Recovery requires hospitalization. Otherwise clinicians decide mainly by age. Unclear -> clinician.
function pickProgram(age, hospitalized) {
  if (hospitalized === "yes") return { id: "r2r", reason: "Your child was hospitalized for a brain injury, and Road to Recovery is built for families after a hospital stay." };
  if (age === null) return { id: null, reason: "We need a little more information, like your child's age, to suggest the right program." };
  if (age < 3) return { id: "grow", reason: "GROW is designed for parents of young children (0-3) after a brain injury." };
  if (age <= 9) return { id: "iinteract", reason: "I-InTERACT is designed for parents of children 3-9 and focuses on everyday behavior." };
  if (age >= 12) return { id: "tops", reason: "TOPS is designed for teens and young adults, and their parents." };
  return { id: null, reason: "For a child this age, a PRH team member can help choose the best fit." };
}

const URGENT = ["seizure", "seizing", "unconscious", "not breathing", "can't breathe", "cannot breathe", "passed out",
  "won't wake", "will not wake", "vomiting blood", "suicid", "kill myself", "kill himself", "kill herself",
  "hurt himself", "hurt herself", "self-harm", "self harm", "overdose"];
const looksUrgent = (t) => URGENT.some((w) => t.toLowerCase().includes(w));

// ---------- Offline extraction (fallback when AI is unavailable) ----------
const CONCERN_WORDS = [
  ["meltdown", "meltdowns"], ["tantrum", "tantrums"], ["bedtime", "bedtime struggles"], ["sleep", "sleep"],
  ["homework", "homework frustration"], ["school", "school"], ["focus", "trouble focusing"], ["attention", "trouble focusing"],
  ["anger", "anger"], ["angry", "anger"], ["tired", "tiredness"], ["fatigue", "tiredness"], ["headache", "headaches"],
  ["memory", "memory"], ["forget", "forgetfulness"], ["mood", "mood changes"], ["sad", "low mood"], ["anxious", "worry"],
  ["worr", "worry"], ["friends", "friendships"], ["frustrat", "frustration"], ["stress", "family stress"],
];
function offlineExtract(story) {
  const t = story.toLowerCase();
  let age = null;
  const y = t.match(/(\d{1,2})\s*(?:-|\s)?\s*(?:year|yr)s?[\s-]*old/) || t.match(/\b(?:is|turned|aged?)\s+(\d{1,2})\b/) || t.match(/\bmy\s+(\d{1,2})\b/);
  const mo = t.match(/(\d{1,2})\s*(?:-|\s)?\s*months?[\s-]*old/);
  if (mo) age = Math.round((Number(mo[1]) / 12) * 10) / 10;
  else if (y) age = Number(y[1]);
  const notAdmitted = /(not admitted|wasn'?t admitted|weren'?t admitted|sent home from the er|only the er|just the er)/.test(t);
  const hosp = /(hospital|admitted|icu|picu|inpatient)/.test(t);
  const hospitalized = notAdmitted ? "no" : hosp ? "yes" : "unknown";
  const concerns = [...new Set(CONCERN_WORDS.filter(([k]) => t.includes(k)).map(([, v]) => v))].slice(0, 3);
  return { age, hospitalized, concerns };
}
function offlinePlan(program, concerns) {
  const c = concerns[0] || "what you described";
  const picks = program.sessions.slice(0, 3);
  return {
    foundationWhy: `You mentioned ${c}. "${picks[0].title}" is short and sets up the skills the rest of your plan builds on.`,
    sessions: picks.map((s, i) => ({ idx: program.sessions.indexOf(s), title: s.title, minutes: s.minutes,
      why: i === 0 ? "Short first lesson. Everything else in your plan builds on it." : `Practical ideas for ${concerns[i] || c}.` })),
    firstStep: "Tonight, name one thing your child did well today, out loud.",
    weekTexts: [
      { day: "Mon", kind: "fact", text: "Small, calm moments add up. Changes after a brain injury are common, and you're not alone." },
      { day: "Wed", kind: "tip", text: `Try one idea from "${picks[1] ? picks[1].title : picks[0].title}" today. Five minutes is enough.` },
      { day: "Fri", kind: "growth", text: "How did this week go? Notice one small win, and celebrate it." },
    ],
  };
}

// ---------- OpenAI ----------
async function askJSON(system, user) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("no key");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, temperature: 0.3, response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

const EXTRACT_PROMPT = `You read a parent's description of their child and extract facts. Never diagnose or give medical advice.
Return JSON only: {"age": number or null (years; 18 months = 1.5), "hospitalized": "yes"|"no"|"unknown" (admitted to a hospital for this injury; ER only = "no"),
"concerns": [what the parent worries about NOW, such as behaviors, moods, sleep, school, in their own words, max 3; never the injury or accident itself],
"urgent": true|false (only a current emergency: seizure, unconsciousness, trouble breathing, thoughts of self-harm)}`;

const PLAN_PROMPT = `You are FamilyGuide, a warm guide for the Parent Resource Hub (validated online programs for families).
Rules: choose ONLY from the numbered sessions given (use their idx). Never diagnose, give medical advice, or promise outcomes.
Plain, kind, short sentences (max 25 words). Quote a short phrase of the parent's own words. Never guess how the child feels inside.
Do not use the words "foundation", "crucial", or "essential".
Return JSON only:
{"sessions": [{"idx": number, "why": one sentence tying it to the parent's concerns}] (exactly 3; the first must be idx 0),
 "foundationWhy": one or two sentences starting "You mentioned", explaining why starting with the first lesson (name it) helps,
 "firstStep": one small concrete thing to do today (5 minutes),
 "weekTexts": [{"day":"Mon","kind":"fact","text":...},{"day":"Wed","kind":"tip","text":...},{"day":"Fri","kind":"growth","text":...}] (each under 160 chars, warm, uses the parent's words)}`;

async function runGuide(story, referredProgram) {
  story = String(story || "").trim().slice(0, 2000);
  const base = { urgent: false, child: { age: null, hospitalized: "unknown", concerns: [] }, program: null,
    needsClinician: false, reason: "", foundationWhy: "", sessions: [], firstStep: "", weekTexts: [], mode: "ai" };
  if (!story) return { ...base, needsClinician: true, reason: "Tell us a little about your child to get started." };
  if (looksUrgent(story)) return { ...base, urgent: true };

  let mode = "ai";
  let ex;
  try { ex = await askJSON(EXTRACT_PROMPT, story); }
  catch { mode = "rules"; ex = offlineExtract(story); }
  if (ex.urgent === true) return { ...base, urgent: true, mode };

  const child = {
    age: typeof ex.age === "number" ? ex.age : null,
    hospitalized: ["yes", "no", "unknown"].includes(ex.hospitalized) ? ex.hospitalized : "unknown",
    concerns: Array.isArray(ex.concerns) ? ex.concerns.slice(0, 3).map(String) : [],
  };

  let pid, reason;
  if (referredProgram && PROGRAMS[referredProgram]) { pid = referredProgram; reason = `Your care team recommended ${PROGRAMS[pid].name} for your family.`; }
  else { const r = pickProgram(child.age, child.hospitalized); pid = r.id; reason = r.reason; }
  if (!pid) return { ...base, child, needsClinician: true, reason, mode };

  const program = PROGRAMS[pid];
  let plan;
  if (mode === "ai") {
    try {
      const list = program.sessions.map((s, i) => `${i}. ${s.title}: ${s.summary}`).join("\n");
      const p = await askJSON(PLAN_PROMPT, `Program: ${program.name}\nSessions:\n${list}\n\nParent's story: ${story}\nConcerns: ${child.concerns.join("; ")}`);
      const clean = (t) => String(t || "").replace(/\s*\(FOUNDATION\)/gi, "").slice(0, 240);
      let sessions = (Array.isArray(p.sessions) ? p.sessions : [])
        .filter((s) => Number.isInteger(s.idx) && program.sessions[s.idx])
        .map((s) => ({ idx: s.idx, title: program.sessions[s.idx].title, minutes: program.sessions[s.idx].minutes, why: clean(s.why) }));
      sessions = sessions.filter((s, i, a) => a.findIndex((x) => x.idx === s.idx) === i);
      if (!sessions.some((s) => s.idx === 0)) sessions.unshift({ idx: 0, title: program.sessions[0].title, minutes: program.sessions[0].minutes, why: "" });
      sessions.sort((a, b) => (a.idx === 0 ? -1 : b.idx === 0 ? 1 : 0));
      sessions = sessions.slice(0, 3);
      sessions[0].why = "Short first lesson. Everything else in your plan builds on it.";
      const kinds = ["fact", "tip", "growth"];
      plan = {
        foundationWhy: clean(p.foundationWhy),
        sessions,
        firstStep: clean(p.firstStep) || "Tonight, name one thing your child did well today, out loud.",
        weekTexts: (Array.isArray(p.weekTexts) ? p.weekTexts : []).filter((t) => t && kinds.includes(t.kind)).slice(0, 3)
          .map((t) => ({ day: String(t.day || ""), kind: t.kind, text: clean(t.text) })),
      };
      if (plan.sessions.length < 3 || !plan.foundationWhy) throw new Error("thin plan");
      if (plan.weekTexts.length < 3) plan.weekTexts = offlinePlan(program, child.concerns).weekTexts;
    } catch { mode = "rules"; plan = offlinePlan(program, child.concerns); }
  } else plan = offlinePlan(program, child.concerns);

  return { ...base, child, program: { id: pid, name: program.name }, reason, ...plan, mode };
}

// ---------- HTTP ----------
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".json": "application/json" };

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/guide") {
      let body = "";
      for await (const chunk of req) { body += chunk; if (body.length > 20000) break; }
      const { story, referredProgram } = JSON.parse(body || "{}");
      const out = await runGuide(story, referredProgram || null);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(out));
    }
    if (req.url === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ai: Boolean(process.env.OPENAI_API_KEY) }));
    }
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p === "/") p = "/index.html";
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) {
        fs.readFile(path.join(ROOT, "index.html"), (e2, html) => {
          res.writeHead(e2 ? 404 : 200, { "Content-Type": TYPES[".html"] });
          res.end(e2 ? "Not found" : html);
        });
        return;
      }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  } catch (e) {
    console.error(e);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Something went wrong" }));
  }
});

server.listen(PORT, () => {
  console.log(`\n  PRH Family Hub is running:  http://localhost:${PORT}`);
  console.log(`  AI mode: ${process.env.OPENAI_API_KEY ? "OpenAI (falls back to rules if it fails)" : "rules only (no OPENAI_API_KEY found)"}\n`);
});
