import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatStandards = (standards) =>
  standards.map(s => `- ${s.code}: ${s.description}${s.state ? ` (${s.state})` : ''}`).join('\n')

const frameworkLabel = (fw) => ({
  ccss:  'Common Core State Standards (CCSS)',
  casel: 'CASEL SEL Competencies',
  ngss:  'Next Generation Science Standards (NGSS)',
  state: 'State Standards',
}[fw] || fw)

// ─── Mode Prompts ─────────────────────────────────────────────────────────────

const buildTagPrompt = ({ selectedStandards, pastedContent, contentType, gradeLevel }) => `
You are an expert curriculum alignment specialist. Analyze the provided educational content and determine how well it aligns to the given standards.

**CONTENT TO ANALYZE:**
Type: ${contentType}
Grade Level: ${gradeLevel}

${pastedContent}

**STANDARDS TO CHECK AGAINST:**
${formatStandards(selectedStandards)}

**YOUR TASK:**
1. Identify which standards are clearly addressed in this content
2. Identify which standards are partially addressed or implied
3. Identify which standards are not addressed
4. Add inline standard tags [e.g., CCSS.RI.5.3 ✓] at relevant points in the content
5. Provide a brief alignment analysis at the end

**OUTPUT FORMAT (JSON):**
{
  "taggedContent": "The full original content with inline [STANDARD.CODE ✓] tags added at relevant points, followed by an ALIGNMENT ANALYSIS section at the bottom",
  "matchedStandards": ["list", "of", "standard", "codes", "clearly", "addressed"],
  "partialStandards": ["standards", "partially", "addressed"],
  "gapStandards": ["standards", "not", "addressed"],
  "alignmentScore": "Strong / Moderate / Developing — one word + one sentence rationale",
  "standardsApplied": ${selectedStandards.length}
}

Return ONLY valid JSON. No markdown fences.`

const buildGeneratePrompt = ({ selectedStandards, generateType, generateGrade, generateNotes }) => `
You are an expert instructional designer. Generate a complete, print-ready ${generateType} that directly and explicitly addresses the following standards.

**TARGET STANDARDS:**
${formatStandards(selectedStandards)}

**SETTINGS:**
- Content Type: ${generateType}
- Grade Level: ${generateGrade}
${generateNotes ? `- Additional Context: ${generateNotes}` : ''}

**REQUIREMENTS:**
1. The content must EXPLICITLY address every selected standard — not just loosely relate to it
2. Include a Standards Alignment header at the top listing each standard with a one-line explanation of how the content addresses it
3. Content must be complete and print-ready — no placeholders
4. Match the format, rigor, and vocabulary appropriate for grade ${generateGrade}
5. For CASEL standards: embed SEL language, reflection prompts, and skill practice naturally throughout
6. For NGSS standards: include science and engineering practices and crosscutting concepts where relevant
7. For CCSS: align question complexity and text demands to grade-level expectations

**OUTPUT FORMAT (JSON):**
{
  "generatedContent": "FULL COMPLETE ${generateType.toUpperCase()} with Standards Alignment header at top, then complete content body",
  "matchedStandards": ["every", "standard", "code", "addressed"],
  "alignmentScore": "Strong / Moderate / Developing — one word + one sentence rationale",
  "standardsApplied": ${selectedStandards.length}
}

Return ONLY valid JSON. No markdown fences.`

const buildReportPrompt = ({ selectedStandards, reportTitle, reportTool, reportNotes }) => {
  // Group standards by framework for cleaner report
  const byFramework = selectedStandards.reduce((acc, s) => {
    acc[s.framework] = acc[s.framework] || []
    acc[s.framework].push(s)
    return acc
  }, {})

  const frameworkSections = Object.entries(byFramework)
    .map(([fw, stds]) => `${frameworkLabel(fw)}:\n${formatStandards(stds)}`)
    .join('\n\n')

  return `
You are a curriculum alignment specialist writing a formal standards alignment report for school administrators and district leadership.

**REPORT DETAILS:**
- Title: ${reportTitle || 'Standards Alignment Report'}
- Tool / Curriculum: ${reportTool || 'Teacher AI Assistant'}
- Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
${reportNotes ? `- Reviewer Notes: ${reportNotes}` : ''}

**STANDARDS BEING REPORTED ON:**
${frameworkSections}

**GENERATE A FORMAL ALIGNMENT REPORT that includes:**

1. EXECUTIVE SUMMARY (2-3 sentences for administrators)
2. STANDARDS FRAMEWORK OVERVIEW — brief description of each framework included
3. DETAILED ALIGNMENT TABLE — for each standard:
   - Standard code and full description
   - How the tool/curriculum addresses it
   - Evidence indicators (what teachers/students do that demonstrates alignment)
   - Alignment strength: Strong / Moderate / Developing
4. CROSS-FRAMEWORK INTEGRATION — how the standards work together
5. IMPLEMENTATION RECOMMENDATIONS — 3-5 practical next steps for the district
6. CONCLUSION

**TONE:** Professional, formal, evidence-informed. Written for an administrator audience who needs to justify curriculum adoption to a school board.

**OUTPUT FORMAT (JSON):**
{
  "report": "FULL FORMATTED REPORT TEXT — use clear section headers, tables represented as formatted text, and professional language throughout",
  "matchedStandards": ["every", "standard", "code", "included"],
  "standardsApplied": ${selectedStandards.length},
  "alignmentScore": "Overall alignment rating with one sentence summary"
}

Return ONLY valid JSON. No markdown fences.`
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      mode,
      selectedStandards = [],
      // Tag mode
      pastedContent,
      contentType,
      gradeLevel,
      // Generate mode
      generateType,
      generateGrade,
      generateNotes,
      // Report mode
      reportTitle,
      reportTool,
      reportNotes,
    } = body

    // ── Validation ────────────────────────────────────────────────────────────
    if (!mode) return Response.json({ error: 'Mode is required' }, { status: 400 })

    if (mode === 'tag' && !pastedContent?.trim())
      return Response.json({ error: 'Please provide content to tag' }, { status: 400 })

    if (mode !== 'tag' && selectedStandards.length === 0)
      return Response.json({ error: 'Please select at least one standard' }, { status: 400 })

    // ── Build prompt ──────────────────────────────────────────────────────────
    const prompt =
      mode === 'tag'      ? buildTagPrompt({ selectedStandards, pastedContent, contentType, gradeLevel }) :
      mode === 'generate' ? buildGeneratePrompt({ selectedStandards, generateType, generateGrade, generateNotes }) :
      mode === 'report'   ? buildReportPrompt({ selectedStandards, reportTitle, reportTool, reportNotes }) :
      null

    if (!prompt) return Response.json({ error: 'Invalid mode' }, { status: 400 })

    // ── API call ──────────────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: mode === 'report' ? 6000 : 4000,
      system: 'You are a JSON API for educational standards alignment. Return ONLY valid JSON. No markdown, no preamble.',
      messages: [{ role: 'user', content: prompt }],
    })

    // ── Parse ─────────────────────────────────────────────────────────────────
    let raw = message.content[0].text.trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const match = raw.match(/\{[\s\S]*\}/)
    if (match) raw = match[0]

    try {
      const result = JSON.parse(raw)
      return Response.json(result)
    } catch (parseError) {
      console.error('Standards alignment parse error:', raw)
      return Response.json({ error: 'Failed to parse alignment result. Please try again.' }, { status: 500 })
    }

  } catch (error) {
    console.error('Standards alignment API error:', error)
    return Response.json({ error: 'Failed to process standards alignment' }, { status: 500 })
  }
}