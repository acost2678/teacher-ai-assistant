import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { studentName, parentName, emailType, tone, keyPoints, context, notes, uploadedContent } = await request.json();

    // Use keyPoints, context, or notes - whichever is provided
    const teacherNotes = keyPoints || context || notes || '';

    const toneInstructions = {
      "Warm & Friendly": "Use a warm, friendly, and encouraging tone while remaining professional. Be personable and approachable.",
      "Professional": "Use a professional, businesslike tone that is clear and direct while remaining respectful.",
      "Encouraging": "Use an uplifting, encouraging tone that motivates and supports. Focus on positives and growth.",
      "Concerned but Supportive": "Use a tone that expresses genuine concern while remaining supportive and solution-focused. Be caring but direct about the issue.",
      "Formal": "Use a formal, official tone appropriate for documentation or serious matters.",
      // Legacy support
      "warm": "Use a warm, friendly, and encouraging tone while remaining professional.",
      "formal": "Use a professional, formal tone appropriate for official school communication.",
      "urgent": "Use a tone that conveys urgency and importance while remaining respectful.",
    };

    const emailTypeInstructions = {
      "General Update": "This is a general update about the student's progress or classroom activities.",
      "Positive News": "This email shares positive news, achievements, or praise about the student. Be celebratory and specific about accomplishments.",
      "Behavior Concern": "This email addresses a behavior concern. Be constructive, focus on the behavior not the child, and include a path forward.",
      "Academic Concern": "This email addresses academic struggles or concerns. Be supportive, offer resources or next steps, and invite collaboration.",
      "Meeting Request": "This email requests a meeting with the parent. Be clear about the purpose and offer flexible scheduling options.",
      "Absence Follow-up": "This email follows up on student absences. Be caring, check on the student's wellbeing, and offer support for catching up.",
      "Event Reminder": "This email reminds parents about an upcoming event. Include all relevant details (date, time, location, what to bring).",
    };

    let uploadedContentSection = "";
    if (uploadedContent && uploadedContent.trim()) {
      uploadedContentSection = `

Reference documents provided by teacher:
---
${uploadedContent.substring(0, 3000)}${uploadedContent.length > 3000 ? '\n...[content truncated]' : ''}
---
Use relevant information from these documents to support the email content.
`;
    }

    const prompt = `You are an experienced teacher assistant helping to draft parent communications.
${uploadedContentSection}
Write an email to a parent about their child.

**IMPORTANT PRIVACY INSTRUCTION:**
- ALWAYS use "[Student Name]" as a placeholder for the student - NEVER use any actual name
- ALWAYS use "[Parent Name]" as a placeholder for the parent - NEVER use any actual name
- The teacher will replace these placeholders with real names after copying the email

**Email Type:** ${emailType}
${emailTypeInstructions[emailType] || ''}

**Teacher's Notes:** 
${teacherNotes}

**Instructions:**
- ${toneInstructions[tone] || toneInstructions["Warm & Friendly"]}
- Use "[Student Name]" and "[Parent Name]" throughout - never invent or use real names
- Keep the email concise but thorough (3-5 paragraphs)
- Include a clear subject line at the top (format: "Subject: ...")
- Be professional and supportive
- For concerns, always include a constructive path forward
- End with an invitation for the parent to reach out with questions
- Sign off as "[Teacher Name]" (the teacher will replace this with their name)

Write the email now:`;

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

    const emailContent = message.content[0].text;

    return Response.json({ email: emailContent });
  } catch (error) {
    console.error("Error generating email:", error);
    return Response.json(
      { error: "Failed to generate email" },
      { status: 500 }
    );
  }
}