import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      checkInType,
      caselCompetency,
      duration,
      format,
      numberOfPrompts,
      theme,
      includeFollowUp,
      classContext,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const checkInTypes = {
      "morning-meeting": "Morning Meeting - Start the day with connection and community",
      "emotion-check": "Emotion Check-In - Help students identify and express feelings",
      "closing-circle": "Closing Circle - Reflect on the day and set intentions",
      "weekly-reflection": "Weekly Reflection - Deeper reflection on growth and goals",
      "transition": "Transition Check-In - Brief reset between activities",
      "one-on-one": "One-on-One Check-In - Individual student conversation prompts",
    };

    const caselCompetencies = {
      "self-awareness": "Self-Awareness: Recognizing emotions, strengths, and areas for growth",
      "self-management": "Self-Management: Regulating emotions, setting goals, managing stress",
      "social-awareness": "Social Awareness: Empathy, appreciating diversity, respecting others",
      "relationship-skills": "Relationship Skills: Communication, teamwork, conflict resolution",
      "responsible-decision-making": "Responsible Decision-Making: Making ethical, safe choices",
      "mixed": "Mixed: Blend of all CASEL competencies",
    };

    const formats = {
      "verbal": "Verbal sharing (go-around, partner talk)",
      "written": "Written response (journal, worksheet)",
      "movement": "Movement-based (body scan, gesture)",
      "creative": "Creative expression (drawing, acting)",
      "digital": "Digital response (poll, emoji selection)",
      "choice": "Student choice of response method",
    };

    const prompt = `You are an expert in Social-Emotional Learning (SEL) and child development, trained in the CASEL framework. Create engaging, developmentally appropriate SEL check-ins for classroom use.

**CHECK-IN DETAILS:**
- Grade Level: ${gradeLevel}
- Check-In Type: ${checkInTypes[checkInType] || checkInTypes["morning-meeting"]}
- CASEL Competency Focus: ${caselCompetencies[caselCompetency] || caselCompetencies["mixed"]}
- Duration: ${duration || "5-10 minutes"}
- Response Format: ${formats[format] || formats["verbal"]}
- Number of Prompts: ${numberOfPrompts || 5}
${theme ? `- Theme/Topic: ${theme}` : ""}
${classContext ? `- Class Context: ${classContext}` : ""}

**CREATE ${numberOfPrompts || 5} SEL CHECK-IN PROMPTS:**

---

# 💚 SEL Check-In: ${checkInType === "morning-meeting" ? "Morning Meeting" : checkInType === "emotion-check" ? "Emotion Check" : checkInType === "closing-circle" ? "Closing Circle" : "Check-In"}

**Grade Level:** ${gradeLevel}
**CASEL Focus:** ${caselCompetency || "Mixed"}
**Duration:** ${duration || "5-10 minutes"}
**Format:** ${format || "Verbal"}

---

## 🎯 Learning Objectives
- [SEL objective 1 aligned to CASEL competency]
- [SEL objective 2 aligned to CASEL competency]

---

## ✨ Check-In Prompts

${Array.from({length: parseInt(numberOfPrompts) || 5}, (_, i) => `
### Prompt ${i + 1}: [Creative Title]

**The Prompt:**
"[Age-appropriate prompt question or statement for ${gradeLevel}]"

**CASEL Connection:** [Which competency this develops]

**How to Facilitate:**
- [Brief facilitation tip]
- [What to listen/look for]

${includeFollowUp ? `**Follow-Up Questions:**
- [Deeper question 1]
- [Deeper question 2]
` : ""}
**Sentence Starters (for students who need support):**
- "I feel ___ because..."
- "Today I noticed..."
- [One more relevant starter]

---
`).join('\n')}

## 🌟 Facilitation Tips

**Before Starting:**
- [Setup tip for creating safe space]
- [How to model vulnerability appropriately]

**During Check-In:**
- [Active listening reminder]
- [How to validate all responses]
- [What to do if a student shares something concerning]

**Closing:**
- [How to wrap up meaningfully]
- [Transition tip]

---

## 📊 What to Notice

**Signs of Growth:**
- [Positive indicator 1]
- [Positive indicator 2]

**Signs a Student May Need Support:**
- [Concern indicator 1]
- [Concern indicator 2]
- [When to follow up privately]

---

## 🔄 Variations

**For Students Who Are Reluctant:**
- [Modification 1]
- [Modification 2]

**For Advanced Reflection:**
- [Extension idea]

---

**GUIDELINES:**
- All prompts must be developmentally appropriate for ${gradeLevel}
- Use inclusive, trauma-informed language
- Avoid prompts that could trigger shame or embarrassment
- Focus on growth mindset and strengths-based approaches
- Ensure prompts are culturally responsive
- Never force sharing - always offer "pass" option`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const checkIn = message.content[0].text;

    return Response.json({ checkIn });
  } catch (error) {
    console.error("Error generating SEL check-in:", error);
    return Response.json(
      { error: "Failed to generate SEL check-in" },
      { status: 500 }
    );
  }
}