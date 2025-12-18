import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      writingType,
      assignmentDescription,
      studentWriting,
      rubric,
      teacherSamples,
      feedbackFocus,
      feedbackTone,
      feedbackDepth,
      includeStrengths,
      includeNextSteps,
      includeInlineSuggestions,
      includeGradeEstimate,
      customInstructions,
    } = await request.json();

    if (!studentWriting) {
      return Response.json(
        { error: "Student writing is required" },
        { status: 400 }
      );
    }

    const writingTypes = {
      "narrative": "Narrative Writing - Stories, personal narratives, creative fiction",
      "argumentative": "Argumentative/Persuasive Writing - Claims, evidence, reasoning",
      "expository": "Expository/Informational Writing - Explaining, informing, analyzing",
      "research": "Research Writing - Research papers, reports with sources",
      "literary-analysis": "Literary Analysis - Analyzing literature, themes, devices",
      "descriptive": "Descriptive Writing - Vivid details, sensory language",
      "compare-contrast": "Compare/Contrast Essay - Analyzing similarities and differences",
      "response-to-text": "Response to Text - Responding to reading with evidence",
      "creative": "Creative Writing - Poetry, short stories, creative nonfiction",
      "journal": "Journal/Reflection - Personal reflection, learning journals",
    };

    const feedbackFocusAreas = {
      "holistic": "Holistic - Overall quality, big picture feedback",
      "content": "Content & Ideas - Depth of thinking, development, originality",
      "organization": "Organization & Structure - Flow, transitions, paragraphing",
      "voice": "Voice & Style - Author's voice, word choice, sentence variety",
      "conventions": "Conventions - Grammar, spelling, punctuation, mechanics",
      "evidence": "Evidence & Support - Use of examples, quotes, reasoning",
      "argument": "Argument & Logic - Thesis, claims, counterarguments",
      "balanced": "Balanced - Equal attention to all areas",
    };

    const toneDescriptions = {
      "encouraging": "Encouraging & Supportive - Focus on growth, celebrate effort",
      "direct": "Direct & Clear - Straightforward feedback, specific suggestions",
      "socratic": "Socratic/Questioning - Ask questions to prompt thinking",
      "coaching": "Coaching - Like a mentor guiding improvement",
      "formal": "Formal/Academic - Professional, scholarly tone",
    };

    let rubricSection = "";
    if (rubric && rubric.trim()) {
      rubricSection = `

**RUBRIC PROVIDED BY TEACHER:**
Use this exact rubric to evaluate the student's writing. Reference specific rubric criteria in your feedback.

---
${rubric}
---

When providing feedback:
- Explicitly reference rubric categories
- Indicate approximate level/score for each category if rubric has levels
- Connect suggestions directly to rubric criteria
`;
    }

    let teacherStyleSection = "";
    if (teacherSamples && teacherSamples.trim()) {
      teacherStyleSection = `

**TEACHER'S GRADING STYLE - MATCH THIS VOICE:**
The teacher has provided examples of their previous feedback. Study this carefully and match their:
- Tone and voice
- Types of comments they make
- How they phrase suggestions
- What they tend to focus on
- Their balance of praise vs. critique
- Their use of questions vs. statements
- Specific phrases or language patterns they use

---
TEACHER'S SAMPLE FEEDBACK:
${teacherSamples.substring(0, 3000)}${teacherSamples.length > 3000 ? '\n...[truncated]' : ''}
---

IMPORTANT: Your feedback should sound like it could have been written by this teacher. Adopt their voice authentically.
`;
    }

    let customSection = "";
    if (customInstructions && customInstructions.trim()) {
      customSection = `

**TEACHER'S CUSTOM INSTRUCTIONS:**
${customInstructions}

Follow these instructions precisely.
`;
    }

    const prompt = `You are an experienced, caring English/Language Arts teacher providing thoughtful, personalized feedback on student writing. Your feedback should help students grow as writers while honoring their voice and effort.

**ASSIGNMENT CONTEXT:**
- Grade Level: ${gradeLevel}
- Writing Type: ${writingTypes[writingType] || writingTypes["expository"]}
${assignmentDescription ? `- Assignment: ${assignmentDescription}` : ""}
- Feedback Focus: ${feedbackFocusAreas[feedbackFocus] || feedbackFocusAreas["balanced"]}
- Feedback Tone: ${toneDescriptions[feedbackTone] || toneDescriptions["encouraging"]}
- Feedback Depth: ${feedbackDepth || "Detailed"}
${rubricSection}
${teacherStyleSection}
${customSection}

**STUDENT'S WRITING:**
---
${studentWriting}
---

**PROVIDE COMPREHENSIVE FEEDBACK:**

---

# ✍️ Writing Feedback

**Assignment:** ${assignmentDescription || writingType}
**Grade Level:** ${gradeLevel}
**Writing Type:** ${writingType}

---

${includeStrengths !== false ? `
## 🌟 Strengths

