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

    const prompt = `You are a positive behavior intervention specialist who creates supportive, function-based behavior plans that focus on teaching replacement behaviors and addressing underlying needs.

**BEHAVIOR PLAN REQUEST:**

**Student Information:**
- Grade Level: ${gradeLevel || "Elementary"}
- Behavior Concern: ${behaviorConcern}
${behaviorContext ? `- When/Where it Occurs: ${behaviorContext}` : ""}
${previousStrategies ? `- Previously Tried: ${previousStrategies}` : ""}
${studentStrengths ? `- Student Strengths: ${studentStrengths}` : ""}

---

# 💚 Positive Behavior Support Plan

**Grade Level:** ${gradeLevel || "Elementary"}
**Target Behavior:** ${behaviorConcern}
**Date Created:** _______________
**Review Date:** _______________

---

## 🔍 Behavior Description

### Target Behavior (Observable & Measurable)
**What it looks like:**
[Describe the behavior in specific, observable terms - what would someone see/hear?]

**What it does NOT include:**
[Clarify what behaviors are not part of this concern]

### Baseline Data
| Metric | Current Level |
|--------|---------------|
| Frequency | _____ times per [hour/day/week] |
| Duration | _____ minutes per occurrence |
| Intensity | Low / Medium / High |

---

## 🎯 Hypothesis: Why This Behavior?

### Possible Function(s)

**The student may be trying to:**
- [ ] **Escape/Avoid:** Get away from [task, situation, person, sensation]
- [ ] **Obtain Attention:** Get attention from [peers, teacher, specific person]
- [ ] **Obtain Tangible:** Get access to [item, activity, privilege]
- [ ] **Sensory:** Meet a sensory need [movement, stimulation, regulation]

**Most Likely Function:** [Primary hypothesis]

### Antecedents (Triggers)
What typically happens BEFORE the behavior:
- [Trigger 1]
- [Trigger 2]
- [Trigger 3]

### Setting Events
Conditions that make the behavior more likely:
- [Setting event 1 - e.g., poor sleep, missed breakfast]
- [Setting event 2 - e.g., transitions, unstructured time]

---

## ✅ Replacement Behavior

### Instead of [problem behavior], the student will:
**Replacement Behavior:** [Specific alternative that serves same function]

**Why this works:**
- Serves the same function (gets the student what they need)
- Is easier/more efficient than the problem behavior
- Is socially acceptable

### Teaching the Replacement
**Direct instruction:**
1. [How to explicitly teach the replacement behavior]
2. [Practice opportunities]
3. [Feedback and reinforcement]

---

## 🛡️ Prevention Strategies

### Environmental Modifications
| Change | How | Why |
|--------|-----|-----|
| [Modification 1] | [Implementation] | [Addresses trigger/function] |
| [Modification 2] | [Implementation] | [Addresses trigger/function] |
| [Modification 3] | [Implementation] | [Addresses trigger/function] |

### Proactive Supports
**Before potential trigger situations:**
- [Proactive strategy 1]
- [Proactive strategy 2]
- [Check-in/pre-correction]

### Schedule Adjustments
- [Any schedule modifications]
- [Built-in breaks if needed]
- [Transition supports]

---

## 🌟 Response Strategies

### When Student Uses REPLACEMENT Behavior:
**Immediately:**
- [Acknowledge the appropriate behavior]
- [Provide what they were seeking - attention, break, etc.]
- [Specific praise: "I noticed you..."]

**Consistently:**
- [Reinforcement schedule]
- [Connection to larger reward system if applicable]

### When Student Shows PROBLEM Behavior:

**DO:**
- Remain calm and neutral
- [Specific response strategy 1]
- [Specific response strategy 2]
- Redirect to replacement behavior: "[Prompt]"
- [Safety considerations if applicable]

**DO NOT:**
- [What to avoid - may reinforce behavior]
- [What to avoid - may escalate situation]
- Give extended attention to the behavior

### De-escalation Script:
"[Word-for-word what to say if behavior escalates]"

---

${includeReinforcementMenu ? `
## 🎁 Reinforcement Menu

### High-Frequency Reinforcers (Free/Easy)
- Specific praise
- High-five/fist bump
- Positive note home
- [Age-appropriate option]
- [Age-appropriate option]

### Medium Reinforcers (Some Cost)
- [Option 1]
- [Option 2]
- [Option 3]
- Choice of [activity]
- Helper role

### Special Reinforcers (Earned Over Time)
- [Bigger reward 1]
- [Bigger reward 2]
- [Special privilege]

### Student Preferences:
- Likes: _______________
- Interests: _______________
- Motivators: _______________

---
` : ""}

${includeDataCollection ? `
## 📊 Data Collection

### Daily Tracking Form

**Date:** _______ **Staff:** _______

| Time | Antecedent | Behavior | Response | Duration | Notes |
|------|------------|----------|----------|----------|-------|
| | | | | | |
| | | | | | |
| | | | | | |

### Frequency Count
| Day | Tally | Total |
|-----|-------|-------|
| Mon | | |
| Tue | | |
| Wed | | |
| Thu | | |
| Fri | | |

### Progress Monitoring Goal
**Goal:** Reduce [behavior] from [baseline] to [target] by [date]

**Weekly Check:**
- [ ] Is the behavior decreasing?
- [ ] Is the replacement behavior increasing?
- [ ] Are strategies being implemented consistently?

---
` : ""}

${includeParentCommunication ? `
## 👨‍👩‍👧 Parent Communication

### Initial Meeting Talking Points

**Frame Positively:**
"We're creating a support plan to help [student] be more successful in [specific area]."

**Share:**
- What we're seeing (factual, not judgmental)
- What we think the student needs
- What we're going to try
- How parents can support at home

**Home Strategies:**
- [What parents can do at home]
- [Consistency between home and school]
- [Communication plan]

### Progress Update Template

Dear [Parent],

I wanted to update you on [student's] progress with [target area].

**Successes this week:**
- [Positive observation]
- [Progress noted]

**We're continuing to work on:**
- [Ongoing focus]

**You can help by:**
- [Home support]

Please let me know if you have any questions!

---
` : ""}

## 📋 Implementation Checklist

### Setup (Before Starting)
- [ ] All staff trained on plan
- [ ] Materials/visuals prepared
- [ ] Data collection forms ready
- [ ] Reinforcement menu created
- [ ] Parent informed

### Daily
- [ ] Implement prevention strategies
- [ ] Teach/prompt replacement behavior
- [ ] Respond consistently to behaviors
- [ ] Collect data
- [ ] Provide reinforcement

### Weekly
- [ ] Review data
- [ ] Adjust strategies if needed
- [ ] Communicate with team/family
- [ ] Celebrate progress

---

## 🔄 Review & Adjust

### After 2 Weeks, Evaluate:
- Is the problem behavior decreasing?
- Is the replacement behavior increasing?
- Are strategies being implemented with fidelity?

### If NOT Working:
1. Check implementation fidelity first
2. Revisit function hypothesis
3. Adjust reinforcement (more frequent/preferred)
4. Consider additional supports/assessment

---

**POSITIVE BEHAVIOR SUPPORT PRINCIPLES:**
- Behavior is communication
- Focus on teaching, not just stopping
- Prevention is more effective than reaction
- Consistency is essential
- All behavior serves a function
- The goal is student success, not compliance`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
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