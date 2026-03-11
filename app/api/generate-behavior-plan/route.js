import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      behaviorConcern,
      behaviorContext,
      previousStrategies,
      studentStrengths,
      // New ABC / PBIS fields
      antecedents,
      consequences,
      functionOfBehavior,
      replacementBehaviorIdea,
      tierLevel,
      settingEvents,
      // Include options
      includeDataCollection,
      includeParentCommunication,
      includeReinforcementMenu,
    } = await request.json();

    if (!behaviorConcern) {
      return Response.json(
        { error: "Behavior concern is required" },
        { status: 400 }
      );
    }

    const tierLabel =
      tierLevel === "1"
        ? "Tier 1 – Universal (Classroom-Wide)"
        : tierLevel === "2"
        ? "Tier 2 – Targeted (Small Group / Check-In Check-Out)"
        : tierLevel === "3"
        ? "Tier 3 – Intensive (Individualized)"
        : "Tier 1 – Universal (Classroom-Wide)";

    const prompt = `You are an expert PBIS behavior specialist and school psychologist creating a research-grounded, function-based Positive Behavior Support Plan for an education professional. Ground every strategy in evidence-based PBIS frameworks (antecedent-behavior-consequence analysis, functional behavior assessment principles, replacement behavior teaching, differential reinforcement).

Use [Student Name] as a placeholder throughout — never a real name.

**INPUT DATA:**

- Grade Level: ${gradeLevel || "Elementary"}
- Support Tier: ${tierLabel}
- Behavior Concern: ${behaviorConcern}
${behaviorContext ? `- When/Where It Occurs: ${behaviorContext}` : ""}
${antecedents ? `- Known Antecedents/Triggers: ${antecedents}` : ""}
${consequences ? `- What Happens After (Consequences): ${consequences}` : ""}
${functionOfBehavior ? `- Suspected Function of Behavior: ${functionOfBehavior}` : ""}
${replacementBehaviorIdea ? `- Replacement Behavior in Mind: ${replacementBehaviorIdea}` : ""}
${settingEvents ? `- Setting Events / Slow Triggers: ${settingEvents}` : ""}
${previousStrategies ? `- Previously Tried: ${previousStrategies}` : ""}
${studentStrengths ? `- Student Strengths & Interests: ${studentStrengths}` : ""}

Generate a complete, polished Positive Behavior Support Plan using the exact structure below. Fill in all sections with specific, actionable, developmentally appropriate content based on the data provided. Do not leave placeholder brackets — generate real content. Use the ABC data and function hypothesis to drive every recommendation.

---

# 💚 Positive Behavior Support Plan

**Student:** [Student Name]
**Grade Level:** ${gradeLevel || "Elementary"}
**Support Tier:** ${tierLabel}
**Date Created:** _______________
**Review Date (6–8 weeks):** _______________
**Plan Developed By:** _______________

---

## 🔍 Behavior Description

### Target Behavior (Operational Definition)
[Write a precise, observable, measurable definition of the target behavior — what it looks like, sounds like, and does NOT include. An observer should be able to reliably identify it.]

### Baseline Data
| Metric | Current Level |
|--------|---------------|
| Frequency | |
| Duration | |
| Intensity | Low / Medium / High |
| Most Common Time/Setting | |

---

## 🔬 ABC Analysis

### Antecedents (What Happens BEFORE)
[List the identified antecedents/triggers. Be specific — include instructional demands, transitions, social contexts, sensory triggers, time of day, etc.]

- 
- 
- 

### Behavior (Observable Description)
[Restate the operational definition concisely]

### Consequences (What Happens AFTER)
[What does the student gain or avoid? This is the key to identifying function.]

- 
- 

### Setting Events (Slow Triggers)
[Conditions that increase behavior likelihood even when proximal triggers aren't present: hunger, sleep deprivation, illness, peer conflict earlier in day, medication changes, etc.]

- 
- 

---

## 🎯 Function of Behavior Hypothesis

**Primary Function:** [Based on the ABC data, what need is this behavior meeting?]

**Hypothesis Statement:**
"When [antecedent], [Student Name] engages in [behavior] in order to [function — escape/obtain attention/obtain tangible/meet sensory need]. This is maintained by [consequence that reinforces the behavior]."

**Supporting Evidence:**
[List 2–3 data points or patterns from the ABC analysis that support this hypothesis]

---

## ✅ Replacement Behavior

### Target Replacement
[Name the specific replacement behavior — it must be functionally equivalent (serves the same function), easier to perform than the problem behavior, and socially acceptable]

**Why This Replacement Works:**
- Serves the same function as the problem behavior
- Is easier and faster to perform
- Will receive the same outcome (student gets what they need)

### Teaching Plan
**Step 1 – Direct Instruction:**
[How and when to explicitly teach the skill: script, modeling, practice]

**Step 2 – Prompting:**
[How to prompt during real situations before escalation: visual, gestural, verbal]

**Step 3 – Reinforcement of Replacement:**
[How to reinforce immediately and consistently when the student uses the replacement]

---

## 🛡️ Antecedent Strategies (Prevention)

[Generate 5–7 specific, evidence-based antecedent modifications that address the identified triggers and function. These should proactively reduce the likelihood of the behavior occurring.]

| Strategy | How to Implement | Addresses |
|----------|-----------------|-----------|
| | | |
| | | |
| | | |
| | | |
| | | |

### Environmental Supports
[Any physical environment modifications, seating, visual supports, schedules]

### Pre-Correction
[Specific pre-correction statement to use before known trigger situations]

---

## 🌟 Consequence Strategies

### When [Student Name] Uses the REPLACEMENT Behavior:
**Immediately:**
- Deliver the reinforcer (honor the function — give the break, give the attention, etc.)
- Provide specific behavior-specific praise: "[Example praise statement]"
- [Any additional reinforcement action]

**Reinforcement Schedule:** [How frequently, fading plan]

### When the TARGET BEHAVIOR Occurs:

**DO:**
[List 3–4 specific, calm, consistent responses — minimize reinforcement of the problem behavior while prompting the replacement]

**DO NOT:**
[List 2–3 things that would inadvertently reinforce the behavior or escalate the situation]

**Planned Ignoring:** [When and how to use — if applicable to function]

**Redirection Script:**
"[Word-for-word prompt to redirect to replacement behavior]"

### Escalation Protocol
**Early Signs:** [What early warning signs look like]
**If Escalating:** [De-escalation steps in order]
**Crisis Threshold:** [When to involve admin/counselor/safety protocol — if applicable]

---

${
  includeReinforcementMenu
    ? `## 🎁 Reinforcement Menu

