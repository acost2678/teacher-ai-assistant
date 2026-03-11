import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      selCompetency,      // matches what page.jsx sends
      activityType,
      duration,
      materials,
      theme,
      includeDiscussion,
      includeExtension,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    if (!selCompetency) {
      return Response.json(
        { error: "CASEL competency is required" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert in Social-Emotional Learning curriculum design, trained in the CASEL framework and trauma-informed practices. Create an engaging, evidence-based SEL activity for classroom use.

**ACTIVITY DETAILS:**
- Grade Level: ${gradeLevel}
- CASEL Competency: ${selCompetency}
- Activity Type: ${activityType}
- Duration: ${duration}
- Materials: ${materials}
${theme ? `- Theme: ${theme}` : ''}
- Include Discussion Questions: ${includeDiscussion ? 'YES' : 'NO'}
- Include Extension Activities: ${includeExtension ? 'YES' : 'NO'}

**IMPORTANT — COMPETENCY FOCUS:**
This activity MUST specifically target the ${selCompetency} competency. Every step, discussion question, and reflection prompt should directly build ${selCompetency} skills. Do not generate a generic SEL activity — make it explicitly and specifically about ${selCompetency}.

**CASEL ${selCompetency.toUpperCase()} SKILLS TO TARGET:**
${selCompetency === 'Self-Awareness'           ? '- Identifying and labeling emotions\n- Recognizing personal strengths\n- Linking feelings to behaviors\n- Developing self-confidence and self-efficacy' : ''}
${selCompetency === 'Self-Management'          ? '- Regulating emotions and impulses\n- Stress management strategies\n- Goal-setting and follow-through\n- Organizational and planning skills' : ''}
${selCompetency === 'Social Awareness'         ? '- Perspective-taking and empathy\n- Appreciating diversity\n- Understanding social norms\n- Recognizing community and family strengths' : ''}
${selCompetency === 'Relationship Skills'      ? '- Clear communication\n- Active listening\n- Teamwork and cooperation\n- Conflict resolution\n- Resisting negative social pressure' : ''}
${selCompetency === 'Responsible Decision-Making' ? '- Identifying problems\n- Analyzing consequences\n- Evaluating options\n- Ethical responsibility\n- Reflecting on decisions' : ''}

**GENERATE A COMPLETE SEL ACTIVITY with this structure:**

# 💚 SEL Activity: [Creative, Engaging Title]

**Grade Level:** ${gradeLevel}
**CASEL Focus:** ${selCompetency}
**Activity Type:** ${activityType}
**Duration:** ${duration}

---

## 📋 Overview
[2-3 sentence description of the activity and why it builds ${selCompetency}]

## 🎯 Learning Objectives
By the end of this activity, students will be able to:
- [Measurable ${selCompetency} objective 1]
- [Measurable ${selCompetency} objective 2]
- [Measurable ${selCompetency} objective 3]

## 📦 Materials Needed
[List only what's needed given: ${materials}]

## 🚀 Activity Steps

**Setup:**
[Setup instructions]

**Introduction:**
[How to introduce — connect explicitly to ${selCompetency}]

**Main Activity:**
[Step-by-step instructions for ${activityType} format]

**Debrief/Reflection:**
[Closing reflection connecting back to ${selCompetency}]

## 🎭 Facilitation Tips
- If students are reluctant: [Strategy]
- If energy is too high: [Strategy]
- For shy or withdrawn students: [Accommodation]
- Trauma-informed consideration: [Note]

## ♿ Differentiation
**For students who need support:** [Modifications]
**For students who need challenge:** [Extensions]
**For ELL students:** [Language scaffolds]

${includeDiscussion ? `## 💬 Discussion Questions
[4-5 age-appropriate questions specifically about ${selCompetency}]` : ''}

${includeExtension ? `## 🔗 Extension Activities
[2-3 follow-up ideas — home connection, literature tie-in, or cross-curricular link]` : ''}

## 📚 CASEL Connection
[2-3 sentences explaining exactly how this activity builds ${selCompetency} skills, grounded in CASEL research]

---
GUIDELINES:
- Developmentally appropriate for ${gradeLevel}
- Trauma-informed and inclusive language throughout
- Never single out or embarrass students
- Always offer modified participation options`

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: `You are an expert SEL curriculum designer. The MOST IMPORTANT requirement is that every activity you generate is specifically and explicitly tailored to the CASEL competency requested. Never generate a generic activity — always make it distinctly about the named competency.`,
      messages: [{ role: "user", content: prompt }],
    });

    return Response.json({ activity: message.content[0].text });

  } catch (error) {
    console.error("Error generating SEL activity:", error);
    return Response.json(
      { error: "Failed to generate SEL activity" },
      { status: 500 }
    );
  }
}