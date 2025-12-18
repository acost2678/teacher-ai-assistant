import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      lessonObjective,
      exitTicketType,
      quantity,
      questionTypes,
      includeAnswerKey,
      includeRubric,
      includeSEL,
    } = await request.json();

    if (!topic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Topic, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const exitTicketTypes = {
      "understanding-check": "Check for understanding of today's lesson",
      "application": "Apply learning to a new situation",
      "reflection": "Reflect on learning process",
      "summary": "Summarize key takeaways",
      "question-generation": "Student generates questions about the content",
      "self-assessment": "Student self-assesses their understanding",
    };

    const questionTypesList = {
      "multiple-choice": "Multiple choice questions",
      "short-answer": "Short answer (1-2 sentences)",
      "extended-response": "Extended response (paragraph)",
      "true-false": "True/False with explanation",
      "fill-blank": "Fill in the blank",
      "matching": "Matching",
      "graphic-organizer": "Graphic organizer/visual",
    };

    let selPrompt = "";
    if (includeSEL) {
      selPrompt = `

**INCLUDE SEL REFLECTION:**
Add a brief SEL component asking students to reflect on one of these:
- How they felt about their learning today
- How they collaborated with peers
- What strategies they used when stuck
- How they can apply this learning outside school`;
    }

    let questionTypesPrompt = "";
    if (questionTypes && questionTypes.length > 0) {
      const types = questionTypes.map(t => questionTypesList[t]).join(", ");
      questionTypesPrompt = `Include these question types: ${types}`;
    }

    const prompt = `You are an expert K-12 teacher. Create effective exit tickets for formative assessment.

**EXIT TICKET DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Topic: ${topic}
${lessonObjective ? `- Today's Learning Objective: ${lessonObjective}` : ""}
- Type: ${exitTicketTypes[exitTicketType] || "Check for understanding"}
- Number of exit tickets to create: ${quantity || 3}
${questionTypesPrompt}
${includeAnswerKey ? "- Include an answer key" : ""}
${includeRubric ? "- Include a simple scoring rubric" : ""}
${selPrompt}

**CREATE ${quantity || 3} EXIT TICKETS:**

For each exit ticket, include:

---

## EXIT TICKET #[number]

**Topic:** ${topic}
**Time:** 3-5 minutes

### Student Section
*(This is what students see)*

Name: _________________ Date: _________

**Question(s):**
[Include 2-3 questions that assess the learning objective]

${includeSEL ? `**Quick Reflection:**
[One SEL reflection prompt]` : ""}

**Rate Your Understanding:**
😊 Got it! | 😐 Getting there | 😕 Need help

---

### Teacher Section

${includeAnswerKey ? `**Answer Key:**
[Correct answers or exemplar responses]` : ""}

${includeRubric ? `**Quick Scoring Guide:**
- 3 points: [description]
- 2 points: [description]  
- 1 point: [description]
- 0 points: [description]` : ""}

**What to look for:**
[Key indicators of understanding vs. misconceptions]

**If students struggle:**
[Quick re-teach suggestion]

---

**GUIDELINES:**
- Questions should directly assess the lesson objective
- Keep it completable in 3-5 minutes
- Make questions clear and grade-appropriate
- Include both surface-level and deeper understanding checks
- Vary the format across the ${quantity || 3} exit tickets

Format each exit ticket so it can be printed as a half-sheet or displayed on screen.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const exitTickets = message.content[0].text;

    return Response.json({ exitTickets });
  } catch (error) {
    console.error("Error generating exit tickets:", error);
    return Response.json(
      { error: "Failed to generate exit tickets" },
      { status: 500 }
    );
  }
}