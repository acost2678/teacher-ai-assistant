import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      originalText,
      originalLevel,
      targetLevel,
      targetLexile,
      preserveElements,
      adjustments,
      includeVocabularySupport,
      includeComprehensionSupport,
      numberOfVersions,
    } = await request.json();

    if (!originalText) {
      return Response.json(
        { error: "Original text is required" },
        { status: 400 }
      );
    }

    const levelDescriptions = {
      "K": "Kindergarten (Lexile BR-200): Very short sentences, basic sight words, simple CVC words, heavy picture support needed",
      "1": "1st Grade (Lexile 200-400): Simple sentences, common words, basic phonics patterns, repetitive structure",
      "2": "2nd Grade (Lexile 400-500): Slightly longer sentences, more varied vocabulary, some compound sentences",
      "3": "3rd Grade (Lexile 500-600): Paragraphs, transitional words, subject-specific vocabulary introduced",
      "4": "4th Grade (Lexile 600-700): Multi-paragraph, inferential thinking required, more complex sentences",
      "5": "5th Grade (Lexile 700-800): Abstract concepts, figurative language, varied sentence structure",
      "6": "6th Grade (Lexile 800-900): Complex sentences, domain-specific vocabulary, nuanced ideas",
      "7": "7th Grade (Lexile 900-1000): Sophisticated vocabulary, complex syntax, multiple perspectives",
      "8": "8th Grade (Lexile 1000-1050): Advanced vocabulary, complex arguments, abstract reasoning",
      "9-10": "9th-10th Grade (Lexile 1050-1150): Dense text, academic vocabulary, complex analysis",
      "11-12": "11th-12th Grade (Lexile 1150-1300): College-prep, sophisticated syntax, nuanced arguments",
    };

    const preserveOptions = {
      "key-facts": "Preserve all key facts and main ideas exactly",
      "names-dates": "Preserve all names, dates, and specific details",
      "sequence": "Preserve the sequence of events/steps",
      "tone": "Preserve the author's tone and perspective",
      "structure": "Preserve the overall structure (intro, body, conclusion)",
      "quotes": "Preserve any direct quotes",
    };

    const adjustmentDescriptions = {
      "sentence-length": "Adjust sentence length (shorter for lower levels)",
      "vocabulary": "Replace complex words with simpler alternatives",
      "syntax": "Simplify sentence structure (reduce embedded clauses)",
      "concept-density": "Reduce number of concepts per paragraph",
      "add-context": "Add context clues and background information",
      "add-transitions": "Add clearer transitional phrases",
      "chunk-text": "Break into smaller, manageable chunks",
      "add-headers": "Add headings and subheadings for navigation",
    };

    const selectedPreserve = preserveElements && preserveElements.length > 0 
      ? preserveElements.map(p => preserveOptions[p] || p).join("\n- ")
      : "All key facts and main ideas";

    const selectedAdjustments = adjustments && adjustments.length > 0
      ? adjustments.map(a => adjustmentDescriptions[a] || a).join("\n- ")
      : "All adjustments as needed";

    const prompt = `You are an expert literacy specialist and reading interventionist who precisely adjusts text complexity while maintaining content integrity. Your leveling is research-based and precise, not approximate.

**TEXT LEVELING TASK:**

**Original Text:**
---
${originalText}
---

**Level Adjustment:**
- Original Level: ${originalLevel ? levelDescriptions[originalLevel] || originalLevel : "Not specified"}
- Target Level: ${levelDescriptions[targetLevel] || targetLevel}
${targetLexile ? `- Target Lexile Range: ${targetLexile}` : ""}

**MUST Preserve:**
- ${selectedPreserve}

**Adjustments to Make:**
- ${selectedAdjustments}

**Number of Versions:** ${numberOfVersions || 1}

---

# 📖 Text Leveler Results

**Original Level:** ${originalLevel || "Not specified"}
**Target Level:** ${targetLevel}
${targetLexile ? `**Target Lexile:** ${targetLexile}` : ""}

---

## 📝 Leveled Text

${parseInt(numberOfVersions) > 1 ? `### Version 1` : ""}

[Rewrite the text at the target reading level. Be precise about:
- Sentence length (count words per sentence)
- Vocabulary complexity
- Concept density
- Syntax complexity

Maintain ALL key information while adjusting complexity.]

---

**Leveling Changes Made:**

| Element | Original | Adjusted |
|---------|----------|----------|
| Avg. sentence length | ~[X] words | ~[X] words |
| Complex vocabulary | [list words replaced] | [simpler alternatives] |
| Sentence types | [describe] | [describe] |
| Paragraph length | [X] sentences | [X] sentences |

**Vocabulary Substitutions:**
| Original Word | Replacement | Why Changed |
|---------------|-------------|-------------|
| [complex word] | [simpler word] | [reason] |
| [complex word] | [simpler word] | [reason] |

---

${includeVocabularySupport ? `
## 📚 Vocabulary Support

**Tier 2 Words to Pre-Teach:**
${Array.from({length: 5}, (_, i) => `
${i + 1}. **[Word]**
   - Student-friendly definition: [definition]
   - In context: "[sentence from text]"
   - Cognate (if applicable): [Spanish/other cognate]
`).join('')}

**Word Bank for Students:**
[Create a simple word bank with key terms and brief definitions]

---
` : ""}

${includeComprehensionSupport ? `
## 🎯 Comprehension Support

**Before Reading:**
- Background knowledge to activate: [what students need to know]
- Key vocabulary to preview: [3-5 words]
- Purpose-setting question: "[question]"

**During Reading:**
- Stop and check at: [specific point]
- Question to ask: "[comprehension check question]"

**After Reading:**
- Main idea check: [question]
- Detail check: [question]

**Graphic Organizer:**
[Suggest appropriate organizer for this text - story map, main idea/details, sequence, etc.]

---
` : ""}

${parseInt(numberOfVersions) > 1 ? `
### Version 2

[Create an alternate version with slightly different vocabulary choices or sentence structures, still at the target level]

---

**Changes in Version 2:**
- [Different vocabulary choices]
- [Different sentence structures]
- [Why this version might work better for certain students]
` : ""}

## ✅ Fidelity Check

**Content Preserved:**
- [ ] All main ideas intact
- [ ] All key facts accurate
- [ ] Sequence maintained
- [ ] Author's purpose preserved

**Level Verification:**
- [ ] Sentence length appropriate for ${targetLevel}
- [ ] Vocabulary matches ${targetLevel}
- [ ] Concept density appropriate
- [ ] Text features support comprehension

---

## 📋 Teacher Notes

**When to Use This Version:**
- Students reading at [level range]
- Students who need [specific support]

**Pair With:**
- [Suggested scaffold or support]

**Progress Monitoring:**
- If students succeed with this, move to [next level]
- If students struggle, add [additional support]

---

**CRITICAL GUIDELINES:**
- NEVER change facts, names, dates, or key information
- ALWAYS maintain the same meaning and message
- Level adjustments must be PRECISE, not approximate
- Count sentences and words to verify level
- Preserve the author's voice as much as possible while adjusting complexity
- This is NOT summarizing - it's rewriting at a different level with FULL content`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const leveledText = message.content[0].text;

    return Response.json({ leveledText });
  } catch (error) {
    console.error("Error leveling text:", error);
    return Response.json(
      { error: "Failed to level text" },
      { status: 500 }
    );
  }
}