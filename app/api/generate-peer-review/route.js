import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      writingType,
      focusAreas,
      reviewStyle,
      includeExamples,
      includeSentenceStarters,
      numberOfRounds,
    } = await request.json();

    if (!gradeLevel || !writingType) {
      return Response.json(
        { error: "Grade level and writing type are required" },
        { status: 400 }
      );
    }

    const writingTypes = {
      "argumentative": "Argumentative/Persuasive Writing",
      "expository": "Expository/Informational Writing",
      "narrative": "Narrative Writing",
      "literary-analysis": "Literary Analysis",
      "research": "Research Paper",
      "descriptive": "Descriptive Writing",
      "poetry": "Poetry",
      "general": "General Writing",
    };

    const reviewStyles = {
      "tag": "TAG (Tell, Ask, Give) - Tell something you liked, Ask a question, Give a suggestion",
      "praise-question-polish": "Praise-Question-Polish (PQP) - Praise strengths, Question unclear parts, Polish with suggestions",
      "glow-grow": "Glow and Grow - What glows (works well), What needs to grow (improve)",
      "stars-wishes": "Stars and Wishes - Stars (great moments), Wishes (things you wish for)",
      "wwwww": "What Works, What Needs Work - Structured positive/constructive feedback",
      "detailed": "Detailed Criteria-Based - Systematic review of specific elements",
    };

    const prompt = `You are an expert English teacher creating structured peer review materials that help students give meaningful, constructive feedback to each other.

**PEER REVIEW PARAMETERS:**
- Grade Level: ${gradeLevel}
- Writing Type: ${writingTypes[writingType] || writingTypes["general"]}
- Review Style: ${reviewStyles[reviewStyle] || reviewStyles["tag"]}
- Focus Areas: ${focusAreas || "All areas"}
- Number of Review Rounds: ${numberOfRounds || 1}
${includeExamples ? "- Include example feedback" : ""}
${includeSentenceStarters ? "- Include sentence starters" : ""}

**CREATE A COMPREHENSIVE PEER REVIEW GUIDE:**

---

# 👥 Peer Review Guide

**Writing Type:** ${writingType}
**Grade Level:** ${gradeLevel}
**Review Style:** ${reviewStyle || "TAG"}

---

## 📋 Before You Begin

### For the Writer:
- [ ] My draft is complete (or as complete as possible)
- [ ] I've numbered my paragraphs for easy reference
- [ ] I have specific questions I want feedback on
- [ ] I'm ready to receive feedback with an open mind

### For the Reviewer:
- [ ] I've read the whole piece once before writing anything
- [ ] I'm focused on helping my peer improve, not showing off
- [ ] I'll be honest AND kind
- [ ] I'll be specific, not vague

---

## 🎯 Review Focus Areas

Based on ${writingType} writing, focus on:

### Primary Focus:
1. **[Key element for this writing type]**
   - What to look for: [Specific guidance]
   - Why it matters: [Brief explanation]

2. **[Second key element]**
   - What to look for: [Specific guidance]
   - Why it matters: [Brief explanation]

3. **[Third key element]**
   - What to look for: [Specific guidance]
   - Why it matters: [Brief explanation]

### Secondary Focus:
- [Additional element]
- [Additional element]

---

## 📝 Peer Review Form

**Writer's Name:** _________________________ **Reviewer's Name:** _________________________

**Title of Piece:** _________________________________________________________________

---

${reviewStyle === "tag" || !reviewStyle ? `
### T - TELL Something You Liked

What part of the writing worked well? Be specific - quote or reference exact parts.

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### A - ASK a Question

What confused you or what do you want to know more about?

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

### G - GIVE a Suggestion

What's one specific thing the writer could do to make this even better?

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
` : ""}

${reviewStyle === "praise-question-polish" ? `
### 🌟 PRAISE - What's Working

Identify 2-3 specific strengths. Quote exact words or sentences that work well.

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

### ❓ QUESTION - What's Unclear

What parts confused you? What questions do you have for the writer?

1. _________________________________________________________________
2. _________________________________________________________________

