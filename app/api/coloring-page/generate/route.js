// Save as: app/api/coloring-page/generate/route.js

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const {
      subject,
      theme,
      ageGroup,
      complexity,
      style,
      lineThickness,
      includeText,
      customText
    } = await request.json()

    // Build complexity instructions
    const complexityGuide = {
      toddler: 'Very simple shapes only. Maximum 3-5 large, distinct objects. No small details. Extra thick outlines (8-10px stroke). Large empty spaces for easy coloring.',
      preschool: 'Simple shapes with minimal detail. 5-8 objects maximum. Thick outlines (6-8px stroke). Clear, separate areas for coloring.',
      elementary: 'Moderate detail and complexity. Can include 8-15 elements. Medium outlines (4-6px stroke). Some smaller details but still clear sections.',
      tween: 'More detailed and intricate designs. Can include many elements and patterns. Thinner lines (2-4px stroke). Can include fine details.'
    }

    const lineWidths = {
      thin: '2-3px',
      medium: '4-5px', 
      thick: '6-8px'
    }

    const styleGuide = {
      cartoon: 'Cartoon style with bold, rounded shapes. Friendly, cute appearance. Exaggerated features.',
      realistic: 'Semi-realistic proportions but simplified for coloring. Natural shapes with clear outlines.',
      mandala: 'Symmetrical, circular pattern design. Geometric shapes arranged in concentric circles.',
      doodle: 'Hand-drawn doodle style. Whimsical, playful lines. Can be slightly imperfect looking.'
    }

    const themeSubjects = {
      animals: 'cute animal',
      nature: 'nature scene with plants and flowers',
      space: 'space scene with rockets, planets, or astronauts',
      ocean: 'underwater ocean scene with sea creatures',
      dinosaurs: 'friendly dinosaur',
      vehicles: 'vehicle (car, truck, plane, or train)',
      fantasy: 'magical fantasy scene (unicorn, dragon, castle, fairy)',
      food: 'fun food items',
      sports: 'sports equipment or athlete',
      holidays: 'holiday themed scene',
      seasons: 'seasonal nature scene',
      community: 'community helper (firefighter, doctor, teacher)',
      shapes: 'geometric shapes and patterns',
      letters: 'alphabet letters or numbers with decorations',
      fairytales: 'fairy tale character or scene'
    }

    const subjectDescription = subject || (theme ? themeSubjects[theme] : 'a friendly animal')

    const prompt = `You are an expert at creating SVG coloring pages for children. Generate a complete, valid SVG coloring page.

SUBJECT: ${subjectDescription}
AGE GROUP: ${ageGroup} - ${complexityGuide[ageGroup]}
STYLE: ${style} - ${styleGuide[style]}
LINE THICKNESS: ${lineWidths[lineThickness]}

REQUIREMENTS:
1. Create a complete, valid SVG with viewBox="0 0 800 800"
2. Use ONLY black strokes (#000000) on a white background
3. NO filled shapes - all shapes must have fill="none" or fill="white"
4. Stroke width should be ${lineWidths[lineThickness]}
5. All paths must be closed and create clear coloring sections
6. Design should be centered and fill most of the canvas
7. Include stroke-linecap="round" and stroke-linejoin="round" for smooth lines
${includeText && customText ? `8. Include the text "${customText}" at the top or bottom of the image in a fun, outlined font style (no fill, just stroke)` : ''}

SVG STRUCTURE:
- Start with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
- Add a white background: <rect width="800" height="800" fill="white"/>
- Then add your drawing elements
- End with: </svg>

Generate ONLY the SVG code, nothing else. No explanation, no markdown, just the raw SVG starting with <svg and ending with </svg>.`

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

    let svgContent = response.content[0].text.trim()
    
    // Clean up the SVG if needed
    // Remove any markdown code blocks if present
    svgContent = svgContent.replace(/```svg\n?/g, '').replace(/```\n?/g, '')
    
    // Ensure it starts with <svg
    if (!svgContent.startsWith('<svg')) {
      const svgStart = svgContent.indexOf('<svg')
      if (svgStart !== -1) {
        svgContent = svgContent.substring(svgStart)
      }
    }
    
    // Ensure it ends with </svg>
    const svgEnd = svgContent.lastIndexOf('</svg>')
    if (svgEnd !== -1) {
      svgContent = svgContent.substring(0, svgEnd + 6)
    }

    // Convert SVG to PNG using sharp
    try {
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .resize(800, 800, { fit: 'contain', background: '#ffffff' })
        .png()
        .toBuffer()

      // Convert to base64 data URL
      const base64Image = `data:image/png;base64,${pngBuffer.toString('base64')}`

      return NextResponse.json({ imageUrl: base64Image })
    } catch (sharpError) {
      console.error('Sharp conversion error:', sharpError)
      // If sharp fails, return the SVG as a data URL
      const svgBase64 = Buffer.from(svgContent).toString('base64')
      const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`
      return NextResponse.json({ imageUrl: svgDataUrl })
    }

  } catch (error) {
    console.error('Coloring page generation error:', error)
    return NextResponse.json({ error: 'Failed to generate coloring page' }, { status: 500 })
  }
}