import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { 
      studentName, 
      gradeLevel, 
      disabilityCategory,
      goalArea,
      currentGoal,
      baselineData,
      currentProgress,
      supportProvided,
      nextSteps,
    } = await request.json();

    const prompt = `You are an experienced special education teacher and IEP specialist with deep knowledge of IDEA (Individuals with Disabilities Education Act) requirements. You write legally compliant, educationally sound IEP progress monitoring documentation.

Generate a professional IEP Progress Update Report based on the following information:

**Student Information:**
- Name: ${studentName}
- Grade Level: ${gradeLevel}
- Disability Category: ${disabilityCategory}
- Goal Area: ${goalArea}

**Current IEP Goal:**
${currentGoal}

**Baseline Data (Start of IEP Period):**
${baselineData || 'Not provided'}

**Current Progress:**
${currentProgress}

**Supports & Services Being Provided:**
${supportProvided || 'Not specified'}

**Recommended Next Steps:**
${nextSteps || 'Not specified'}

---

Please generate a comprehensive IEP Progress Update that includes:

## PROGRESS MONITORING REPORT

### Student Information
[Format the student details professionally]

### Current Goal
[Restate the goal clearly]

### Progress Summary
- **Baseline Performance:** [Summarize where the student started]
- **Current Performance:** [Describe current data and observations]
- **Progress Toward Goal:** [Indicate if student is: Mastered / On Track / Progressing / Limited Progress / No Progress]
- **Percentage of Goal Achieved:** [Estimate based on data provided]

### Data Analysis
[Provide a brief, objective analysis of the student's progress, noting patterns, strengths, and areas still needing support]

### Supports & Accommodations in Place
[List the current supports being provided]

### Recommendations
[Based on progress, recommend whether to:
- Continue current goal and supports
- Modify supports/instruction
- Adjust goal criteria
- Consider goal mastery and new goal development]

### Next Steps
[Specific action items for the team]

---

Write in professional, objective language that is also parent-friendly. Use data-driven statements and avoid subjective opinions. Ensure compliance with IDEA progress reporting requirements.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const updateContent = message.content[0].text;

    return Response.json({ update: updateContent });
  } catch (error) {
    console.error("Error generating IEP update:", error);
    return Response.json(
      { error: "Failed to generate IEP update" },
      { status: 500 }
    );
  }
}