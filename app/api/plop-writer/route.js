// Save as: app/api/plop-writer/route.js

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
      evaluationDate,
      readingLevel, readingStrengths, readingChallenges,
      mathLevel, mathStrengths, mathChallenges,
      writingLevel, writingStrengths, writingChallenges,
      communicationSkills, socialSkills, behaviorSkills, selfCareSkills, motorSkills,
      standardizedAssessments, classroomAssessments, teacherObservations, parentInput,
      impactOnEducation, accommodationsUsed,
      plopAreas, includeTransition,
      extractedText
    } = await request.json()

    const prompt = `You are an expert special education professional writing Present Levels of Academic Achievement and Functional Performance (PLAAFP/PLOP) statements for an IEP.

Generate comprehensive, IDEA-compliant Present Levels statements based on the following information. Use "[Student Name]" as a placeholder throughout the document for FERPA compliance.

STUDENT INFORMATION:
- Identifier: ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Disability Category: ${disabilityCategory || 'Not specified'}
- Most Recent Evaluation: ${evaluationDate || 'Not specified'}

AREAS TO ADDRESS: ${plopAreas.join(', ')}

${plopAreas.includes('reading') ? `
READING/LITERACY DATA:
- Current Level: ${readingLevel || 'Not provided'}
- Strengths: ${readingStrengths || 'Not provided'}
- Challenges: ${readingChallenges || 'Not provided'}
` : ''}

${plopAreas.includes('math') ? `
MATHEMATICS DATA:
- Current Level: ${mathLevel || 'Not provided'}
- Strengths: ${mathStrengths || 'Not provided'}
- Challenges: ${mathChallenges || 'Not provided'}
` : ''}

${plopAreas.includes('writing') ? `
WRITTEN EXPRESSION DATA:
- Current Level: ${writingLevel || 'Not provided'}
- Strengths: ${writingStrengths || 'Not provided'}
- Challenges: ${writingChallenges || 'Not provided'}
` : ''}

${plopAreas.includes('communication') ? `
COMMUNICATION SKILLS:
${communicationSkills || 'Not provided'}
` : ''}

${plopAreas.includes('social') ? `
SOCIAL/EMOTIONAL SKILLS:
${socialSkills || 'Not provided'}
` : ''}

${plopAreas.includes('behavior') ? `
BEHAVIORAL SKILLS:
${behaviorSkills || 'Not provided'}
` : ''}

${plopAreas.includes('selfcare') ? `
SELF-CARE/DAILY LIVING SKILLS:
${selfCareSkills || 'Not provided'}
` : ''}

${plopAreas.includes('motor') ? `
MOTOR SKILLS:
${motorSkills || 'Not provided'}
` : ''}

ASSESSMENT DATA:
- Standardized Assessments: ${standardizedAssessments || 'Not provided'}
- Classroom Assessments: ${classroomAssessments || 'Not provided'}
- Teacher Observations: ${teacherObservations || 'Not provided'}
- Parent Input: ${parentInput || 'Not provided'}

IMPACT ON EDUCATION: ${impactOnEducation || 'Not provided'}

CURRENT ACCOMMODATIONS: ${accommodationsUsed || 'Not provided'}

${extractedText ? `
ADDITIONAL INFORMATION FROM UPLOADED DOCUMENTS:
${extractedText}
` : ''}

REQUIREMENTS:
1. Write in third person using "[Student Name]" as placeholder
2. Include BASELINE DATA with specific, measurable current performance levels
3. For each area, include:
   - Current performance level with data
   - Strengths in this area
   - Areas of need with specific examples
   - How the disability impacts performance in this area
   - Connection to grade-level standards when applicable
4. Use professional, objective language
5. Include specific assessment scores and dates where provided
6. Make statements measurable and useful for writing IEP goals
7. Address how the disability affects involvement and progress in the general education curriculum
${includeTransition ? '8. Include a Transition section addressing postsecondary goals and current skills related to education/training, employment, and independent living' : ''}

FORMAT:
Generate the PLOP document with clear section headers for each area. Each section should include:
- A summary paragraph with current levels
- Baseline data in a clear format
- Strengths
- Areas of Need
- Educational Impact

Begin the document with a brief introduction, then address each requested area.`

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

    const plop = response.content[0].text

    return NextResponse.json({ plop })
  } catch (error) {
    console.error('PLOP generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PLOP' }, { status: 500 })
  }
}