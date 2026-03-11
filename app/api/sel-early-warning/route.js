import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Crisis keyword detection (pre-LLM gate) ──────────────────────────────────
const CRISIS_KEYWORDS = [
  'hurt myself', 'hurt myself', 'kill', 'die', 'suicide', 'suicidal',
  'end it', 'not safe', 'unsafe at home', 'being hurt', 'someone hurts me',
  'want to disappear', 'nobody cares', 'no reason to live',
]

const detectCrisisLanguage = (text = '') => {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw))
}

// ─── Tier classification logic ────────────────────────────────────────────────
const classifyTier = (student) => {
  const {
    avg_mood_score, low_mood_last_7_days, tier2_flag_count,
    crisis_flag_count, total_checkins,
  } = student

  if (crisis_flag_count > 0)                          return 3
  if (avg_mood_score <= 1.5)                          return 3
  if (low_mood_last_7_days >= 4)                      return 3
  if (avg_mood_score <= 2.5 && low_mood_last_7_days >= 2) return 2
  if (tier2_flag_count >= 2)                          return 2
  if (avg_mood_score <= 2 && total_checkins >= 3)     return 2
  return 1
}

// ─── Analyze action ───────────────────────────────────────────────────────────
async function handleAnalyze({ classLabel, gradeLevel, trendData }) {
  // Pre-classify each student
  const classified = trendData.map(student => ({
    ...student,
    tier: classifyTier(student),
  }))

  const tier2Students = classified.filter(s => s.tier === 2)
  const tier3Students = classified.filter(s => s.tier === 3)
  const tier1Students = classified.filter(s => s.tier === 1)

  const summaryData = classified.map(s =>
    `${s.student_placeholder}: avg_mood=${s.avg_mood_score}, low_days_7d=${s.low_mood_last_7_days}, total=${s.total_checkins}, tier=${s.tier}${s.crisis_flag_count > 0 ? ' [CRISIS FLAG]' : ''}`
  ).join('\n')

  const prompt = `You are a school counselor reviewing anonymized SEL check-in trend data for a class. Provide a clinical, actionable summary.

**CLASS:** ${classLabel}
**GRADE:** ${gradeLevel}
**DATE:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

**TREND DATA (anonymized):**
${summaryData}

**TIER SUMMARY:**
- Tier 1 (Universal): ${tier1Students.length} students
- Tier 2 (Targeted — needs review): ${tier2Students.length} students
- Tier 3 (Intensive — urgent): ${tier3Students.length} students

**YOUR TASK:**
Write a concise clinical summary (4–6 sentences) for the teacher/counselor that:
1. Describes the overall class emotional climate
2. Notes any patterns across the class (not individual students — use aggregate language)
3. Flags the number requiring Tier 2 and Tier 3 review
4. Recommends 2–3 Tier 1 whole-class SEL strategies appropriate for ${gradeLevel}
5. Reminds the educator to follow school/district protocol for any Tier 3 or crisis-flagged students

IMPORTANT: Do NOT identify individual students by name or placeholder. Use aggregate language only in this summary. Keep tone professional and trauma-informed.

Return ONLY the summary text, no JSON, no headers.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: 'You are a school counselor writing a clinical SEL trend summary. Be concise, professional, and trauma-informed.',
    messages: [{ role: 'user', content: prompt }],
  })

  return Response.json({
    flags:      classified.map(s => ({ placeholder: s.student_placeholder, tier: s.tier, crisisFlag: s.crisis_flag_count > 0 })),
    summary:    message.content[0].text,
    tier2Count: tier2Students.length,
    tier3Count: tier3Students.length,
    tier1Count: tier1Students.length,
  })
}

// ─── Referral note action ─────────────────────────────────────────────────────
async function handleReferral({ student, history, gradeLevel, classLabel }) {
  // Pre-check for crisis language in history
  const hasCrisisLanguage = history.some(r => detectCrisisLanguage(r.response_text))
  const tier = classifyTier(student)

  // Build history summary
  const historySummary = history.length > 0
    ? history.map(r =>
        `${r.checkin_date}: mood=${r.mood_score}/5${r.zone_of_regulation ? `, zone=${r.zone_of_regulation}` : ''}${r.response_text ? `, note="${r.response_text}"` : ''}`
      ).join('\n')
    : 'No prior check-in history available.'

  const prompt = `You are a school counselor writing a formal referral note to a colleague. Generate a complete, professional counselor referral note based on anonymized SEL check-in data.

**STUDENT:** [Student Placeholder: ${student.student_placeholder}]
**CLASS:** ${classLabel}
**GRADE LEVEL:** ${gradeLevel}
**DATE:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
**TIER FLAG:** ${tier === 3 ? 'Tier 3 — Intensive/Urgent' : 'Tier 2 — Targeted Review'}
${hasCrisisLanguage ? '**⚠️ CRISIS LANGUAGE DETECTED IN CHECK-IN RESPONSES**' : ''}

**CHECK-IN HISTORY (last 10 entries):**
${historySummary}

**TREND SUMMARY:**
- Average mood score: ${student.avg_mood_score}/5
- Total check-ins on record: ${student.total_checkins}
- Low mood days in last 7 days: ${student.low_mood_last_7_days}
- Prior Tier 2 flags: ${student.tier2_flag_count}

**GENERATE A FORMAL REFERRAL NOTE that includes:**

1. REFERRAL HEADER (Date, Student Placeholder, Class, Grade, Referring Educator placeholder)
2. REASON FOR REFERRAL (1–2 sentences, objective behavioral/observational language only)
3. OBSERVED PATTERN SUMMARY (3–5 sentences describing the trend data — no clinical diagnosis, no speculation about cause)
4. SPECIFIC CHECK-IN DATA CITED (reference dates and scores without identifying the student)
5. RECOMMENDED NEXT STEPS (2–3 specific actions for the counselor)
6. URGENCY LEVEL: ${tier === 3 ? 'URGENT — follow crisis protocol if applicable' : 'Routine — schedule within 3–5 school days'}
${hasCrisisLanguage ? '7. ⚠️ CRISIS PROTOCOL REMINDER: Crisis language was detected. Educator should follow school/district crisis protocol immediately. This document does not replace crisis assessment by a qualified professional.' : ''}

**TONE:** Professional, objective, strengths-based where possible. No diagnostic language. No speculation about home environment or family. FERPA-compliant — no real names.

Write the complete referral note now.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: 'You are a school counselor writing formal, FERPA-compliant referral documentation. Be objective, professional, and trauma-informed. Never diagnose. Never speculate about causes without evidence. Always remind educators to follow crisis protocol when crisis language is present.',
    messages: [{ role: 'user', content: prompt }],
  })

  return Response.json({
    referralNote:      message.content[0].text,
    hasCrisisLanguage,
    tier,
  })
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) return Response.json({ error: 'Action is required' }, { status: 400 })

    if (action === 'analyze') return handleAnalyze(body)
    if (action === 'referral') return handleReferral(body)

    return Response.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('SEL Early Warning API error:', error)
    return Response.json({ error: 'Failed to process early warning request' }, { status: 500 })
  }
}