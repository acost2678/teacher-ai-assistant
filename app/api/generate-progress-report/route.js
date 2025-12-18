import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { studentName, gradeLevel, subject, reportingPeriod, notes, strengths, areasForGrowth, additionalNotes, uploadedContent } = await request.json();

    let uploadedContentSection = "";
    if (uploadedContent && uploadedContent.trim()) {
      uploadedContentSection = `

Reference Data Provided by Teacher:
---
${uploadedContent.substring(0, 4000)}${uploadedContent.length > 4000 ? '\n...[content truncated]' : ''}
---
Use this data to provide specific, accurate details in the progress report.
`;
    }

    const prompt = `You are an experienced teacher assistant helping to write student progress reports.
${uploadedContentSection}
Write a progress report for the following student:

Student Name: ${studentName}
Grade Level: ${gradeLevel}
Subject Area: ${subject}
Reporting Period: ${reportingPeriod}

Teacher's Notes: ${notes}

Strengths Observed: ${strengths || 'Not specified'}

Areas for Growth: ${areasForGrowth || 'Not specified'}

Instructions:
- Write a professional, supportive progress report
- Start with a brief overview of the student's overall performance
- Highlight specific strengths with examples when possible
- Address areas for improvement constructively and positively
- Include specific, actionable suggestions for continued growth
- End with an encouraging statement
- Use appropriate language for the grade level (simpler for elementary, more detailed for middle/high school)
- Keep the report concise but thorough (about 200-300 words)
- Do not include a header or title - just the report content

Write the progress report now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reportContent = message.content[0].text;

    return Response.json({ report: reportContent });
  } catch (error) {
    console.error("Error generating progress report:", error);
    return Response.json(
      { error: "Failed to generate progress report" },
      { status: 500 }
    );
  }
}