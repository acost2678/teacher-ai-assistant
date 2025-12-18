import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      badgeCategory,
      numberOfBadges,
      badgeStyle,
      includeRequirements,
      includeLevels,
      customAchievements,
    } = await request.json();

    if (!badgeCategory || !gradeLevel) {
      return Response.json(
        { error: "Badge category and grade level are required" },
        { status: 400 }
      );
    }

    const badgeCategories = {
      "academic": "Academic Achievement - Subject mastery and learning goals",
      "behavior": "Behavior & Character - Positive behaviors and SEL skills",
      "participation": "Participation - Engagement and contribution",
      "growth": "Growth & Improvement - Progress and effort",
      "collaboration": "Collaboration - Teamwork and helping others",
      "creativity": "Creativity - Creative thinking and innovation",
      "leadership": "Leadership - Leading and mentoring",
      "custom": "Custom badges for specific classroom needs",
    };

    const badgeStyles = {
      "fantasy": "Fantasy themed (knights, wizards, dragons)",
      "space": "Space themed (astronauts, stars, planets)",
      "nature": "Nature themed (animals, plants, elements)",
      "sports": "Sports themed (medals, trophies, champions)",
      "tech": "Tech themed (robots, coding, circuits)",
      "classic": "Classic school themed (stars, ribbons, seals)",
    };

    const prompt = `You are an expert educational game designer specializing in student motivation and achievement systems. Create engaging achievement badges for a classroom reward system.

**BADGE SYSTEM DETAILS:**
- Grade Level: ${gradeLevel}
- Subject Focus: ${subject || "General"}
- Badge Category: ${badgeCategories[badgeCategory] || badgeCategories["academic"]}
- Visual Style: ${badgeStyles[badgeStyle] || badgeStyles["classic"]}
- Number of Badges: ${numberOfBadges || 5}
${includeLevels ? "- Include tiered levels (Bronze → Silver → Gold → Platinum)" : ""}
${customAchievements ? `- Include these specific achievements: ${customAchievements}` : ""}

**CREATE ${numberOfBadges || 5} ACHIEVEMENT BADGES:**

---

# 🏆 BADGE COLLECTION: ${badgeCategory.charAt(0).toUpperCase() + badgeCategory.slice(1)}

**Grade Level:** ${gradeLevel}
**Theme:** ${badgeStyle || "Classic"}
**Category:** ${badgeCategory}

---

${Array.from({length: parseInt(numberOfBadges) || 5}, (_, i) => `
## Badge ${i + 1}: [Creative Badge Name]

### 🎨 Badge Design
**Icon/Symbol:** [Describe the visual - emoji + description]
**Colors:** [Primary and accent colors]
**Shape:** [Circle, shield, star, hexagon, etc.]
**Visual Elements:** [Border style, decorations, effects]

**Badge Display (for printing/digital):**
\`\`\`
   ⭐ [BADGE NAME] ⭐
   
   [Main Icon/Emoji]
   
   [Short motto or tagline]
\`\`\`

### 📋 Badge Details
**Name:** [Full badge name]
**Tagline:** "[Catchy phrase - 3-5 words]"
**Description:** [1-2 sentences explaining what this badge represents]

${includeRequirements ? `
### ✅ Requirements to Earn
**How to Earn This Badge:**
1. [Specific, measurable requirement]
2. [Specific, measurable requirement]
3. [Specific, measurable requirement]

**Evidence Needed:**
- [What proves the student earned it]
` : ""}

${includeLevels ? `
### 🥉🥈🥇💎 Badge Levels

| Level | Name | Requirements | Bonus |
|-------|------|--------------|-------|
| 🥉 Bronze | [Name] | [Basic requirement] | [Small reward] |
| 🥈 Silver | [Name] | [Intermediate requirement] | [Medium reward] |
| 🥇 Gold | [Name] | [Advanced requirement] | [Good reward] |
| 💎 Platinum | [Name] | [Master requirement] | [Best reward] |
` : ""}

### 🎉 Award Ceremony Script
*(Say this when awarding the badge)*
"[2-3 sentence celebration script that makes the student feel special]"

---
`).join('\n')}

## 📊 Badge Tracking Sheet

| Student Name | ${Array.from({length: parseInt(numberOfBadges) || 5}, (_, i) => `Badge ${i + 1}`).join(' | ')} |
|--------------|${Array.from({length: parseInt(numberOfBadges) || 5}, () => '------').join('|')}|
| | ${Array.from({length: parseInt(numberOfBadges) || 5}, () => '☐').join(' | ')} |
| | ${Array.from({length: parseInt(numberOfBadges) || 5}, () => '☐').join(' | ')} |

---

## 🖨️ Printing Tips

**For Physical Badges:**
- Print on cardstock for durability
- Laminate for reuse
- Use 2-inch circles for standard badge size
- Add pin backs or lanyards

**For Digital Display:**
- Create a "Badge Wall" in classroom
- Use ClassDojo, Seesaw, or Google Slides
- Let students display on portfolios

---

**GUIDELINES:**
- Badge names should be exciting and memorable
- Requirements should be achievable but meaningful
- Visuals should be clear and reproducible
- Language should be age-appropriate for ${gradeLevel}
- Each badge should feel special and worth earning`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const badges = message.content[0].text;

    return Response.json({ badges });
  } catch (error) {
    console.error("Error generating badges:", error);
    return Response.json(
      { error: "Failed to generate badges" },
      { status: 500 }
    );
  }
}