import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      gradingPeriod,
      tone,
      reportLength,
      studentIdentifier,
      strengths,
      improvements,
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

    const prompt = `You are an experienced ${gradeLevel} teacher writing progress reports for ${subject}. Write a progress report narrative for a student based on the teacher's notes.

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

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const report = message.content[0].text;

    return Response.json({ report });
  } catch (error) {
    console.error("Error generating progress report:", error);
    return Response.json(
      { error: "Failed to generate progress report" },
      { status: 500 }
    );
  }
}