import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      unit,
      topics,
      questionsPerTopic,
      questionTypes,
      difficulty,
      includeAnswers,
      includeStandards,
      standardsFramework,
    } = await request.json();

    if (!unit || !gradeLevel || !subject) {
      return Response.json(
        { error: "Unit, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const standardsMap = {
      "common-core": "Common Core State Standards",
      "ngss": "Next Generation Science Standards",
      "texas-teks": "Texas TEKS",
      "state": "State Standards",
    };

    const questionTypeDescriptions = {
      "multiple-choice": "Multiple choice (4 options)",
      "true-false": "True/False",
      "short-answer": "Short answer",
      "fill-blank": "Fill in the blank",
      "matching": "Matching",
      "extended-response": "Extended response",
    };

    let questionTypesPrompt = "";
    if (questionTypes && questionTypes.length > 0) {
      const types = questionTypes.map(t => questionTypeDescriptions[t] || t).join(", ");
      questionTypesPrompt = `Question types to include: ${types}`;
    }

    const prompt = `You are an expert K-12 assessment designer. Create a comprehensive question bank for a unit of study.

**QUESTION BANK DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Unit: ${unit}
${topics ? `- Topics/Concepts to Cover: ${topics}` : ""}
- Questions per topic: ${questionsPerTopic || 5}
- ${questionTypesPrompt || "Include a variety of question types"}
- Difficulty: ${difficulty || "Mixed"}
${includeStandards ? `- Align to: ${standardsMap[standardsFramework] || "Standards"}` : ""}

**CREATE A QUESTION BANK:**

---

# QUESTION BANK: ${unit}

**Grade Level:** ${gradeLevel}  
**Subject:** ${subject}  
**Total Questions:** [count]

---

## HOW TO USE THIS QUESTION BANK
- Questions are organized by topic/concept
- Each question is tagged with difficulty level (E=Easy, M=Medium, H=Hard)
- Mix and match to create custom assessments
${includeStandards ? "- Standards alignment noted for each question" : ""}

---

## QUESTIONS BY TOPIC

### Topic 1: [Topic Name]
${includeStandards ? "*Standards: [relevant standard codes]*" : ""}

**Question 1** [Difficulty: E/M/H] ${includeStandards ? "[Standard: XXX]" : ""}
Type: Multiple Choice
[Question text]
A) [option]
B) [option]
C) [option]
D) [option]
${includeAnswers ? "**Answer:** [correct answer with brief explanation]" : ""}

**Question 2** [Difficulty: E/M/H]
Type: Short Answer
[Question text]
${includeAnswers ? "**Answer:** [expected response]" : ""}

...continue with ${questionsPerTopic || 5} questions for this topic

---

### Topic 2: [Topic Name]
...continue pattern for each topic

---

## QUESTION SUMMARY TABLE

| # | Topic | Type | Difficulty | ${includeStandards ? "Standard |" : ""}
|---|-------|------|------------|${includeStandards ? "---------|" : ""}
| 1 | [topic] | MC | E | ${includeStandards ? "[code] |" : ""}
| 2 | [topic] | SA | M | ${includeStandards ? "[code] |" : ""}
...

---

${includeAnswers ? `
## ANSWER KEY

### Topic 1
1. [Answer]
2. [Answer]
...

### Topic 2
1. [Answer]
...
` : ""}

---

**GUIDELINES:**
- Create high-quality, unambiguous questions
- Vary difficulty within each topic (some easy, some medium, some hard)
- Include different question types as specified
- Questions should assess genuine understanding, not just recall
- All multiple choice distractors should be plausible
- Tag each question with difficulty level
- Organize for easy teacher use`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const questionBank = message.content[0].text;

    return Response.json({ questionBank });
  } catch (error) {
    console.error("Error generating question bank:", error);
    return Response.json(
      { error: "Failed to generate question bank" },
      { status: 500 }
    );
  }
}