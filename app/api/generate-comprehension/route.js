import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      textType,
      textTitle,
      textContent,
      questionTypes,
      dokLevels,
      numberOfQuestions,
      includeAnswerKey,
      includeTextEvidence,
      includeDiscussion,
      standards,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const textTypes = {
      "fiction": "Fiction - Novels, short stories, narrative texts",
      "nonfiction": "Nonfiction - Informational texts, articles, essays",
      "poetry": "Poetry - Poems, song lyrics, verse",
      "drama": "Drama - Plays, scripts, dialogues",
      "primary-source": "Primary Source - Historical documents, speeches, letters",
      "article": "News/Magazine Article - Current events, journalism",
    };

    const dokDescriptions = {
      "1": "DOK 1 (Recall) - Remember, identify, recognize, locate",
      "2": "DOK 2 (Skill/Concept) - Summarize, interpret, infer, compare",
      "3": "DOK 3 (Strategic Thinking) - Analyze, evaluate, draw conclusions",
      "4": "DOK 4 (Extended Thinking) - Synthesize, connect, create",
    };

    const questionTypeDescriptions = {
      "literal": "Literal/Explicit - Answers found directly in text",
      "inferential": "Inferential - Reading between the lines",
      "evaluative": "Evaluative - Making judgments about the text",
      "analytical": "Analytical - Examining author's craft and structure",
      "vocabulary": "Vocabulary in Context - Word meaning from context",
      "text-structure": "Text Structure - How the text is organized",
      "purpose-theme": "Purpose/Theme - Central ideas and author's purpose",
      "character": "Character Analysis - Traits, motivations, development",
      "mixed": "Mixed - Variety of question types",
    };

    let textSection = "";
    if (textContent && textContent.trim()) {
      textSection = `

**TEXT PROVIDED:**
---
${textContent.substring(0, 4000)}${textContent.length > 4000 ? '\n...[text truncated for length]' : ''}
---

Generate questions specifically about this text. Reference specific passages, quotes, and details.
`;
    }

    const selectedDoks = dokLevels && dokLevels.length > 0 ? dokLevels : ["1", "2", "3"];
    const dokList = selectedDoks.map(d => dokDescriptions[d]).join("\n- ");

    const prompt = `You are an expert reading specialist who creates rigorous, text-dependent comprehension questions aligned to literacy standards.

**QUESTION PARAMETERS:**
- Grade Level: ${gradeLevel}
- Text Type: ${textTypes[textType] || textTypes["fiction"]}
${textTitle ? `- Text Title: ${textTitle}` : ""}
- Question Types: ${questionTypeDescriptions[questionTypes] || questionTypeDescriptions["mixed"]}
- DOK Levels to Include:
  - ${dokList}
- Number of Questions: ${numberOfQuestions || 10}
${standards ? `- Standards: ${standards}` : ""}
${textSection}

**GENERATE COMPREHENSION QUESTIONS:**

---

# 📖 Comprehension Questions

**Text:** ${textTitle || "[Text Title]"}
**Grade Level:** ${gradeLevel}
**Text Type:** ${textType || "Fiction"}

---

## 📋 Question Set

${Array.from({length: parseInt(numberOfQuestions) || 10}, (_, i) => `
### Question ${i + 1}

**DOK Level:** [1/2/3/4]
**Question Type:** [Literal/Inferential/Evaluative/Analytical/Vocabulary/etc.]
${standards ? `**Standard:** [Relevant standard]` : ""}

**Question:**
[Write a clear, specific question appropriate for ${gradeLevel}]

${includeTextEvidence ? `
**Text Evidence Requirement:**
☐ Students must cite specific evidence from the text
**Look for evidence in:** [Paragraph/section hint without giving away answer]
` : ""}

${includeAnswerKey ? `
**Answer Key:**
[Provide the correct answer or exemplary response]

**Acceptable Responses Include:**
- [Variation 1]
- [Variation 2]

**Common Misconceptions:**
- [What students might incorrectly think and why]
` : ""}

---
`).join('\n')}

${includeDiscussion ? `
## 💬 Discussion Questions

These questions are designed for whole-class or small-group discussion:

### Discussion Question 1 (DOK 3-4)
[Higher-order question that invites multiple perspectives]

**Discussion Facilitation Tips:**
- [How to launch the discussion]
- [Follow-up questions to deepen thinking]
- [Connections to make]

### Discussion Question 2 (DOK 3-4)
[Another discussion-worthy question]

**Discussion Facilitation Tips:**
- [How to launch the discussion]
- [Follow-up questions to deepen thinking]

---
` : ""}

## 📊 Question Distribution

| DOK Level | Count | Question Numbers |
|-----------|-------|------------------|
| DOK 1 (Recall) | [#] | [list] |
| DOK 2 (Skill/Concept) | [#] | [list] |
| DOK 3 (Strategic Thinking) | [#] | [list] |
| DOK 4 (Extended Thinking) | [#] | [list] |

| Question Type | Count |
|---------------|-------|
| Literal | [#] |
| Inferential | [#] |
| Evaluative | [#] |
| Analytical | [#] |
| Vocabulary | [#] |

---

## 🎯 Teaching Notes

**Before Reading:**
- [Activate prior knowledge about...]
- [Pre-teach vocabulary: ...]

**During Reading:**
- [Stop points for check-in questions]
- [What to model or think aloud]

**After Reading:**
- [Suggested sequence for questions]
- [Which questions work best for written response vs. discussion]

---

**GUIDELINES:**
- Questions must be text-dependent (answerable only by reading the text)
- Avoid questions answerable from prior knowledge alone
- Include a range of DOK levels as specified
- Questions should build comprehension, not just test it
- Use clear, grade-appropriate language for ${gradeLevel}
- If text was provided, questions MUST reference specific parts of that text`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const questions = message.content[0].text;

    return Response.json({ questions });
  } catch (error) {
    console.error("Error generating comprehension questions:", error);
    return Response.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}