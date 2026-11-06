# PRH Family Hub (prototype)

One place for families and clinicians around the Parent Resource Hub programs.
Built for the Cincinnati Children's x Cintrifuse Digital Health Hackathon by Team CareNova. Sample content and made-up families only.

## Run (Windows)
1. Copy `.env.example` to `.env.local` and put your key on one line: `OPENAI_API_KEY=sk-...` (optional: without it the app runs in rules mode).
2. Double-click `start.cmd` (or run `node server.js`). The app opens at http://localhost:4000

No `npm install` needed.

## Screens
- Families: `/` story -> `/match` -> `/plan` -> `/first-step` -> `/my` (My hub)
- Courses: `/programs` -> `/course/:program` -> `/lesson/:program/:n` (video preview, key points, quick check, mark complete)
- Clinicians: `/clinician` (KPIs, funnel, referral links, nudges, families) -> `/clinician/family/:id`
- Referral link: `/#/?ref=tops` (also grow, iinteract, r2r)

## How the guide decides
The AI only reads the parent's words (age, hospitalized, concerns). Plain-code rules from the PRH clinicians pick the program:
hospitalized -> Road to Recovery; under 4 -> GROW; 4-9 -> I-InTERACT; 12+ -> TOPS; 10-11 or unclear -> PRH team.
Urgent words stop the flow and point to the child's doctor or 911. If the AI call fails, the app falls back to rules mode automatically.
