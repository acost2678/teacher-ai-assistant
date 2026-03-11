import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Grade band mapping ───────────────────────────────────────────────────────
const getGradeBand = (gradeLevel) => {
  const g = gradeLevel.toLowerCase()
  if (g.includes('pre-k') || g.includes('kindergarten') || g.includes('1st') || g.includes('2nd')) return 'K-2'
  if (g.includes('3rd') || g.includes('4th') || g.includes('5th')) return '3-5'
  if (g.includes('6th') || g.includes('7th') || g.includes('8th')) return '6-8'
  return '9-12'
}

// ─── Grade-band specific language calibration ─────────────────────────────────
const GRADE_BAND_GUIDANCE = {
  'K-2': `
- Use simple, concrete language (1st–2nd grade reading level)
- Sentence length: max 8–10 words
- Use picture-word pairings wherever possible (describe the visual in text)
- Avoid abstract concepts — anchor everything to body sensations or familiar situations
- Use "I feel..." sentence starters
- Limit choices to 3–4 maximum
- Include a visual feelings chart description (e.g., "Look at the face cards: happy, sad, mad, worried, calm")`,

  '3-5': `
- Use clear, grade-appropriate vocabulary (3rd–5th grade level)
- Can introduce emotion vocabulary beyond basic feelings (frustrated, nervous, proud, overwhelmed)
- Include sentence frames for written responses
- Use relatable examples from school situations (recess, tests, group work, lunch)
- Can include brief reflective prompts (1–2 sentences)
- Limit open-ended questions to 1–2 per check-in`,

  '6-8': `
- Use middle-school appropriate language and tone — NOT childish, NOT overly clinical
- Can explore nuanced emotions (anxious, conflicted, disappointed, motivated)
- Include reflective prompts that invite perspective-taking
- Can reference peer relationships, academic pressure, and identity
- Avoid forced positivity — validate the full emotional spectrum
- Include optional private response options`,

  '9-12': `
- Use mature, respectful language that treats students as emerging adults
- Can engage metacognition (e.g., "What patterns do you notice in how you respond to stress?")
- Include prompts relevant to high school context: college pressure, social dynamics, identity, future planning
- Offer choice in depth of response — brief check vs. deeper reflection
- Avoid infantilizing language or overly structured formats
- Include optional anonymous or private modes explicitly`,
}

// ─── Zones of Regulation integration ─────────────────────────────────────────
const ZONES_GUIDANCE = `
When Zones of Regulation framing is enabled:
- Open each check-in by inviting students to identify their zone:
  🔵 BLUE ZONE: low energy — sad, sick, bored, tired
  🟢 GREEN ZONE: ready to learn — happy, calm, focused, grateful
  🟡 YELLOW ZONE: heightened — worried, silly, excited, frustrated, confused
  🔴 RED ZONE: intense — furious, terrified, out of control, overwhelmed
- Frame follow-up prompts based on zone (e.g., if yellow/red: coping strategy options; if blue: energy-building options; if green: maintenance/reflection)
- Never frame Red or Blue zones as "wrong" — normalize all zones as information`

// ─── Crisis guardrails ────────────────────────────────────────────────────────
const CRISIS_GUIDANCE = `
CRITICAL SAFETY GUARDRAILS — NON-NEGOTIABLE:
- Do NOT generate prompts that ask students directly about self-harm, suicide, or abuse
- DO generate prompts that create safe emotional space and open doors for disclosure naturally
- If generating follow-up protocols, instruct teachers to follow their school/district crisis protocol for any student who discloses unsafe thoughts or situations
- Never include language suggesting AI can assess or manage crisis situations`

export async function POST(request) {
  try {
    const {
      gradeLevel, checkInType, selCompetency, format, duration,
      includeVisuals, includeFollowUp, quantity, zonesEnabled,
    } = await request.json()

    const gradeBand = getGradeBand(gradeLevel)
    const bandGuidance = GRADE_BAND_GUIDANCE[gradeBand]

    const prompt = `You are an expert school counselor and SEL curriculum specialist with deep expertise in the CASEL framework and Zones of Regulation. Generate ${quantity} SEL check-in(s) for classroom use.

**SPECIFICATIONS:**
- Grade Level: ${gradeLevel} (Grade Band: ${gradeBand})
- Check-In Type: ${checkInType}
- CASEL Competency Focus: ${selCompetency}
- Format: ${format}
- Duration: ${duration}
- Visual Supports: ${includeVisuals ? 'YES — include emoji suggestions and visual cues described in text' : 'NO'}
- Follow-Up Prompts: ${includeFollowUp ? 'YES — include 2-3 tiered follow-up questions based on student responses' : 'NO'}
- Zones of Regulation: ${zonesEnabled ? 'YES — integrate zone language throughout' : 'NO'}

**GRADE-BAND LANGUAGE CALIBRATION — ${gradeBand}:**
${bandGuidance}

${zonesEnabled ? ZONES_GUIDANCE : ''}

${CRISIS_GUIDANCE}

**CASEL COMPETENCY: ${selCompetency}**
Ensure every check-in directly builds the named competency skill. For each check-in, briefly note (in brackets) which specific CASEL indicator is being targeted.

**FORMAT REQUIREMENTS FOR ${format.toUpperCase()}:**
${format === 'Rating Scale'          ? '- Include a 1–5 scale with labeled anchors\n- Add a brief "tell me more" follow-up for scores 1–2' : ''}
${format === 'Emoji/Visual Selection' ? '- Describe 4–6 emoji/image options with feeling labels\n- Include a "none of these fit" option' : ''}
${format === 'Choice Board'          ? '- Create a 3×2 or 2×3 grid of response options\n- Each cell: one feeling/response with a brief description' : ''}
${format === 'Written Response'      ? '- Include a sentence frame or starter\n- Specify approximate expected length (1 sentence, 3–4 sentences, etc.)' : ''}
${format === 'Think-Pair-Share'      ? '- Structure: Think prompt → Pair discussion prompt → Share sentence frame\n- Keep think portion private, share portion safe for whole group' : ''}
${format === 'Journal Prompt'        ? '- Include a main prompt + 2 extension prompts for students who want to write more\n- Note: responses are private unless student chooses to share' : ''}
${format === 'Discussion Circle'     ? '- Include a community circle opening, main prompt, and closing reflection\n- Add talking piece protocol reminder' : ''}

**OUTPUT STRUCTURE FOR EACH CHECK-IN:**
---
CHECK-IN [#]: [Brief Title]
CASEL Indicator: [Specific indicator targeted]
${zonesEnabled ? 'Zones Connection: [Which zone(s) this addresses]\n' : ''}
[Full check-in content in the specified format]
${includeFollowUp ? '\nFOLLOW-UP PROTOCOL:\n[Tiered follow-up prompts based on different student responses]\n[Note to teacher about what to watch for]' : ''}
---

Generate all ${quantity} check-in(s) now, fully complete and ready to use.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: `You are an expert school counselor and SEL curriculum designer. Generate practical, developmentally appropriate, trauma-informed SEL check-ins. Never generate content that could be harmful to students or that attempts to replace clinical crisis intervention.`,
      messages: [{ role: 'user', content: prompt }],
    })

    return Response.json({ checkIns: message.content[0].text })

  } catch (error) {
    console.error('SEL check-in generation error:', error)
    return Response.json({ error: 'Failed to generate SEL check-ins' }, { status: 500 })
  }
}