### Identify Preferred Reinforcers
*(Interview student and observe — reinforcement must be individualized)*

| Reinforcer | Type | Frequency |
|------------|------|-----------|
| Specific verbal praise | Social | Every instance |
| | Social | |
| | Activity | |
| | Tangible | |
| | | |

### Reinforcement Schedule
- **Initial Phase:** Continuous (every correct response)
- **Building Phase:** Variable ratio (every 2–3 responses)
- **Maintenance Phase:** Intermittent (unpredictable, infrequent)

### Token Economy (if applicable)
[Describe token system if appropriate for this student/tier]

---
`
    : ""
}

${
  includeDataCollection
    ? `## 📊 Data Collection

### ABC Data Sheet

**Student:** [Student Name] &nbsp;&nbsp; **Date:** _______ &nbsp;&nbsp; **Observer:** _______

| Time | Antecedent | Behavior (describe) | Consequence | Duration | Function? |
|------|------------|---------------------|-------------|----------|-----------|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

### Frequency Tracking

| Day | Tally (Problem Behavior) | Total | Tally (Replacement Behavior) | Total |
|-----|--------------------------|-------|-------------------------------|-------|
| Mon | | | | |
| Tue | | | | |
| Wed | | | | |
| Thu | | | | |
| Fri | | | | |
| **Week Total** | | | | |

### Progress Monitoring Goal
**Baseline:** [Current level]
**Goal:** Reduce [target behavior] to [goal level] AND increase [replacement behavior] to [goal level] by [date]

### Decision Rules
- **4 data points above goal line** → Consider fading support
- **4 data points below goal line** → Problem-solve, adjust plan
- **Plateau (no change)** → Review function hypothesis and reinforcement

---
`
    : ""
}

${
  includeParentCommunication
    ? `## 👨‍👩‍👧 Family Communication

### Initial Contact — Key Talking Points

**Opening (strengths-first):**
"We want to share some of the great things we're seeing with [Student Name], and also talk about a support plan we're putting in place to help them be even more successful."

**Describing the Behavior (non-judgmental, factual):**
"We've noticed that [Student Name] sometimes [brief description of behavior]. We think this happens because [function — stated as a need, not a flaw]."

**Sharing the Plan:**
"Here's what we're going to do at school to support them..."

**Home Consistency:**
"Here's how you can help at home to reinforce the same skills..."

**Communication Plan:**
- [ ] Daily behavior chart
- [ ] Weekly email/phone update
- [ ] Parent portal access
- [ ] Emergency contact protocol: _______________

### Progress Update Template

Dear [Parent/Guardian Name],

I wanted to update you on [Student Name]'s progress this week.

**Highlights:**
- 

**We're continuing to work on:**
- 

**You can reinforce at home by:**
- 

Thank you for your ongoing partnership. Please don't hesitate to reach out.

Warm regards,
[Teacher/Counselor Name]

---
`
    : ""
}

## 👥 Implementation Plan

### Staff Responsible
| Role | Staff Member | Responsibility |
|------|-------------|----------------|
| Primary Implementer | | |
| Data Collector | | |
| Parent Contact | | |
| Plan Coordinator | | |

### Training Needed
[List any training staff need before implementing — escape extinction, break card system, reinforcement procedures, crisis protocol]

### Fidelity Checklist (Daily)
- [ ] Antecedent strategies implemented
- [ ] Replacement behavior prompted/taught
- [ ] Replacement behavior reinforced consistently
- [ ] Consistent response to problem behavior
- [ ] Data collected

---

## 🔄 Review Schedule

| Review | When | Who |
|--------|------|-----|
| Initial check | After 1 week | Implementation team |
| Formal review | After 4–6 weeks | Full team + family |
| Plan revision (if needed) | After 8 weeks | IEP/student support team |

### Plan Adjustment Decision Tree
1. **Behavior decreasing + replacement increasing** → Stay the course, begin fading
2. **No change after 2 weeks** → Check fidelity first; then revisit function hypothesis
3. **Behavior increasing** → Immediate team consultation; consider FBA referral

---

**PBIS PRINCIPLES GUIDING THIS PLAN:**
Behavior is communication. All behavior serves a function. Prevention is more effective than reaction. Teach — don't just stop. Reinforce the replacement, not the problem. Consistency across all adults is essential.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const behaviorPlan = message.content[0].text;

    return Response.json({ behaviorPlan });
  } catch (error) {
    console.error("Error generating behavior plan:", error);
    return Response.json(
      { error: "Failed to generate behavior plan" },
      { status: 500 }
    );
  }
}