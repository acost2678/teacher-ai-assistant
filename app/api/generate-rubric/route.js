import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      assignmentType,
      assignmentDescription,
      rubricStyle,
      pointScale,
      criteria,
      includeExemplars,
      studentFriendly,
    } = await request.json();

    if (!assignmentDescription || !gradeLevel) {
      return Response.json(
        { error: "Assignment description and grade level are required" },
        { status: 400 }
      );
    }

    const rubricStyles = {
      "analytic": "Analytic rubric (separate scores for each criterion)",
      "holistic": "Holistic rubric (single overall score)",
      "single-point": "Single-point rubric (describes proficiency only, with space for feedback)",
    };

    const pointScales = {
      "4": "4-point scale (4=Exceeds, 3=Meets, 2=Approaching, 1=Beginning)",
      "5": "5-point scale (5=Exemplary, 4=Proficient, 3=Developing, 2=Beginning, 1=Not Yet)",
      "3": "3-point scale (3=Proficient, 2=Developing, 1=Beginning)",
      "100": "Percentage scale (100-90, 89-80, 79-70, below 70)",
    };

    let criteriaPrompt = "";
    if (criteria && criteria.trim()) {
      criteriaPrompt = `
**USE THESE SPECIFIC CRITERIA:**
${criteria}

Build the rubric around these criteria provided by the teacher.`;
    }

    const prompt = `You are an expert K-12 assessment specialist. Create a professional rubric for student work.

**RUBRIC DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Assignment Type: ${assignmentType || "Project"}
- Assignment Description: ${assignmentDescription}
- Rubric Style: ${rubricStyles[rubricStyle] || rubricStyles["analytic"]}
- Scoring Scale: ${pointScales[pointScale] || pointScales["4"]}
${studentFriendly ? "- Create a STUDENT-FRIENDLY version with simple language" : ""}
${criteriaPrompt}

**CREATE A COMPREHENSIVE RUBRIC:**

1. **RUBRIC HEADER**
   - Assignment Title
   - Grade Level
   - Subject
   - Total Points Possible

2. **RUBRIC TABLE**

${rubricStyle === "single-point" ? `
| Areas for Improvement | Criteria | Evidence of Excellence |
|----------------------|----------|----------------------|
| (Space for feedback) | [Criterion 1]: Description of proficient performance | (Space for feedback) |
| (Space for feedback) | [Criterion 2]: Description of proficient performance | (Space for feedback) |
...continue for each criterion
` : `
| Criteria | ${pointScale === "4" ? "Exceeds (4) | Meets (3) | Approaching (2) | Beginning (1)" : pointScale === "5" ? "Exemplary (5) | Proficient (4) | Developing (3) | Beginning (2) | Not Yet (1)" : pointScale === "3" ? "Proficient (3) | Developing (2) | Beginning (1)" : "A (90-100) | B (80-89) | C (70-79) | Below (0-69)"} |
|----------|${pointScale === "4" ? "------------|---------|--------------|-------------|" : pointScale === "5" ? "-------------|------------|-------------|------------|----------|" : pointScale === "3" ? "-------------|-------------|-------------|" : "------------|---------|---------|-----------|"}
| [Criterion] | [Description] | [Description] | [Description] | [Description] |
`}

3. **CRITERIA TO ASSESS** (use 4-6 criteria)
   Create specific, measurable criteria appropriate for this assignment.
   Each level should clearly describe what student work looks like at that level.

${includeExemplars ? `
4. **EXEMPLAR DESCRIPTIONS**
   For the highest level of each criterion, provide a brief example of what excellent work looks like.
` : ""}

5. **SCORING GUIDE**
   - How to calculate final score
   - Grade conversion (if applicable)

${studentFriendly ? `
6. **STUDENT-FRIENDLY VERSION**
   Rewrite the rubric using simple, clear language that students can understand.
   Use "I can..." statements where appropriate.
` : ""}

**GUIDELINES:**
- Use clear, specific language that describes observable behaviors/qualities
- Avoid vague terms like "good" or "nice" - be specific
- Each performance level should be distinct and measurable
- Align criteria to grade-level expectations
- Make it practical for teachers to use quickly

Format as a clean, professional rubric ready to print or share with students.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }],
    });

    const rubric = message.content[0].text;

    return Response.json({ rubric });
  } catch (error) {
    console.error("Error generating rubric:", error);
    return Response.json(
      { error: "Failed to generate rubric" },
      { status: 500 }
    );
  }
}