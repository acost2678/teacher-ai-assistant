import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      assessmentType,
      questionCount,
      questionTypes,
      difficulty,
      includeAnswerKey,
      includePointValues,
      bloomsLevels,
      customInstructions,
      timeLimit,
    } = await request.json();

    if (!topic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Topic, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const questionTypeDescriptions = {
      "multiple-choice": "Multiple choice (4 options, one correct)",
      "true-false": "True/False questions",
      "short-answer": "Short answer (1-2 sentences)",
      "fill-blank": "Fill in the blank",
      "matching": "Matching (terms to definitions)",
      "extended-response": "Extended response / essay",
    };

    const bloomsDescriptions = {
      "remember": "Remember - recall facts and basic concepts",
      "understand": "Understand - explain ideas or concepts",
      "apply": "Apply - use information in new situations",
      "analyze": "Analyze - draw connections among ideas",
      "evaluate": "Evaluate - justify a decision or course of action",
      "create": "Create - produce new or original work",
    };

    let questionTypesPrompt = "";
    if (questionTypes && questionTypes.length > 0) {
      const types = questionTypes.map(t => questionTypeDescriptions[t] || t).join("\n- ");
      questionTypesPrompt = `
**QUESTION TYPES TO INCLUDE:**
- ${types}

Distribute questions across these types appropriately.`;
    }

    let bloomsPrompt = "";
    if (bloomsLevels && bloomsLevels.length > 0) {
      const levels = bloomsLevels.map(l => bloomsDescriptions[l] || l).join("\n- ");
      bloomsPrompt = `
**BLOOM'S TAXONOMY LEVELS:**
Include questions at these cognitive levels:
- ${levels}`;
    }

    const prompt = `You are an expert K-12 assessment designer. Create a well-structured ${assessmentType || "quiz"}.

**ASSESSMENT DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Topic: ${topic}
- Type: ${assessmentType || "Quiz"}
- Number of Questions: ${questionCount || 10}
- Difficulty: ${difficulty || "On grade level"}
${timeLimit ? `- Time Limit: ${timeLimit}` : ""}
${customInstructions ? `- Special Instructions: ${customInstructions}` : ""}
${questionTypesPrompt}
${bloomsPrompt}

**CREATE THE ASSESSMENT:**

---

# ${assessmentType === "test" ? "TEST" : assessmentType === "exam" ? "EXAM" : "QUIZ"}: ${topic}

**Name:** _________________________ **Date:** _____________

**Class/Period:** _________________ ${timeLimit ? `**Time Limit:** ${timeLimit}` : ""}

${includePointValues ? `**Total Points:** _____ points` : ""}

**Instructions:** Read each question carefully. ${assessmentType === "test" || assessmentType === "exam" ? "Show all work where applicable." : ""} 

---

## QUESTIONS

${questionTypes?.includes("multiple-choice") || !questionTypes ? `
### Multiple Choice
*${includePointValues ? "(___ points each)" : ""}*

For each question, circle the best answer.

1. [Question]
   A) [Option]
   B) [Option]
   C) [Option]
   D) [Option]

...continue with multiple choice questions
` : ""}

${questionTypes?.includes("true-false") ? `
### True or False
*${includePointValues ? "(___ points each)" : ""}*

Write T for True or F for False.

_____ 1. [Statement]
_____ 2. [Statement]

...continue with T/F questions
` : ""}

${questionTypes?.includes("matching") ? `
### Matching
*${includePointValues ? "(___ points each)" : ""}*

Match each term with its correct definition.

| Term | Definition |
|------|------------|
| ___ 1. [Term] | A. [Definition] |
| ___ 2. [Term] | B. [Definition] |

...continue with matching
` : ""}

${questionTypes?.includes("fill-blank") ? `
### Fill in the Blank
*${includePointValues ? "(___ points each)" : ""}*

Complete each sentence with the correct word or phrase.

1. _________________________________ [context for blank]

...continue with fill in the blank
` : ""}

${questionTypes?.includes("short-answer") ? `
### Short Answer
*${includePointValues ? "(___ points each)" : ""}*

Answer each question in 1-2 complete sentences.

1. [Question]

   ________________________________________________________________

   ________________________________________________________________

...continue with short answer
` : ""}

${questionTypes?.includes("extended-response") ? `
### Extended Response
*${includePointValues ? "(___ points)" : ""}*

Answer the following question in a well-developed paragraph.

1. [Question prompt that requires analysis, synthesis, or evaluation]

   ________________________________________________________________
   
   ________________________________________________________________
   
   ________________________________________________________________
   
   ________________________________________________________________

` : ""}

---

${includeAnswerKey ? `
## ANSWER KEY

### Multiple Choice
1. [Letter] - [Brief explanation if helpful]
2. ...

### True/False
1. [T/F] - [Explanation]
2. ...

### Matching
1. [Letter]
2. ...

### Fill in the Blank
1. [Answer]
2. ...

### Short Answer (Acceptable responses)
1. [Key points that should be included]
2. ...

### Extended Response (Scoring guide)
- Full credit: [description]
- Partial credit: [description]
- Minimal credit: [description]
` : ""}

---

**GUIDELINES:**
- Create exactly ${questionCount || 10} questions total
- Questions should be clear and unambiguous
- All options in multiple choice should be plausible
- Match difficulty to grade level: ${difficulty || "on grade level"}
- Ensure questions actually assess understanding of ${topic}
- Format cleanly for easy printing`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const quiz = message.content[0].text;

    return Response.json({ quiz });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return Response.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}