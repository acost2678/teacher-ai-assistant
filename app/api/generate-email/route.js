import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { studentName, parentName, context, notes, tone, emailType, uploadedContent } = await request.json();

    const toneInstructions = {
      formal:
        "Use a professional, formal tone appropriate for official school communication.",
      warm: "Use a warm, friendly, and encouraging tone while remaining professional.",
      urgent:
        "Use a tone that conveys urgency and importance while remaining respectful.",
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
Write a ${tone} email to ${parentName ? parentName : "a parent"} about their child, ${studentName}.

Context from the teacher: ${context || notes}

Email type: ${emailType}

Instructions:
- ${toneInstructions[tone]}
- Keep the email concise but thorough
- Include a clear subject line at the top (format: "Subject: ...")
- Be professional and supportive
- End with an invitation for the parent to reach out with questions
- Sign off as "The Teacher" (the teacher will replace this with their name)

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