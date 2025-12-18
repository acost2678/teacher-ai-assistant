import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      strategyType,
      duration,
      setting,
      numberOfStrategies,
      specificNeeds,
      includeVisuals,
      includeScripts,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const strategyTypes = {
      "breathing": "Breathing Exercises - Calming breath techniques",
      "grounding": "Grounding Techniques - 5-4-3-2-1 and sensory awareness",
      "movement": "Movement Breaks - Physical release of energy/stress",
      "mindfulness": "Mindfulness - Present-moment awareness",
      "visualization": "Visualization - Guided imagery and safe place",
      "sensory": "Sensory Tools - Fidgets, textures, sounds",
      "cognitive": "Cognitive Strategies - Positive self-talk, reframing",
      "mixed": "Mixed - Variety of calming strategies",
    };

    const settings = {
      "classroom": "Whole Classroom - For all students together",
      "calming-corner": "Calming Corner - Individual quiet space",
      "one-on-one": "One-on-One - Individual student support",
      "transition": "Transitions - Between activities",
      "before-test": "Test Prep - Before assessments",
      "crisis": "De-escalation - For heightened emotions",
    };

    const prompt = `You are an expert in child psychology, self-regulation, and trauma-informed practices. Create calming strategies and self-regulation tools for classroom use.

**CALMING STRATEGY DETAILS:**
- Grade Level: ${gradeLevel}
- Strategy Type: ${strategyTypes[strategyType] || strategyTypes["mixed"]}
- Setting: ${settings[setting] || settings["classroom"]}
- Duration: ${duration || "2-5 minutes"}
- Number of Strategies: ${numberOfStrategies || 5}
${specificNeeds ? `- Specific Needs to Address: ${specificNeeds}` : ""}
${includeVisuals ? "- Include visual/poster descriptions" : ""}
${includeScripts ? "- Include word-for-word teacher scripts" : ""}

**CREATE ${numberOfStrategies || 5} CALMING STRATEGIES:**

---

# 🧘 Calming Strategies: ${strategyType ? strategyType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Self-Regulation'}

**Grade Level:** ${gradeLevel}
**Setting:** ${setting || "Classroom"}
**Duration:** ${duration || "2-5 minutes each"}

---

## 🌟 Overview

These strategies help students:
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

**When to Use:**
- [Situation 1]
- [Situation 2]
- [Situation 3]

---

${Array.from({length: parseInt(numberOfStrategies) || 5}, (_, i) => `
## Strategy ${i + 1}: [Creative Strategy Name]

### 📋 Quick Reference
**Name:** [Kid-friendly name]
**Type:** ${strategyType || "Mixed"}
**Time:** [Specific duration]
**Best For:** [When to use this one]

### 🎯 What It Does
[1-2 sentences explaining how this strategy helps regulate the nervous system in kid-friendly terms]

${includeScripts ? `
### 📜 Teacher Script
*(Read this calmly and slowly)*

"[Word-for-word script the teacher can read to guide students through the strategy. Use age-appropriate language for ${gradeLevel}. Include pauses marked with (...). Make it soothing and supportive.]"
` : `
### 📝 Instructions
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]
`}

### 👶 Kid-Friendly Explanation
"[How to explain this to students in simple terms]"

${includeVisuals ? `
### 🖼️ Visual/Poster Description
**Title:** [Poster title]
**Images:** [What pictures to include]
**Steps shown:** [Visual step-by-step]
**Colors:** [Calming colors to use]
` : ""}

### 💡 Tips for Success
- [Facilitation tip 1]
- [Facilitation tip 2]
- [What to do if student resists]

### ♿ Adaptations
- **For younger students:** [Modification]
- **For students with sensory needs:** [Modification]
- **For students who need movement:** [Modification]

---
`).join('\n')}

## 🏠 Setting Up a Calming Corner

**Essential Items:**
- [Item 1 with purpose]
- [Item 2 with purpose]
- [Item 3 with purpose]
- [Item 4 with purpose]

**Visual Supports to Post:**
- [Visual 1]
- [Visual 2]
- [Visual 3]

**Rules for the Calming Corner:**
1. [Rule 1 - stated positively]
2. [Rule 2 - stated positively]
3. [Rule 3 - stated positively]

---

## 📋 Teaching Self-Regulation

**Introduce Strategies When Calm:**
- Practice during non-stressful times
- Model using strategies yourself
- Celebrate when students use them

**Create a Menu:**
Let students choose which strategies work best for them

**Use Visual Cues:**
- Calm-down thermometer
- Zones of Regulation colors
- Feeling check-in chart

---

## ⚠️ Important Reminders

- Never force a strategy on an upset child
- Validate feelings before offering strategies
- Some students need space, not techniques
- Watch for signs of trauma responses
- Know when to involve counselor/support staff

---

**GUIDELINES:**
- All strategies must be developmentally appropriate for ${gradeLevel}
- Use trauma-informed, non-shaming language
- Avoid strategies that could feel punitive
- Ensure strategies are accessible to all abilities
- Focus on co-regulation before self-regulation for younger students
- Never use calming corner as punishment`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const strategies = message.content[0].text;

    return Response.json({ strategies });
  } catch (error) {
    console.error("Error generating calming strategies:", error);
    return Response.json(
      { error: "Failed to generate calming strategies" },
      { status: 500 }
    );
  }
}