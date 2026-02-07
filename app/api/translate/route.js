// Save as: app/api/translate/route.js

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { content, targetLanguage } = await request.json()

    if (!content || !targetLanguage) {
      return NextResponse.json({ error: 'Content and target language are required' }, { status: 400 })
    }

    const languageMap = {
      'spanish': 'Spanish (Latin American)',
      'chinese': 'Chinese (Simplified)',
      'vietnamese': 'Vietnamese',
      'arabic': 'Arabic (Modern Standard)',
      'french': 'French',
      'portuguese': 'Portuguese (Brazilian)',
      'korean': 'Korean',
      'tagalog': 'Tagalog (Filipino)',
      'russian': 'Russian',
      'haitian-creole': 'Haitian Creole',
      'german': 'German',
      'japanese': 'Japanese',
      'hindi': 'Hindi',
      'urdu': 'Urdu',
      'somali': 'Somali'
    }

    const targetLang = languageMap[targetLanguage] || targetLanguage

    const prompt = `You are an expert translator specializing in educational and parent communication content. Translate the following text into ${targetLang}.

TRANSLATION GUIDELINES:
1. Maintain the same tone and formality level as the original
2. Keep any formatting (bullet points, numbering, headers) intact
3. Translate educational terms appropriately for the target language's educational context
4. Preserve names, dates, and specific data without translation
5. Use culturally appropriate expressions where direct translation would sound unnatural
6. For parent communications, maintain a warm, professional tone
7. Keep paragraph breaks and structure identical to the original

IMPORTANT: 
- Output ONLY the translation, no explanations or notes
- Do not add any translator notes or brackets
- Maintain the exact same structure and formatting as the original

TEXT TO TRANSLATE:
${content}

TRANSLATION:`

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

    const translatedContent = response.content[0].text.trim()

    return NextResponse.json({ translatedContent })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Failed to translate content' }, { status: 500 })
  }
}