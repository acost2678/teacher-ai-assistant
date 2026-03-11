import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Accommodation prompt fragments ──────────────────────────────────────────
const ACCOMMODATION_INSTRUCTIONS = {
  'extended-time':        'Structure the assignment in clearly numbered steps so students can track their own progress and pace.',
  'reduced-items':        'Reduce the total number of items or questions by 40–50%, keeping only the most essential ones that directly address the learning objective.',
  'graphic-organizer':    'Include a built-in graphic organizer (e.g., T-chart, web, table, or sequence chart) embedded directly in the assignment where students record responses.',
  'word-bank':            'Provide a word bank of 8–12 key vocabulary terms students can reference when completing the assignment.',
  'sentence-starters':    'Include sentence starters or sentence frames at the beginning of each response section (e.g., "The main idea is... because...").',
  'preferential-seating': 'Note at the top of the assignment that this version is designed for small-group or teacher-proximity use.',
  'read-aloud':           'Use shorter sentences (10–12 words max), simple punctuation, and paragraph breaks every 2–3 sentences to support read-aloud delivery.',
  'chunking':             'Break all multi-part tasks into clearly labeled sub-steps using numbered or bulleted micro-instructions. Do not combine steps.',
}

// ─── Modality prompt fragments ────────────────────────────────────────────────
const MODALITY_INSTRUCTIONS = {
  'visual-supports':  'Where appropriate, describe or suggest simple visual supports inline (e.g., "[Draw or include a diagram here]", "[See the image below]"). Use formatting cues like boxes, arrows, or labeled spaces to guide visual learners.',
  'ell-frames':       'Embed ELL-specific language scaffolds throughout: sentence frames for each response, key vocabulary with simple definitions in parentheses on first use, and bilingual cue words where natural.',
  'exec-chunking':    'Apply executive function supports: include a "Steps to Complete" checklist at the top, number every sub-task, and add brief transition phrases between sections (e.g., "Now that you have finished Part 1, move on to Part 2.").',
  'iep-simplify':     'Simplify all syntax to short, direct sentences. Use active voice only. Replace multi-syllable words with simpler synonyms where meaning is preserved. Avoid figurative language, idioms, or ambiguous pronouns.',
}

