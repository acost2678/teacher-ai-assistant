import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      caselCompetency,
      subCompetency,
      worksheetType,
      numberOfWorksheets,
      theme,
      includeAnswerKey,
      includeParentVersion,
    } = await request.json();

    if (!gradeLevel || !caselCompetency) {
      return Response.json(
        { error: "Grade level and CASEL competency are required" },
        { status: 400 }
      );
    }

    const competencyDetails = {
      "self-awareness": {
        name: "Self-Awareness",
        description: "The ability to understand one's own emotions, thoughts, and values and how they influence behavior across contexts",
        subCompetencies: {
          "identifying-emotions": "Identifying Emotions - Recognizing and labeling one's feelings",
          "accurate-self-perception": "Accurate Self-Perception - Understanding personal strengths and limitations",
          "recognizing-strengths": "Recognizing Strengths - Identifying personal talents and abilities",
          "self-confidence": "Self-Confidence - Believing in oneself and abilities",
          "self-efficacy": "Self-Efficacy - Believing one can achieve goals through effort",
          "growth-mindset": "Growth Mindset - Understanding abilities can be developed",
        }
      },
      "self-management": {
        name: "Self-Management",
        description: "The ability to manage one's emotions, thoughts, and behaviors effectively in different situations",
        subCompetencies: {
          "impulse-control": "Impulse Control - Stopping and thinking before acting",
          "stress-management": "Stress Management - Coping with stress in healthy ways",
          "self-discipline": "Self-Discipline - Staying focused and following through",
          "self-motivation": "Self-Motivation - Finding internal drive to achieve",
          "goal-setting": "Goal-Setting - Setting and working toward personal goals",
          "organizational-skills": "Organizational Skills - Managing time and materials",
        }
      },
      "social-awareness": {
        name: "Social Awareness",
        description: "The ability to understand the perspectives of and empathize with others",
        subCompetencies: {
          "perspective-taking": "Perspective-Taking - Seeing situations from others' viewpoints",
          "empathy": "Empathy - Understanding and sharing others' feelings",
          "appreciating-diversity": "Appreciating Diversity - Valuing differences in others",
          "respect-for-others": "Respect for Others - Treating everyone with dignity",
          "gratitude": "Gratitude - Recognizing and appreciating what we have",
          "identifying-resources": "Identifying Resources - Knowing where to get help",
        }
      },
      "relationship-skills": {
        name: "Relationship Skills",
        description: "The ability to establish and maintain healthy and supportive relationships",
        subCompetencies: {
          "communication": "Communication - Expressing thoughts and listening effectively",
          "social-engagement": "Social Engagement - Participating positively with others",
          "relationship-building": "Relationship Building - Making and keeping friends",
          "teamwork": "Teamwork - Working cooperatively with others",
          "conflict-resolution": "Conflict Resolution - Solving disagreements peacefully",
          "seeking-help": "Seeking/Offering Help - Asking for and giving support",
        }
      },
      "responsible-decision-making": {
        name: "Responsible Decision-Making",
        description: "The ability to make caring and constructive choices about personal behavior and social interactions",
        subCompetencies: {
          "identifying-problems": "Identifying Problems - Recognizing when there's a problem",
          "analyzing-situations": "Analyzing Situations - Thinking through options",
          "solving-problems": "Solving Problems - Finding solutions that work",
          "evaluating-consequences": "Evaluating Consequences - Thinking about outcomes",
          "reflecting": "Reflecting - Learning from experiences",
          "ethical-responsibility": "Ethical Responsibility - Making choices that help others",
        }
      }
    };

    const worksheetTypes = {
      "reflection": "Reflection Worksheet - Writing prompts and journaling",
      "scenarios": "Scenario-Based - Read situations and respond",
      "drawing": "Drawing/Creative - Express through art",
      "matching": "Matching Activity - Connect concepts",
      "sorting": "Sorting Activity - Categorize examples",
      "comic-strip": "Comic Strip - Create a story showing the skill",
      "self-assessment": "Self-Assessment - Rate and reflect on skills",
      "goal-setting": "Goal-Setting - Plan for improvement",
      "role-play-cards": "Role-Play Cards - Scenarios to act out",
      "mixed": "Mixed Activities - Variety of formats",
    };

    const competencyInfo = competencyDetails[caselCompetency];
    const subCompetencyInfo = subCompetency && subCompetency !== "all" 
      ? competencyInfo.subCompetencies[subCompetency] 
      : "All sub-competencies";

    const prompt = `You are an expert in Social-Emotional Learning curriculum design, specializing in the CASEL framework. Create engaging, developmentally appropriate worksheets that help students develop SEL skills.

**WORKSHEET DETAILS:**
- Grade Level: ${gradeLevel}
- CASEL Competency: ${competencyInfo.name}
- Competency Description: ${competencyInfo.description}
- Sub-Competency Focus: ${subCompetencyInfo}
- Worksheet Type: ${worksheetTypes[worksheetType] || worksheetTypes["mixed"]}
- Number of Worksheets: ${numberOfWorksheets || 1}
${theme ? `- Theme/Topic: ${theme}` : ""}
${includeAnswerKey ? "- Include answer key/teacher guide" : ""}
${includeParentVersion ? "- Include parent/home version" : ""}

**CREATE ${numberOfWorksheets || 1} SEL WORKSHEET(S):**

---

# 📝 SEL Worksheet: ${competencyInfo.name}

**CASEL Competency:** ${competencyInfo.name}
**Sub-Competency:** ${subCompetency && subCompetency !== "all" ? subCompetencyInfo.split(" - ")[0] : "Multiple"}
**Grade Level:** ${gradeLevel}
**Worksheet Type:** ${worksheetType || "Mixed"}

---

## 🎯 Learning Objectives

By completing this worksheet, students will:
- [Specific, measurable SEL objective 1]
- [Specific, measurable SEL objective 2]
- [Specific, measurable SEL objective 3]

---

${Array.from({length: parseInt(numberOfWorksheets) || 1}, (_, i) => `
## Worksheet ${(numberOfWorksheets || 1) > 1 ? (i + 1) + ': ' : ''}[Creative Worksheet Title]

