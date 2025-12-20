import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      checkInType,
      selCompetency,
      format,
      duration,
      includeVisuals,
      includeFollowUp,
      quantity,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const checkInTypes = {
      "Daily Morning": "Morning Meeting - Start the day with connection and community",
      "End of Day": "Closing Circle - Reflect on the day and celebrate growth",
      "After Recess/Break": "Transition Check-In - Reset and refocus after active time",
      "Before Test/Assessment": "Calming Check-In - Reduce anxiety and build confidence",
      "Monday Reset": "Weekly Kickoff - Set intentions and goals for the week",
      "Friday Reflection": "Weekly Reflection - Celebrate wins and reflect on growth",
      "After Conflict": "Restorative Check-In - Process emotions and rebuild connection",
    };

    const caselCompetencies = {
      "Self-Awareness": "Self-Awareness: Recognizing emotions, strengths, and areas for growth",
      "Self-Management": "Self-Management: Regulating emotions, setting goals, managing stress",
      "Social Awareness": "Social Awareness: Empathy, appreciating diversity, respecting others",
      "Relationship Skills": "Relationship Skills: Communication, teamwork, conflict resolution",
      "Responsible Decision-Making": "Responsible Decision-Making: Making ethical, safe choices",
      "Mixed/All Competencies": "Mixed: Blend of all CASEL competencies",
    };

    const formats = {
      "Written Response": "Written response (journal, worksheet)",
      "Rating Scale": "Rating scale (1-5, thumbs up/down)",
      "Emoji/Visual Selection": "Visual selection (emoji, feelings chart)",
      "Choice Board": "Choice board (multiple response options)",
      "Think-Pair-Share": "Think-Pair-Share (reflect, partner talk, group share)",
      "Journal Prompt": "Journal prompt (deeper written reflection)",
      "Discussion Circle": "Discussion circle (whole class sharing)",
    };

    const prompt = `You are an expert in Social-Emotional Learning (SEL) and child development, trained in the CASEL framework. Create engaging, developmentally appropriate SEL check-ins for classroom use.

**CHECK-IN DETAILS:**
- Grade Level: ${gradeLevel}
- Check-In Type: ${checkInTypes[checkInType] || checkInType}
- CASEL Competency Focus: ${caselCompetencies[selCompetency] || selCompetency}
- Duration: ${duration}
- Response Format: ${formats[format] || format}
- Number of Check-Ins: ${quantity}

**CREATE ${quantity} SEL CHECK-IN PROMPTS:**

---

# 💚 SEL Check-Ins: ${checkInType}

**Grade Level:** ${gradeLevel}
**CASEL Focus:** ${selCompetency}
**Duration:** ${duration}
**Format:** ${format}

---

## 🎯 Learning Objectives
- Students will practice ${selCompetency.toLowerCase()} skills
- Students will identify and express their emotions appropriately
- Students will build classroom community through sharing

---

## ✨ Check-In Prompts

${Array.from({length: parseInt(quantity) || 5}, (_, i) => `
### Check-In ${i + 1}: [Creative Title]

**The Prompt:**
"[Age-appropriate prompt question for ${gradeLevel}]"

**CASEL Connection:** ${selCompetency}

${includeVisuals ? `**Visual Support:**
[Describe an emoji scale, feelings chart, or visual that could accompany this prompt]
- 😊 😐 😢 😤 😰 (or similar visual scale)
- [Suggestion for anchor chart or visual aid]
` : ""}

**How to Facilitate:**
- [Brief facilitation tip]
- [What to listen/look for]

${includeFollowUp ? `**Follow-Up Questions:**
- [Deeper question 1]
- [Deeper question 2]
- [Question to extend thinking]
` : ""}

**Sentence Starters (for students who need support):**
- "I feel ___ because..."
- "Today I noticed..."
- [One more relevant starter for this prompt]

---
`).join('\n')}

## 🌟 Facilitation Tips

**Creating a Safe Space:**
- Remind students that all feelings are valid
- Model vulnerability by sharing your own (appropriate) feelings
- Always offer a "pass" option - no one is forced to share

**During Check-In:**
- Use active listening (eye contact, nodding, reflecting)
- Validate all responses without judgment
- If a student shares something concerning, note it for private follow-up

**Closing:**
- Thank students for sharing
- Summarize themes you noticed (without calling out individuals)
- Provide a brief transition activity

---

## 📊 What to Notice

**Signs of Growth:**
- Students using feeling words independently
- Increased willingness to share over time
- Students showing empathy toward peers

**Signs a Student May Need Support:**
- Consistent negative responses
- Refusal to participate (beyond normal shyness)
- Disclosures that suggest stress at home or school
- Follow up privately with students who seem to be struggling

---

## 🔄 Variations & Modifications

**For Reluctant Sharers:**
- Allow written responses instead of verbal
- Partner sharing before whole group
- Use thumbs up/down or visual scales

**For Students Ready for More:**
- Ask them to connect feelings to goals
- Have them suggest check-in prompts for the class
- Pair with a journal extension

---

**IMPORTANT GUIDELINES:**
- All prompts are developmentally appropriate for ${gradeLevel}
- Use inclusive, trauma-informed language
- Avoid prompts that could trigger shame or embarrassment
- Focus on growth mindset and strengths-based approaches
- Ensure prompts are culturally responsive`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const checkIns = message.content[0].text;

    return Response.json({ checkIns });
  } catch (error) {
    console.error("Error generating SEL check-ins:", error);
    return Response.json(
      { error: "Failed to generate SEL check-ins" },
      { status: 500 }
    );
  }
}