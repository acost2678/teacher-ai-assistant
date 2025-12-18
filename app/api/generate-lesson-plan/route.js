import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      duration,
      standardsFramework,
      includeStandardCodes,
      customStandards,
      learningObjectives,
      priorKnowledge,
      materials,
      includeSEL,
      selCompetencies,
      differentiationNeeds,
      assessmentType,
      previousPlan,
      feedbackToFix,
      uploadedContent,
    } = await request.json();

    if (!topic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Topic, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const standardsMap = {
      "common-core": "Common Core State Standards (CCSS)",
      "ngss": "Next Generation Science Standards (NGSS)",
      "texas-teks": "Texas Essential Knowledge and Skills (TEKS)",
      "virginia-sol": "Virginia Standards of Learning (SOLs)",
      "california": "California State Standards",
      "florida-best": "Florida B.E.S.T. Standards",
      "new-york": "New York State Learning Standards",
    };

    const selCompetencyDescriptions = {
      "self-awareness": "Self-Awareness: Recognizing emotions, personal goals, and values",
      "self-management": "Self-Management: Regulating emotions, thoughts, and behaviors",
      "social-awareness": "Social Awareness: Understanding diverse perspectives and empathy",
      "relationship-skills": "Relationship Skills: Communication, cooperation, and conflict resolution",
      "responsible-decision-making": "Responsible Decision-Making: Making ethical, constructive choices",
    };

    let selPrompt = "";
    if (includeSEL && selCompetencies && selCompetencies.length > 0) {
      const selDescriptions = selCompetencies
        .map((comp) => selCompetencyDescriptions[comp])
        .join("\n- ");
      selPrompt = `

**CASEL SEL INTEGRATION (Required):**
Integrate the following CASEL Social-Emotional Learning competencies throughout this lesson:
- ${selDescriptions}

For each SEL competency, include:
1. A specific activity or discussion prompt that develops this skill
2. Teacher facilitation tips for supporting SEL development
3. Reflection questions for students

Create a dedicated "SEL Integration" section in the lesson plan that shows how SEL is woven throughout the lesson, not just added as an afterthought.`;
    }

    let differentiationPrompt = "";
    if (differentiationNeeds) {
      differentiationPrompt = `

**DIFFERENTIATION NEEDS:**
Address these specific differentiation requirements: ${differentiationNeeds}
Include modifications for struggling learners, on-level learners, and advanced learners.`;
    }

    let standardsPrompt = "";
    if (customStandards && customStandards.trim()) {
      standardsPrompt = `
**IMPORTANT - USE THESE EXACT STANDARDS:**
The teacher has provided the specific standards to align this lesson to. You MUST use these exact standards:

${customStandards}

Reference these standards directly in the lesson plan. Do not substitute or modify them.`;
    } else {
      standardsPrompt = `- Standards Framework: ${standardsMap[standardsFramework] || "Common Core State Standards"}
${includeStandardCodes ? "- Include specific standard codes in the plan" : "- Align to standards but do not include specific codes"}`;
    }

    let regenerationPrompt = "";
    if (previousPlan && feedbackToFix) {
      regenerationPrompt = `

**IMPORTANT - REGENERATION REQUEST:**
The teacher has reviewed the previous lesson plan and identified issues that need to be fixed.

**PREVIOUS LESSON PLAN:**
${previousPlan.substring(0, 2000)}${previousPlan.length > 2000 ? '...[truncated]' : ''}

**TEACHER FEEDBACK - MUST FIX THESE ISSUES:**
${feedbackToFix}

Please regenerate the lesson plan addressing ALL of the teacher's feedback. Make sure to fix the specific issues mentioned while maintaining the overall structure and quality of the lesson.`;
    }

    let uploadedContentPrompt = "";
    if (uploadedContent && uploadedContent.trim()) {
      uploadedContentPrompt = `

**REFERENCE MATERIALS PROVIDED BY TEACHER:**
The teacher has uploaded/provided the following reference materials. Use this content to ensure accuracy and alignment with their curriculum:

---
${uploadedContent.substring(0, 4000)}${uploadedContent.length > 4000 ? '\n...[content truncated for length]' : ''}
---

Incorporate relevant information from these materials into the lesson plan. Reference specific content, vocabulary, or concepts from the provided materials where appropriate.`;
    }

    const prompt = `You are an expert K-12 curriculum specialist. Create a detailed, standards-aligned lesson plan.
${regenerationPrompt}
${uploadedContentPrompt}

**LESSON DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Topic/Unit: ${topic}
- Duration: ${duration || "45-60 minutes"}
${standardsPrompt}
${learningObjectives ? `- Teacher's Learning Objectives: ${learningObjectives}` : ""}
${priorKnowledge ? `- Prior Knowledge Required: ${priorKnowledge}` : ""}
${materials ? `- Available Materials: ${materials}` : ""}
${assessmentType ? `- Assessment Type: ${assessmentType}` : ""}
${selPrompt}
${differentiationPrompt}

**CREATE A COMPREHENSIVE LESSON PLAN WITH THESE SECTIONS:**

1. **LESSON OVERVIEW**
   - Title
   - Grade Level & Subject
   - Duration
   - Standards Addressed ${includeStandardCodes ? "(with codes)" : ""}

2. **LEARNING OBJECTIVES**
   - 2-3 clear, measurable objectives using Bloom's Taxonomy verbs
   - Student-friendly "I Can" statements

3. **MATERIALS & RESOURCES**
   - List all required materials
   - Technology needs
   - Handouts/worksheets needed

4. **VOCABULARY**
   - Key terms with student-friendly definitions

5. **LESSON PROCEDURE**
   
   **Opening/Hook (5-10 minutes)**
   - Engaging activity to capture attention
   - Connection to prior knowledge
   - Essential question introduction
   
   **Direct Instruction (10-15 minutes)**
   - Clear teaching points
   - Modeling/demonstration
   - Check for understanding strategies
   
   **Guided Practice (10-15 minutes)**
   - Structured practice with support
   - Teacher facilitation notes
   - Common misconceptions to address
   
   **Independent Practice (10-15 minutes)**
   - Student application activities
   - Differentiated options
   
   **Closing (5-10 minutes)**
   - Summary/review
   - Exit ticket or formative assessment
   - Preview of next lesson

${includeSEL ? `6. **SEL INTEGRATION**
   - How each selected competency is addressed
   - Specific activities and discussion prompts
   - Reflection opportunities` : ""}

7. **DIFFERENTIATION STRATEGIES**
   - Supports for struggling learners
   - Extensions for advanced learners
   - ELL accommodations

8. **ASSESSMENT**
   - Formative assessment strategies throughout
   - Summative assessment options
   - Success criteria

9. **REFLECTION NOTES**
   - Space for teacher reflection after lesson

Format the lesson plan professionally with clear headers and organized sections. Make it practical and immediately usable by a classroom teacher.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const lessonPlan = message.content[0].text;

    return Response.json({ lessonPlan });
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return Response.json(
      { error: "Failed to generate lesson plan" },
      { status: 500 }
    );
  }
}