### 📋 Student Worksheet

**Name:** _________________________ **Date:** _____________

---

**${competencyInfo.name}: ${subCompetency && subCompetency !== "all" ? subCompetencyInfo.split(" - ")[0] : "Skills Practice"}**

[Create age-appropriate content based on worksheet type. Include:]

${worksheetType === "reflection" || worksheetType === "mixed" ? `
#### ✏️ Reflection Questions

1. [Thought-provoking question about the sub-competency]
   _________________________________________________________________
   _________________________________________________________________

2. [Question connecting to personal experience]
   _________________________________________________________________
   _________________________________________________________________

3. [Question about applying the skill]
   _________________________________________________________________
   _________________________________________________________________
` : ""}

${worksheetType === "scenarios" || worksheetType === "mixed" ? `
#### 📖 Scenario Practice

**Read each situation and answer the questions:**

**Scenario A:**
[Age-appropriate scenario related to ${subCompetencyInfo || competencyInfo.name}]

- What is happening in this situation?
  _________________________________________________________________

- How might the person feel?
  _________________________________________________________________

- What could they do? (List 2 options)
  1. _______________________________________________________________
  2. _______________________________________________________________

- Which option would you choose? Why?
  _________________________________________________________________
` : ""}

${worksheetType === "drawing" || worksheetType === "mixed" ? `
#### 🎨 Express Yourself

**Draw or write about a time when you used ${subCompetency ? subCompetencyInfo.split(" - ")[0] : competencyInfo.name}:**

[Large box for drawing/writing]
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│                                                                │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘

**What happened?** ________________________________________________
**How did it make you feel?** _____________________________________
` : ""}

