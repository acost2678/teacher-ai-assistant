import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      activityGoal,
      groupSize,
      timeAvailable,
      spaceType,
      materialsAvailable,
      classContext,
      includeVariations,
      includeDebrief,
    } = await request.json();

    const activityGoals = {
      "ice-breaker": "Ice Breaker - Getting to know each other, first day/week activities",
      "trust-building": "Trust Building - Developing trust and vulnerability",
      "communication": "Communication - Improving listening and speaking skills",
      "collaboration": "Collaboration - Working together toward a goal",
      "problem-solving": "Problem Solving - Group challenges and critical thinking",
      "inclusion": "Inclusion - Ensuring everyone feels valued and included",
      "energizer": "Energizer - Quick activities to boost energy and engagement",
      "conflict-resolution": "Conflict Resolution - Practicing handling disagreements",
      "creativity": "Creativity - Encouraging creative thinking together",
      "class-community": "Class Community - Building overall classroom culture",
    };

    const spaceTypes = {
      "classroom": "Regular Classroom - Desks/tables, limited movement space",
      "open-space": "Open Space - Gym, multipurpose room, or outdoor area",
      "virtual": "Virtual/Remote - Online meeting platform",
      "flexible": "Flexible - Can rearrange furniture",
    };

    const prompt = `You are an expert in team building and classroom community development who creates engaging, age-appropriate activities that build connection, trust, and collaboration among students.

**TEAM BUILDING ACTIVITY REQUEST:**

**Parameters:**
- Grade Level: ${gradeLevel || "3rd-5th Grade"}
- Activity Goal: ${activityGoals[activityGoal] || activityGoals["class-community"]}
- Group Size: ${groupSize || "Whole class (20-30)"}
- Time Available: ${timeAvailable || "15-20 minutes"}
- Space: ${spaceTypes[spaceType] || spaceTypes["classroom"]}
${materialsAvailable ? `- Materials Available: ${materialsAvailable}` : ""}
${classContext ? `- Class Context: ${classContext}` : ""}

---

# 🤝 Team Building Activity

**Goal:** ${activityGoals[activityGoal] || "Class Community"}
**Grade Level:** ${gradeLevel || "3rd-5th Grade"}
**Time Needed:** ${timeAvailable || "15-20 minutes"}
**Group Size:** ${groupSize || "Whole class"}
**Space:** ${spaceTypes[spaceType] || "Classroom"}

---

## 🎯 Activity Overview

**Activity Name:** [Creative, engaging name]

**One-Sentence Description:**
[What students will do in one sentence]

**SEL Competencies Addressed:**
- [ ] Self-Awareness
- [ ] Self-Management
- [ ] Social Awareness
- [ ] Relationship Skills
- [ ] Responsible Decision-Making

**Why This Works:**
[Brief explanation of why this activity builds community/meets the goal]

---

## 📦 Materials Needed

- [Material 1]
- [Material 2]
- [Material 3]
- [Optional: additional materials]

**No Materials Version:**
[How to do this activity with zero materials if applicable]

---

## 👥 Setup

**Room Arrangement:**
[How to arrange the space]

**Group Formation:**
[How to divide into groups if needed - include random/fair grouping method]

**Before You Begin:**
- [Preparation step 1]
- [Preparation step 2]

---

## 📋 Instructions

### Introduction (2-3 minutes)

**Say:**
"[Script for introducing the activity - build excitement without giving away too much]"

**Demonstrate:**
[What to model or show]

### Activity Steps

**Step 1: [Action]** ([X] minutes)
[Detailed instructions for what happens]

**What you'll see:** [What student behavior to expect]

**Step 2: [Action]** ([X] minutes)
[Detailed instructions]

**What you'll see:** [Expected behavior]

**Step 3: [Action]** ([X] minutes)
[Detailed instructions]

**What you'll see:** [Expected behavior]

[Continue with additional steps as needed]

### Closing ([X] minutes)

**Signal to end:**
[How to bring the activity to a close]

**Gather:**
[How to bring students back together]

---

## 🗣️ Facilitation Tips

**During the Activity:**
- [Tip for facilitating]
- [What to watch for]
- [How to encourage participation]

**If Students Are Hesitant:**
- [Strategy to encourage participation]
- [How to lower the stakes]

**If It Gets Too Loud/Chaotic:**
- [Classroom management strategy]
- [Signal or phrase to use]

**If Someone Is Left Out:**
- [How to ensure inclusion]
- [Intervention strategy]

---

${includeDebrief ? `
## 💭 Debrief Questions

**Processing the Experience:**
1. "What did you notice during this activity?"
2. "How did it feel to [specific aspect of activity]?"
3. "What was challenging? What was easy?"

**Connecting to Class Community:**
4. "What did you learn about your classmates?"
5. "How can we use what we practiced today in our regular class time?"

**Personal Reflection:**
6. "What's one thing you want to remember from this?"

**Debrief Format Options:**
- **Pair-Share:** Discuss with a partner first, then share out
- **Whip Around:** Quick one-word or one-phrase responses
- **Written:** Journal response before discussion
- **Four Corners:** Move to corner based on response

---
` : ""}

${includeVariations ? `
## 🔄 Variations

### Easier Version (Younger/Less Experienced)
- [Modification to simplify]
- [Reduced complexity]
- [More structure]

### Harder Version (Older/More Experienced)
- [Way to increase challenge]
- [Added complexity]
- [Less structure]

### Shorter Version (5-10 minutes)
- [How to condense the activity]
- [What to skip]

### Longer Version (25-30 minutes)
- [How to extend the activity]
- [Additional rounds or elements]

### Remote/Virtual Version
- [How to adapt for video call]
- [Technology needed]
- [Modified instructions]

### Small Group Version (4-6 students)
- [Adaptations for small groups]

### Large Group Version (30+ students)
- [Adaptations for large groups]

---
` : ""}

## ⚠️ Watch Out For

| Potential Issue | Prevention/Solution |
|-----------------|---------------------|
| [Issue 1] | [How to prevent or address] |
| [Issue 2] | [How to prevent or address] |
| [Issue 3] | [How to prevent or address] |

---

## 📊 Success Indicators

**The activity is working when you see:**
- [Observable indicator 1]
- [Observable indicator 2]
- [Observable indicator 3]

**Students are growing when:**
- [Long-term indicator]
- [Behavior change to watch for]

---

## 🔁 Follow-Up Ideas

**Tomorrow:**
- Reference the activity in class
- "Remember when we [activity]? Let's use that same [skill] now."

**This Week:**
- [Related activity to build on this one]

**This Month:**
- [How to revisit or extend]

**Connection to Academics:**
- [How to connect this to content learning]

---

## 📝 Teacher Reflection

After the activity, consider:
- What worked well?
- What would I change?
- Who participated fully? Who held back?
- What does this tell me about my class?
- When should we do this again?

---

**TEAM BUILDING PRINCIPLES:**
- Every student should feel included
- Failure should be safe and even fun
- Focus on process, not just outcome
- Debrief is where the learning happens
- Build gradually from low-risk to higher-risk activities
- Participation should feel inviting, not forced`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const activity = message.content[0].text;

    return Response.json({ activity });
  } catch (error) {
    console.error("Error generating team building activity:", error);
    return Response.json(
      { error: "Failed to generate activity" },
      { status: 500 }
    );
  }
}