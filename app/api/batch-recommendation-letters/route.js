import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      writerName,
      writerTitle,
      schoolName,
      letterType,
      studentIdentifier,
      relationship,
      duration,
      academicStrengths,
      personalQualities,
      achievements,
      anecdote,
      goals,
      destination,
    } = await request.json();

    if (!writerName) {
      return Response.json(
        { error: "Writer name is required" },
        { status: 400 }
      );
    }

    if (!academicStrengths && !personalQualities) {
      return Response.json(
        { error: "Please provide academic strengths or personal qualities" },
        { status: 400 }
      );
    }

    const letterTypeInstructions = {
      college: "This is a college application recommendation letter. Be specific about why this student would succeed in college. Focus on intellectual curiosity, academic potential, and character.",
      scholarship: "This is a scholarship recommendation letter. Emphasize merit, achievements, and financial need if mentioned. Explain why this student deserves support.",
      job: "This is a job/internship recommendation letter. Focus on professional skills, reliability, work ethic, and relevant abilities.",
      award: "This is an award nomination letter. Make a compelling case for why this student deserves recognition.",
      program: "This is a recommendation for a special program. Explain why this student is an ideal candidate and would benefit from the opportunity.",
    };

    const prompt = `Write a compelling recommendation letter for a ${letterType} application.

**PRIVACY:** Use "[Student Name]" as placeholder throughout - never invent names.

**WRITER INFORMATION:**
- Name: ${writerName}
- Title: ${writerTitle || 'Teacher'}
- School: ${schoolName || 'Not specified'}

**LETTER TYPE:** ${letterTypeInstructions[letterType] || letterTypeInstructions.college}

**STUDENT INFORMATION:**
${relationship ? `- Relationship: ${relationship}` : ''}
${duration ? `- How long known: ${duration}` : ''}
${academicStrengths ? `- Academic Strengths: ${academicStrengths}` : ''}
${personalQualities ? `- Personal Qualities: ${personalQualities}` : ''}
${achievements ? `- Key Achievements: ${achievements}` : ''}
${anecdote ? `- Specific Story/Anecdote: ${anecdote}` : ''}
${goals ? `- Goals/Intended Major: ${goals}` : ''}
${destination ? `- Applying to: ${destination}` : ''}

**WRITE A RECOMMENDATION LETTER THAT:**
1. Opens with a strong statement of recommendation and how you know [Student Name]
2. Uses "[Student Name]" throughout - NEVER invent names
3. Includes specific examples and details from the information provided
4. Incorporates the anecdote naturally if provided (this makes letters memorable)
5. Connects the student's qualities to their future goals
6. Uses professional but warm language
7. Is approximately 400-500 words
8. Ends with a clear, enthusiastic endorsement
9. Includes your signature block at the end

**FORMAT:**
- Date at top
- Formal greeting (To the Admissions Committee, To Whom It May Concern, etc.)
- 4-5 paragraphs
- Professional closing
- Signature block with your name, title, and school

Write the complete letter now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const letter = message.content[0].text.trim();

    return Response.json({ letter });
  } catch (error) {
    console.error("Error generating recommendation letter:", error);
    return Response.json(
      { error: "Failed to generate letter" },
      { status: 500 }
    );
  }
}