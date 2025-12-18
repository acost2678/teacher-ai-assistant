import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      storyTopic,
      customTopic,
      studentContext,
      storyLength,
      includeVisualCues,
      includeComprehensionQuestions,
      perspectiveType,
    } = await request.json();

    if (!storyTopic && !customTopic) {
      return Response.json(
        { error: "Story topic is required" },
        { status: 400 }
      );
    }

    const storyTopics = {
      "transitions": "Transitions - Moving between activities or locations",
      "taking-turns": "Taking Turns - Waiting for my turn and sharing",
      "asking-help": "Asking for Help - How to ask when I need something",
      "managing-anger": "Managing Big Feelings - When I feel angry or frustrated",
      "making-friends": "Making Friends - How to join play and make friends",
      "losing-game": "Losing a Game - What to do when I don't win",
      "unexpected-changes": "Unexpected Changes - When things don't go as planned",
      "personal-space": "Personal Space - Respecting others' space",
      "loud-noises": "Loud Noises - What to do when sounds bother me",
      "waiting": "Waiting - Being patient when I have to wait",
      "following-directions": "Following Directions - Listening and doing what's asked",
      "cafeteria": "Cafeteria - What to expect at lunch",
      "fire-drill": "Fire Drill - What happens during a fire drill",
      "substitute-teacher": "Substitute Teacher - When we have a different teacher",
      "group-work": "Group Work - Working with classmates",
      "recess": "Recess - Playing safely and having fun",
      "bathroom": "Using the Bathroom at School",
      "assembly": "Going to an Assembly",
      "field-trip": "Going on a Field Trip",
      "custom": "Custom Topic",
    };

    const topicName = customTopic || storyTopics[storyTopic] || storyTopic;

    const perspectiveDescriptions = {
      "first": "First person ('I will...', 'I can...')",
      "third": "Third person ('The student will...', '[Name] can...')",
      "we": "Inclusive ('We will...', 'We can...')",
    };

    const lengthDescriptions = {
      "short": "Short (5-7 sentences) - For younger students or quick reference",
      "medium": "Medium (8-12 sentences) - Standard social story length",
      "long": "Long (13-18 sentences) - More detail for complex situations",
    };

    const prompt = `You are an expert in creating social stories following Carol Gray's Social Story guidelines. Social stories are short, personalized narratives that describe a situation, skill, or concept using specific criteria to support individuals (especially those with autism, anxiety, or social learning differences) in understanding social situations.

**SOCIAL STORY REQUEST:**

**Topic:** ${topicName}
**Grade Level:** ${gradeLevel || "Elementary"}
**Perspective:** ${perspectiveDescriptions[perspectiveType] || perspectiveDescriptions["first"]}
**Length:** ${lengthDescriptions[storyLength] || lengthDescriptions["medium"]}
${studentContext ? `**Student Context:** ${studentContext}` : ""}

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

# 📖 Social Story: ${topicName.split(' - ')[0]}

**For:** ${gradeLevel || "Elementary"} Student
**Topic:** ${topicName}

---

## The Story

[Write a social story following Carol Gray's guidelines. Use ${perspectiveDescriptions[perspectiveType] || "first person"} perspective. Include ${storyLength === "short" ? "5-7" : storyLength === "long" ? "13-18" : "8-12"} sentences.]

${includeVisualCues ? `
---

## 🖼️ Visual Supports

### Suggested Images for Each Section

| Story Section | Visual Suggestion |
|---------------|-------------------|
| [Opening] | [Description of helpful image] |
| [Middle section] | [Description of helpful image] |
| [Strategy/coping part] | [Description of helpful image] |
| [Closing] | [Description of helpful image] |

### Icons/Symbols to Include
- [Relevant symbol 1 and what it represents]
- [Relevant symbol 2 and what it represents]
- [Relevant symbol 3 and what it represents]

### Visual Schedule Component
If making into a visual schedule:
1. [Step 1 with icon suggestion]
2. [Step 2 with icon suggestion]
3. [Step 3 with icon suggestion]
4. [Step 4 with icon suggestion]

` : ""}

---

## 📝 Key Vocabulary

| Word | Simple Definition |
|------|-------------------|
| [Key word 1] | [Child-friendly definition] |
| [Key word 2] | [Child-friendly definition] |
| [Key word 3] | [Child-friendly definition] |

---

${includeComprehensionQuestions ? `
## ❓ Comprehension Check

**Before Reading - Preview:**
- "What do you think this story is about?"
- "Have you ever [related experience]?"

**During Reading - Check Understanding:**
- "What happens when [situation]?"
- "How might [person] feel?"

**After Reading - Review:**
1. [Simple recall question about the story]
2. [Question about feelings/perspectives]
3. [Question about what to do]
4. "When can you use this?"

**Practice Scenario:**
"Let's practice! Pretend [scenario]. What would you do?"

---
` : ""}

## 🎯 Teaching Tips

### Introducing the Story
1. Read at a calm, quiet time (not during the situation)
2. Read in a matter-of-fact tone
3. Let the student hold the story or follow along
4. Don't quiz - just read and discuss naturally

### Reading Schedule
- [ ] Read daily for 1-2 weeks before the situation
- [ ] Read right before the situation occurs
- [ ] Review after the situation (celebrate success!)
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
- Consider if the situation itself needs modification

---

## ✏️ Customization Notes

**Personalize this story by:**
- Adding student's name: _______________
- Adding specific teacher/staff names
- Adding your school's specific locations
- Adding student's specific coping strategies
- Adding student's interests/motivators

**Adapt for your setting:**
- Change location details to match your classroom
- Adjust timing to match your schedule
- Modify strategies to match what works for this student

---

## 📋 Story Sentence Types (For Reference)

| Sentence from Story | Type |
|--------------------|------|
| [First sentence] | Descriptive |
| [Second sentence] | [Type] |
| [Third sentence] | [Type] |
| [Continue for each sentence...] | |

**Sentence Type Key:**
- **Descriptive:** Describes the situation factually
- **Perspective:** Describes feelings/thoughts of others
- **Directive:** Suggests a response (uses "can" or "will try")
- **Affirmative:** Reassures or emphasizes a point
- **Control:** Written by/with the student (optional)
- **Cooperative:** Describes who will help

---

**SOCIAL STORY PRINCIPLES:**
- Patient, supportive tone throughout
- More descriptive than directive (2:1 ratio minimum)
- Accurate and honest
- Uses "can" and "will try" (not "must" or "will always")
- Focuses on what TO do, not what NOT to do
- Respects student's perspective and feelings`;

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