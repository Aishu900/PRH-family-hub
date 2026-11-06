// PRH Family Hub - program, course and sample clinician data.
// Program audiences follow parentresourcehub.org and what PRH clinicians told us (Nov 6).
// TOPS session titles come from the live TOPS dashboard. Lesson text is SAMPLE content written for this prototype;
// the real, validated PRH course content would plug in here unchanged.
(function () {
  const PROGRAMS = {
    grow: {
      id: "grow", name: "GROW", tag: "Ages 0-3", color: "#00738C",
      who: "Parents of young children (0-3) after a traumatic brain injury",
      what: "Self-paced modules on development, responsive parenting and play",
      sessions: [
        { title: "Understanding Your Young Child's Brain Injury", minutes: 10, summary: "How a brain injury can affect a young child's development, sleep and behavior.",
          points: ["Young brains keep developing after an injury, so changes can show up over time.", "Changes in sleep, mood or play are common things to notice and write down.", "Your observations are valuable information for your child's care team."],
          check: { q: "You notice a new change in your toddler's sleep. What's a good next step?", options: ["Search online and decide on your own", "Note it down and share it with your child's care team", "Wait a few months before mentioning it"], answer: 1, explain: "Your notes help the care team see patterns. They're the right people to interpret changes." } },
        { title: "Responsive Parenting", minutes: 15, summary: "Noticing your child's cues and responding warmly.",
          points: ["Watch for cues: sounds, gestures, where your child looks.", "Respond warmly and name what you see: \"You want the ball!\"", "Small, frequent moments of connection matter more than long ones."],
          check: { q: "Your toddler reaches for a toy and fusses. A responsive reply is…", options: ["Ignore it so they learn to wait", "Notice it, name it, and help them reach it", "Put the toy away"], answer: 1, explain: "Naming and responding to cues builds trust and early communication." } },
        { title: "Helping Your Child Focus and Play", minutes: 15, summary: "Play-based ways to support attention.",
          points: ["Keep play short and calm, with fewer toys out at once.", "Follow your child's lead and join what interests them.", "Turn off background screens during play time."],
          check: { q: "Which play set-up best supports focus?", options: ["Many toys and the TV on", "A few toys, quiet room, child leads", "Long, adult-planned activities"], answer: 1, explain: "Fewer distractions and child-led play make it easier to stay engaged." } },
        { title: "Caring for Yourself", minutes: 10, summary: "Managing your own stress so you can keep going.",
          points: ["Your wellbeing is part of your child's recovery too.", "Plan small breaks, even 5 minutes.", "Asking for help is a strength, not a failure."],
          check: { q: "Which is a realistic self-care step this week?", options: ["Wait until things calm down", "A 5-minute break you plan ahead", "Do everything yourself"], answer: 1, explain: "Small, planned breaks are more likely to actually happen." } },
      ],
    },
    iinteract: {
      id: "iinteract", name: "I-InTERACT", tag: "Ages 4-9", color: "#005F73",
      who: "Parents of children 4-9 with a brain injury or brain condition and behavior challenges",
      what: "Online sessions on positive behavior, praise, routines and calm responses",
      sessions: [
        { title: "Why Positive Attention Matters", minutes: 10, summary: "How warmth and praise change behavior.",
          points: ["Children repeat what gets attention, so catch the good moments.", "Positive attention builds connection, which makes hard moments easier.", "A few minutes of warm attention each day makes a difference."],
          check: { q: "Which response gives positive attention?", options: ["\"Finally, you did it.\"", "\"You put your shoes on by yourself. Great job!\"", "Saying nothing so they don't expect praise"], answer: 1, explain: "Specific, warm praise tells your child exactly what to repeat." } },
        { title: "Praise That Works", minutes: 15, summary: "Specific praise to encourage the behavior you want.",
          points: ["Be specific: name exactly what they did.", "Praise effort, not just results.", "Praise soon after the behavior."],
          check: { q: "Which praise is most effective?", options: ["\"Good job.\"", "\"You kept trying on that puzzle even when it was hard!\"", "\"You're the best kid ever.\""], answer: 1, explain: "Specific praise about effort helps the behavior stick." } },
        { title: "Calm Routines for Bedtime and Transitions", minutes: 15, summary: "Making hard moments of the day more predictable.",
          points: ["Use the same steps in the same order each night.", "Give a 5-minute warning before transitions.", "A simple picture chart helps children know what comes next."],
          check: { q: "What makes bedtime more predictable?", options: ["A different routine each night", "The same short steps in the same order", "Bedtime whenever they seem tired"], answer: 1, explain: "Predictable steps reduce surprises, which reduces meltdowns." } },
        { title: "Handling Meltdowns and Tantrums", minutes: 15, summary: "Consistent, calm responses to big emotions.",
          points: ["Stay calm and keep your voice low.", "Keep everyone safe, then wait for the storm to pass.", "Talk about it later, when everyone is calm."],
          check: { q: "During a meltdown, the first priority is…", options: ["Explaining why the behavior is wrong", "Staying calm and keeping everyone safe", "Giving in so it stops"], answer: 1, explain: "Calm and safety first. Teaching works better once everyone has settled." } },
        { title: "Managing Parenting Stress", minutes: 10, summary: "Looking after yourself so you can stay calm.",
          points: ["Stress is normal. You're doing a hard job.", "Notice your own early stress signs.", "Have one quick calming step ready, like three slow breaths."],
          check: { q: "A quick way to reset when you feel stress rising is…", options: ["Three slow breaths before responding", "Raising your voice", "Leaving it for later"], answer: 0, explain: "A short pause helps you respond the way you want to." } },
      ],
    },
    r2r: {
      id: "r2r", name: "Road to Recovery", tag: "After a hospital stay", color: "#8F4469",
      who: "Parents of children (3 months-18 years) recently hospitalized for a traumatic brain injury",
      what: "Support for the first weeks and months at home: what to expect, parenting, self-care",
      sessions: [
        { title: "Coming Home from the Hospital", minutes: 10, summary: "What to expect in the first weeks at home.",
          points: ["Recovery takes time, and every child's path is different.", "Follow your care team's discharge instructions closely.", "Keep a simple notebook of questions for follow-up visits."],
          check: { q: "A good habit for the first weeks at home is…", options: ["Keeping a notebook of questions for your care team", "Getting back to the full schedule right away", "Changing instructions if things seem fine"], answer: 0, explain: "Writing questions down makes follow-up visits more useful." } },
        { title: "Understanding Recovery", minutes: 15, summary: "Common changes after a brain injury and how recovery unfolds.",
          points: ["Tiredness, headaches and mood changes are common to notice.", "Progress can be uneven, with good days and harder days.", "Share changes with your care team rather than guessing."],
          check: { q: "If recovery has a harder day after good ones…", options: ["It means recovery has failed", "Uneven progress is common; note it and share it", "Stop all routines"], answer: 1, explain: "Recovery is often uneven. Your notes help the team see the bigger picture." } },
        { title: "Balancing Rest and Activity", minutes: 15, summary: "Getting back to routines step by step.",
          points: ["Follow your care team's guidance on activity.", "Build in rest breaks during the day.", "Increase activity gradually, one step at a time."],
          check: { q: "Returning to activities works best when…", options: ["Everything restarts at once", "It's gradual, with planned rest breaks", "Rest only at night"], answer: 1, explain: "Step-by-step return with breaks is easier to manage." } },
        { title: "Returning to School", minutes: 15, summary: "Working with teachers on a gradual return.",
          points: ["Talk with the school before your child returns.", "Ask about temporary supports like breaks or extra time.", "Check in regularly with teachers in the first weeks."],
          check: { q: "Before your child returns to school, it helps to…", options: ["Say nothing to avoid labels", "Talk with the school about temporary supports", "Wait for problems to appear"], answer: 1, explain: "Planning supports ahead makes the return smoother." } },
        { title: "Caring for the Whole Family", minutes: 10, summary: "Siblings, partners and your own wellbeing.",
          points: ["Siblings may feel worried or left out. Make small one-on-one time.", "Share tasks with your partner or support network.", "Your rest matters too."],
          check: { q: "A simple way to support a sibling is…", options: ["Short one-on-one time each week", "Keeping them out of the loop", "Expecting them to manage alone"], answer: 0, explain: "A little dedicated time helps siblings feel included." } },
      ],
    },
    tops: {
      id: "tops", name: "Teen Online Problem Solving (TOPS)", tag: "Teens 12+", color: "#CA3D6A",
      who: "Teens and young adults (12+) with a brain injury or brain condition, and their families",
      what: "Sessions on problem solving, staying positive, getting organized and managing emotions",
      sessions: [
        { title: "Getting Started", minutes: 10, summary: "Get to know the program, hear from other families, and set a first goal.",
          points: ["TOPS works best when you and your teen pick one goal together.", "Goals should be small and specific, like \"homework started by 7 pm\".", "Every later session builds on the goal you set here."],
          check: { q: "Which is a good first goal?", options: ["\"Be better at school\"", "\"Start homework by 7 pm on school nights\"", "\"Never get angry again\""], answer: 1, explain: "Small, specific goals are easier to work on and to celebrate." } },
        { title: "Staying Positive", minutes: 15, summary: "Ways to shift mindset and boost mood.",
          points: ["Thoughts affect feelings: notice helpful and unhelpful thoughts.", "Swap \"I can't\" for \"I can't yet\".", "Plan one enjoyable activity each day."],
          check: { q: "Which thought is more helpful?", options: ["\"I'll never get this.\"", "\"This is hard, but I can try one step.\"", "\"Why bother?\""], answer: 1, explain: "Helpful thoughts are realistic and point to a next step." } },
        { title: "Solving Problems", minutes: 15, summary: "Tools to solve problems and communicate as a family.",
          points: ["Use A-B-C-D-E: Aim, Brainstorm, Choose, Do it, Evaluate.", "Brainstorm without judging ideas first.", "Review what worked, and adjust."],
          check: { q: "In A-B-C-D-E, \"B\" stands for…", options: ["Blame", "Brainstorm", "Break"], answer: 1, explain: "Brainstorming many ideas first leads to better choices." } },
        { title: "Getting Organized", minutes: 15, summary: "A toolkit for getting things done and staying on track.",
          points: ["Use one planner or phone calendar for everything.", "Break big tasks into small steps.", "Set reminders for the most important tasks."],
          check: { q: "A big project feels overwhelming. Best first move?", options: ["Wait until the night before", "Break it into small steps with dates", "Do it all at once"], answer: 1, explain: "Small steps with dates make big tasks manageable." } },
        { title: "Staying In Control", minutes: 15, summary: "Staying in control of emotions.",
          points: ["Notice early warning signs in your body.", "Pause before reacting: step away or breathe.", "Return to the problem when calm."],
          check: { q: "An early sign you're getting angry might be…", options: ["Tight fists or a hot face", "Feeling sleepy", "Feeling hungry"], answer: 0, explain: "Spotting body signs early gives you time to pause." } },
        { title: "Managing Difficult Emotions", minutes: 15, summary: "Why brain conditions can affect emotional control, and what helps.",
          points: ["A brain injury can make strong feelings harder to manage. It's not a character flaw.", "Name the feeling to tame it.", "Have a go-to calming plan ready."],
          check: { q: "Naming a feeling (\"I'm frustrated\") helps because…", options: ["It makes the feeling stronger", "It helps you step back and choose a response", "It doesn't help"], answer: 1, explain: "Putting a feeling into words creates space to choose what to do." } },
        { title: "Talking with Your Teen/Young Adult", minutes: 15, summary: "For parents: communicating with your teen.",
          points: ["Listen first. Summarize what you heard.", "Pick calm times for important talks.", "Ask open questions: \"What would help this week?\""],
          check: { q: "Which question opens a conversation best?", options: ["\"Why can't you just try harder?\"", "\"What would make this week easier?\"", "\"Did you do it, yes or no?\""], answer: 1, explain: "Open questions invite your teen to share and problem-solve with you." } },
      ],
    },
  };

  // Sample referred families for the clinician view (made-up first names, no real patient data).
  // stage: 0 invited, 1 first step done, 2 session 1 started, 3 active (2+ sessions)
  const FAMILIES = [
    { id: "f1", name: "Maya's family", age: 14, program: "tops", stage: 3, sessions: 4, days: 0, concerns: ["anger", "homework"], step: "Wrote one shared goal with Maya" },
    { id: "f2", name: "Leo's family", age: 7, program: "iinteract", stage: 3, sessions: 3, days: 0, concerns: ["bedtime meltdowns"], step: "Named one thing Leo did well at bedtime" },
    { id: "f3", name: "Ava's family", age: 11, program: "r2r", stage: 2, sessions: 1, days: 1, concerns: ["tiredness", "school"], step: "Set up a rest corner" },
    { id: "f4", name: "Noah's family", age: 16, program: "tops", stage: 2, sessions: 1, days: 1, concerns: ["focus", "low mood"], step: "Picked one evening routine" },
    { id: "f5", name: "Zara's family", age: 2, program: "grow", stage: 2, sessions: 1, days: 2, concerns: ["sleep"], step: "Started a sleep notebook" },
    { id: "f6", name: "Eli's family", age: 5, program: "iinteract", stage: 3, sessions: 2, days: 2, concerns: ["tantrums"], step: "Five minutes of child-led play" },
    { id: "f7", name: "Ivy's family", age: 8, program: "iinteract", stage: 1, sessions: 0, days: 1, concerns: ["homework frustration"], step: "Praised effort on homework" },
    { id: "f8", name: "Sam's family", age: 13, program: "tops", stage: 1, sessions: 0, days: 4, concerns: ["forgetfulness"], step: "Set up a phone calendar" },
    { id: "f9", name: "Nora's family", age: 1, program: "grow", stage: 1, sessions: 0, days: 5, concerns: ["feeding", "sleep"], step: "Noted sleep changes for the care team" },
    { id: "f10", name: "Jay's family", age: 9, program: "r2r", stage: 1, sessions: 0, days: 6, concerns: ["headaches"], step: "Wrote questions for the follow-up visit" },
    { id: "f11", name: "Lila's family", age: 15, program: "tops", stage: 0, sessions: 0, days: 0, concerns: [], step: "" },
    { id: "f12", name: "Ben's family", age: 6, program: "iinteract", stage: 0, sessions: 0, days: 1, concerns: [], step: "" },
    { id: "f13", name: "Mia's family", age: 12, program: "tops", stage: 0, sessions: 0, days: 4, concerns: [], step: "" },
    { id: "f14", name: "Theo's family", age: 10, program: "r2r", stage: 0, sessions: 0, days: 5, concerns: [], step: "" },
    { id: "f15", name: "Aria's family", age: 4, program: "iinteract", stage: 0, sessions: 0, days: 6, concerns: [], step: "" },
    { id: "f16", name: "Kai's family", age: 2, program: "grow", stage: 0, sessions: 0, days: 8, concerns: [], step: "" },
    { id: "f17", name: "Ella's family", age: 14, program: "tops", stage: 0, sessions: 0, days: 9, concerns: [], step: "" },
    { id: "f18", name: "Finn's family", age: 7, program: "iinteract", stage: 0, sessions: 0, days: 12, concerns: [], step: "" },
    { id: "f19", name: "Ruby's family", age: 13, program: "tops", stage: 3, sessions: 5, days: 3, concerns: ["friendships"], step: "Brainstormed with A-B-C-D-E" },
    { id: "f20", name: "Omar's family", age: 6, program: "r2r", stage: 2, sessions: 1, days: 4, concerns: ["school"], step: "Met with the teacher" },
  ];

  const api = { PROGRAMS, FAMILIES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.PRH = api;
})();
