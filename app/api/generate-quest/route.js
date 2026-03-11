import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      bossTheme,
      difficulty,
      numRounds,
      teamBased,
      includeHealthBar,
      includePowerUps,
    } = await request.json();

    if (!topic || !gradeLevel) {
      return Response.json(
        { error: "Topic and grade level are required" },
        { status: 400 }
      );
    }

    const rounds = parseInt(numRounds) || 5;

    const difficultySettings = {
      easy: { time: "30-40 minutes", pace: "relaxed pace with hints available", dmg: "10" },
      medium: { time: "20-30 minutes", pace: "moderate pace", dmg: "15" },
      hard: { time: "15-20 minutes", pace: "fast pace, no hints", dmg: "20" },
      epic: { time: "45-60 minutes", pace: "intense pace, bonus challenges", dmg: "25" },
    };

    const settings = difficultySettings[difficulty] || difficultySettings.medium;
    const totalHP = rounds * parseInt(settings.dmg) + 20;

    const prompt = `You are an expert educational game designer. Create a complete, ready-to-run "Boss Battle" classroom review game. Every question must be real, curriculum-aligned content — not placeholders. The game should be immediately usable with no editing required.

**BOSS BATTLE DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Topic to Review: ${topic}
- Boss Theme: ${bossTheme || "Dragon"}
- Battle Format: ${teamBased ? "Team Battle (teams compete)" : "Whole Class vs Boss"}
- Number of Rounds: ${rounds}
- Difficulty: ${difficulty || "medium"} — ${settings.pace}
- Estimated Time: ${settings.time}
- Health Bar System: ${includeHealthBar ? "Yes" : "No"}
- Power-Ups: ${includePowerUps ? "Yes" : "No"}

Generate a complete Boss Battle. All questions must be REAL questions about ${topic} at the ${gradeLevel} level — specific content, correct answers, and teaching tips. No placeholder brackets anywhere.

---

# ⚔️ BOSS BATTLE: [Creative Boss Name that connects to ${topic}]

## 🎮 Battle Setup

**Boss:** [Full boss name and title — connected to ${topic} in a clever way]
**Theme:** ${bossTheme}
**Format:** ${teamBased ? "Team Battle" : "Whole Class vs Boss"}
**Rounds:** ${rounds}
**Estimated Time:** ${settings.time}
**Boss HP:** ${totalHP}

---

## 📖 The Story
*(Read dramatically before battle begins)*

[Write 4-5 sentences of dramatic narrative. The boss should be thematically connected to ${topic} in a clever, funny, or exciting way. Set the stakes — why must students defeat this boss? What happens if they fail? End with a battle cry that launches the game. Age-appropriate for ${gradeLevel}.]

---

${includeHealthBar ? `## ❤️ Boss Health Tracker

**Starting HP:** ${totalHP}
**Damage per correct answer:** ${settings.dmg} HP
${includePowerUps ? "**Critical Hit (answered in <10 sec):** Double damage!" : ""}

Draw this on the board or use a projected slide:

\`\`\`
BOSS HP: ${totalHP}/${totalHP}
[████████████████████] FULL POWER
[██████████░░░░░░░░░░] WEAKENING...  
[████░░░░░░░░░░░░░░░░] ALMOST DOWN!
[░░░░░░░░░░░░░░░░░░░░] DEFEATED! 🎉
\`\`\`

---` : ""}

${includePowerUps ? `## ⚡ Power-Ups

| Power-Up | How to Earn | Effect |
|----------|-------------|--------|
| 🛡️ Shield | 3 correct answers in a row | Block one wrong answer — no boss attack |
| ⚔️ Critical Strike | Answer within 10 seconds | Deal double damage this round |
| 💊 Team Heal | Help a teammate explain their answer | Restore 10 HP to class total |
| 🎯 Hint Token | Earn through bonus challenge | Reveal one wrong answer option |
| 💣 Super Attack | 5 correct in a row | Triple damage — one time use |

---` : ""}

## 📝 Battle Rounds

${Array.from({ length: rounds }, (_, i) => {
  const isEasy = i < Math.floor(rounds * 0.4);
  const isHard = i >= Math.floor(rounds * 0.7);
  const dmgAmount = isEasy ? settings.dmg : isHard ? Math.floor(parseInt(settings.dmg) * 1.5) : Math.floor(parseInt(settings.dmg) * 1.2);
  const label = isEasy ? "⭐ Apprentice" : isHard ? "⭐⭐⭐ Champion" : "⭐⭐ Adventurer";

  return `### Round ${i + 1} — ${label} (${dmgAmount} damage)

**[Write a real question about ${topic} appropriate for ${gradeLevel}]**

A) [Real option]
B) [Real option]
C) [Real option]
D) [Real option]

✅ **Answer:** [Correct letter] — [Brief explanation of why this is correct]
💡 **If students struggle:** [Specific teaching tip or hint for this exact question]
🎭 **Boss reaction if correct:** "[Short dramatic line from the boss — hurt, angry, impressed]"

---`;
}).join("\n")}

## 🎭 Boss Attack Table

When students get wrong answers, the boss strikes back:

| Wrong Answers | Boss Attack | Classroom Effect |
|---------------|-------------|-----------------|
| 1 wrong | "[Boss name] scoffs!" | Warning — no penalty |
| 2-3 wrong | "[Boss name] counterattacks!" | Lose one power-up |
| 4+ wrong in a row | "[Boss name] unleashes special move!" | Must answer a bonus challenge to continue |

**Boss One-Liners** *(use throughout for drama)*:
- "[Trash talk line 1 connected to ${topic}]"
- "[Trash talk line 2]"
- "[Trash talk line 3 — when health is low]"

---

## 🏆 Victory

**When Boss HP Reaches 0:**

*(Announce dramatically)*
"[Boss name] has been defeated! Your knowledge of ${topic} was too powerful! The kingdom/galaxy/school is saved!"

**Victory Rewards:**
- Class earns: [Specific reward — homework pass, free choice time, etc.]
- Badge: "[Victory badge name]"
- Celebration: [Specific class celebration — cheer, dance, etc.]

---

## 📋 Teacher Setup Checklist

**Before Class:**
- [ ] Draw or project boss image
- [ ] Set up HP tracker on board
- [ ] ${teamBased ? "Divide class into teams (3-4 students each)" : "Brief class on whole-class format"}
- [ ] Have reward ready
- [ ] Print questions or keep on screen

**During Battle:**
1. Read story dramatically — commit to the bit!
2. Explain HP system and damage amounts
3. ${teamBased ? "Teams huddle for 30 seconds before answering" : "Cold call or use random selector"}
4. Update HP after every round — make it visual
5. Use boss attack lines for wrong answers
6. Build tension as HP gets low

**Teacher Tips:**
- The more dramatic you are, the more engaged students will be
- Let students cheer when they deal damage
- Use a timer for harder difficulty
- If class is dominating, add a "plot twist" bonus challenge`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4500,
      messages: [{ role: "user", content: prompt }],
    });

    const bossBattle = message.content[0].text;
    return Response.json({ bossBattle });
  } catch (error) {
    console.error("Error generating boss battle:", error);
    return Response.json({ error: "Failed to generate boss battle" }, { status: 500 });
  }
}