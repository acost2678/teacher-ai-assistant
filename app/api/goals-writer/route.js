// Save as: app/api/goals-writer/route.js

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const {
      studentIdentifier,
      gradeLevel,
      disabilityCategory,
      goals,
      alignToStandards,
      stateStandards,
      goalFormat,
      includeDataCollection,
      extractedText
    } = await request.json()

    const formatInstructions = {
      'condition-behavior-criterion': `Use the Condition → Behavior → Criterion format:
"Given [condition/context], [Student Name] will [observable behavior] with [criterion for mastery] as measured by [measurement method] by [timeframe]."

Example: "Given a grade-level reading passage, [Student Name] will read aloud with 90 words correct per minute with 95% accuracy as measured by weekly CBM probes by the end of 36 weeks."`,
      
      'smart': `Use SMART goal format ensuring each goal is:
- Specific: Clearly defines the skill
- Measurable: Includes quantifiable criteria
- Achievable: Realistic based on present levels
- Relevant: Connected to student needs
- Time-bound: Has clear deadline`,
      
      'simple': `Use a simple, clear format:
"By [date], [Student Name] will [specific skill] from [baseline] to [target] as measured by [method]."

Example: "By the end of the school year, [Student Name] will improve reading fluency from 65 wcpm to 90 wcpm as measured by weekly progress monitoring."`
    }

    const goalsDescription = goals.map((goal, index) => `
GOAL ${index + 1}:
- Area: ${goal.area}
- Present Level: ${goal.presentLevel}
- Target Skill: ${goal.specificSkill}
- Baseline: ${goal.baselineData}
- Target Criteria: ${goal.targetCriteria}
- Timeframe: ${goal.timeframe}
- Measurement Method: ${goal.measurementMethod || 'Not specified'}
- Include Short-Term Objectives: ${goal.includeObjectives ? 'Yes' : 'No'}
`).join('\n')

    const prompt = `You are an expert special education professional writing measurable IEP goals. Generate legally compliant, IDEA-aligned annual goals based on the following information.

Use "[Student Name]" as a placeholder throughout for FERPA compliance.

STUDENT INFORMATION:
- Identifier: ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Disability Category: ${disabilityCategory || 'Not specified'}

GOAL FORMAT INSTRUCTIONS:
${formatInstructions[goalFormat]}

STANDARDS ALIGNMENT: ${alignToStandards ? `Align to ${stateStandards}. Reference specific standards where applicable.` : 'No standards alignment required.'}

GOALS TO WRITE:
${goalsDescription}

${extractedText ? `
ADDITIONAL CONTEXT FROM UPLOADED DOCUMENTS:
${extractedText}
` : ''}

REQUIREMENTS FOR EACH GOAL:

1. ANNUAL GOAL
   - Must be measurable with clear criteria
   - Must include condition, behavior, and criterion
   - Must specify timeframe
   - Must include measurement method
   ${alignToStandards ? '- Reference applicable grade-level standard' : ''}

2. ${goals.some(g => g.includeObjectives) ? `SHORT-TERM OBJECTIVES/BENCHMARKS (where requested)
   - Break annual goal into 3-4 sequential benchmarks
   - Each objective should be measurable
   - Show clear progression from baseline to target
   - Include timeline for each benchmark (e.g., "By end of Quarter 1...")` : ''}

3. ${includeDataCollection ? `DATA COLLECTION PROCEDURES
   - Specify what data will be collected
   - How often data will be collected
   - Who will collect the data
   - How progress will be reported` : ''}

FORMAT YOUR RESPONSE:
For each goal area, provide:

═══════════════════════════════════════════════════
GOAL [NUMBER]: [AREA NAME]
═══════════════════════════════════════════════════

PRESENT LEVEL CONNECTION:
[Brief statement connecting to present level]

${alignToStandards ? `STANDARD ALIGNMENT:
[Reference to applicable ${stateStandards} standard]

` : ''}ANNUAL GOAL:
[Full goal statement in requested format]

${goals.some(g => g.includeObjectives) ? `SHORT-TERM OBJECTIVES:

Objective 1 (By [timeframe]):
[Measurable objective]

Objective 2 (By [timeframe]):
[Measurable objective]

Objective 3 (By [timeframe]):
[Measurable objective]

` : ''}${includeDataCollection ? `DATA COLLECTION:
- Method: [specific method]
- Frequency: [how often]
- Responsible Staff: [who]
- Progress Reporting: [when/how reported to parents]
` : ''}
---

Generate professional, legally-compliant goals that are ambitious yet achievable based on the baseline data provided.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const generatedGoals = response.content[0].text

    return NextResponse.json({ goals: generatedGoals })
  } catch (error) {
    console.error('Goals generation error:', error)
    return NextResponse.json({ error: 'Failed to generate goals' }, { status: 500 })
  }
}