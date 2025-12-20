import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      includeStudentVersion,
      includeExemplars,
    } = await request.json();

    if (!assignmentDescription || !gradeLevel) {
      return Response.json(
        { error: "Assignment description and grade level are required" },
        { status: 400 }
      );
    }

    const rubricStyles = {
      "analytic": "Analytic Rubric - Provides separate scores for each criterion, allowing detailed feedback on specific aspects of the work",
      "holistic": "Holistic Rubric - Provides a single overall score based on the total impression of the work",
      "single-point": "Single-Point Rubric - Describes only the proficient level, with space for feedback on strengths and areas for growth",
      "checklist": "Checklist Rubric - Yes/No format for each criterion, useful for process-based assessments",
    };

    const pointScales = {
      "4": "4-point scale (4=Exceeds Expectations, 3=Meets Expectations, 2=Approaching Expectations, 1=Beginning)",
      "5": "5-point scale (5=Exemplary, 4=Proficient, 3=Developing, 2=Beginning, 1=Not Yet)",
      "3": "3-point scale (3=Proficient, 2=Developing, 1=Beginning)",
      "100": "Percentage scale (A=90-100, B=80-89, C=70-79, D=60-69, F=Below 60)",
    };

    let criteriaPrompt = "";
    if (criteria && criteria.trim()) {
      criteriaPrompt = `
**USE THESE SPECIFIC CRITERIA:**
${criteria}

Build the rubric around these criteria provided by the teacher.`;
    }

    let rubricFormatPrompt = "";
    
    if (rubricStyle === "analytic") {
      rubricFormatPrompt = `
**ANALYTIC RUBRIC FORMAT:**
Create a table with:
- Rows: Each criterion (4-6 criteria)
- Columns: Each performance level (${pointScale === "4" ? "Exceeds (4), Meets (3), Approaching (2), Beginning (1)" : pointScale === "5" ? "Exemplary (5), Proficient (4), Developing (3), Beginning (2), Not Yet (1)" : pointScale === "3" ? "Proficient (3), Developing (2), Beginning (1)" : "A (90-100), B (80-89), C (70-79), D (60-69), F (Below 60)"})

| Criteria | ${pointScale === "4" ? "Exceeds (4) | Meets (3) | Approaching (2) | Beginning (1)" : pointScale === "5" ? "Exemplary (5) | Proficient (4) | Developing (3) | Beginning (2) | Not Yet (1)" : pointScale === "3" ? "Proficient (3) | Developing (2) | Beginning (1)" : "A (90-100) | B (80-89) | C (70-79) | D/F (Below 70)"} |
|----------|...
| [Criterion 1] | [Detailed description of performance at this level] | [Description] | [Description] | [Description] |

Each cell should contain specific, observable descriptors of what work looks like at that level.`;
    } else if (rubricStyle === "holistic") {
      rubricFormatPrompt = `
**HOLISTIC RUBRIC FORMAT:**
Create a rubric that assigns a single score based on the overall quality of work.

| Score | Overall Performance Description |
|-------|--------------------------------|
| ${pointScale === "4" ? "4 - Exceeds" : pointScale === "5" ? "5 - Exemplary" : pointScale === "3" ? "3 - Proficient" : "A (90-100)"} | [Comprehensive description of excellent work that demonstrates mastery of all criteria] |
| ${pointScale === "4" ? "3 - Meets" : pointScale === "5" ? "4 - Proficient" : pointScale === "3" ? "2 - Developing" : "B (80-89)"} | [Description of proficient work] |
| ${pointScale === "4" ? "2 - Approaching" : pointScale === "5" ? "3 - Developing" : pointScale === "3" ? "1 - Beginning" : "C (70-79)"} | [Description of developing work] |
| ${pointScale === "4" ? "1 - Beginning" : pointScale === "5" ? "2 - Beginning" : "D/F (Below 70)"} | [Description of beginning work] |
${pointScale === "5" ? "| 1 - Not Yet | [Description of work not yet meeting expectations] |" : ""}

Include which criteria are considered at each level.`;
    } else if (rubricStyle === "single-point") {
      rubricFormatPrompt = `
**SINGLE-POINT RUBRIC FORMAT:**
Create a three-column rubric where the middle column describes proficient performance, and the side columns are left for feedback.

| Areas for Growth (Feedback) | Criteria - Proficient Performance | Evidence of Excellence (Feedback) |
|-----------------------------|-----------------------------------|-----------------------------------|
| [Space for teacher to write specific feedback on what needs improvement] | **[Criterion 1]:** [Clear description of what proficient performance looks like] | [Space for teacher to write specific feedback on what exceeded expectations] |
| [Space for feedback] | **[Criterion 2]:** [Proficient description] | [Space for feedback] |
| [Space for feedback] | **[Criterion 3]:** [Proficient description] | [Space for feedback] |
| [Space for feedback] | **[Criterion 4]:** [Proficient description] | [Space for feedback] |

Single-point rubrics focus on what "meeting expectations" looks like, with space for personalized feedback.`;
    } else if (rubricStyle === "checklist") {
      rubricFormatPrompt = `
**CHECKLIST RUBRIC FORMAT:**
Create a yes/no checklist for each criterion.

| Criterion | Description | ✓ Yes | ✗ No | Notes |
|-----------|-------------|-------|------|-------|
| [Criterion 1] | [What this looks like when done correctly] | ☐ | ☐ | |
| [Criterion 2] | [What this looks like when done correctly] | ☐ | ☐ | |
| [Criterion 3] | [What this looks like when done correctly] | ☐ | ☐ | |
| [Criterion 4] | [What this looks like when done correctly] | ☐ | ☐ | |
| [Criterion 5] | [What this looks like when done correctly] | ☐ | ☐ | |

Include a scoring guide: e.g., "5/5 = A, 4/5 = B, 3/5 = C, etc."`;
    }

    const prompt = `You are an expert K-12 assessment specialist. Create a professional rubric for student work.

**RUBRIC DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Assignment Type: ${assignmentType || "Project"}
- Assignment Description: ${assignmentDescription}
- Rubric Style: ${rubricStyles[rubricStyle] || rubricStyles["analytic"]}
${rubricStyle !== "single-point" && rubricStyle !== "checklist" ? `- Scoring Scale: ${pointScales[pointScale] || pointScales["4"]}` : ""}
${includeStudentVersion ? "- Include a STUDENT-FRIENDLY version with simple language" : ""}
${includeExemplars ? "- Include EXEMPLAR descriptions for the highest level" : ""}
${criteriaPrompt}

**CREATE A COMPREHENSIVE ${rubricStyle.toUpperCase()} RUBRIC:**

---

# 📊 ${rubricStyle === "analytic" ? "Analytic" : rubricStyle === "holistic" ? "Holistic" : rubricStyle === "single-point" ? "Single-Point" : "Checklist"} Rubric: ${assignmentType}

**Assignment:** ${assignmentDescription}
**Grade Level:** ${gradeLevel}
**Subject:** ${subject || "General"}
${rubricStyle !== "single-point" && rubricStyle !== "checklist" ? `**Scale:** ${pointScales[pointScale] || "4-point"}` : ""}
**Total Points:** [Calculate based on criteria]

---

## Rubric

${rubricFormatPrompt}

---

${includeExemplars ? `
## 🌟 Exemplar Descriptions

