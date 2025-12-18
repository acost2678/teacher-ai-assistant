import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      contentType,
      originalContent,
      scaffoldTypes,
      studentNeeds,
      outputFormat,
    } = await request.json();

    if (!originalContent) {
      return Response.json(
        { error: "Original content is required" },
        { status: 400 }
      );
    }

    const scaffoldDescriptions = {
      "sentence-starters": "Sentence Starters - Frames to begin responses",
      "word-bank": "Word Bank - Key vocabulary provided",
      "graphic-organizer": "Graphic Organizer - Visual structure for thinking",
      "chunked-text": "Chunked Text - Broken into manageable sections",
      "annotations": "Annotations - Notes and explanations added",
      "visuals": "Visual Supports - Images, icons, diagrams described",
      "examples": "Worked Examples - Completed models provided",
      "checklists": "Checklists - Step-by-step guides",
      "hints": "Hints/Prompts - Guiding questions embedded",
      "vocabulary-support": "Vocabulary Support - Definitions in context",
      "reduced-choices": "Reduced Choices - Fewer options to select from",
      "templates": "Templates - Fill-in-the-blank structures",
    };

    const studentNeedsDescriptions = {
      "ell": "English Language Learners - Language support, visuals, cognates",
      "reading-below": "Below Grade Level Readers - Simplified text, more support",
      "attention": "Attention/Focus Needs - Chunked, clear steps, frequent checks",
      "processing": "Processing Needs - Extra time, reduced load, clear organization",
      "anxiety": "Test/Performance Anxiety - Low-stakes practice, encouragement",
      "gifted-support": "Gifted Needing Structure - Framework without limiting thinking",
      "general": "General Support - Universal scaffolds for all learners",
    };

    const selectedScaffolds = scaffoldTypes && scaffoldTypes.length > 0 
      ? scaffoldTypes.map(s => scaffoldDescriptions[s] || s).join("\n- ")
      : "All appropriate scaffolds";

    const selectedNeeds = studentNeeds && studentNeeds.length > 0
      ? studentNeeds.map(n => studentNeedsDescriptions[n] || n).join("\n- ")
      : "General support";

    const prompt = `You are an expert in Universal Design for Learning (UDL) and scaffolded instruction. You add meaningful supports to content that help ALL learners access the material while maintaining rigor.

**SCAFFOLD REQUEST:**

**Original Content:**
---
${originalContent}
---

**Parameters:**
- Grade Level: ${gradeLevel || "Not specified"}
- Content Type: ${contentType || "General"}
- Scaffolds Requested:
  - ${selectedScaffolds}
- Student Needs:
  - ${selectedNeeds}
- Output Format: ${outputFormat || "Full scaffolded version"}

---

# 🛠️ Scaffolded Content

**Original Content Type:** ${contentType || "General"}
**Grade Level:** ${gradeLevel || "Not specified"}
**Scaffolds Applied:** ${scaffoldTypes ? scaffoldTypes.join(", ") : "Multiple"}

---

## 📄 Original Content (for reference)

${originalContent.substring(0, 500)}${originalContent.length > 500 ? '...' : ''}

---

## 🎯 Scaffolded Version

[Rewrite/restructure the content with ALL requested scaffolds integrated naturally]

${scaffoldTypes?.includes('chunked-text') || !scaffoldTypes ? `
### Section 1: [Clear Header]
[Chunked content with manageable amount of information]

💡 **Check:** [Comprehension check question]

### Section 2: [Clear Header]
[Next chunk of content]

💡 **Check:** [Comprehension check question]
` : ''}

${scaffoldTypes?.includes('vocabulary-support') || !scaffoldTypes ? `
---

## 📚 Vocabulary Support

**Key Terms:**
| Word | Definition | In Context |
|------|------------|------------|
| [term 1] | [student-friendly definition] | "[how it's used in the content]" |
| [term 2] | [student-friendly definition] | "[how it's used in the content]" |
| [term 3] | [student-friendly definition] | "[how it's used in the content]" |

**Word Bank:** [List of key terms students will need]
` : ''}

${scaffoldTypes?.includes('sentence-starters') || !scaffoldTypes ? `
---

