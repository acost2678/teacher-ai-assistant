import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      assignmentType,
      overallPerformance,
      strengths,
      areasForGrowth,
      specificErrors,
      feedbackTone,
      includeNextSteps,
      includeEncouragement,
      studentName,
    } = await request.json();

    if (!overallPerformance) {
      return Response.json(
        { error: "Overall performance description is required" },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      "encouraging": "Warm, encouraging, celebrates effort and growth",
      "direct": "Clear and direct, focused on specific improvements",
      "coaching": "Like a coach - challenging but supportive",
      "celebratory": "Highly positive, celebrating achievements",
      "growth-mindset": "Emphasizes learning from mistakes, brain growth, 'yet' language",
    };

    const assignmentTypes = {
      "quiz": "Quiz/Test",
      "homework": "Homework Assignment",
      "classwork": "Classwork",
      "project": "Math Project",
      "problem-set": "Problem Set",
      "assessment": "Unit Assessment",
      "exit-ticket": "Exit Ticket",
    };

    const prompt = `You are an expert math teacher who writes specific, encouraging feedback that helps students grow. Your feedback is always constructive, never discouraging, and focuses on the mathematics, not the student's intelligence.

**FEEDBACK REQUEST:**

**Student:** ${studentName || "Student"}
**Grade Level:** ${gradeLevel || "Not specified"}
**Assignment Type:** ${assignmentTypes[assignmentType] || assignmentType || "Math Assignment"}
**Feedback Tone:** ${toneDescriptions[feedbackTone] || toneDescriptions["growth-mindset"]}

**Performance Summary:**
${overallPerformance}

${strengths ? `**Strengths Observed:** ${strengths}` : ""}
${areasForGrowth ? `**Areas for Growth:** ${areasForGrowth}` : ""}
${specificErrors ? `**Specific Errors:** ${specificErrors}` : ""}

---

# ✨ Math Feedback

**Student:** ${studentName || "_______________"}
**Assignment:** ${assignmentTypes[assignmentType] || "Math Work"}
**Date:** _______________

---

## 🌟 What You Did Well

[Write 2-3 specific, genuine compliments about the student's work. Be specific about WHAT they did well mathematically, not just "good job."]

- **[Strength 1]:** [Specific observation with example from their work]
- **[Strength 2]:** [Specific observation with example from their work]
${strengths ? `- **[Strength 3]:** [Additional strength based on teacher input]` : ""}

---

## 🎯 Growing Edge

[Frame areas for improvement as opportunities, not deficits. Use "yet" language.]

**One thing to focus on:**
[Single, actionable focus area - don't overwhelm]

**What I noticed:**
[Specific, non-judgmental observation about the error pattern]

**Try this:**
[Concrete strategy or next step the student can take]

---

${includeNextSteps ? `
## 📝 Next Steps

**Before the next lesson:**
- [ ] [Specific action - review, practice, watch video, etc.]

**During class:**
- [ ] [What to pay attention to]

**If you get stuck:**
- [Strategy to try]
- [Resource to use]
- [Who to ask for help]

---
` : ""}

${includeEncouragement ? `
## 💪 Remember

[Personalized encouragement message using growth mindset language]

"[Encouraging quote or message about effort, growth, or learning from mistakes]"

**Growth Mindset Reminder:**
- Mistakes help your brain grow
- "Not yet" means you're still learning
- Effort matters more than being "naturally good"
- Every mathematician struggles sometimes

---
` : ""}

## 📊 Quick Summary

| Area | Feedback |
|------|----------|
| **Understanding** | [Brief assessment] |
| **Process/Work** | [Brief assessment] |
| **Effort** | [Acknowledgment] |
| **Next Focus** | [One thing] |

---

## 💬 Teacher Notes

[Space for additional personalized comments]

_________________________________________________
_________________________________________________
_________________________________________________

---

**FEEDBACK PRINCIPLES FOLLOWED:**
- Specific and actionable (not vague praise)
- Focused on the mathematics, not the person
- Growth-mindset language throughout
- One focus area (not overwhelming)
- Celebrates effort and progress
- Never uses words like "smart" or "talented"
- Avoids comparison to other students`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = message.content[0].text;

    return Response.json({ feedback });
  } catch (error) {
    console.error("Error generating math feedback:", error);
    return Response.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}