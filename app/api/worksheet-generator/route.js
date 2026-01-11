// Save as: app/api/worksheet-generator/route.js

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const {
      subject,
      gradeLevel,
      topic,
      learningObjective,
      standardCode,
      sourceType,
      pastedText,
      extractedText,
      questionTypes,
      numberOfQuestions,
      difficultyLevel,
      includeWordBank,
      includeAnswerKey,
      includeInstructions,
      extraSpacing,
      dyslexiaFriendly,
      createTieredVersions,
      batchMode,
      batchTopics
    } = await request.json()

    const subjectNames = {
      'math': 'Mathematics',
      'ela': 'English Language Arts',
      'science': 'Science',
      'social-studies': 'Social Studies',
      'foreign-language': 'Foreign Language',
      'health': 'Health/Physical Education',
      'art': 'Art',
      'music': 'Music',
      'other': 'General'
    }

    const questionTypeDescriptions = {
      'multiple-choice': 'Multiple choice questions with 4 answer options (A, B, C, D)',
      'fill-blank': 'Fill in the blank questions' + (includeWordBank ? ' with a word bank provided' : ''),
      'matching': 'Matching questions with two columns to connect',
      'true-false': 'True/False questions',
      'short-answer': 'Short answer questions requiring 1-2 sentence responses',
      'ordering': 'Ordering/sequencing questions where students arrange items in correct order',
      'labeling': 'Diagram labeling questions with blanks to fill in parts',
      'word-problems': 'Word problems requiring multi-step solutions with space to show work',
      'open-response': 'Open response/essay questions requiring paragraph-length answers'
    }

    const formatInstructions = dyslexiaFriendly 
      ? `FORMAT FOR DYSLEXIA-FRIENDLY VERSION:
- Use simple, clear language
- Keep sentences short
- Use extra spacing between questions
- Avoid dense text blocks
- Number all questions clearly
- Use consistent formatting throughout`
      : (extraSpacing 
        ? `FORMAT WITH EXTRA SPACING:
- Include blank lines between questions for student work
- Add space after each question for showing work
- Use clear numbering and organization`
        : `STANDARD FORMAT:
- Clear numbering
- Professional layout
- Organized sections`);

    const generateWorksheet = async (worksheetTopic, worksheetObjective, level) => {
      const levelInstructions = {
        'below-level': `BELOW GRADE LEVEL VERSION:
- Reduce number of questions to ${Math.ceil(numberOfQuestions * 0.7)}
- Use simpler vocabulary and shorter sentences
- Include a word bank for ALL fill-in-the-blank questions
- Add visual supports or hints where helpful
- Break complex problems into smaller steps
- Use more concrete examples
- Provide sentence starters for open responses`,
        
        'on-level': `ON GRADE LEVEL VERSION:
- Standard ${gradeLevel} expectations
- Grade-appropriate vocabulary
- ${numberOfQuestions} questions total
- Balanced mix of question types`,
        
        'above-level': `ABOVE GRADE LEVEL VERSION:
- Increase complexity and depth
- Include challenge questions requiring higher-order thinking
- Add extension questions at the end
- Use more sophisticated vocabulary
- Require more detailed explanations
- Include questions that require synthesis or evaluation
- Add "Bonus Challenge" section with 2-3 extra rigorous questions`
      }

      const prompt = `You are an expert ${subjectNames[subject]} teacher creating a high-quality worksheet for ${gradeLevel} students.

WORKSHEET DETAILS:
- Subject: ${subjectNames[subject]}
- Grade Level: ${gradeLevel}
- Topic: ${worksheetTopic}
${worksheetObjective ? `- Learning Objective: ${worksheetObjective}` : ''}
${standardCode ? `- Standard: ${standardCode}` : ''}

${levelInstructions[level]}

QUESTION TYPES TO INCLUDE:
${questionTypes.map(qt => `- ${questionTypeDescriptions[qt]}`).join('\n')}

${sourceType !== 'topic' && (pastedText || extractedText) ? `
SOURCE MATERIAL TO BASE QUESTIONS ON:
${pastedText || extractedText}
` : ''}

${formatInstructions}

WORKSHEET REQUIREMENTS:

1. HEADER:
   - Title: "${worksheetTopic}" 
   - Grade: ${gradeLevel}
   - Name: _________________ Date: _________________
   ${level !== 'on-level' ? `- Version: ${level === 'below-level' ? 'Modified' : 'Challenge'}` : ''}

${includeInstructions ? `2. INSTRUCTIONS:
   - Clear directions for each section
   - Explain how to complete each question type` : ''}

3. QUESTIONS:
   - Create a mix of the requested question types
   - Ensure questions progress from easier to harder
   - Make questions grade-appropriate for ${gradeLevel}
   - All questions should align to the topic/objective
   ${questionTypes.includes('word-problems') ? '- Word problems should be engaging and use real-world contexts' : ''}
   ${questionTypes.includes('multiple-choice') ? '- Multiple choice distractors should be plausible but clearly incorrect' : ''}

${includeWordBank ? `4. WORD BANK (if applicable):
   - Include word bank at the top of fill-in-the-blank section
   - Include 2-3 extra words as distractors` : ''}

${includeAnswerKey ? `5. ANSWER KEY:
   - Include complete answer key at the end
   - Clearly labeled "ANSWER KEY - TEACHER COPY"
   - Show work for math problems
   - Include acceptable variations for open-ended questions` : ''}

Generate a complete, print-ready worksheet now:`

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

      return response.content[0].text
    }

    let worksheets = {}

    if (batchMode && batchTopics && batchTopics.length > 0) {
      // Batch mode - generate multiple worksheets
      const batchResults = {}
      for (let i = 0; i < batchTopics.length; i++) {
        const bt = batchTopics[i]
        if (bt.topic) {
          if (createTieredVersions) {
            batchResults[`worksheet_${i + 1}`] = {
              topic: bt.topic,
              'below-level': await generateWorksheet(bt.topic, bt.objective, 'below-level'),
              'on-level': await generateWorksheet(bt.topic, bt.objective, 'on-level'),
              'above-level': await generateWorksheet(bt.topic, bt.objective, 'above-level')
            }
          } else {
            batchResults[`worksheet_${i + 1}`] = {
              topic: bt.topic,
              single: await generateWorksheet(bt.topic, bt.objective, difficultyLevel)
            }
          }
        }
      }
      worksheets = batchResults
    } else if (createTieredVersions) {
      // 3-tier differentiation
      worksheets = {
        'below-level': await generateWorksheet(topic, learningObjective, 'below-level'),
        'on-level': await generateWorksheet(topic, learningObjective, 'on-level'),
        'above-level': await generateWorksheet(topic, learningObjective, 'above-level')
      }
    } else {
      // Single worksheet
      worksheets = {
        single: await generateWorksheet(topic, learningObjective, difficultyLevel)
      }
    }

    return NextResponse.json({ worksheets })
  } catch (error) {
    console.error('Worksheet generation error:', error)
    return NextResponse.json({ error: 'Failed to generate worksheet' }, { status: 500 })
  }
}