## 💬 Sentence Starters

**For Summarizing:**
- "The main idea is..."
- "This is important because..."
- "In other words..."

**For Responding:**
- "I think ___ because..."
- "According to the text..."
- "This connects to..."

**For Questions:**
- "I wonder why..."
- "What would happen if..."
- "How does this relate to..."
` : ''}

${scaffoldTypes?.includes('graphic-organizer') || !scaffoldTypes ? `
---

## 📊 Graphic Organizer

[Create an appropriate organizer for this content - could be:
- Main idea and details
- Sequence/timeline
- Compare/contrast
- Cause and effect
- Concept map
- Cornell notes template]

### [Organizer Name]

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [Visual representation of organizer with labels]       │
│                                                         │
│  [Include spaces for student responses]                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

**How to Use:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
` : ''}

${scaffoldTypes?.includes('examples') || !scaffoldTypes ? `
---

## ✅ Worked Example

**Here's how to approach this:**

[Provide a complete example with think-aloud annotations]

Step 1: [What to do] → *"I'm doing this because..."*
Step 2: [What to do] → *"I notice that..."*
Step 3: [What to do] → *"This tells me..."*

**Now you try:** [Parallel problem/task for student practice]
` : ''}

${scaffoldTypes?.includes('checklists') || !scaffoldTypes ? `
---

## ☑️ Task Checklist

**Before You Start:**
- [ ] I read/reviewed the content
- [ ] I understand what I need to do
- [ ] I have my materials ready

**While Working:**
- [ ] I am using the word bank/sentence starters
- [ ] I am checking my understanding
- [ ] I am asking for help if stuck

**When Finished:**
- [ ] I completed all parts
- [ ] I checked my work
- [ ] My work is clear and organized
` : ''}

${scaffoldTypes?.includes('hints') || !scaffoldTypes ? `
---

## 💡 Hints & Prompts

**If you're stuck on understanding:**
- Try rereading the section about [specific part]
- Look at the graphic organizer
- Ask yourself: [guiding question]

**If you're stuck on responding:**
- Start with the sentence starter: "[starter]"
- Look back at [specific section]
- Use the word bank for vocabulary

**If you need more challenge:**
- Try explaining this to someone else
- Connect this to [related concept]
- What questions do you still have?
` : ''}

${scaffoldTypes?.includes('visuals') || !scaffoldTypes ? `
---

## 🖼️ Visual Supports

**Suggested Visuals:**
- [Description of helpful image/diagram 1]
- [Description of helpful image/diagram 2]
- [Icon suggestions for key concepts]

**Visual Cues in Text:**
- 📌 = Important point
- ⚠️ = Watch out/common mistake
- 💡 = Helpful tip
- ✅ = Check your understanding
` : ''}

---

## 🎯 Scaffolding Guide for Teachers

**How These Scaffolds Support Learning:**
| Scaffold | Purpose | When to Remove |
|----------|---------|----------------|
| [scaffold 1] | [why it helps] | [signs student is ready] |
| [scaffold 2] | [why it helps] | [signs student is ready] |
| [scaffold 3] | [why it helps] | [signs student is ready] |

**Gradual Release Plan:**
1. **Full Support:** Use all scaffolds
2. **Partial Support:** Remove [specific scaffolds] first
3. **Minimal Support:** Keep only [essential scaffold]
4. **Independent:** Student works without scaffolds

---

## 📋 Differentiation Notes

**For ELL Students:**
- [Additional language support]
- [Cognates if applicable]

**For Students Below Level:**
- [Additional reading support]

**For Students with Attention Needs:**
- [Focus supports]

---

**SCAFFOLDING PRINCIPLES APPLIED:**
- Scaffolds provide ACCESS, not answers
- Rigor is maintained - expectations stay high
- Scaffolds are designed to be gradually removed
- Multiple means of representation (UDL)
- Clear, consistent visual structure`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const scaffoldedContent = message.content[0].text;

    return Response.json({ scaffoldedContent });
  } catch (error) {
    console.error("Error generating scaffolds:", error);
    return Response.json(
      { error: "Failed to generate scaffolds" },
      { status: 500 }
    );
  }
}