Identify 3-5 specific strengths in this writing. Be genuine and specific - quote exact phrases or sentences that work well. Explain WHY each element is effective.

### Strength 1: [Category]
[Quote from student's work]
[Explanation of why this works]

### Strength 2: [Category]
[Quote from student's work]
[Explanation of why this works]

### Strength 3: [Category]
[Quote from student's work]
[Explanation of why this works]

---
` : ""}

## 📝 Areas for Growth

Provide specific, actionable feedback for improvement. Be constructive, not critical. Focus on teaching, not just identifying problems.

### Area 1: [Category]
**What I Notice:** [Describe the issue without judgment]
**Why This Matters:** [Explain the impact on the reader/writing]
**Try This:** [Specific, concrete suggestion with example]

### Area 2: [Category]
**What I Notice:** [Describe the issue]
**Why This Matters:** [Explain the impact]
**Try This:** [Specific suggestion with example]

### Area 3: [Category]
**What I Notice:** [Describe the issue]
**Why This Matters:** [Explain the impact]
**Try This:** [Specific suggestion with example]

---

${includeInlineSuggestions ? `
## 📍 Specific Suggestions

Provide line-by-line or paragraph-by-paragraph suggestions. Reference specific parts of the student's writing.

**Opening:** 
[Feedback on introduction/hook]

**Body Paragraphs:**
[Feedback on development, evidence, transitions]

**Closing:**
[Feedback on conclusion]

**Language & Style:**
[Specific word choice, sentence structure suggestions]

---
` : ""}

${rubric ? `
## 📊 Rubric Assessment

${includeGradeEstimate ? `**Estimated Score/Level:** [Based on rubric]` : ""}

| Criteria | Feedback | ${includeGradeEstimate ? "Level |" : ""}
|----------|----------|${includeGradeEstimate ? "-------|" : ""}
| [Criterion 1] | [Specific feedback] | ${includeGradeEstimate ? "[Score] |" : ""}
| [Criterion 2] | [Specific feedback] | ${includeGradeEstimate ? "[Score] |" : ""}
| [Criterion 3] | [Specific feedback] | ${includeGradeEstimate ? "[Score] |" : ""}
| [Criterion 4] | [Specific feedback] | ${includeGradeEstimate ? "[Score] |" : ""}

---
` : ""}

${includeNextSteps !== false ? `
## 🎯 Next Steps for Revision

Prioritize 2-3 specific actions the student should take when revising:

1. **First Priority:** [Most important revision]
   - Specific action to take
   - Example of how to do it

2. **Second Priority:** [Next important revision]
   - Specific action to take
   - Example of how to do it

3. **Optional Challenge:** [Stretch goal for stronger revision]
   - How to push the writing further

---
` : ""}

## 💬 Closing Note

[Write a brief, encouraging closing message that acknowledges effort, celebrates growth, and motivates continued improvement. Make it personal and warm.]

---

**GUIDELINES:**
- Be specific - vague feedback doesn't help writers grow
- Balance honesty with encouragement
- Honor the student's voice - suggest improvements, don't rewrite for them
- Use language appropriate for ${gradeLevel}
- Focus on teaching transferable skills, not just fixing this one piece
- If a rubric was provided, your feedback must align with its criteria
- If teacher samples were provided, match their voice authentically
- Remember: behind every piece of writing is a student who tried`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = message.content[0].text;

    return Response.json({ feedback });
  } catch (error) {
    console.error("Error generating essay feedback:", error);
    return Response.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}