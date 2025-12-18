import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      responseType,
      textType,
      textTitle,
      focusStandard,
      numberOfPrompts,
      includeGraphicOrganizer,
      includeRubric,
      includeSentenceStarters,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const responseTypes = {
      "text-evidence": "Text Evidence Response - Cite and explain evidence",
      "character-analysis": "Character Analysis - Traits, motivations, changes",
      "theme": "Theme Response - Central message and lessons",
      "compare-contrast": "Compare/Contrast - Similarities and differences",
      "cause-effect": "Cause & Effect - How events connect",
      "summary": "Summary Response - Key details and main ideas",
      "opinion": "Opinion/Argument - Claim with text support",
      "inference": "Inference Response - Reading between the lines",
      "author-craft": "Author's Craft - Analyzing writer's choices",
      "connection": "Personal Connection - Relating to the text",
      "mixed": "Mixed Response Types - Variety of prompts",
    };

    const prompt = `You are an expert literacy specialist who creates engaging reading response prompts and graphic organizers that help students think deeply about texts.

**READING RESPONSE PARAMETERS:**
- Grade Level: ${gradeLevel}
- Response Type: ${responseTypes[responseType] || responseTypes["mixed"]}
- Text Type: ${textType || "Fiction"}
${textTitle ? `- Text Title: ${textTitle}` : ""}
${focusStandard ? `- Focus Standard: ${focusStandard}` : ""}
- Number of Prompts: ${numberOfPrompts || 5}

**CREATE READING RESPONSE MATERIALS:**

---

# 📝 Reading Response: ${responseType ? responseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Text Response'}

**Grade Level:** ${gradeLevel}
**Response Type:** ${responseType || "Mixed"}
${textTitle ? `**Text:** ${textTitle}` : ""}

---

## 📋 Response Prompts

${Array.from({length: parseInt(numberOfPrompts) || 5}, (_, i) => `
### Prompt ${i + 1}

**Question:**
[Write an engaging, text-dependent prompt that requires evidence and thinking. Appropriate for ${gradeLevel}.]

**What This Assesses:**
- [Skill 1]
- [Skill 2]

${includeSentenceStarters ? `
**Sentence Starters:**
- "[Starter that scaffolds the response]..."
- "[Another starter option]..."
- "[Transition/evidence starter]: According to the text..."
` : ""}

**Look-Fors in Student Response:**
- [ ] [What a strong response includes]
- [ ] [Evidence requirement]
- [ ] [Explanation/analysis requirement]

---
`).join('\n')}

${includeGraphicOrganizer ? `
## 📊 Graphic Organizers

### Organizer 1: ${responseType === 'character-analysis' ? 'Character Map' : responseType === 'compare-contrast' ? 'Venn Diagram' : responseType === 'cause-effect' ? 'Cause & Effect Chain' : responseType === 'theme' ? 'Theme Tracker' : 'Evidence Organizer'}

[Create appropriate organizer for the response type]

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [Graphic organizer appropriate for ${responseType || "text evidence"}]     │
│                                                                 │
│  [Include labeled sections, boxes, arrows as appropriate]       │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

**How to Use:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

---

### Organizer 2: Response Planning Template

**My Claim/Main Point:**
_________________________________________________________________

**Evidence from the Text:**

| Quote/Detail | Page # | How This Supports My Point |
|--------------|--------|---------------------------|
| | | |
| | | |
| | | |

**My Explanation:**
_________________________________________________________________
_________________________________________________________________

**Conclusion:**
_________________________________________________________________

---

### Organizer 3: ${textType === 'fiction' ? 'Story Elements' : 'Text Structure'} Map

[Create organizer appropriate for text type]

---
` : ""}

${includeRubric ? `
## 📊 Response Rubric

### Reading Response Scoring Guide

| Criteria | 4 - Exceeds | 3 - Meets | 2 - Approaching | 1 - Beginning |
|----------|-------------|-----------|-----------------|---------------|
| **Understanding** | Demonstrates deep understanding of text | Shows solid understanding | Shows partial understanding | Shows limited understanding |
| **Text Evidence** | Multiple relevant, well-chosen quotes | Appropriate evidence cited | Some evidence, may be weak | Little or no evidence |
| **Explanation** | Thorough analysis of evidence | Clear explanation of evidence | Basic explanation | Missing or unclear explanation |
| **Organization** | Well-organized, flows logically | Organized with some flow | Some organization | Disorganized |
| **Conventions** | Few or no errors | Minor errors | Several errors | Many errors affecting meaning |

**Total: _____ / 20**

### Quick Rubric (for daily responses)

| Score | Description |
|-------|-------------|
| ✓+ | Exceeds expectations - thorough, insightful, well-supported |
| ✓ | Meets expectations - complete, uses evidence, explains thinking |
| ✓- | Approaching - partial response, needs more evidence or explanation |
| ○ | Not yet - incomplete, missing evidence, unclear |

---
` : ""}

## 💬 Discussion Extensions

Turn any prompt into a discussion with these stems:

**Agreeing:**
- "I agree with [name] because..."
- "Building on what [name] said..."
- "The text also supports this when..."

**Respectfully Disagreeing:**
- "I see it differently because..."
- "I respectfully disagree because the text says..."
- "Another way to look at this is..."

**Asking for Clarification:**
- "Can you explain what you mean by...?"
- "What evidence made you think that?"
- "Can you show me where in the text...?"

---

## 📚 Response Writing Tips

**For Students:**

1. **Read the prompt carefully** - What is it really asking?
2. **Find your evidence FIRST** - Mark it in the text
3. **Plan before you write** - Use a graphic organizer
4. **Follow the formula:**
   - State your answer/claim
   - Cite evidence (include page number)
   - Explain HOW the evidence supports your answer
5. **Reread your response** - Does it answer the question?

**Response Formula:**
ANSWER → CITE → EXPLAIN (ACE)

or

RACE:
- **R**estate the question
- **A**nswer the question
- **C**ite evidence
- **E**xplain your thinking

---

## 🎯 Teaching Tips

**Scaffolding Progression:**
1. Modeled response (teacher writes, thinks aloud)
2. Shared response (class writes together)
3. Guided response (students write, teacher supports)
4. Independent response (students write alone)

**Common Issues & Solutions:**
- **Retells instead of analyzes:** Model the difference
- **Quotes without explanation:** Require "This shows..." after every quote
- **Surface-level response:** Push with "Why?" and "So what?"

---

**GUIDELINES:**
- Prompts must be answerable only by reading the text
- Scaffolds should gradually be removed
- Include a range of difficulty levels
- Connect to grade-level standards
- Graphic organizers should match response type`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const response = message.content[0].text;

    return Response.json({ response });
  } catch (error) {
    console.error("Error generating reading response:", error);
    return Response.json(
      { error: "Failed to generate reading response materials" },
      { status: 500 }
    );
  }
}