import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      procedureType,
      customProcedure,
      classContext,
      includeVisuals,
      includeTeachingScript,
      includePracticeSchedule,
      includeReinforcement,
    } = await request.json();

    if (!procedureType && !customProcedure) {
      return Response.json(
        { error: "Procedure type or custom procedure is required" },
        { status: 400 }
      );
    }

    const procedureTypes = {
      "entering-class": "Entering the Classroom - Morning arrival or class start routine",
      "dismissal": "Dismissal - End of day/class exit routine",
      "transitions": "Transitions - Moving between activities or locations",
      "attention-signal": "Attention Signal - Getting students' attention",
      "bathroom": "Bathroom/Water - Restroom and water fountain procedures",
      "materials": "Getting Materials - Supplies, books, technology distribution",
      "group-work": "Group Work - Starting and managing collaborative work",
      "independent-work": "Independent Work - Silent work time expectations",
      "turning-in-work": "Turning In Work - Assignment submission procedures",
      "asking-help": "Asking for Help - How to get teacher assistance",
      "emergency": "Emergency Procedures - Fire drill, lockdown basics",
      "technology": "Technology Use - Device procedures and expectations",
      "supplies": "Classroom Supplies - Accessing shared materials",
      "homework": "Homework - Recording and submitting homework",
      "makeup-work": "Makeup Work - Procedures for missed assignments",
      "custom": "Custom Procedure",
    };

    const procedureName = customProcedure || procedureTypes[procedureType] || procedureType;

    const prompt = `You are an expert classroom management specialist who creates clear, teachable procedures that help classrooms run smoothly. You understand that procedures must be explicitly taught, practiced, and reinforced.

**PROCEDURE REQUEST:**

**Procedure:** ${procedureName}
**Grade Level:** ${gradeLevel || "Elementary"}
${classContext ? `**Class Context:** ${classContext}` : ""}

---

# 📋 Classroom Procedure: ${procedureName.split(' - ')[0]}

**Grade Level:** ${gradeLevel || "Elementary"}
**Time to Teach:** [X] minutes
**Practice Frequency:** [Daily/Weekly for first X weeks]

---

## 🎯 Purpose

**Why This Procedure Matters:**
[Explain why this procedure helps students and the classroom community]

**Student-Friendly Explanation:**
"[How to explain the 'why' to students in age-appropriate language]"

---

## 📝 The Procedure (Step-by-Step)

### Steps for Students:

**Step 1: [Action Verb] [Specific Action]**
- What it looks like: [Observable behavior]
- What it sounds like: [Volume level, words if any]

**Step 2: [Action Verb] [Specific Action]**
- What it looks like: [Observable behavior]
- What it sounds like: [Volume level, words if any]

**Step 3: [Action Verb] [Specific Action]**
- What it looks like: [Observable behavior]
- What it sounds like: [Volume level, words if any]

**Step 4: [Action Verb] [Specific Action]**
- What it looks like: [Observable behavior]
- What it sounds like: [Volume level, words if any]

[Add more steps as needed - typically 3-6 steps]

---

## ✅ Success Criteria

**Students are successful when:**
- [ ] [Observable criterion 1]
- [ ] [Observable criterion 2]
- [ ] [Observable criterion 3]

**The procedure is working when:**
- [ ] [Classroom indicator 1]
- [ ] [Classroom indicator 2]

---

${includeVisuals ? `
## 🖼️ Visual Support

### Anchor Chart Content

**[PROCEDURE NAME]**

1️⃣ [Step 1 - short phrase]
2️⃣ [Step 2 - short phrase]
3️⃣ [Step 3 - short phrase]
4️⃣ [Step 4 - short phrase]

**Remember:** [Key phrase or motto]

### Visual Cue Suggestions
- [Icon/image for step 1]
- [Icon/image for step 2]
- [Icon/image for step 3]
- [Icon/image for step 4]

### Poster Placement
- [Where to display for maximum visibility]

---
` : ""}

${includeTeachingScript ? `
## 🗣️ Teaching Script

### Day 1: Introduction (10-15 minutes)

**Hook:**
"[Engaging opening question or scenario]"

