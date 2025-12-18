import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      studentName,
      writingType,
      currentStrengths,
      currentChallenges,
      previousGoals,
      studentWritingSample,
      conferenceType,
      includeGoals,
      includeStrategies,
      includeFollowUp,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const conferenceTypes = {
      "initial": "Initial Conference - Getting to know the student as a writer",
      "process": "Process Conference - Checking in during drafting",
      "revision": "Revision Conference - Focusing on improving the draft",
      "editing": "Editing Conference - Focusing on conventions and polish",
      "goal-setting": "Goal-Setting Conference - Setting and reviewing writing goals",
      "celebration": "Celebration Conference - Celebrating growth and success",
    };

    const prompt = `You are an expert writing teacher conducting a 1-on-1 writing conference with a student. Create professional conference notes that document the conversation and guide next steps.

**CONFERENCE DETAILS:**
- Grade Level: ${gradeLevel}
- Student Name: ${studentName || "[Student Name]"}
- Writing Type: ${writingType || "General"}
- Conference Type: ${conferenceTypes[conferenceType] || conferenceTypes["process"]}
${currentStrengths ? `- Observed Strengths: ${currentStrengths}` : ""}
${currentChallenges ? `- Current Challenges: ${currentChallenges}` : ""}
${previousGoals ? `- Previous Goals: ${previousGoals}` : ""}

${studentWritingSample ? `
**STUDENT WRITING SAMPLE:**
---
${studentWritingSample.substring(0, 2000)}${studentWritingSample.length > 2000 ? '\n...[truncated]' : ''}
---
` : ""}

**GENERATE CONFERENCE NOTES:**

---

# 📝 Writing Conference Notes

**Student:** ${studentName || "[Student Name]"}
**Grade:** ${gradeLevel}
**Date:** [Today's Date]
**Conference Type:** ${conferenceType || "Process Conference"}
**Writing Piece:** ${writingType || "[Assignment]"}

---

## 📊 Quick Assessment

Based on the conference and/or writing sample:

| Area | Strength | Developing | Focus Needed |
|------|----------|------------|--------------|
| Ideas/Content | ○ | ○ | ○ |
| Organization | ○ | ○ | ○ |
| Voice | ○ | ○ | ○ |
| Word Choice | ○ | ○ | ○ |
| Sentence Fluency | ○ | ○ | ○ |
| Conventions | ○ | ○ | ○ |

---

## 🌟 Strengths Observed

**What this writer does well:**

1. **[Strength Category]**
   - Specific observation: [What I noticed]
   - Evidence: [Example from writing or conversation]
   - Why it matters: [Growth this shows]

2. **[Strength Category]**
   - Specific observation: [What I noticed]
   - Evidence: [Example from writing or conversation]
   - Why it matters: [Growth this shows]

**Affirmation shared with student:**
"[Exact words or paraphrase of positive feedback given]"

---

## 🎯 Teaching Point

**Focus for this conference:**
[One clear, specific skill or strategy to teach]

**Why this teaching point:**
- [Connection to student's current work]
- [How it builds on strengths]
- [Why it's the right next step]

**How I taught it:**
- [Demonstration/modeling I did]
- [Examples I showed]
- [Practice we did together]

**Student understanding check:**
- [ ] Could explain the strategy
- [ ] Could try it with support
- [ ] Could try it independently
- [ ] Needs more practice

---

${previousGoals ? `
## 📋 Previous Goals Check-In

**Previous goals were:**
${previousGoals}

**Progress observed:**
- [Assessment of each goal]
- [Evidence of growth]
- [What still needs work]

---
` : ""}

${includeGoals ? `
## 🎯 New Goals Set

**Goal 1 (Primary):**
[Specific, measurable writing goal]
- Success criteria: [How we'll know it's achieved]
- Timeline: [When to check in]

**Goal 2 (Secondary):**
[Specific, measurable writing goal]
- Success criteria: [How we'll know it's achieved]
- Timeline: [When to check in]

**Student's own words:**
"I will work on _________________________________"

---
` : ""}

${includeStrategies ? `
## 🛠️ Strategies to Try

**Strategy #1: [Name]**
- What: [Description in student-friendly terms]
- When to use: [Specific situation]
- How: [Step-by-step if needed]

**Strategy #2: [Name]**
- What: [Description in student-friendly terms]
- When to use: [Specific situation]
- How: [Step-by-step if needed]

**Resources provided:**
- [ ] Anchor chart reference
- [ ] Mentor text
- [ ] Checklist
- [ ] Other: ____________

---
` : ""}

## 💬 Conference Conversation Notes

**Key things the student said:**
- "[Quote or paraphrase 1]"
- "[Quote or paraphrase 2]"

**Student's self-assessment:**
"[What they think is working/not working]"

**Questions the student asked:**
- [Question 1]
- [Question 2]

**My responses/teaching moves:**
- [How I responded]
- [What I modeled]

---

${includeFollowUp ? `
## 📅 Follow-Up Plan

**Next check-in:** [Date/timeframe]

**What to look for:**
- [Specific evidence of goal progress]
- [What success will look like]

**Support needed:**
- [ ] Small group instruction on ____________
- [ ] Additional 1-on-1 conference
- [ ] Peer partnership with ____________
- [ ] Independent practice with ____________

**Notes for next conference:**
[Reminders for myself]

---
` : ""}

## 📝 Quick Notes

**Things to remember about this writer:**
- [Learning preference]
- [Motivation/interests]
- [What works for them]
- [What to avoid]

**Connection to build on:**
[Personal detail or interest to reference next time]

---

*Conference duration: approximately ___ minutes*

---

**GUIDELINES:**
- Be specific and evidence-based
- Focus on one teaching point (don't overwhelm)
- Document student voice and perspective
- Set achievable, measurable goals
- Plan concrete next steps
- Maintain growth mindset language`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const notes = message.content[0].text;

    return Response.json({ notes });
  } catch (error) {
    console.error("Error generating conference notes:", error);
    return Response.json(
      { error: "Failed to generate conference notes" },
      { status: 500 }
    );
  }
}