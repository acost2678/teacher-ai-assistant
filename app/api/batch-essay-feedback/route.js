import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      assignmentType,
      feedbackTemplate,
      tone,
      rubric,
      focusAreas,
      studentIdentifier,
      essay,
    } = await request.json();

    if (!essay || essay.trim().length < 50) {
      return Response.json(
        { error: "Essay is too short (minimum 50 characters)" },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      encouraging: "encouraging, supportive, and positive while being constructive",
      direct: "direct, clear, and straightforward without being harsh",
      coaching: "like a writing coach - guiding with questions and suggestions",
      'strength-based': "leading with strengths and framing growth areas positively",
    };

    const assignmentTypeDescriptions = {
      'persuasive': 'persuasive/argumentative essay (thesis, evidence, counterarguments)',
      'narrative': 'narrative/personal essay (storytelling, voice, details)',
      'expository': 'expository/informational essay (clarity, organization, facts)',
      'literary-analysis': 'literary analysis (thesis, textual evidence, interpretation)',
      'research': 'research paper (sources, citations, synthesis)',
      'compare-contrast': 'compare and contrast essay (structure, balance, transitions)',
      'descriptive': 'descriptive essay (sensory details, imagery, word choice)',
      'response': 'reading response (comprehension, connections, analysis)',
    };

    const templateInstructions = {
      'glow-grow': `Use the "Glow & Grow" format:

✨ GLOWS (2 Specific Strengths):
1. [Quote a specific phrase/sentence from the essay] - Explain why this works well
2. [Quote another specific example] - Explain the strength

🌱 GROWS (2 Specific Areas for Improvement):
1. [Reference a specific part of the essay] - Explain what could be improved and give a concrete example of how to fix it
2. [Reference another specific area] - Explain the issue and provide a revision suggestion`,

      'rubric-aligned': `Organize feedback by rubric criteria. For each criterion:
- State the criterion
- Quote specific evidence from the essay
- Explain how well the student met the criterion
- Provide a specific suggestion for improvement if needed

End with an overall assessment and one priority revision.`,

      'paragraph-by-paragraph': `Provide feedback on each major section:

📖 INTRODUCTION:
[Specific feedback with quotes from their intro]

📝 BODY PARAGRAPHS:
[Feedback on each body paragraph, referencing specific sentences]

🎯 CONCLUSION:
[Specific feedback on their conclusion]

🔑 TOP PRIORITY FOR REVISION:
[One most important thing to fix, with example]`,

      'revision-roadmap': `Create a clear revision plan:

🗺️ REVISION ROADMAP

Overall Impression: [1-2 sentences on the essay's current state]

Step 1: [Most important revision]
- What to change: [Be specific, quote the essay]
- How to fix it: [Provide an example revision]

Step 2: [Second priority]
- What to change: [Be specific]
- How to fix it: [Provide an example]

Step 3: [Third priority]
- What to change: [Be specific]
- How to fix it: [Provide an example]

✨ Strength to Keep: [One thing they should NOT change]`,

      'conference-notes': `Create talking points for a writing conference:

📋 CONFERENCE NOTES FOR [Student Name]

Start With (Praise): 
[Specific strength to acknowledge first - quote the essay]

Discussion Questions:
1. [Question to ask about their writing choices]
2. [Question to prompt reflection on an area for growth]
3. [Question about their revision plans]

Teaching Point:
[One skill to focus on, with a mini-lesson explanation]

Next Steps:
[Specific action items for the student]`,

      'socratic': `Generate thought-provoking questions to guide self-reflection:

❓ REFLECTION QUESTIONS

About Your Thesis/Main Idea:
[Question that prompts them to examine their central argument]

About Your Evidence:
[Question about their use of support/examples]

About Your Organization:
[Question about structure and flow]

About Your Reader:
[Question about audience awareness]

Challenge Question:
[A deeper question that pushes their thinking]

💡 Hint: [A gentle nudge toward one key improvement without giving the answer]`,
    };

    const focusAreaDescriptions = focusAreas && focusAreas.length > 0
      ? `Pay special attention to these focus areas: ${focusAreas.join(', ')}`
      : '';

    const rubricInstruction = rubric
      ? `Use this rubric to guide your feedback:\n${rubric}\n\nAlign your feedback to these criteria.`
      : 'Use grade-level appropriate standards for this assignment type.';

    const prompt = `You are an experienced ${gradeLevel} English/Language Arts teacher providing feedback on a ${assignmentTypeDescriptions[assignmentType] || 'essay'}.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder - NEVER invent a name
- This is a privacy-first system

**FEEDBACK SETTINGS:**
- Grade Level: ${gradeLevel}
- Assignment Type: ${assignmentType}
- Tone: ${toneDescriptions[tone] || toneDescriptions.encouraging}
${focusAreaDescriptions}

**RUBRIC/CRITERIA:**
${rubricInstruction}

**FEEDBACK FORMAT:**
${templateInstructions[feedbackTemplate] || templateInstructions['glow-grow']}

**THE STUDENT'S ESSAY:**
${essay}

**GENERATE FEEDBACK:**

Requirements:
1. Be SPECIFIC - quote actual phrases/sentences from the essay
2. Be ${toneDescriptions[tone] || "encouraging"} in your delivery
3. Provide CONCRETE examples of how to improve, not vague advice
4. Match expectations to ${gradeLevel} level
5. Follow the exact format specified above
6. Keep feedback focused and actionable (not overwhelming)
7. If the essay has significant issues, prioritize the most important 2-3

Write the feedback now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
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