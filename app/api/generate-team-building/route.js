import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      groupSize,
      activityType,
      duration,
      setting,
      focus,
      materials,
      quantity,
    } = await request.json();

    const activityTypes = {
      "Icebreaker": "Ice Breaker - Getting to know each other, first day/week activities",
      "Collaboration Challenge": "Collaboration Challenge - Working together toward a goal",
      "Trust Building": "Trust Building - Developing trust and vulnerability",
      "Problem Solving": "Problem Solving - Group challenges and critical thinking",
      "Communication Game": "Communication Game - Improving listening and speaking skills",
      "Creative Challenge": "Creative Challenge - Encouraging creative thinking together",
      "Movement/Physical": "Movement/Physical - Active games that build energy and connection",
      "Discussion/Sharing": "Discussion/Sharing - Structured conversations to build understanding",
    };

    const materialsDescriptions = {
      "none": "No materials needed",
      "minimal": "Minimal materials (paper/pencils only)",
      "basic": "Basic classroom supplies (markers, tape, etc.)",
      "special": "Special materials may be needed",
    };

    const prompt = `You are an expert in team building and classroom community development who creates engaging, age-appropriate activities that build connection, trust, and collaboration among students.

**TEAM BUILDING ACTIVITY REQUEST:**

**Parameters:**
- Grade Level: ${gradeLevel}
- Group Size: ${groupSize}
- Activity Type: ${activityTypes[activityType] || activityType}
- Duration: ${duration}
- Setting: ${setting}
- Materials: ${materialsDescriptions[materials] || materials}
${focus ? `- Specific Focus: ${focus}` : ''}
- Number of Activities: ${quantity}

---

# 🤝 Team Building Activities: ${activityType}

**Grade Level:** ${gradeLevel}
**Group Size:** ${groupSize}
**Duration:** ${duration} per activity
**Setting:** ${setting}
**Materials:** ${materialsDescriptions[materials] || materials}
${focus ? `**Focus:** ${focus}` : ''}

---

${Array.from({length: parseInt(quantity) || 3}, (_, i) => `
## Activity ${i + 1}: [Creative Activity Name]

### 📋 Quick Reference
| | |
|---|---|
| **Time** | ${duration} |
| **Group Size** | ${groupSize} |
| **Space Needed** | ${setting} |
| **Materials** | [List specific materials or "None"] |
| **Energy Level** | [Low/Medium/High] |

### 🎯 Purpose
[One sentence explaining what this activity builds - connection, trust, communication, etc.]

**SEL Skills:** [List 2-3 relevant skills: Communication, Cooperation, Trust, Listening, Problem-Solving, Empathy, etc.]

### 📦 Materials Needed
- [Material 1]
- [Material 2]
- [Or: No materials needed!]

### 👥 Setup
**Room Arrangement:** [How to set up the space]
**Group Formation:** [How to divide students - pairs, small groups, whole class]

### 📝 Instructions

**Introduction (1-2 min):**
"[Script for introducing the activity]"

**Steps:**
1. [Clear step with timing]
2. [Clear step with timing]
3. [Clear step with timing]
4. [Clear step with timing]

**Closing:**
[How to end the activity and bring students back together]

### 💡 Facilitation Tips
- [Tip for success]
- [What to watch for]
- [How to keep everyone included]

### 🗣️ Debrief Questions
1. "[Question about the experience]"
2. "[Question connecting to real life/classroom]"
3. "[Question for personal reflection]"

### 🔄 Variations
- **Easier:** [Simplification for younger or less experienced groups]
- **Harder:** [Way to increase the challenge]
- **Quick Version:** [How to do it in less time]

---
`).join('\n')}

## 🌟 Tips for Success

**Before Activities:**
- Create a safe, judgment-free environment
- Set clear expectations for participation and respect
- Remind students that mistakes are part of learning together

**During Activities:**
- Circulate and observe, stepping in only when needed
- Encourage quieter students without putting them on the spot
- Keep energy high but controlled

**After Activities:**
- Always debrief - this is where the learning happens!
- Connect the activity to your classroom community goals
- Note what worked for future reference

---

## ⚠️ Troubleshooting

| Challenge | Solution |
|-----------|----------|
| Students are too silly/unfocused | Lower the energy, add more structure |
| Someone is left out | Assign roles, check in privately |
| Activity falls flat | Move on without dwelling, try a higher-energy option |
| Students won't participate | Lower the risk, make it optional, model enthusiasm |

---

**TEAM BUILDING PRINCIPLES:**
- Every student should feel included and valued
- Failure should be safe and even celebrated
- Focus on process and connection, not just winning
- Build gradually from low-risk to higher-risk activities
- Participation should feel inviting, never forced`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const activities = message.content[0].text;

    return Response.json({ activities });
  } catch (error) {
    console.error("Error generating team building activities:", error);
    return Response.json(
      { error: "Failed to generate activities" },
      { status: 500 }
    );
  }
}