### ✨ POLISH - Suggestions for Improvement

Give 2-3 specific suggestions. Be constructive, not critical.

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________
` : ""}

${reviewStyle === "glow-grow" ? `
### ✨ GLOW - What Shines

What are the brightest moments in this writing? What made you think, "Yes!"?

**Glow #1:** _________________________________________________________________
**Why it works:** _________________________________________________________________

**Glow #2:** _________________________________________________________________
**Why it works:** _________________________________________________________________

### 🌱 GROW - What Could Develop

What areas could use more attention? Be specific and helpful.

**Grow #1:** _________________________________________________________________
**Suggestion:** _________________________________________________________________

**Grow #2:** _________________________________________________________________
**Suggestion:** _________________________________________________________________
` : ""}

${reviewStyle === "detailed" ? `
### Detailed Review Checklist

Rate each area and provide specific feedback:

| Criteria | Strong | Developing | Needs Work | Comments |
|----------|--------|------------|------------|----------|
| **Opening/Hook** | □ | □ | □ | |
| **Thesis/Main Idea** | □ | □ | □ | |
| **Organization** | □ | □ | □ | |
| **Evidence/Support** | □ | □ | □ | |
| **Transitions** | □ | □ | □ | |
| **Voice/Style** | □ | □ | □ | |
| **Conclusion** | □ | □ | □ | |
| **Conventions** | □ | □ | □ | |

**Strongest Element:** _________________________________________________________________

**Most Important Revision:** _________________________________________________________________

**One Specific Suggestion:** _________________________________________________________________
` : ""}

---

${includeSentenceStarters ? `
## 💬 Sentence Starters

### For Positive Feedback:
- "I really liked how you..."
- "The part where you said '___' was effective because..."
- "Your strongest paragraph is ___ because..."
- "I could really picture/feel/understand ___ when you wrote..."
- "This part grabbed my attention: ..."

### For Constructive Feedback:
- "I was confused when..."
- "I'd love to hear more about..."
- "Have you considered...?"
- "What if you tried...?"
- "This part might be stronger if..."
- "I wonder what would happen if you..."

### For Questions:
- "Can you tell me more about...?"
- "What did you mean when you said...?"
- "Why did you choose to...?"
- "How does ___ connect to ___?"

---
` : ""}

${includeExamples ? `
## 🌟 Example Feedback

### ❌ NOT Helpful (Too Vague):
- "Good job!"
- "I liked it."
- "Fix your grammar."
- "It was boring."
- "Add more detail."

### ✅ HELPFUL (Specific & Kind):
- "Your opening line 'The door creaked open like a warning' immediately created tension. I was hooked!"
- "I got confused in paragraph 3 when you switched from talking about the environment to talking about economics. Maybe add a transition sentence?"
- "Your evidence in paragraph 2 is strong, but I want to know YOUR thoughts about it. What does this quote prove?"
- "Consider varying your sentence length in the third paragraph - it's all short sentences which makes it feel choppy."

---
` : ""}

## 🔄 After the Review

### For the Writer:
1. Read all feedback carefully
2. Ask clarifying questions if needed
3. Decide which suggestions to use (you don't have to use all of them!)
4. Thank your reviewer

### For the Reviewer:
1. Be available to explain your feedback
2. Remember: your job is to help, not to judge
3. Celebrate your peer's strengths

---

## 📊 Quick Reference Card

**The Peer Review Mindset:**
- Be a helper, not a judge
- Be specific, not vague
- Be honest, not harsh
- Be thoughtful, not rushed
- The goal is to help the writing get better

**Remember:** Every piece of writing has something good in it. Find it first.

---

**GUIDELINES:**
- Language appropriate for ${gradeLevel}
- Focus on growth-oriented feedback
- Teach students to be specific
- Model respectful, constructive criticism`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const guide = message.content[0].text;

    return Response.json({ guide });
  } catch (error) {
    console.error("Error generating peer review guide:", error);
    return Response.json(
      { error: "Failed to generate peer review guide" },
      { status: 500 }
    );
  }
}