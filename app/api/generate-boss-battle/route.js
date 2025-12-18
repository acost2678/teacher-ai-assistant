import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      bossTheme,
      battleType,
      teamSize,
      questionCount,
      difficulty,
      includeHealthBar,
      includePowerUps,
      timeLimit,
    } = await request.json();

    if (!topic || !gradeLevel) {
      return Response.json(
        { error: "Topic and grade level are required" },
        { status: 400 }
      );
    }

    const bossThemes = {
      "dragon": "Dragon - A fearsome dragon that breathes fire",
      "wizard": "Dark Wizard - A powerful sorcerer with dark magic",
      "robot": "Robot Overlord - A giant mechanical menace",
      "monster": "Monster - A terrifying creature from the deep",
      "alien": "Alien Invader - A being from another galaxy",
      "villain": "Super Villain - An evil mastermind",
      "custom": "Custom boss based on topic",
    };

    const battleTypes = {
      "whole-class": "Whole Class vs Boss - Everyone works together",
      "teams": "Team Battle - Teams compete to defeat the boss first",
      "individual": "Individual Heroes - Each student fights their own battle",
      "relay": "Relay Battle - Students take turns attacking",
    };

    const prompt = `You are an expert educational game designer. Create an exciting "Boss Battle" review activity that turns assessment into an engaging game.

**BOSS BATTLE DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Topic to Review: ${topic}
- Boss Theme: ${bossThemes[bossTheme] || bossThemes["dragon"]}
- Battle Type: ${battleTypes[battleType] || battleTypes["whole-class"]}
- Team Size: ${teamSize || "Whole class"}
- Number of Questions: ${questionCount || 10}
- Difficulty: ${difficulty || "Medium"}
${timeLimit ? `- Time Limit: ${timeLimit}` : ""}
${includeHealthBar ? "- Include boss health tracking system" : ""}
${includePowerUps ? "- Include power-ups and special abilities" : ""}

**CREATE AN EPIC BOSS BATTLE:**

---

# ⚔️ BOSS BATTLE: [Epic Boss Name]

## 🎮 Battle Overview

**Boss:** [Creative name that connects to ${topic}]
**Boss Type:** ${bossTheme || "Dragon"}
**Difficulty:** ${difficulty || "Medium"}
**Battle Format:** ${battleType || "Whole Class"}
**Estimated Time:** ${timeLimit || "20-30 minutes"}

---

## 📖 The Story

*(Read dramatically to class)*

[Create a 3-4 sentence dramatic narrative that sets up why students must defeat this boss. Connect the boss to the ${topic} subject matter in a creative way. Make it exciting and age-appropriate for ${gradeLevel}.]

---

${includeHealthBar ? `
## ❤️ Boss Health System

**Boss HP:** [Amount based on ${questionCount} questions]
**Damage per Correct Answer:** [Amount]
**Critical Hit (fast answer):** [Bonus damage]

### Health Tracker
Draw on board or use visual tracker:
\`\`\`
[████████████████████] 100%
[████████████░░░░░░░░] 50%
[████░░░░░░░░░░░░░░░░] 20%
[░░░░░░░░░░░░░░░░░░░░] DEFEATED!
\`\`\`
` : ""}

${includePowerUps ? `
## ⚡ Power-Ups & Special Abilities

Students can earn/use these during battle:

| Power-Up | How to Earn | Effect |
|----------|-------------|--------|
| 🛡️ Shield | Answer streak of 3 | Block one wrong answer |
| ⚔️ Critical Strike | Answer in under 10 sec | Double damage |
| 💊 Heal | Help a teammate | Restore class health |
| 🎯 Hint | Teamwork bonus | Get a hint on hard question |
| 💣 Super Attack | 5 correct in a row | Triple damage |
` : ""}

---

## 📝 Battle Questions

**Instructions:** Each correct answer deals damage to the boss!

${Array.from({length: parseInt(questionCount) || 10}, (_, i) => `
### Question ${i + 1} ${i < 3 ? "(Easy - 10 damage)" : i < 7 ? "(Medium - 15 damage)" : "(Hard - 25 damage)"}

**[Question about ${topic}]**

A) [Option]
B) [Option]
C) [Option]
D) [Option]

**Answer:** [Correct letter]
**If students struggle:** [Quick hint or teaching tip]
`).join('\n')}

---

## 🎭 Boss Attacks (Optional Drama)

When students get answers wrong, the boss "attacks":

| Wrong Answers | Boss Attack | Effect |
|---------------|-------------|--------|
| 1-2 wrong | "[Boss name] growls menacingly!" | Warning only |
| 3-4 wrong | "[Boss name] strikes!" | Lose a power-up |
| 5+ wrong | "[Boss name] unleashes special attack!" | Must answer bonus question |

---

## 🏆 Victory Celebration

**When Boss is Defeated:**
- Dramatic announcement: "[Boss name] has been vanquished!"
- Class earns: [Reward - XP points, class reward, etc.]
- Badge earned: "[Victory badge name]"

**Victory Phrases to Use:**
- "The heroes have triumphed!"
- "Your knowledge was too powerful!"
- "[Boss name] crumbles before your wisdom!"

---

## 📋 Teacher Setup Guide

**Before Battle:**
- [ ] Display boss image (draw or project)
- [ ] Set up health tracker on board
- [ ] Prepare reward/badge
- [ ] Have questions ready

**Running the Battle:**
1. Read the story dramatically
2. Explain the rules and damage system
3. Ask questions one at a time
4. Update health bar after each answer
5. Add drama with boss attacks for wrong answers
6. Celebrate victory!

**Tips:**
- Ham it up! The more dramatic, the more engaged students will be
- Use sound effects if possible
- Let students celebrate each "hit"
- If boss health gets low, add tension to your voice

---

**GUIDELINES:**
- Questions should genuinely assess ${topic} knowledge
- Balance difficulty across easy, medium, hard
- All questions should be grade-appropriate for ${gradeLevel}
- Make the boss attacks silly/fun, not scary
- Ensure the battle is winnable but challenging`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const bossBattle = message.content[0].text;

    return Response.json({ bossBattle });
  } catch (error) {
    console.error("Error generating boss battle:", error);
    return Response.json(
      { error: "Failed to generate boss battle" },
      { status: 500 }
    );
  }
}