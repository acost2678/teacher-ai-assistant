import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      questType,
      duration,
      difficulty,
      rewards,
      numberOfQuests,
      includeCheckpoints,
      theme,
      learningObjectives,
    } = await request.json();

    if (!topic || !gradeLevel) {
      return Response.json(
        { error: "Topic and grade level are required" },
        { status: 400 }
      );
    }

    const questTypes = {
      "main-quest": "Main Quest - Primary learning objective, longer duration",
      "side-quest": "Side Quest - Optional enrichment activity",
      "daily-quest": "Daily Quest - Quick daily challenge",
      "group-quest": "Group Quest - Collaborative team mission",
      "boss-prep": "Boss Prep Quest - Preparation for a major assessment",
    };

    const themes = {
      "fantasy": "Fantasy (knights, dragons, magic kingdoms)",
      "space": "Space Exploration (astronauts, planets, aliens)",
      "mystery": "Mystery Detective (clues, solving cases)",
      "superhero": "Superhero Academy (powers, saving the day)",
      "adventure": "Adventure Explorer (treasure, maps, discovery)",
      "minecraft": "Building/Crafting (like Minecraft)",
      "pokemon": "Creature Collection (catch and train)",
      "custom": "Custom theme",
    };

    const prompt = `You are an expert educational game designer who creates engaging learning quests for K-12 classrooms. Create exciting, curriculum-aligned quests that motivate students.

**QUEST DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Topic/Skill: ${topic}
- Quest Type: ${questTypes[questType] || questTypes["main-quest"]}
- Duration: ${duration || "1 class period"}
- Difficulty: ${difficulty || "Medium"}
- Theme: ${themes[theme] || themes["adventure"]}
- Number of Quests: ${numberOfQuests || 1}
${learningObjectives ? `- Learning Objectives: ${learningObjectives}` : ""}
${rewards ? `- Reward Ideas: ${rewards}` : ""}

**CREATE ${numberOfQuests || 1} ENGAGING QUEST(S):**

For each quest, include:

---

# 🗡️ QUEST: [Epic Quest Name]

## Quest Overview
**Type:** ${questType || "Main Quest"}
**Difficulty:** ⭐⭐⭐ (${difficulty || "Medium"})
**Duration:** ${duration || "1 class period"}
**Theme:** ${theme || "Adventure"}

### 📜 The Story/Setup
*(Read this to students or display on screen)*
[Create an engaging narrative hook that connects to the ${theme || "adventure"} theme. Make it exciting and age-appropriate for ${gradeLevel}. The story should naturally lead into the learning activity.]

### 🎯 Quest Objectives
**Learning Goals (for teacher):**
- [Actual curriculum objective 1]
- [Actual curriculum objective 2]

**Quest Goals (for students):**
- [Kid-friendly, themed objective 1]
- [Kid-friendly, themed objective 2]

${includeCheckpoints ? `
### 🏁 Checkpoints
**Checkpoint 1: [Name]**
- Task: [What students do]
- Success Criteria: [How to know they passed]
- XP Reward: [points]

**Checkpoint 2: [Name]**
- Task: [What students do]
- Success Criteria: [How to know they passed]
- XP Reward: [points]

**Checkpoint 3: [Name]**
- Task: [What students do]
- Success Criteria: [How to know they passed]
- XP Reward: [points]
` : `
### 📋 Quest Tasks
1. [Task 1 - themed description]
2. [Task 2 - themed description]
3. [Task 3 - themed description]
`}

### 🏆 Rewards
**Upon Completion:**
- XP: [amount] points
- Badge: [badge name and description]
- Special: [any bonus rewards]

**Bonus Rewards (optional challenges):**
- [Bonus challenge]: +[XP] bonus

### 🎮 How to Run This Quest

**Setup (5 min):**
- [What teacher needs to prepare]
- [Materials needed]

**Launch (5 min):**
- [How to introduce the quest dramatically]
- [Script or key phrases to use]

**During Quest:**
- [Teacher role/facilitation tips]
- [How to help struggling students without breaking immersion]

**Closing (5 min):**
- [How to wrap up the narrative]
- [Celebration/reward distribution]

### 📊 Assessment Connection
- [How this quest connects to actual learning assessment]
- [Evidence of learning to look for]

---

**GUIDELINES:**
- Make the narrative engaging and age-appropriate for ${gradeLevel}
- Ensure all activities actually teach the curriculum content
- Balance fun with genuine learning
- Include clear success criteria
- Make rewards meaningful but manageable
- Keep timing realistic for classroom use
- Theme should be consistent throughout`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const quest = message.content[0].text;

    return Response.json({ quest });
  } catch (error) {
    console.error("Error generating quest:", error);
    return Response.json(
      { error: "Failed to generate quest" },
      { status: 500 }
    );
  }
}