// ─── Tier definitions ─────────────────────────────────────────────────────────
const TIER_DEFINITIONS = {
  below: `
📘 TIER 1 — APPROACHING GRADE LEVEL:
- Reduce reading level by 1–2 grades using simpler syntax and vocabulary
- Break complex multi-part tasks into discrete, numbered micro-steps
- Use concrete, familiar examples and real-world connections
- Fewer total items — prioritize depth on core concepts over breadth
- Same learning objective as all other tiers — scaffold ACCESS, not expectations
- Apply all accommodation and modality instructions listed above`,

  on: `
📗 TIER 2 — ON GRADE LEVEL:
- Grade-appropriate vocabulary, complexity, and sentence structure
- Standard expectations aligned to grade-level standards
- Clear, direct instructions with no unnecessary scaffolding
- Mirrors the intent and structure of the original assignment with refinements
- Same learning objective as all other tiers`,

  above: `
📕 TIER 3 — ABOVE GRADE LEVEL:
- Extend with higher-order thinking: analysis, synthesis, evaluation, creation (Bloom's top tiers)
- Add open-ended questions requiring students to defend a position with evidence
- Include real-world application, cross-curricular connections, or independent research prompts
- Do NOT simply add more of the same work — increase DEPTH and COMPLEXITY
- Same learning objective as all other tiers — extend BEYOND, not around`,
}

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      assignmentType,
      originalAssignment,
      learningObjective,
      additionalNotes,
      generateBelow,
      generateOn,
      generateAbove,
      // New fields
      accommodations     = [],
      modalities         = [],
      enableTranslation  = false,
      targetLanguage     = null,
      culturalAdaptation = false,
    } = await request.json();

    // ── Validation ──────────────────────────────────────────────────────────
    if (!originalAssignment) {
      return Response.json({ error: "Please provide the original assignment" }, { status: 400 });
    }

    const tiersToGenerate = [
      generateBelow && 'below',
      generateOn    && 'on',
      generateAbove && 'above',
    ].filter(Boolean);

    if (tiersToGenerate.length === 0) {
      return Response.json({ error: "Please select at least one tier to generate" }, { status: 400 });
    }

    // ── Build accommodation block ────────────────────────────────────────────
    const accommodationBlock = accommodations.length > 0
      ? `**IEP / 504 ACCOMMODATIONS — Apply these to the Approaching tier:**\n${accommodations
          .map(id => ACCOMMODATION_INSTRUCTIONS[id])
          .filter(Boolean)
          .map((instr, i) => `${i + 1}. ${instr}`)
          .join('\n')}`
      : ''

    // ── Build modality block ─────────────────────────────────────────────────
    const modalityBlock = modalities.length > 0
      ? `**MODALITY SCAFFOLDING — Apply these across all tiers where appropriate:**\n${modalities
          .map(id => MODALITY_INSTRUCTIONS[id])
          .filter(Boolean)
          .map((instr, i) => `${i + 1}. ${instr}`)
          .join('\n')}`
      : ''

    // ── Build translation block ──────────────────────────────────────────────
    const translationBlock = enableTranslation && targetLanguage
      ? `**LANGUAGE & CULTURAL ADAPTATION:**
- Generate ALL tier outputs in ${targetLanguage}.
${culturalAdaptation
  ? `- Apply full cultural adaptation: replace names, examples, settings, and cultural references with ones that are authentic and relevant to ${targetLanguage}-speaking communities. This is NOT a literal translation — rewrite for cultural resonance while preserving the learning objective.`
  : `- Provide an accurate, natural-sounding translation. Preserve educational terminology appropriately for ${targetLanguage}-speaking classrooms.`
}`
      : ''

    // ── Build tier definitions block ─────────────────────────────────────────
    const tierBlock = tiersToGenerate.map(t => TIER_DEFINITIONS[t]).join('\n')

    // ── Build JSON shape instruction ─────────────────────────────────────────
    const jsonShape = `{
  ${generateBelow ? '"below": "FULL APPROACHING-LEVEL ASSIGNMENT TEXT",' : ''}
  ${generateOn    ? '"on":    "FULL ON-GRADE-LEVEL ASSIGNMENT TEXT",'    : ''}
  ${generateAbove ? '"above": "FULL ABOVE-LEVEL ASSIGNMENT TEXT"'        : ''}
}`

    // ── Assemble final prompt ────────────────────────────────────────────────
    const prompt = `You are an expert instructional designer specializing in differentiated instruction, universal design for learning (UDL), and evidence-based accommodation practices. Create ${tiersToGenerate.length} tiered version(s) of the assignment below.

**ASSIGNMENT DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Assignment Type: ${assignmentType}
${learningObjective  ? `- Learning Objective: ${learningObjective}`  : ''}
${additionalNotes    ? `- Additional Context: ${additionalNotes}`    : ''}

**ORIGINAL ASSIGNMENT:**
${originalAssignment}

${accommodationBlock ? `${accommodationBlock}\n` : ''}
${modalityBlock      ? `${modalityBlock}\n`      : ''}
${translationBlock   ? `${translationBlock}\n`   : ''}

**TIERS TO GENERATE:**
${tierBlock}

**NON-NEGOTIABLE GUIDELINES:**
1. ALL tiers must target the EXACT SAME learning objective — do not change what students are learning, only how they access it.
2. Approaching tier: scaffold ACCESS, never lower expectations.
3. Above tier: increase DEPTH and complexity, do not simply assign more items.
4. Every tier must be a complete, print-ready assignment — no placeholders, no "add your own questions here."
5. Maintain the same general structural format across tiers so teachers can distribute without revealing ability groupings.
6. If accommodation or modality instructions conflict with each other, prioritize the one that most reduces barriers to access.
${enableTranslation ? `7. Output ALL tiers in ${targetLanguage} — do not include any English text in the tier content.` : ''}

**RESPOND IN THIS EXACT JSON FORMAT (no other text, no markdown fences):**
${jsonShape}`;

    // ── API call ─────────────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000, // increased from 4000 to handle richer outputs
      system: "You are a JSON API that generates differentiated classroom assignments. Return ONLY a valid JSON object. No markdown, no preamble, no explanation.",
      messages: [{ role: "user", content: prompt }],
    });

    // ── Parse response ────────────────────────────────────────────────────────
    let responseText = message.content[0].text.trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) responseText = jsonMatch[0]

    try {
      const tiers = JSON.parse(responseText)
      return Response.json({ tiers })
    } catch (parseError) {
      console.error("JSON parse failed:", responseText)
      return Response.json({
        tiers: {
          below: generateBelow ? "Error generating this tier. Please try again." : null,
          on:    generateOn    ? originalAssignment                              : null,
          above: generateAbove ? "Error generating this tier. Please try again." : null,
        }
      })
    }

  } catch (error) {
    console.error("Differentiation API error:", error)
    return Response.json(
      { error: "Failed to generate differentiated assignments" },
      { status: 500 }
    )
  }
}