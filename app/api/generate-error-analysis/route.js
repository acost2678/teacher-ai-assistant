import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      mathTopic,
      problem,
      correctAnswer,
      studentAnswer,
      showWork,
      errorPatterns,
      includeReteaching,
      includeParentExplanation,
    } = await request.json();

    if (!problem || !correctAnswer || !studentAnswer) {
      return Response.json(
        { error: "Problem, correct answer, and student answer are required" },
        { status: 400 }
      );
    }

    const mathTopics = {
      "addition": "Addition",
      "subtraction": "Subtraction",
      "multiplication": "Multiplication",
      "division": "Division",
      "fractions": "Fractions",
      "decimals": "Decimals",
      "percents": "Percents",
      "place-value": "Place Value",
      "algebra": "Algebraic Thinking",
      "geometry": "Geometry",
      "measurement": "Measurement",
      "word-problems": "Word Problems",
      "order-operations": "Order of Operations",
      "ratios": "Ratios & Proportions",
      "integers": "Integers",
      "equations": "Equations",
      "other": "Other",
    };

    const prompt = `You are an expert math interventionist who specializes in diagnosing student misconceptions and providing targeted re-teaching strategies.

**CRITICAL INSTRUCTION:** You are NOT calculating or verifying the math. The teacher has already determined what is correct and incorrect. Your job is to ANALYZE WHY the student might have gotten the answer they got, and suggest how to address the misconception.

**ERROR ANALYSIS REQUEST:**

**Problem Information:**
- Grade Level: ${gradeLevel || "Not specified"}
- Math Topic: ${mathTopics[mathTopic] || mathTopic || "General"}
- Problem: ${problem}
- Correct Answer (teacher verified): ${correctAnswer}
- Student's Answer: ${studentAnswer}
${showWork ? `- Student's Work/Process: ${showWork}` : ""}
${errorPatterns ? `- Teacher's Observation: ${errorPatterns}` : ""}

**ANALYZE THE ERROR:**

---

# 🔍 Math Error Analysis

**Problem:** ${problem}
**Correct Answer:** ${correctAnswer}
**Student's Answer:** ${studentAnswer}
**Topic:** ${mathTopics[mathTopic] || mathTopic || "General"}

---

## 🎯 Error Identification

**Type of Error:**
[Identify the category: Conceptual, Procedural, Careless, or Notation]

**Most Likely Misconception:**
[Explain what the student probably misunderstood or did incorrectly to arrive at ${studentAnswer}]

**How the Student Likely Thought:**
"[Write from the student's perspective - what was their probable reasoning?]"

**Error Pattern:**
[Is this a common error? What pattern does it suggest?]

---

## 🧠 Diagnostic Questions

Ask the student these questions to confirm the misconception:

1. "[Question to probe their understanding]"
2. "[Question to reveal their process]"
3. "[Question to check foundational skills]"

**Listen for:**
- [What answer would confirm this misconception]
- [What answer would suggest a different issue]

---

${includeReteaching ? `
## 📚 Re-Teaching Strategies

### Strategy 1: Concrete (Manipulatives)
**Materials:** [Specific manipulatives]
**Activity:**
[Step-by-step activity using physical objects]

### Strategy 2: Visual (Representational)
**Visual Model:**
[Describe a diagram, number line, area model, etc.]

**How to Use:**
[Step-by-step guide]

### Strategy 3: Abstract (Symbolic)
**Approach:**
[How to re-teach the procedure with numbers/symbols]

**Key Points to Emphasize:**
- [Point 1]
- [Point 2]
- [Point 3]

### Quick Intervention Script
"[Word-for-word what to say to the student to address this specific error]"

---

## ✅ Check for Understanding

After re-teaching, have the student try:

**Similar Problem:** [A parallel problem to check if they understood]

**Look for:** [What correct work/answer would show]

**If still struggling:** [Next step intervention]

---
` : ""}

## 📋 Common Errors in ${mathTopics[mathTopic] || "This Topic"}

This error is [common/less common] for this topic. Related misconceptions to watch for:

| Error Type | What It Looks Like | Root Cause |
|------------|-------------------|------------|
| [Error 1] | [Example] | [Why it happens] |
| [Error 2] | [Example] | [Why it happens] |
| [Error 3] | [Example] | [Why it happens] |

---

${includeParentExplanation ? `
## 👨‍👩‍👧 Parent-Friendly Explanation

**What happened:**
[Simple explanation of the error for parents]

**How to help at home:**
- [Specific activity 1]
- [Specific activity 2]
- [What NOT to do]

**Sample conversation:**
"[Script for how parents can talk through this with their child]"

---
` : ""}

## 📊 Progress Monitoring

**Mastery Indicator:**
The student has addressed this misconception when they can:
- [ ] [Specific observable behavior]
- [ ] [Specific observable behavior]
- [ ] [Specific observable behavior]

**Red Flags:**
If the student continues to [specific error], consider [intervention suggestion].

---

**IMPORTANT NOTES:**
- I have NOT verified the math - I trust the teacher's determination of correct/incorrect
- My analysis is based on common error patterns for this type of problem
- The student may have a different misconception than what I've identified
- Use the diagnostic questions to confirm before re-teaching`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const analysis = message.content[0].text;

    return Response.json({ analysis });
  } catch (error) {
    console.error("Error analyzing math error:", error);
    return Response.json(
      { error: "Failed to analyze error" },
      { status: 500 }
    );
  }
}