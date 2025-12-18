import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      mathSkill,
      theme,
      numberOfProblems,
      difficulty,
      includeScaffolding,
      includeVisualSupport,
      problemStyle,
    } = await request.json();

    if (!mathSkill) {
      return Response.json(
        { error: "Math skill is required" },
        { status: 400 }
      );
    }

    const themes = {
      "sports": "Sports (basketball, soccer, swimming, etc.)",
      "food": "Food & Cooking (recipes, restaurants, groceries)",
      "animals": "Animals (pets, zoo, wildlife)",
      "games": "Video Games & Gaming",
      "music": "Music & Entertainment",
      "space": "Space & Science Fiction",
      "nature": "Nature & Outdoors",
      "shopping": "Shopping & Money",
      "travel": "Travel & Transportation",
      "school": "School & Classroom",
      "seasonal": "Seasonal/Holiday themes",
      "random": "Mixed/Random themes",
    };

    const difficultyDescriptions = {
      "entry": "Entry Level - Single-step, friendly numbers, clear context",
      "developing": "Developing - May require two steps, some regrouping",
      "proficient": "Proficient - Multi-step, requires planning",
      "advanced": "Advanced - Complex, multiple operations, extraneous info",
    };

    const styleDescriptions = {
      "traditional": "Traditional - Standard word problem format",
      "real-world": "Real-World - Authentic scenarios with context",
      "open-ended": "Open-Ended - Multiple solution paths or answers",
      "numberless": "Numberless First - Present context, add numbers later",
      "three-act": "Three-Act Math - Engaging hook, question, reveal",
    };

    const prompt = `You are an expert math teacher who creates engaging, culturally responsive word problems that students actually want to solve.

**CRITICAL INSTRUCTION:** You are creating word problems for teachers to use. Include a section where the teacher can write in the correct answer AFTER verifying it themselves. Do NOT calculate or provide answers - the teacher will verify all math.

**WORD PROBLEM REQUEST:**

**Parameters:**
- Grade Level: ${gradeLevel || "5th Grade"}
- Math Skill: ${mathSkill}
- Theme: ${themes[theme] || themes["random"]}
- Number of Problems: ${numberOfProblems || 5}
- Difficulty: ${difficultyDescriptions[difficulty] || difficultyDescriptions["proficient"]}
- Style: ${styleDescriptions[problemStyle] || styleDescriptions["real-world"]}

---

# 🔢 Word Problems: ${mathSkill}

**Grade Level:** ${gradeLevel || "5th Grade"}
**Skill Focus:** ${mathSkill}
**Theme:** ${theme || "Mixed"}
**Difficulty:** ${difficulty || "Proficient"}

---

## 📝 Teacher Preparation

**Before using these problems:**
1. ⚠️ **VERIFY ALL ANSWERS** - Solve each problem yourself before giving to students
2. Write the correct answer in the "Answer (Teacher Verified)" space
3. Note any student-friendly numbers you want to adjust
4. Consider which problems match your students' interests

---

${Array.from({length: parseInt(numberOfProblems) || 5}, (_, i) => `
## Problem ${i + 1}

### 📖 The Problem

[Write an engaging word problem using the ${theme || "varied"} theme that requires ${mathSkill}. Make it culturally inclusive and relatable for ${gradeLevel || "5th Grade"} students.]

---

${problemStyle === 'numberless' ? `
**Numberless Version (present first):**
[Same problem without the numbers - discuss the situation and what operation would be needed]

**Add Numbers:**
[Then reveal the numbers for students to solve]

---
` : ''}

${includeScaffolding ? `
### 🛠️ Scaffolding Support

**Understand the Problem:**
- What do we know? [List given information]
- What are we trying to find? [Identify the question]
- What information is NOT needed? [If applicable]

**Plan:**
- What operation(s) might help? [Guide without giving away]
- Draw a picture or model: [Describe what visual might help]

**Sentence Starter for Answer:**
"The answer is __________ because __________."

---
` : ''}

${includeVisualSupport ? `
### 🎨 Visual Support

**Suggested Model:**
[Describe a visual model that would help - bar model, number line, table, array, etc.]

\`\`\`
[ASCII representation of the visual model structure - NOT solved]
\`\`\`

---
` : ''}

### ✅ Answer (Teacher Verified)

**Correct Answer:** _______________________

**Work/Solution Path:** 
_________________________________________________
_________________________________________________
_________________________________________________

**Common Student Errors to Watch For:**
- [Likely error 1]
- [Likely error 2]

---
`).join('\n')}

## 🎯 Problem Set Overview

| # | Theme | Operation(s) | Difficulty | Verified ✓ |
|---|-------|--------------|------------|------------|
${Array.from({length: parseInt(numberOfProblems) || 5}, (_, i) => `| ${i + 1} | [theme] | [ops] | [level] | ☐ |`).join('\n')}

---

## 📊 Suggested Use

**Whole Class:**
- Problem [#] - Good for modeling (clearest context)
- Problem [#] - Good for discussion (interesting scenario)

**Independent Practice:**
- Problem [#] - Entry level
- Problem [#] - On grade level
- Problem [#] - Challenge

**Assessment:**
- Problem [#] - Best represents the target skill

---

## 💡 Extension Ideas

**For students who finish early:**
- "What if the numbers were different? Create your own version."
- "What's another question we could ask about this situation?"
- "Explain your thinking to a partner."

**For struggling students:**
- Use smaller, friendlier numbers
- Provide the visual model partially completed
- Work with manipulatives first

---

## ⚠️ Important Reminders

1. **ALWAYS verify answers before giving to students**
2. Adjust numbers to match your students' needs
3. Add student names to make problems more engaging
4. Consider cultural relevance for your specific classroom
5. Problems can be simplified by removing extraneous information

---

**NOTE TO TEACHER:** These problems are generated to provide engaging contexts and scaffolding. The mathematical accuracy of answers must be verified by you before classroom use. This protects students from potential AI calculation errors.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const problems = message.content[0].text;

    return Response.json({ problems });
  } catch (error) {
    console.error("Error generating word problems:", error);
    return Response.json(
      { error: "Failed to generate word problems" },
      { status: 500 }
    );
  }
}