import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      questTheme,
      duration,
      numChallenges,
      learningObjectives,
      includeRewards,
      includeBossChallenge,
    } = await request.json();

    if (!topic || !gradeLevel) {
      return Response.json(
        { error: "Topic and grade level are required" },
        { status: 400 }
      );
    }

    const count = parseInt(numChallenges) || 5;

    const prompt = `You are an expert educational game designer who creates immersive, curriculum-aligned learning quests for K-12 classrooms. Every activity must genuinely teach the content — gamification is the wrapper, not a replacement for learning.

**QUEST DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Topic/Unit: ${topic}
- Quest Theme: ${questTheme || "Fantasy Adventure"}
- Duration: ${duration || "1 week"}
- Number of Challenges: ${count}
- Learning Objectives: ${learningObjectives || "Master key concepts and skills related to " + topic}
- Include Rewards System: ${includeRewards ? "Yes" : "No"}
- Include Final Boss Challenge: ${includeBossChallenge ? "Yes" : "No"}

Generate a complete, fully-developed learning quest. All challenge names, tasks, and narratives must be real and specific — no placeholder brackets. Everything must be age-appropriate for ${gradeLevel} and genuinely aligned to ${topic}.

---

# 🗡️ THE QUEST: [Epic, Theme-Appropriate Quest Name for ${topic}]

## Quest Overview
**Theme:** ${questTheme}
**Subject:** ${subject || "General"} — ${topic}
**Grade:** ${gradeLevel}
**Duration:** ${duration || "1 week"}
**Total Challenges:** ${count}

---

## 📜 The Story
*(Read dramatically to launch the quest)*

[Write a 4-5 sentence immersive narrative in the ${questTheme} style that sets up why students must complete this quest. The story should cleverly connect to the real learning content of ${topic}. Make it exciting and age-appropriate for ${gradeLevel}. End with a call to action that launches the first challenge.]

---

## 🎯 Learning Objectives

**Curriculum Goals (for teacher):**
[List 3-4 specific, standards-aligned learning objectives for ${topic} at ${gradeLevel} level]

**Quest Goals (for students — themed language):**
[Rewrite the same objectives in ${questTheme}-themed language that students will see]

---

## ⚔️ Challenges

${Array.from({ length: count }, (_, i) => `### Challenge ${i + 1}: [Specific, Theme-Appropriate Challenge Name]

**Quest Narrative:** [1-2 sentences continuing the story that introduce this challenge in the ${questTheme} theme]

**The Task:** [Specific, real academic task that teaches/practices a skill related to ${topic}. Be concrete — describe exactly what students do.]

**Success Criteria:** [How students and teacher know the challenge is complete]

**Difficulty:** ${ i < count * 0.4 ? "⭐ Apprentice" : i < count * 0.75 ? "⭐⭐ Adventurer" : "⭐⭐⭐ Champion"}
${includeRewards ? `**Reward:** [XP amount] XP + [Themed item or privilege]` : ""}

---`).join("\n")}

${includeBossChallenge ? `## 👹 FINAL BOSS CHALLENGE: [Epic Boss Name connected to ${topic}]

**Boss Narrative:** [3-4 sentence dramatic buildup — the ultimate villain/obstacle connected to ${topic} stands in the way. Everything learned so far is needed to defeat it.]

**The Final Challenge:** [Culminating performance task that requires students to synthesize all skills and knowledge from the quest. Should take 15-30 minutes and demonstrate mastery of ${topic}.]

**Victory Condition:** [Specific criteria for defeating the boss / completing the task]

${includeRewards ? `**Victory Rewards:**
- XP: [Large amount] XP
- Title: "[Themed champion title]"
- Badge: "[Quest completion badge name]"
- Class Reward: [Whole-class celebration or privilege]` : ""}

---` : ""}

${includeRewards ? `## 🏆 Rewards System

### XP Progression
| Rank | XP Required | Title |
|------|-------------|-------|
| Recruit | 0 | [Theme-appropriate beginner title] |
| Apprentice | [amount] | [Theme-appropriate title] |
| Adventurer | [amount] | [Theme-appropriate title] |
| Champion | [amount] | [Theme-appropriate title] |
| Legend | [amount] | [Theme-appropriate master title] |

### Bonus XP Opportunities
- [Bonus challenge 1]: +[XP]
- [Bonus challenge 2]: +[XP]
- [Helping a classmate]: +[XP]

---` : ""}

## 📋 Teacher Setup Guide

**Before Launching:**
- [ ] Print quest map or display on screen
- [ ] Prepare challenge materials for each task
- [ ] Set up XP/progress tracking (board, spreadsheet, or app)
- [ ] Prepare launch speech using the story above

**During the Quest:**
- [Facilitation tip 1 specific to this quest]
- [Facilitation tip 2]
- [How to support struggling students without breaking immersion]
- [How to challenge advanced students]

**Closing the Quest:**
[How to wrap up the narrative and celebrate completion — specific to this quest's story]

---

## 📊 Assessment Connection
[How each challenge maps to formative/summative assessment. What evidence of learning to collect. How this quest prepares students for or replaces a traditional assessment.]`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4500,
      messages: [{ role: "user", content: prompt }],
    });

    const quest = message.content[0].text;
    return Response.json({ quest });
  } catch (error) {
    console.error("Error generating quest:", error);
    return Response.json({ error: "Failed to generate quest" }, { status: 500 });
  }
}