For each criterion, here's what EXCELLENT work looks like:

**[Criterion 1]:**
[Specific example of what top-level performance looks like for this criterion]

**[Criterion 2]:**
[Specific example]

**[Criterion 3]:**
[Specific example]

[Continue for each criterion...]

---
` : ""}

## 📝 Scoring Guide

${rubricStyle === "analytic" ? `
**How to Use:**
1. Score each criterion independently
2. Add up all criterion scores
3. Total possible points: [X]

**Grade Conversion:**
- [90-100%] = A
- [80-89%] = B
- [70-79%] = C
- [60-69%] = D
- [Below 60%] = F
` : rubricStyle === "holistic" ? `
**How to Use:**
1. Read through the entire student work
2. Compare to each performance level description
3. Assign the score that best matches the overall quality

**Remember:** Holistic rubrics assess the work as a whole, not individual components.
` : rubricStyle === "single-point" ? `
**How to Use:**
1. Review student work against each criterion
2. If proficient, check the middle column
3. If needs improvement, write specific feedback in "Areas for Growth"
4. If exceeds expectations, write specific feedback in "Evidence of Excellence"

**Benefits:** Focuses on meaningful feedback rather than just scores.
` : `
**How to Use:**
1. Review each criterion
2. Mark Yes (✓) if the criterion is fully met
3. Mark No (✗) if the criterion is not met or partially met
4. Add notes for feedback

**Scoring:**
- All criteria met = Excellent
- 80%+ criteria met = Proficient
- 60-79% criteria met = Developing
- Below 60% = Needs significant revision
`}

---

${includeStudentVersion ? `
## 👦👧 Student-Friendly Version

**Your Assignment:** ${assignmentDescription}

**How You'll Be Graded:**

${rubricStyle === "single-point" ? `
| What I Need to Work On | What Good Work Looks Like | What I Did Really Well |
|------------------------|---------------------------|------------------------|
| (Your teacher will write here) | **[Criterion 1]:** [Simple description a student can understand] | (Your teacher will write here) |
| | **[Criterion 2]:** [Simple description] | |
| | **[Criterion 3]:** [Simple description] | |
| | **[Criterion 4]:** [Simple description] | |
` : rubricStyle === "checklist" ? `
**Check Your Work!** ✓

Before you turn in your work, ask yourself:

☐ Did I [criterion 1 in student language]?
☐ Did I [criterion 2 in student language]?
☐ Did I [criterion 3 in student language]?
☐ Did I [criterion 4 in student language]?
☐ Did I [criterion 5 in student language]?
` : `
| What I'm Being Graded On | Amazing! | Good Job! | Getting There | Keep Trying |
|--------------------------|----------|-----------|---------------|-------------|
| [Criterion 1 - simple language] | [What amazing looks like] | [What good looks like] | [What getting there looks like] | [What needs more work] |
| [Criterion 2 - simple language] | ... | ... | ... | ... |
`}

**Tips for Success:**
- [Tip 1 in kid-friendly language]
- [Tip 2]
- [Tip 3]

---
` : ""}

## 💡 Teacher Notes

**When using this rubric:**
- Share with students BEFORE they begin the assignment
- Review criteria together as a class
- Consider having students self-assess before submission
- Use the rubric for feedback, not just grading

---

**GUIDELINES:**
- Use clear, specific language that describes observable qualities
- Avoid vague terms like "good" or "nice" - be specific
- Each performance level should be distinct and measurable
- Align criteria to ${gradeLevel} expectations
- Make it practical for teachers to use quickly`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
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