${worksheetType === "matching" || worksheetType === "sorting" ? `
#### 🔗 Matching/Sorting Activity

**Match each situation to the best response:**

| Situation | | Response |
|-----------|--|----------|
| 1. [Situation] | ___ | A. [Response option] |
| 2. [Situation] | ___ | B. [Response option] |
| 3. [Situation] | ___ | C. [Response option] |
| 4. [Situation] | ___ | D. [Response option] |
` : ""}

${worksheetType === "self-assessment" ? `
#### 📊 Self-Assessment

**Rate yourself on these ${competencyInfo.name} skills:**

| Skill | Not Yet (1) | Sometimes (2) | Usually (3) | Always (4) |
|-------|-------------|---------------|-------------|------------|
| [Skill 1 related to sub-competency] | ○ | ○ | ○ | ○ |
| [Skill 2 related to sub-competency] | ○ | ○ | ○ | ○ |
| [Skill 3 related to sub-competency] | ○ | ○ | ○ | ○ |
| [Skill 4 related to sub-competency] | ○ | ○ | ○ | ○ |

**My strongest skill is:** ________________________________________
**I want to improve:** ____________________________________________
**One thing I can do this week:** _________________________________
` : ""}

${worksheetType === "goal-setting" ? `
#### 🎯 Goal-Setting

**My ${competencyInfo.name} Goal**

**The skill I want to work on:** __________________________________

**Why this is important to me:** 
_________________________________________________________________

**My SMART Goal:**
- **S**pecific - What exactly will I do? ___________________________
- **M**easurable - How will I know I did it? _______________________
- **A**chievable - Is this possible for me? ________________________
- **R**elevant - Why does this matter? _____________________________
- **T**ime-bound - When will I do this by? _________________________

**Steps to reach my goal:**
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

**Who can help me?** ______________________________________________
` : ""}

${worksheetType === "comic-strip" ? `
#### 📚 Comic Strip

**Create a comic showing someone using ${subCompetency ? subCompetencyInfo.split(" - ")[0] : competencyInfo.name}:**

| Panel 1: The Problem | Panel 2: The Feeling |
|---------------------|---------------------|
| [Draw here] | [Draw here] |
| | |
| | |

| Panel 3: Using the Skill | Panel 4: The Outcome |
|-------------------------|---------------------|
| [Draw here] | [Draw here] |
| | |
| | |

**What skill did the character use?** ____________________________
` : ""}

---

### 💭 Final Reflection

**One thing I learned today:** ____________________________________

**I will use this skill when:** ___________________________________

---
`).join('\n')}

${includeAnswerKey ? `
## 📋 Teacher Guide / Answer Key

### Facilitation Tips
- [How to introduce the worksheet]
- [Key discussion points]
- [What to look for in responses]

### Sample Responses
- [Example of proficient response for key questions]
- [What growth looks like]

### Extension Ideas
- [Follow-up activity]
- [Class discussion prompt]
` : ""}

${includeParentVersion ? `
## 🏠 Parent/Home Version

**Dear Family,**

Your child is learning about **${competencyInfo.name}**, specifically **${subCompetency ? subCompetencyInfo.split(" - ")[0] : "key skills"}**.

**What is ${competencyInfo.name}?**
${competencyInfo.description}

**Home Activity:**
[Simple activity families can do together to practice this skill]

**Conversation Starters:**
- [Question to ask your child]
- [Question to ask your child]

**Ways to Support at Home:**
- [Tip 1]
- [Tip 2]
- [Tip 3]

Thank you for supporting your child's social-emotional growth!
` : ""}

---

**GUIDELINES:**
- All content must be developmentally appropriate for ${gradeLevel}
- Use inclusive, affirming language
- Avoid scenarios that could trigger trauma
- Include visual supports for younger students
- Make activities engaging and meaningful
- Connect skills to real-life situations
- Provide adequate space for student responses`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const worksheet = message.content[0].text;

    return Response.json({ worksheet });
  } catch (error) {
    console.error("Error generating SEL worksheet:", error);
    return Response.json(
      { error: "Failed to generate SEL worksheet" },
      { status: 500 }
    );
  }
}