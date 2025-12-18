import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      caselCompetency,
      activityType,
      duration,
      groupSize,
      materials,
      theme,
      numberOfActivities,
      includeAssessment,
      classContext,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const caselCompetencies = {
      "self-awareness": "Self-Awareness: Recognizing emotions, personal strengths, self-confidence, self-efficacy",
      "self-management": "Self-Management: Impulse control, stress management, self-discipline, goal-setting, organizational skills",
      "social-awareness": "Social Awareness: Perspective-taking, empathy, appreciating diversity, respect for others",
      "relationship-skills": "Relationship Skills: Communication, social engagement, building relationships, teamwork, conflict resolution",
      "responsible-decision-making": "Responsible Decision-Making: Identifying problems, analyzing situations, solving problems, evaluating, reflecting, ethical responsibility",
    };

    const activityTypes = {
      "game": "Interactive Game - Engaging play-based learning",
      "discussion": "Guided Discussion - Structured conversation and sharing",
      "creative": "Creative Expression - Art, writing, drama, music",
      "mindfulness": "Mindfulness Practice - Breathing, meditation, body awareness",
      "role-play": "Role-Play/Scenarios - Acting out situations",
      "collaborative": "Collaborative Project - Working together on a task",
      "movement": "Movement Activity - Kinesthetic learning",
      "journaling": "Journaling/Writing - Reflective writing activities",
    };

    const prompt = `You are an expert in Social-Emotional Learning curriculum design, trained in the CASEL framework and trauma-informed practices. Create engaging, evidence-based SEL activities for classroom use.

**ACTIVITY DETAILS:**
- Grade Level: ${gradeLevel}
- CASEL Competency: ${caselCompetencies[caselCompetency] || caselCompetencies["self-awareness"]}
- Activity Type: ${activityTypes[activityType] || activityTypes["game"]}
- Duration: ${duration || "20-30 minutes"}
- Group Size: ${groupSize || "Whole class"}
${materials ? `- Available Materials: ${materials}` : ""}
${theme ? `- Theme: ${theme}` : ""}
${classContext ? `- Class Context: ${classContext}` : ""}
- Number of Activities: ${numberOfActivities || 1}

**CREATE ${numberOfActivities || 1} SEL ACTIVIT${(numberOfActivities || 1) > 1 ? 'IES' : 'Y'}:**

---

# 💚 SEL Activity: ${caselCompetency ? caselCompetency.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Social-Emotional Learning'}

**Grade Level:** ${gradeLevel}
**CASEL Focus:** ${caselCompetency || "Mixed"}
**Activity Type:** ${activityType || "Game"}
**Duration:** ${duration || "20-30 minutes"}

---

${Array.from({length: parseInt(numberOfActivities) || 1}, (_, i) => `
## Activity ${(numberOfActivities || 1) > 1 ? (i + 1) + ': ' : ''}[Creative Activity Name]

### 📋 Overview
**Activity Name:** [Engaging, kid-friendly name]
**Time Required:** [Specific time]
**Group Size:** ${groupSize || "Whole class"}
**CASEL Competency:** ${caselCompetency || "Mixed"}
**Activity Type:** ${activityType || "Game"}

### 🎯 Learning Objectives
By the end of this activity, students will be able to:
- [Measurable SEL objective 1]
- [Measurable SEL objective 2]
- [Measurable SEL objective 3]

### 📦 Materials Needed
- [Material 1]
- [Material 2]
- [Material 3]
${materials ? `\n**Teacher has available:** ${materials}` : ""}

### 🚀 Activity Steps

**Setup (${Math.round((parseInt(duration) || 25) * 0.15)} min):**
1. [Setup step 1]
2. [Setup step 2]

**Introduction (${Math.round((parseInt(duration) || 25) * 0.15)} min):**
1. [How to introduce the activity]
2. [Connection to SEL concept]
3. [Model expectations]

**Main Activity (${Math.round((parseInt(duration) || 25) * 0.5)} min):**
1. [Step-by-step instructions]
2. [What students do]
3. [Teacher's role during activity]
4. [Key facilitation moments]

**Debrief/Reflection (${Math.round((parseInt(duration) || 25) * 0.2)} min):**
1. [Reflection question 1]
2. [Reflection question 2]
3. [Connection to real life]

### 💬 Discussion Questions
- [Age-appropriate discussion question 1]
- [Age-appropriate discussion question 2]
- [Age-appropriate discussion question 3]

### 🎭 Facilitation Tips
- **If students are reluctant:** [Strategy]
- **If energy is too high:** [Strategy]
- **If conflict arises:** [Strategy]
- **For shy students:** [Accommodation]

### ♿ Differentiation
**For students who need support:**
- [Modification 1]
- [Modification 2]

**For students who need challenge:**
- [Extension 1]
- [Extension 2]

**For students with sensory needs:**
- [Accommodation]

${includeAssessment ? `
### 📊 Assessment
**Observe for:**
- [Observable behavior 1]
- [Observable behavior 2]

**Student Self-Assessment:**
"On a scale of 1-5, how well did I [skill]?"

**Exit Ticket Question:**
"[Quick reflection question]"
` : ""}

### 🔗 Extensions
- [Follow-up activity idea]
- [Home connection idea]
- [Literature connection]

---
`).join('\n')}

## 📚 CASEL Connection

**${caselCompetency || "This activity"} develops:**
- [Specific sub-skill 1]
- [Specific sub-skill 2]
- [Specific sub-skill 3]

**Research Base:**
[Brief mention of why this type of activity is effective for SEL development]

---

**GUIDELINES:**
- All activities must be developmentally appropriate for ${gradeLevel}
- Use trauma-informed, inclusive language
- Ensure activities are accessible to students with various abilities
- Avoid activities that could single out or embarrass students
- Include sensory considerations
- Provide clear behavior expectations
- Always offer opt-out or modified participation options`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const activity = message.content[0].text;

    return Response.json({ activity });
  } catch (error) {
    console.error("Error generating SEL activity:", error);
    return Response.json(
      { error: "Failed to generate SEL activity" },
      { status: 500 }
    );
  }
}