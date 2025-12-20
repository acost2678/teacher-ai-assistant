import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      reportType,
      gradeLevel,
      subject,
      gradingPeriod,
      tone,
      reportLength,
      commentStyle,
      includeGoals,
      studentIdentifier,
      grade,
      strengths,
      improvements,
      behavior,
      notes,
    } = await request.json();

    if (!gradeLevel || !subject) {
      return Response.json(
        { error: "Grade level and subject are required" },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      warm: "warm, encouraging, and supportive while remaining professional",
      professional: "professional, direct, and straightforward",
      detailed: "thorough, detailed, and comprehensive",
    };

    const lengthDescriptions = {
      short: "2-3 sentences",
      medium: "4-5 sentences (one paragraph)",
      long: "6-8 sentences (two short paragraphs)",
    };

    const styleDescriptions = {
      balanced: "Balance strengths with areas for growth. Start positive, address growth areas constructively, end on an encouraging note.",
      'strength-focused': "Emphasize strengths and achievements. Mention growth areas briefly and positively.",
      'growth-focused': "Focus on growth and improvement. Acknowledge effort and progress while being clear about areas needing work.",
      celebratory: "Celebrate achievements and growth. Very positive tone, minimize focus on areas for improvement.",
    };

    let prompt;

    if (reportType === 'report-card-comment') {
      // Report Card Comment Mode
      prompt = `Write a report card comment for a ${gradeLevel} student in ${subject} for ${gradingPeriod}.

**PRIVACY:** Use "[Student Name]" as placeholder - never invent names.

**STYLE:** ${styleDescriptions[commentStyle] || styleDescriptions.balanced}
**LENGTH:** ${lengthDescriptions[reportLength] || lengthDescriptions.medium}
${grade ? `**CURRENT GRADE:** ${grade}` : ''}

**TEACHER'S NOTES:**
${strengths ? `Strengths: ${strengths}` : ''}
${improvements ? `Areas for Growth: ${improvements}` : ''}
${behavior ? `Behavior/Work Habits: ${behavior}` : ''}
${notes ? `Additional Context: ${notes}` : ''}

**REQUIREMENTS:**
1. Start with "[Student Name]" - never invent names
2. Write in third person
3. Be specific - reference actual skills/behaviors from the notes
4. Use professional but warm language appropriate for parents
5. ${includeGoals ? 'End with a specific goal or next step for the student' : 'Do not include goals or next steps'}
6. Match the ${commentStyle || 'balanced'} style
7. Keep to ${lengthDescriptions[reportLength] || lengthDescriptions.medium}
8. Do NOT include headers, labels, or formatting - just the comment

Write the report card comment now:`;
    } else {
      // Progress Report Mode (default)
      prompt = `You are an experienced ${gradeLevel} teacher writing progress reports for ${subject}. Write a progress report narrative for a student based on the teacher's notes.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder - NEVER invent or use any actual name
- The teacher will replace "[Student Name]" with the real name after downloading
- This is a privacy-first system

**REPORT SETTINGS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Grading Period: ${gradingPeriod}
- Tone: ${toneDescriptions[tone] || toneDescriptions.warm}
- Length: ${lengthDescriptions[reportLength] || lengthDescriptions.medium}

**TEACHER'S NOTES FOR THIS STUDENT:**
${strengths ? `Strengths: ${strengths}` : ''}
${improvements ? `Areas for Growth: ${improvements}` : ''}
${notes ? `Additional Notes: ${notes}` : ''}

**WRITE THE PROGRESS REPORT:**

Requirements:
1. Start with "[Student Name]" - NEVER use any other name
2. Be ${lengthDescriptions[reportLength] || "4-5 sentences"}
3. Include specific observations based on the teacher's notes
4. Mention strengths first, then areas for growth
5. End with an encouraging statement or next steps
6. Use grade-appropriate language
7. Be ${toneDescriptions[tone] || "warm and encouraging"}
8. Do NOT include headers, labels, or formatting - just the narrative paragraph(s)
9. Do NOT include phrases like "Progress Report" or "Student:" - just write the narrative

Write the progress report narrative now:`;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const report = message.content[0].text;

    return Response.json({ report });
  } catch (error) {
    console.error("Error generating report:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}