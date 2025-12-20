import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      situation,
      targetBehavior,
      storyLength,
      perspective,
      includeVisualCues,
      includeComprehension,
    } = await request.json();

    if (!situation) {
      return Response.json(
        { error: "Situation is required" },
        { status: 400 }
      );
    }

    const perspectiveDescriptions = {
      "first": "First person ('I will...', 'I can...')",
      "third": "Third person ('The student will...', '[Name] can...')",
    };

    const lengthDescriptions = {
      "short": "Short (5-7 sentences)",
      "medium": "Medium (8-12 sentences)",
      "long": "Long (13+ sentences)",
    };

    const sentenceCount = storyLength === "short" ? "5-7" : storyLength === "long" ? "13-18" : "8-12";

    const prompt = `You are an expert in creating social stories following Carol Gray's Social Story guidelines. Social stories are short, personalized narratives that describe a situation, skill, or concept using specific criteria to support individuals (especially those with autism, anxiety, or social learning differences) in understanding social situations.

**SOCIAL STORY REQUEST:**

**Situation:** ${situation}
**Target Behavior/Skill:** ${targetBehavior || "General appropriate behavior for the situation"}
**Grade Level:** ${gradeLevel}
**Perspective:** ${perspectiveDescriptions[perspective] || perspectiveDescriptions["first"]}
**Length:** ${lengthDescriptions[storyLength] || lengthDescriptions["medium"]}

**SOCIAL STORY GUIDELINES TO FOLLOW:**
1. Use a positive and patient tone
2. Include descriptive sentences (what happens)
3. Include perspective sentences (how others feel/think)
4. Include directive sentences (what I can do) - use "I can" or "I will try" not "I must"
5. Include affirmative sentences (reassurance)
6. Ratio: At least 2 descriptive/perspective sentences for every 1 directive sentence
7. Use literal, concrete language
8. Avoid idioms, sarcasm, or abstract concepts
9. Be accurate and honest (don't promise things that might not happen)

---

# 📖 Social Story: ${situation}

**For:** ${gradeLevel} Student
**Situation:** ${situation}
${targetBehavior ? `**Target Skills:** ${targetBehavior}` : ''}

---

## The Story

[Write a social story with exactly ${sentenceCount} sentences following Carol Gray's guidelines. Use ${perspective === "third" ? "third" : "first"} person perspective. Each sentence should be on its own line for easy reading.]

---

${includeVisualCues ? `
## 🖼️ Visual Supports

### Suggested Images for Each Page

| Page | Story Text | Visual Suggestion |
|------|------------|-------------------|
| 1 | [First 1-2 sentences] | [Description of helpful image] |
| 2 | [Next 1-2 sentences] | [Description of helpful image] |
| 3 | [Next 1-2 sentences] | [Description of helpful image] |
| 4 | [Final sentences] | [Description of helpful image] |

### Icons/Symbols to Include
- [Relevant symbol 1 and what it represents]
- [Relevant symbol 2 and what it represents]
- [Relevant symbol 3 and what it represents]

### Visual Schedule Version
If converting to a visual schedule:
1. [Step 1 with icon suggestion]
2. [Step 2 with icon suggestion]
3. [Step 3 with icon suggestion]
4. [Step 4 with icon suggestion]

---
` : ''}

${includeComprehension ? `
## ❓ Comprehension Questions

**Before Reading:**
- "What do you think this story is about?"
- "Have you ever [related experience]?"

**After Reading:**
1. [Simple recall question about what happens]
2. [Question about how people might feel]
3. [Question about what the student can do]

**Practice:**
"Let's practice! Show me what you would do when [situation]."

---
` : ''}

## 🎯 Teaching Tips

### Introducing the Story
- Read at a calm, quiet time (not during the actual situation)
- Read in a matter-of-fact, calm tone
- Let the student hold the story or follow along
- Don't quiz - just read and discuss naturally

### Reading Schedule
- [ ] Read daily for 1-2 weeks before the situation
- [ ] Read right before the situation occurs
- [ ] Review after (celebrate success!)
- [ ] Fade to weekly, then as-needed

### Signs It's Working
- Student references the story language
- Decreased anxiety about the situation
- Improved behavior during the situation
- Student asks for the story

### If It's Not Working
- Check if the story is accurate to your setting
- Simplify language if needed
- Add more visuals
- Read more frequently

---

## ✏️ Personalization

**To customize this story, add:**
- Student's name: _______________
- Teacher/staff names: _______________
- Specific location names: _______________
- Student's preferred coping strategies: _______________
- Student's interests/motivators: _______________

---

## 📋 Sentence Type Analysis

| Sentence | Type |
|----------|------|
| [Each sentence from the story] | [Descriptive/Perspective/Directive/Affirmative] |

**Sentence Types:**
- **Descriptive:** Describes what happens (facts)
- **Perspective:** Describes feelings/thoughts of others
- **Directive:** Suggests what to do (uses "can" or "will try")
- **Affirmative:** Provides reassurance

**Ratio Check:** ✓ At least 2 descriptive/perspective for every 1 directive

---

**REMEMBER:** Social stories should be:
- Patient and supportive in tone
- More descriptive than directive
- Accurate and honest
- Using "can" and "will try" (not "must")
- Focused on what TO do (not what NOT to do)`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const story = message.content[0].text;

    return Response.json({ story });
  } catch (error) {
    console.error("Error generating social story:", error);
    return Response.json(
      { error: "Failed to generate social story" },
      { status: 500 }
    );
  }
}