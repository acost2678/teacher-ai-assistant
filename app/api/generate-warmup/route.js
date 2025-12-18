import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      warmUpType,
      duration,
      quantity,
      difficulty,
      includeAnswerKey,
      connectToLesson,
      lessonContext,
    } = await request.json();

    if (!topic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Topic, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const warmUpTypes = {
      "review": "Review of previously taught material",
      "preview": "Preview/hook for upcoming lesson",
      "spiral": "Spiral review of multiple past concepts",
      "brain-teaser": "Brain teaser or critical thinking puzzle",
      "journal": "Quick write or journal prompt",
      "discussion": "Discussion starter or debate prompt",
      "skill-practice": "Skill practice problems",
    };

    const prompt = `You are an expert K-12 teacher. Create engaging warm-up activities (also known as bell ringers or do-nows).

**WARM-UP DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Topic/Skill: ${topic}
- Type: ${warmUpTypes[warmUpType] || "Review of previously taught material"}
- Duration: ${duration || "5 minutes"}
- Number of warm-ups to create: ${quantity || 5}
- Difficulty: ${difficulty || "On grade level"}
${connectToLesson && lessonContext ? `- Connect to today's lesson: ${lessonContext}` : ""}
${includeAnswerKey ? "- Include an answer key" : ""}

**CREATE ${quantity || 5} WARM-UP ACTIVITIES:**

For each warm-up, include:

1. **WARM-UP #[number]**
   
   **Instructions for Students:**
   (Clear, concise directions they see on the board)
   
   **The Task:**
   (The actual question, problem, or prompt)
   
   **Materials Needed:** (if any)
   
   **Time:** ${duration || "5 minutes"}
   
   ${includeAnswerKey ? `**Answer Key / Expected Response:**
   (What a correct or strong response looks like)` : ""}
   
   **Teacher Tip:**
   (Quick note on facilitation or common misconceptions)

---

**GUIDELINES:**
- Make each warm-up self-contained and clear
- Students should be able to start immediately without teacher explanation
- Vary the format slightly across the ${quantity || 5} warm-ups
- Ensure activities are grade-appropriate and engaging
- Include visual elements or manipulatives suggestions where appropriate
- Keep language student-friendly

Format each warm-up clearly so teachers can easily copy one to display on the board.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const warmUps = message.content[0].text;

    return Response.json({ warmUps });
  } catch (error) {
    console.error("Error generating warm-ups:", error);
    return Response.json(
      { error: "Failed to generate warm-ups" },
      { status: 500 }
    );
  }
}