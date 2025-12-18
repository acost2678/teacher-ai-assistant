import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      unitTopic,
      timeframe,
      totalDays,
      standardsFramework,
      customStandards,
      priorKnowledge,
      endGoals,
      assessmentDates,
      includeHolidays,
      holidays,
      uploadedContent,
    } = await request.json();

    if (!unitTopic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Unit topic, grade level, and subject are required" },
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

    let standardsPrompt = "";
    if (customStandards && customStandards.trim()) {
      standardsPrompt = `
**USE THESE EXACT STANDARDS:**
${customStandards}

Map each standard to specific days/lessons in the pacing guide.`;
    } else {
      standardsPrompt = `Standards Framework: ${standardsMap[standardsFramework] || "Common Core State Standards"}`;
    }

    let holidaysPrompt = "";
    if (includeHolidays && holidays) {
      holidaysPrompt = `
**HOLIDAYS/NON-INSTRUCTIONAL DAYS TO ACCOUNT FOR:**
${holidays}
Do NOT schedule instruction on these days. Mark them in the pacing guide.`;
    }

    let uploadedContentPrompt = "";
    if (uploadedContent && uploadedContent.trim()) {
      uploadedContentPrompt = `

**REFERENCE MATERIALS FROM TEACHER:**
The teacher has provided curriculum documents for reference:
---
${uploadedContent.substring(0, 4000)}${uploadedContent.length > 4000 ? '\n...[content truncated]' : ''}
---
Use this information to ensure alignment with existing curriculum.
`;
    }

    const prompt = `You are an expert K-12 curriculum specialist. Create a detailed pacing guide for a unit of study.
${uploadedContentPrompt}
**PACING GUIDE DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Unit/Topic: ${unitTopic}
- Timeframe: ${timeframe || "3 weeks"}
- Total Instructional Days: ${totalDays || "15 days"}
${standardsPrompt}
${priorKnowledge ? `- Prior Knowledge: ${priorKnowledge}` : ""}
${endGoals ? `- End Goals: ${endGoals}` : ""}
${assessmentDates ? `- Assessment Dates: ${assessmentDates}` : ""}
${holidaysPrompt}

**CREATE A COMPREHENSIVE PACING GUIDE WITH:**

1. **UNIT OVERVIEW**
   - Unit Title
   - Grade Level & Subject
   - Duration (dates/weeks)
   - Essential Questions (2-3)
   - Enduring Understandings

2. **STANDARDS ALIGNMENT**
   - List all standards covered
   - Primary vs. supporting standards

3. **DAILY/WEEKLY BREAKDOWN**

   Create a detailed day-by-day or week-by-week schedule:

   | Day/Week | Topic/Focus | Learning Objectives | Activities | Standards | Assessment |
   |----------|-------------|--------------------| -----------|-----------|------------|
   
   For each day include:
   - Main topic/focus
   - Specific learning objective
   - Key activities (brief)
   - Standard(s) addressed
   - Formative assessment check

4. **ASSESSMENT SCHEDULE**
   - Formative assessments (when/what)
   - Summative assessment date and format
   - Re-teach/intervention windows

5. **MATERIALS & RESOURCES**
   - Required materials by week
   - Technology needs
   - Texts/readings

6. **DIFFERENTIATION NOTES**
   - Built-in flex days
   - Scaffolding suggestions
   - Extension opportunities

7. **TEACHER NOTES**
   - Potential challenges
   - Cross-curricular connections
   - Tips for pacing adjustments

Format as a clear, organized document that a teacher can follow day-by-day. Use tables where appropriate for easy scanning.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const pacingGuide = message.content[0].text;

    return Response.json({ pacingGuide });
  } catch (error) {
    console.error("Error generating pacing guide:", error);
    return Response.json(
      { error: "Failed to generate pacing guide" },
      { status: 500 }
    );
  }
}