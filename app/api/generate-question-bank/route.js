import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      standards,
      dokLevels,
      questionTypes,
      numQuestions,
      includeAnswerKey,
      includeDistractorRationale,
    } = await request.json();

    if (!topic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Topic, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const dokDescriptions = {
      'dok1': 'DOK 1 (Recall & Reproduction)',
      'dok2': 'DOK 2 (Skills & Concepts)',
      'dok3': 'DOK 3 (Strategic Thinking)',
      'dok4': 'DOK 4 (Extended Thinking)',
    };

    const questionTypeDescriptions = {
      'multiple-choice': 'Multiple Choice (4 options)',
      'true-false': 'True/False',
      'short-answer': 'Short Answer',
      'extended-response': 'Extended Response',
      'fill-blank': 'Fill in the Blank',
      'matching': 'Matching',
    };

    const dokList = dokLevels.map(d => dokDescriptions[d] || d).join(', ');
    const typesList = questionTypes.map(t => questionTypeDescriptions[t] || t).join(', ');

    const prompt = `You are an expert K-12 assessment designer specializing in creating standards-aligned question banks with proper DOK (Depth of Knowledge) level distribution.

**QUESTION BANK DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Topic/Unit: ${topic}
- Number of Questions: ${numQuestions}
- DOK Levels to Include: ${dokList}
- Question Types: ${typesList}
${standards ? `- Standards Alignment: ${standards}` : ''}

**CREATE A COMPREHENSIVE QUESTION BANK:**

---

# QUESTION BANK: ${topic}

**Grade Level:** ${gradeLevel}  
**Subject:** ${subject}  
**Total Questions:** ${numQuestions}
**DOK Distribution:** ${dokList}

---

## HOW TO USE THIS QUESTION BANK
- Questions are organized by DOK level for easy differentiation
- Each question is tagged with question type and DOK level
- Mix and match to create custom assessments
- Use lower DOK for formative checks, higher DOK for deeper assessment
${standards ? '- All questions aligned to specified standards' : ''}

---

${standards ? `## STANDARDS ADDRESSED
${standards}

---` : ''}

## QUESTIONS BY DOK LEVEL

${dokLevels.includes('dok1') ? `### DOK 1 - Recall & Reproduction
*Questions that require recalling facts, terms, definitions, or simple procedures*

` : ''}

${dokLevels.includes('dok2') ? `### DOK 2 - Skills & Concepts  
*Questions that require mental processing beyond recall, such as comparing, organizing, or interpreting*

` : ''}

${dokLevels.includes('dok3') ? `### DOK 3 - Strategic Thinking
*Questions that require reasoning, planning, and using evidence to support conclusions*

` : ''}

${dokLevels.includes('dok4') ? `### DOK 4 - Extended Thinking
*Questions that require complex reasoning, investigation, and connecting ideas across content*

` : ''}

For each DOK level included, create an appropriate number of questions (distribute ${numQuestions} questions across the selected DOK levels). Use the specified question types: ${typesList}.

**For each question, format as:**

**Question [#]** | Type: [Question Type] | DOK: [Level]
${standards ? '[Standard: relevant standard code]' : ''}

[Question text]

[For multiple choice, include:]
A) [option]
B) [option]
C) [option]
D) [option]

${includeAnswerKey ? `**Answer:** [correct answer]` : ''}
${includeDistractorRationale ? `**Distractor Analysis:**
- A) [why this is correct/incorrect]
- B) [why this is incorrect - common misconception it addresses]
- C) [why this is incorrect - common misconception it addresses]
- D) [why this is incorrect - common misconception it addresses]` : ''}

---

${includeAnswerKey ? `## ANSWER KEY

[List all answers in a quick-reference format]

| Q# | DOK | Type | Answer |
|----|-----|------|--------|
| 1  | [level] | [type] | [answer] |
...

---` : ''}

## QUESTION SUMMARY

| Q# | DOK Level | Question Type | ${standards ? 'Standard |' : ''} Difficulty |
|----|-----------|---------------|${standards ? '----------|' : ''} ----------|

---

**IMPORTANT GUIDELINES:**
- Create ${numQuestions} high-quality, unambiguous questions total
- Distribute questions appropriately across the selected DOK levels
- Ensure questions genuinely match their DOK level (don't label recall questions as DOK 3)
- All multiple choice distractors should be plausible and address common misconceptions
- Questions should assess genuine understanding appropriate to ${gradeLevel}
- Vary the specific skills assessed within the topic
${includeDistractorRationale ? '- Provide detailed rationale for why each distractor is wrong and what misconception it targets' : ''}`;

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