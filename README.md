# PRH Family Hub

**Making Parent Resource Hub easy to start, and easy to come back to.**

A working prototype built by **Team CareNova** for the Cincinnati Children's × Cintrifuse Digital Health Hackathon (Nov 6, 2026), on the **Parent Resource Hub (PRH)** project.

> Prototype only. Lesson text, families, and reminders are **sample data**. Not medical advice.

---

## The problem (what the PRH clinicians told us)

- **Parents create an account and never log in again**, so existing nudges never reach them and clinicians get no feedback.
- Programs **overlap**, and a parent who arrives alone has **no one to help them choose**.
- Parents **skip the foundation lessons** because they don't see why they matter.
- After referring a family, clinicians **don't know if they ever started**.

## Our solution: one umbrella, two doors

**Parent side**
1. The parent describes their child **in their own words**.
2. The AI picks out the key facts (age, hospital stay, concerns). **The clinicians' rules choose the program.**
3. The parent gets a **3-session personal plan** (not 29), with **why the first lesson matters for their child**.
4. **One 5-minute step for tonight**, plus **reminders they choose** and 3 personal weekly messages.
5. **My hub** shows progress and the next lesson, one click away.
6. **Courses you can walk through:** video preview, key points, a quick check, and "Mark complete."
7. **Ask PRH:** a helper that answers only from PRH program content and points to the right session.

**Clinician side (MeHealth, clinician-only access)**
- See **who started and where families stop** (funnel).
- **"Needs a nudge"** list for families with no progress in 3+ days, plus personal nudges.
- **Referral links** that open the app with the program already recommended.
- A page per family showing their journey.

**Safety:** urgent messages (e.g., a seizure) stop the flow and point to the child's doctor or 911. The app never diagnoses or gives medical advice.

---

## How to run it

**You need:** [Node.js](https://nodejs.org) 18 or newer. No `npm install` needed.

**Windows**
1. Download or clone this repo.
2. *(Optional, for AI mode)* Create a file named `.env.local` in the main folder with one line:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Double-click **`start.cmd`**, or open Command Prompt in the folder and run:
   ```
   node server.js
   ```
4. Open **http://localhost:4000**

**Mac / Linux**
```
node server.js
```
then open **http://localhost:4000**

**No OpenAI key?** The app still works in **rules mode**. The footer shows "AI guide: on" or "AI guide: rules mode."
**Port 4000 busy?** Run `PORT=4100 node server.js` (Windows cmd: `set PORT=4100` then `node server.js`).

---

## Demo walkthrough (about 3 minutes)

Tip: use a **private/incognito window** so you start fresh.

**Parent side**
1. On the home page, click the example **"Bike fall, bedtime meltdowns"**, then **Find my program**.
2. **Match:** see what the app understood (age 8, not hospitalized, bedtime meltdowns) and the program: **I-InTERACT**.
3. **See my plan:** 3 sessions, with "Why start with the first lesson?"
4. **Open lesson:** play the video preview, answer the quick check, then **Mark complete**.
5. Back on the plan, scroll down to **Start tonight's small step**: tonight's step, reminder choice, and the 3 weekly messages.
6. **My hub:** progress and "Up next."
7. *(Optional)* Click **Ask PRH** (bottom right) and try "How do I handle bedtime meltdowns?"

**Clinician side**
8. Click **Clinician sign-in**, then **Continue as clinician (demo)**.
9. See the funnel, the "needs a nudge" list, and **Demo family (this session)** at the top of the table: the parent you just played.
10. Click a family to see their journey, then **Send nudge**.
11. **Refer a family:** pick a program, click **Create link**, then **Open as the family** to see the "Your care team recommended…" banner.

**Safety**
12. **Sign out**, then type: *"My child is having a seizure right now"*. The urgent screen appears.

**More stories to try**
| Story | Result |
|---|---|
| "My daughter is 14 and was in the hospital for a week after a car crash." | Road to Recovery |
| "My 2 year old had a fall, wasn't admitted, and her sleep has changed." | GROW |
| "My 10 year old had a concussion a year ago." | Connect with the PRH team |
| "My son had a concussion and now has bedtime meltdowns." (no age) | The app asks for the child's age |

---

## How the guide decides

**The AI understands; the rules decide.**

1. **AI step 1** reads the story and extracts: age, hospitalized (yes/no/unknown), and current concerns in the parent's words.
2. **Rules (plain code, from the PRH clinicians)** pick the program:

   | Situation | Program |
   |---|---|
   | Hospitalized for the injury (any age) | Road to Recovery |
   | Age 0–3 | GROW |
   | Age 4–9 | I-InTERACT |
   | Age 10–11, or unclear | PRH team helps choose |
   | Age 12+ | TOPS |
   | Referral link from a clinician | The program the clinician chose |

3. **AI step 2** writes the personal plan: picks 3 sessions **only from that program's real session list** (checked in code), explains why the first lesson matters, and writes tonight's step and 3 weekly messages.

**Built-in safeguards**
- Urgent words are caught by code **before** any AI call.
- The AI can't decide eligibility or invent sessions.
- If the AI call fails, the app **automatically switches to rules mode**, so it never breaks.
- MeHealth (clinician view) is hidden from parents (demo role switch; in production, hospital single sign-on).

---

## Project structure

```
server.js          Tiny Node server: serves the app, /api/guide, /api/ask, /api/health
start.cmd          Windows: double-click to start
public/
  index.html       Page shell
  app.js           All screens (parent, courses, clinician) and navigation
  data.js          Programs, sessions, sample lessons, sample families
  styles.css       Cincinnati Children's color palette
  images/          Photos (free Unsplash license)
.env.example       Template for your OpenAI key (copy to .env.local; never commit it)
```

## What's real vs. sample

| Real | Sample (for the prototype) |
|---|---|
| AI story reading and plan writing (OpenAI API) | Lesson text and quiz questions |
| Matching rules from PRH clinicians | Families in the clinician view |
| TOPS session titles from the live PRH site | Reminder sending and "Send nudge" (simulated) |
| Safety stop and rules-mode fallback | Clinician sign-in (demo role switch) |

PRH's real, validated course content would plug in unchanged.

## Next steps

- Plug in real PRH course content and videos.
- Connect to **MeHealth** (referrals) and PRH's **Problem Solving Tool** (goals and reminders).
- Spanish version (PRH already supports Spanish).
- Pilot with referred families and measure: **% who start session 1, % who finish the first lesson, % who return in week 2.**

---

## Team CareNova
- **Aishu** ([@Aishu900](https://github.com/Aishu900))
- **Kusuma**

**Thanks** to the Cincinnati Children's PRH clinicians for their time and insights. They shaped everything we built.

**Built with:** Node.js, plain HTML/CSS/JavaScript, OpenAI API, and AI coding tools. Problem research, clinician interviews, design decisions, and testing by Team CareNova.
