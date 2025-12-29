import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      reportingPeriod,
      gradeLevel,
      toneStyle,
      reportDate,
      studentIdentifier,
      disabilityCategory,
      goalArea,
      annualGoal,
      baseline,
      currentLevel,
      percentGoalAchieved,
      interventions,
      accommodations,
      progress,
      recommendations,
      nextSteps,
      nextReviewDate,
    } = await request.json();

    if (!annualGoal || !currentLevel) {
      return Response.json(
        { error: "Annual goal and current level are required" },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      professional: "professional, formal, and objective - suitable for official documentation",
      'parent-friendly': "clear and accessible for parents while remaining professional",
      detailed: "highly detailed and technical, including specific data points and metrics",
    };

    const progressDescriptions = {
      'mastered': 'MASTERED - The student has met the goal criteria.',
      'progressing': 'PROGRESSING - The student is making meaningful progress toward the annual goal.',
      'slow-progress': 'LIMITED PROGRESS - The student is making some progress but slower than expected.',
      'minimal': 'MINIMAL PROGRESS - Significant concern about meeting the annual goal.',
      'regression': 'REGRESSION - The student is performing below previous levels.',
      'not-addressed': 'NOT ADDRESSED - This goal was not addressed during this reporting period.',
    };

    const goalAreaLabels = {
      'reading': 'Reading',
      'writing': 'Writing',
      'math': 'Mathematics',
      'behavior': 'Behavior/Social-Emotional',
      'speech': 'Speech/Language',
      'motor': 'Fine/Gross Motor',
      'adaptive': 'Adaptive/Life Skills',
      'transition': 'Transition',
    };

    const prompt = `You are an experienced special education teacher writing an IEP Progress Monitoring Report that complies with IDEA requirements.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder throughout - NEVER invent a name
- This is a privacy-first system for FERPA compliance

**REPORT SETTINGS:**
- Reporting Period: ${reportingPeriod}
- Grade Level: ${gradeLevel}
- Report Date: ${reportDate || '[Current Date]'}
- Writing Style: ${toneDescriptions[toneStyle] || toneDescriptions.professional}

**STUDENT DATA PROVIDED:**
- Student Identifier: ${studentIdentifier}
- Disability Category: ${disabilityCategory || 'Not specified'}
- Goal Area: ${goalAreaLabels[goalArea] || goalArea}
- Annual Goal: ${annualGoal}
- Baseline Performance: ${baseline || 'Not specified'}
- Current Performance: ${currentLevel}
- Progress Status: ${progressDescriptions[progress] || progressDescriptions.progressing}
- Percentage of Goal Achieved: ${percentGoalAchieved || 'Not specified'}%
- Interventions/Services: ${interventions || 'Not specified'}
- Accommodations: ${accommodations || 'Not specified'}
- Teacher Recommendations: ${recommendations || 'Not specified'}
- Next Steps: ${nextSteps || 'Not specified'}
- Next Review Date: ${nextReviewDate || '[Date]'}

**GENERATE A COMPLETE IEP PROGRESS MONITORING REPORT with the following sections:**

# PROGRESS MONITORING REPORT

## Student Information
- Student Name: [Student Name]
- Grade Level: ${gradeLevel}
- Disability Category: ${disabilityCategory || '[Category]'}
- IEP Goal Area: ${goalAreaLabels[goalArea] || goalArea}
- Report Date: ${reportDate || '[Current Date]'}
- Reporting Period: ${reportingPeriod}

## Current Goal
[Write the annual goal clearly]

## Progress Summary

### Baseline Performance:
[Describe where the student started at the beginning of the IEP period using the baseline data provided]

### Current Performance:
[Describe the student's current performance level with specific data points]

### Progress Toward Goal:
**${progressDescriptions[progress]?.split(' - ')[0] || 'PROGRESSING'}** - [Explain the progress status]

### Percentage of Goal Achieved:
Approximately **${percentGoalAchieved || '[X]'}%** of the annual goal has been achieved based on current performance data.

## Data Analysis
[Write 2-3 paragraphs analyzing the student's progress data:
- What patterns do you see in the data?
- What areas show strength vs. need continued focus?
- What does the progress trajectory suggest about meeting the annual goal?]

## Supports & Accommodations in Place
[List the current interventions and accommodations as bullet points]

## Recommendations
[Based on the data, provide 2-3 specific recommendations with rationale]

## Next Steps
[Number each action item with responsible party and timeline:
1. **Instructional Team:** [Action]
2. **General Education Teacher:** [Action]
3. **Family:** [Action]
4. **Progress Review:** [When]
5. **Data Collection:** [What/How]]

## Next Formal Review Date: ${nextReviewDate || '[Date]'}

---

**Prepared by:** [Name, Title]
**Date:** ${reportDate || '[Current Date]'}

---
*This progress report demonstrates that [Student Name] is making educationally meaningful progress toward IEP goals. [Add closing statement based on progress status].*

**IMPORTANT FORMATTING:**
- Use markdown formatting (## for headers, **bold** for emphasis, - for bullet points)
- Include specific data points from the information provided
- Be objective and evidence-based
- Write in third person using "[Student Name]"
- Make sure all sections flow professionally
- If information is missing, use appropriate placeholders like [specify] or [date]

Generate the complete progress report now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const update = message.content[0].text;

    return Response.json({ update });
  } catch (error) {
    console.error("Error generating IEP update:", error);
    return Response.json(
      { error: "Failed to generate IEP update" },
      { status: 500 }
    );
  }
}