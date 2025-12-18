import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      writingType,
      topic,
      standards,
      numberOfPrompts,
      complexity,
      includeRubric,
      rubricType,
      includePrewriting,
      includeExemplar,
      timeAllotted,
      customRequirements,
    } = await request.json();

    if (!gradeLevel || !writingType) {
      return Response.json(
        { error: "Grade level and writing type are required" },
        { status: 400 }
      );
    }

    const writingTypes = {
      "argumentative": "Argumentative/Persuasive - Taking a position and defending it with evidence",
      "expository": "Expository/Informational - Explaining a topic clearly and thoroughly",
      "narrative": "Narrative - Telling a story with characters, setting, and plot",
      "literary-analysis": "Literary Analysis - Analyzing literature for meaning, themes, and devices",
      "research": "Research-Based - Synthesizing information from multiple sources",
      "compare-contrast": "Compare/Contrast - Examining similarities and differences",
      "descriptive": "Descriptive - Using vivid details and sensory language",
      "response-to-text": "Text-Dependent Response - Responding to reading with evidence",
      "personal-narrative": "Personal Narrative - Sharing a meaningful personal experience",
      "poetry": "Poetry - Creative expression through poetic forms",
    };

    const complexityLevels = {
      "scaffold": "Scaffolded - Extra support, sentence starters, graphic organizers",
      "standard": "Standard - Grade-level appropriate challenge",
      "advanced": "Advanced - Higher complexity, more independence required",
    };

    const prompt = `You are an expert English/Language Arts curriculum specialist who creates engaging, standards-aligned writing prompts that inspire authentic student writing.

**PROMPT PARAMETERS:**
- Grade Level: ${gradeLevel}
- Writing Type: ${writingTypes[writingType] || writingTypes["expository"]}
${topic ? `- Topic/Theme: ${topic}` : ""}
${standards ? `- Standards to Address: ${standards}` : ""}
- Number of Prompts: ${numberOfPrompts || 1}
- Complexity: ${complexityLevels[complexity] || complexityLevels["standard"]}
${timeAllotted ? `- Time Allotted: ${timeAllotted}` : ""}
${customRequirements ? `- Special Requirements: ${customRequirements}` : ""}

**CREATE ${numberOfPrompts || 1} WRITING PROMPT(S):**

---

# ✍️ Writing Prompts: ${writingType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Grade Level:** ${gradeLevel}
**Writing Type:** ${writingType}
**Complexity:** ${complexity || "Standard"}
${timeAllotted ? `**Time:** ${timeAllotted}` : ""}

---

${Array.from({length: parseInt(numberOfPrompts) || 1}, (_, i) => `
## Prompt ${(numberOfPrompts || 1) > 1 ? (i + 1) : ''}: [Engaging Title]

### 📝 The Prompt

[Write an engaging, clear prompt that:
- Hooks students with an interesting angle or question
- Clearly states what students should write about
- Specifies the writing type and audience
- Is appropriately complex for ${gradeLevel}
- Connects to student interests or real-world relevance]

---

### 📋 Assignment Details

**Writing Type:** ${writingType}
**Audience:** [Specify intended audience]
**Purpose:** [State the purpose clearly]
**Length:** [Appropriate length for grade level]
${timeAllotted ? `**Time:** ${timeAllotted}` : ""}

**Your Task:**
[Break down exactly what students need to do in clear, numbered steps]

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]

---

${includePrewriting ? `
### 🧠 Prewriting Support

**Brainstorming Questions:**
- [Question to help generate ideas]
- [Question to help generate ideas]
- [Question to help generate ideas]

**Graphic Organizer:**
[Describe or provide a simple organizer appropriate for this writing type]

${complexity === "scaffold" ? `
**Sentence Starters:**
- [Starter for introduction]
- [Starter for body paragraphs]
- [Starter for conclusion]
- [Transition words/phrases to use]
` : ""}

---
` : ""}

${includeRubric ? `
### 📊 Scoring Rubric

${rubricType === "holistic" ? `
**Holistic Rubric**

| Score | Description |
|-------|-------------|
| 4 - Exemplary | [Detailed description of exemplary work] |
| 3 - Proficient | [Detailed description of proficient work] |
| 2 - Developing | [Detailed description of developing work] |
| 1 - Beginning | [Detailed description of beginning work] |
` : `
**Analytic Rubric**

| Criteria | 4 - Exemplary | 3 - Proficient | 2 - Developing | 1 - Beginning |
|----------|---------------|----------------|----------------|---------------|
| **Ideas & Content** | [Description] | [Description] | [Description] | [Description] |
| **Organization** | [Description] | [Description] | [Description] | [Description] |
| **Voice & Style** | [Description] | [Description] | [Description] | [Description] |
| **Word Choice** | [Description] | [Description] | [Description] | [Description] |
| **Conventions** | [Description] | [Description] | [Description] | [Description] |

**Total Points Possible:** 20
`}

---
` : ""}

${includeExemplar ? `
### 🌟 Mentor Text Suggestions

**Published Examples:**
- [Suggest a published piece that models this type of writing]
- [Suggest another example if appropriate]

**Key Features to Notice:**
- [Feature 1 students should observe]
- [Feature 2 students should observe]
- [Feature 3 students should observe]

---
` : ""}

### 🎯 Success Criteria

Students who meet the standard will:
- [ ] [Specific, measurable criterion]
- [ ] [Specific, measurable criterion]
- [ ] [Specific, measurable criterion]
- [ ] [Specific, measurable criterion]

---

### 💡 Teacher Notes

**Common Challenges:**
- [Anticipate a challenge] → [Suggestion to address it]
- [Anticipate a challenge] → [Suggestion to address it]

**Differentiation Ideas:**
- **Support:** [How to scaffold for struggling writers]
- **Extension:** [How to challenge advanced writers]

---
`).join('\n')}

**GUIDELINES:**
- Prompts should inspire authentic, meaningful writing
- Avoid prompts that lead to formulaic responses
- Include student choice where appropriate
- Connect to real audiences and purposes when possible
- Make expectations crystal clear
- Rubric criteria should align with prompt requirements`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const prompts = message.content[0].text;

    return Response.json({ prompts });
  } catch (error) {
    console.error("Error generating writing prompts:", error);
    return Response.json(
      { error: "Failed to generate writing prompts" },
      { status: 500 }
    );
  }
}