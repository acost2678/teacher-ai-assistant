import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      emailType,
      tone,
      teacherName,
      baseMessage,
      studentIdentifier,
      positives,
      concerns,
      action,
    } = await request.json();

    if (!teacherName) {
      return Response.json(
        { error: "Teacher name is required" },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      warm: "warm, friendly, and approachable",
      professional: "professional and respectful",
      encouraging: "encouraging, supportive, and positive",
      direct: "direct, concise, and to-the-point",
    };

    const emailTypeInstructions = {
      'progress-update': 'This is a general progress update email sharing how the student is doing academically and/or behaviorally.',
      'positive-news': 'This is a POSITIVE email celebrating the student\'s achievements, growth, or good behavior. Focus primarily on the positives.',
      'concern': 'This email addresses a concern while maintaining a collaborative, non-accusatory tone. Start with positives before addressing concerns.',
      'missing-work': 'This email notifies the parent about missing assignments and requests their help in getting work completed.',
      'conference-invite': 'This email invites the parent to schedule a conference/meeting to discuss their child\'s progress.',
      'event-reminder': 'This email reminds the parent about an upcoming school event, field trip, or deadline.',
    };

    const prompt = `You are ${teacherName}, a ${gradeLevel} teacher writing a personalized email to a parent.

**IMPORTANT PRIVACY INSTRUCTIONS:**
- Use "[Student Name]" as a placeholder for the student's name - NEVER invent a name
- Use "[Parent Name]" as a placeholder for the parent's name - NEVER use "Dear Parent"
- The teacher will replace these placeholders with real names before sending
- This is a privacy-first system

**EMAIL SETTINGS:**
- Email Type: ${emailType.replace('-', ' ')}
- ${emailTypeInstructions[emailType] || emailTypeInstructions['progress-update']}
- Tone: ${toneDescriptions[tone] || toneDescriptions.warm}
- Teacher Name: ${teacherName}
${baseMessage ? `- Base Message to Include: "${baseMessage}"` : ''}

**TEACHER'S NOTES FOR THIS STUDENT:**
${positives ? `Positives/Good News: ${positives}` : ''}
${concerns ? `Concerns: ${concerns}` : ''}
${action ? `Action/Request: ${action}` : ''}

**WRITE THE EMAIL:**

Requirements:
1. Start with "Dear [Parent Name],"
2. Use "[Student Name]" throughout - NEVER invent names
3. Be ${toneDescriptions[tone] || "warm and friendly"}
4. Keep it concise (3-4 short paragraphs max)
5. Include the base message naturally if provided
6. Lead with positives, then address concerns (if any)
7. End with a clear action item or next step if applicable
8. Sign off warmly with the teacher's name
9. Do NOT include the word "Subject:" in the body - just write the email content

Also generate a subject line for this email.

Format your response as:
SUBJECT: [subject line here]

[email body here]`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const response = message.content[0].text;
    
    // Parse subject and body
    let subject = `Update from ${teacherName}`;
    let email = response;
    
    if (response.includes('SUBJECT:')) {
      const parts = response.split('\n\n');
      const subjectLine = parts[0].replace('SUBJECT:', '').trim();
      subject = subjectLine;
      email = parts.slice(1).join('\n\n').trim();
    }

    return Response.json({ email, subject });
  } catch (error) {
    console.error("Error generating parent email:", error);
    return Response.json(
      { error: "Failed to generate parent email" },
      { status: 500 }
    );
  }
}