**Explain the Why:**
"[Script explaining importance - connect to student benefit]"

**Model - I Do:**
"Watch me demonstrate this procedure. Notice how I [specific things to observe]..."

[Demonstrate each step, thinking aloud]

**Guided Practice - We Do:**
"Now let's try this together. Everyone will [action]. Ready?"

[Practice 2-3 times together]

**Check for Understanding:**
- "What do we do first?"
- "Why is [step X] important?"
- "What does it look like when we [step]?"

**Independent Practice - You Do:**
"Now you'll practice on your own. I'll be watching for [specific criteria]."

[Have students practice while you observe and give feedback]

**Debrief:**
"What went well? What do we need to remember for next time?"

---
` : ""}

${includePracticeSchedule ? `
## 📅 Practice Schedule

### Week 1: Heavy Practice
| Day | Practice Opportunity | Notes |
|-----|---------------------|-------|
| Mon | Teach & practice 3x | Full modeling |
| Tue | Practice 3x | Positive reinforcement |
| Wed | Practice 2-3x | Quick reminders |
| Thu | Practice 2x | Note strugglers |
| Fri | Practice 2x | Celebrate success |

### Week 2: Maintenance
- Practice 1-2x daily
- Provide specific feedback
- Reteach to small groups if needed

### Week 3+: As Needed
- Practice after breaks/holidays
- Reteach if slipping
- Reinforce randomly

### Reteaching Triggers
Reteach the full procedure if:
- [ ] More than 3 students struggle
- [ ] After any break (weekend counts for young students)
- [ ] When a new student joins
- [ ] When procedures are slipping

---
` : ""}

${includeReinforcement ? `
## 🌟 Reinforcement Strategies

### Positive Reinforcement

**Verbal Praise (Specific):**
- "[Student name], I noticed you [specific step]. That helps our class!"
- "Table [X], you all [procedure] perfectly. Thank you!"
- "I see [X] students who remembered to [step]. Excellent!"

**Non-Verbal Acknowledgment:**
- Thumbs up
- Smile and nod
- Class signal for "great job"

**Classroom Rewards (Optional):**
- [Age-appropriate reward idea 1]
- [Age-appropriate reward idea 2]
- Class celebration when mastered

### Corrective Feedback

**If a student forgets:**
1. Private reminder: "[Name], remember to [step]"
2. Quick reteach: "Let me show you again..."
3. Practice opportunity: "Try that again"

**If many students forget:**
1. Stop activity
2. "I notice we need to review [procedure]"
3. Quick whole-class reteach
4. Practice together
5. Resume activity

**What NOT to do:**
- Don't embarrass students publicly
- Don't assume defiance (assume they forgot)
- Don't skip reteaching (it's not "wasting time")

---
` : ""}

## 🔄 Variations & Adaptations

**For Students Who Need Extra Support:**
- [Modification 1]
- [Modification 2]
- [Visual/physical cue]

**For Remote/Hybrid Learning:**
- [Adaptation if applicable]

**For Substitute Teachers:**
- [Simplified version for subs]

---

## ⚠️ Common Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| [Common issue 1] | [How to address] |
| [Common issue 2] | [How to address] |
| [Common issue 3] | [How to address] |

---

## 📊 Assessment & Tracking

**Observation Checklist:**
| Student/Group | Step 1 | Step 2 | Step 3 | Step 4 | Notes |
|---------------|--------|--------|--------|--------|-------|
| | ☐ | ☐ | ☐ | ☐ | |
| | ☐ | ☐ | ☐ | ☐ | |

**Mastery Indicators:**
- Approaching: Needs reminders for most steps
- Meeting: Follows with occasional reminders
- Exceeding: Follows independently and helps peers

---

**PROCEDURE DESIGN PRINCIPLES:**
- Clear, observable steps (no ambiguity)
- Age-appropriate expectations
- Positive framing (what TO do, not what NOT to do)
- Built-in practice and reinforcement
- Assumes need for explicit teaching`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const procedure = message.content[0].text;

    return Response.json({ procedure });
  } catch (error) {
    console.error("Error generating procedure:", error);
    return Response.json(
      { error: "Failed to generate procedure" },
      { status: 500 }
    );
  }
}