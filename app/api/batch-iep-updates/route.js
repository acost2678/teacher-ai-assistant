import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      reportingPeriod,
      gradeLevel,
      toneStyle,
      studentIdentifier,
      goalArea,
      annualGoal,
      baseline,
      currentLevel,
      interventions,
      progress,
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
      'mastered': 'The student has MASTERED this goal and met the criteria.',
      'progressing': 'The student is making ADEQUATE PROGRESS and is on track to meet the annual goal.',
      'slow-progress': 'The student is making SOME PROGRESS but slower than expected. May need intervention adjustment.',
      'minimal': 'The student is making MINIMAL PROGRESS. Significant concern about meeting the annual goal.',
      'regression': 'The student has shown REGRESSION and is performing below previous levels.',
      'not-addressed': 'This goal was NOT ADDRESSED during this reporting period due to [circumstances].',
    };

    const goalAreaContext = {
      'reading': 'reading and literacy skills',
      'writing': 'written expression skills',
      'math': 'mathematics skills',
      'behavior': 'behavior and social-emotional skills',
      'speech': 'speech and language skills',
      'motor': 'fine and/or gross motor skills',
      'adaptive': 'adaptive and daily living skills',
      'transition': 'transition and vocational skills',
    };

    const prompt = `You are an experienced special education teacher writing an IEP progress update that complies with IDEA requirements.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder - NEVER invent a name
- This is a privacy-first system for FERPA compliance

**REPORT SETTINGS:**
- Reporting Period: ${reportingPeriod}
- Grade Level: ${gradeLevel}
- Goal Area: ${goalAreaContext[goalArea] || goalArea}
- Writing Style: ${toneDescriptions[toneStyle] || toneDescriptions.professional}

**PROGRESS STATUS:** ${progressDescriptions[progress] || progressDescriptions.progressing}

**GOAL DATA PROVIDED:**

Annual Goal: ${annualGoal}

Baseline (Start of IEP): ${baseline || 'Not specified'}

Current Performance Level: ${currentLevel}

Interventions/Services: ${interventions || 'Not specified'}

**WRITE THE PROGRESS UPDATE:**

Requirements for IDEA Compliance:
1. Start with "[Student Name]" - never invent names
2. State the annual goal clearly
3. Compare current performance to baseline (show growth or lack thereof)
4. Include specific data/metrics from the information provided
5. State whether student is on track to meet the annual goal by the end of the IEP year
6. Mention interventions/services being provided
7. If progress is slow/minimal/regression, note that the IEP team should review
8. Keep it professional and objective (no subjective opinions)
9. Be concise but thorough (1-2 paragraphs)
10. End with projected timeline for goal mastery if applicable

Format:
- Write in third person ("[Student Name] has demonstrated...")
- Use past tense for what has occurred, present tense for current status
- Include measurable data points when provided
- Be factual and evidence-based

Write the progress update now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
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