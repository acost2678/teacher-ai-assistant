import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      concept,
      priorKnowledge,
      representations,
      includeCommonMistakes,
      includeRealWorld,
      includeVocabulary,
      audienceType,
    } = await request.json();

    if (!concept) {
      return Response.json(
        { error: "Math concept is required" },
        { status: 400 }
      );
    }

    const audienceDescriptions = {
      "student": "Direct explanation for students - use 'you' language, encouraging tone",
      "teacher": "Teacher reference - include pedagogical notes and teaching tips",
      "parent": "Parent-friendly - simple language, home activity suggestions",
    };

    const representationDescriptions = {
      "concrete": "Concrete (Manipulatives) - Physical objects and hands-on materials",
      "visual": "Visual (Pictorial) - Diagrams, drawings, number lines, area models",
      "abstract": "Abstract (Symbolic) - Numbers, symbols, equations",
      "verbal": "Verbal - Word explanations and mathematical language",
      "real-world": "Real-World - Everyday contexts and applications",
    };

    const selectedReps = representations && representations.length > 0
      ? representations.map(r => representationDescriptions[r] || r).join("\n- ")
      : "All representations";

    const prompt = `You are an expert math educator who explains concepts in multiple ways to reach all learners. You use the CRA (Concrete-Representational-Abstract) approach and connect math to real life.

**CONCEPT EXPLANATION REQUEST:**

**Concept:** ${concept}
**Grade Level:** ${gradeLevel || "Not specified"}
**Audience:** ${audienceDescriptions[audienceType] || audienceDescriptions["student"]}
${priorKnowledge ? `**Prior Knowledge Needed:** ${priorKnowledge}` : ""}

**Representations to Include:**
- ${selectedReps}

---

# 📐 Understanding: ${concept}

**Grade Level:** ${gradeLevel || "General"}
**Audience:** ${audienceType === "student" ? "Students" : audienceType === "parent" ? "Parents" : "Teachers"}

---

## 🎯 The Big Idea

**In One Sentence:**
[Explain ${concept} in one clear, memorable sentence]

**Why This Matters:**
[Why students need to understand this concept - real purpose]

**Connection to Prior Learning:**
[What students already know that connects to this]

---

${representations?.includes('concrete') || !representations ? `
## 🧱 Concrete (Hands-On)

**Materials Needed:**
- [Manipulative 1]
- [Manipulative 2]
- [Household alternative]

**Activity:**
[Step-by-step hands-on exploration of the concept]

1. [Step 1 - what to do with manipulatives]
2. [Step 2 - what to observe]
3. [Step 3 - what to discover]

**What to Say:**
"[Script for guiding the hands-on exploration]"

**Key Observation:**
[What students should notice/discover]

---
` : ""}

${representations?.includes('visual') || !representations ? `
## 🎨 Visual (Pictures & Diagrams)

**Visual Model 1: [Type - e.g., Number Line, Area Model, Array]**

\`\`\`
[ASCII representation of the visual model]
\`\`\`

**How to Read This:**
[Explanation of what each part represents]

**Visual Model 2: [Type]**

\`\`\`
[Another visual representation]
\`\`\`

**Drawing It Yourself:**
1. [Step to draw]
2. [Step to draw]
3. [Step to draw]

---
` : ""}

${representations?.includes('abstract') || !representations ? `
## 🔢 Abstract (Symbols & Numbers)

**The Mathematical Notation:**
[Show the symbolic representation]

**Reading the Symbols:**
[Explain what each symbol means in words]

**Step-by-Step Process:**
1. [Procedural step]
2. [Procedural step]
3. [Procedural step]

**Pattern to Notice:**
[Mathematical pattern or rule]

**Memory Aid:**
[Mnemonic, rhyme, or memory trick if applicable]

---
` : ""}

${representations?.includes('verbal') || !representations ? `
## 💬 Verbal (In Words)

**Explaining to a Friend:**
"[Casual, student-friendly explanation as if talking to a peer]"

**Mathematical Language:**
| Everyday Word | Math Word |
|---------------|-----------|
| [common word] | [math term] |
| [common word] | [math term] |

**Complete Explanation:**
[Thorough verbal explanation using proper mathematical vocabulary]

**Questions to Check Understanding:**
1. "[Question that reveals understanding]"
2. "[Question that goes deeper]"

---
` : ""}

${includeRealWorld || representations?.includes('real-world') ? `
## 🌍 Real-World Connections

**Where You See This:**
- [Real-world example 1]
- [Real-world example 2]
- [Real-world example 3]

**Story Problem:**
"[Engaging real-world scenario that uses this concept]"

**Career Connection:**
[How professionals use this math]

**At Home:**
[Where this shows up in everyday life]

---
` : ""}

${includeVocabulary ? `
## 📚 Math Vocabulary

| Term | Definition | Example |
|------|------------|---------|
| [term 1] | [student-friendly definition] | [example] |
| [term 2] | [student-friendly definition] | [example] |
| [term 3] | [student-friendly definition] | [example] |
| [term 4] | [student-friendly definition] | [example] |

**Word Wall Words:**
[List of key terms for display]

---
` : ""}

${includeCommonMistakes ? `
## ⚠️ Common Mistakes to Avoid

### Mistake 1: [Common error]
❌ **What it looks like:** [Example of the error]
✅ **Instead:** [Correct approach]
💡 **Why this happens:** [Root cause]

### Mistake 2: [Common error]
❌ **What it looks like:** [Example of the error]
✅ **Instead:** [Correct approach]
💡 **Why this happens:** [Root cause]

### Mistake 3: [Common error]
❌ **What it looks like:** [Example of the error]
✅ **Instead:** [Correct approach]
💡 **Why this happens:** [Root cause]

---
` : ""}

## ✅ Check Your Understanding

**I understand this concept when I can:**
- [ ] Explain it in my own words
- [ ] Show it with objects or pictures
- [ ] Use it to solve a problem
- [ ] Find an example in real life

**Quick Self-Check:**
[2-3 simple questions or tasks to verify understanding]

---

## 🚀 What's Next?

**This concept leads to:**
- [Future concept 1]
- [Future concept 2]

**Challenge Extension:**
[For students who want to go deeper]

---

${audienceType === "teacher" ? `
## 👩‍🏫 Teaching Notes

**Lesson Sequence:**
1. [Hook/Launch]
2. [Exploration]
3. [Discussion]
4. [Practice]
5. [Reflection]

**Differentiation:**
- **Support:** [For struggling learners]
- **Extend:** [For advanced learners]

**Assessment Ideas:**
- [Formative check]
- [Exit ticket idea]

**Time Estimate:** [X] minutes
` : ""}

${audienceType === "parent" ? `
## 🏠 For Parents

**How to Help at Home:**
- [Simple activity 1]
- [Simple activity 2]
- [Game to play]

**Questions to Ask:**
- "[Question 1]"
- "[Question 2]"

**What NOT to Do:**
- [Common parent mistake to avoid]

**If Your Child is Struggling:**
[Reassuring guidance]
` : ""}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const explanation = message.content[0].text;

    return Response.json({ explanation });
  } catch (error) {
    console.error("Error generating concept explanation:", error);
    return Response.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}