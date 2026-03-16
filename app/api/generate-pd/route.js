import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      userId,
      title,
      category,
      audience,
      duration,
      objectives,
      outputMode,
    } = body

    if (!title || !category || !audience || !duration) {
      return Response.json({ error: 'Title, category, audience, and duration are required' }, { status: 400 })
    }

    const systemPrompt = `You are a senior professional development designer and educational researcher with expertise in adult learning theory, cognitive science, and evidence-based instructional design. You hold deep knowledge of:

- CASEL's 5 SEL competencies and implementation frameworks
- PBIS (Positive Behavioral Interventions and Supports) tiered systems
- Trauma-informed practices (SAMHSA, Cole et al., 2005; Perry, 2006)
- Responsive Classroom and Restorative Practices frameworks
- Universal Design for Learning (CAST, 2018)
- Culturally Responsive Teaching (Hammond, 2015; Gay, 2010)
- Visible Learning research (Hattie, 2009) and effect sizes
- Zones of Regulation (Kuypers, 2011)
- Adverse Childhood Experiences research (Felitti et al., 1998)
- Second Step, RULER, and other evidence-based SEL curricula
- Data-driven instruction frameworks (Bambrick-Santoyo)
- Instructional coaching models (Knight, Aguilar)

CRITICAL REQUIREMENTS:
1. Every content slide MUST include specific research citations (Author, Year format) or reference named frameworks
2. Every single slide MUST have detailed, substantive presenter notes (minimum 3-4 sentences) with facilitation guidance, discussion prompts, and implementation tips
3. The resources slide MUST include 4-6 real, specific resources (actual books, websites, frameworks — not generic placeholders)
4. Learning objectives MUST be specific, measurable, and written in Bloom's taxonomy action verb format
5. Activity slides must include specific protocols with timing, grouping strategies, and debrief questions
6. Content must be calibrated for the specified audience — professionals, not beginners
7. Statistics and research findings must be specific and attributed (e.g., "Research by Durlak et al. (2011) found that SEL programs improved academic achievement by 11 percentile points")

NEVER generate empty arrays, placeholder text, or generic content. If you don't have specific information, generate the most evidence-based, professionally appropriate content possible.

Always respond with valid JSON only. No markdown, no preamble, no explanation outside the JSON.`

    const durationSlideCount = {
      '30 minutes': { min: 8, max: 10, content: 3, activity: 1 },
      '45 minutes': { min: 10, max: 12, content: 4, activity: 2 },
      '1 hour': { min: 12, max: 15, content: 5, activity: 2 },
      '90 minutes': { min: 16, max: 20, content: 7, activity: 3 },
      'Half day': { min: 22, max: 28, content: 10, activity: 5 },
    }
    const counts = durationSlideCount[duration] || durationSlideCount['1 hour']

    const userPrompt = `Create a comprehensive, research-grounded professional development presentation with these specifications:

Title: ${title}
Topic Category: ${category}
Audience: ${audience}
Duration: ${duration}
Learning Objectives Provided: ${objectives || 'None — generate 3 specific, measurable objectives using Bloom\'s taxonomy action verbs'}
Output Mode: ${outputMode === 'draft' ? 'Detailed with extensive facilitation notes' : 'Complete, polished, ready to present'}

SLIDE COUNT REQUIREMENT: Generate exactly ${counts.min}-${counts.max} total slides, including:
- 1 title slide
- 1 agenda slide  
- 1 learning objectives slide (REQUIRED — never empty)
- ${counts.content} content slides with research citations
- ${counts.activity} activity slides with specific protocols
- 1 resources slide (REQUIRED — include 4-6 real, specific resources)
- 1 action steps slide

SPEAKER NOTES REQUIREMENT: Every single slide must have presenter_notes with:
- What to say/emphasize on this slide (2-3 sentences)
- A discussion question or prompt for the audience
- A facilitation tip or transition to next slide

Generate a JSON object with this EXACT structure — all fields required, no empty arrays:

{
  "title": "exact presentation title",
  "subtitle": "compelling one-line subtitle that frames the value of this PD",
  "audience": "${audience}",
  "duration": "${duration}",
  "category": "${category}",
  "objectives": [
    "Participants will VERB specific measurable outcome 1",
    "Participants will VERB specific measurable outcome 2", 
    "Participants will VERB specific measurable outcome 3"
  ],
  "slides": [
    {
      "type": "title",
      "title": "presentation title",
      "subtitle": "subtitle",
      "presenter_notes": "Welcome participants and introduce yourself. Share why this topic matters by citing a compelling statistic or personal connection. Ask participants to briefly share with a neighbor: what brings them to this PD today and what they hope to take away."
    },
    {
      "type": "agenda",
      "title": "Today's Agenda",
      "items": ["Opening & Objectives (X min)", "Section 1 title (X min)", "Activity: Name (X min)", "Section 2 title (X min)", "Resources & Action Steps (X min)"],
      "presenter_notes": "Walk through the agenda. Note the balance of direct instruction and application. Acknowledge participants' time and commit to starting and ending on schedule. Mention that resources will be shared at the end."
    },
    {
      "type": "objectives",
      "title": "Learning Objectives",
      "items": [
        "By the end of this session, participants will be able to VERB outcome 1",
        "By the end of this session, participants will be able to VERB outcome 2",
        "By the end of this session, participants will be able to VERB outcome 3"
      ],
      "presenter_notes": "Read through objectives with participants. Explain how these connect to their daily practice. Ask: Which of these objectives is most relevant to a challenge you're currently facing? This activates prior knowledge and creates personal relevance."
    },
    {
      "type": "content",
      "title": "Specific slide title",
      "heading": "optional section heading if this starts a new section",
      "bullets": [
        "Specific research-backed point with attribution (Author, Year)",
        "Concrete, actionable point relevant to the audience",
        "Data point or statistic with source",
        "Implication for practice"
      ],
      "stat": "KEY STAT: Specific number or finding (Source, Year)",
      "presenter_notes": "Explain the key concept and why it matters. Reference: [specific researcher or framework]. Discussion question: [specific prompt]. Transition: [how this connects to next slide]."
    },
    {
      "type": "activity",
      "title": "Activity: Specific Name",
      "activity_type": "Think-Pair-Share | Discussion | Reflection | Small Group | Gallery Walk | Case Study | Jigsaw",
      "prompt": "Specific, thought-provoking question or scenario relevant to this topic and audience",
      "instructions": [
        "Step 1 with specific timing (e.g., 'Individually reflect for 2 minutes...')",
        "Step 2 with grouping (e.g., 'Turn to a partner and share...')",
        "Step 3 with debrief (e.g., 'We will hear 3-4 responses from the large group...')"
      ],
      "time_estimate": "X minutes",
      "presenter_notes": "Purpose of this activity: [why this activity at this point]. Facilitation tip: [specific guidance]. Debrief by asking: [specific question]. Connect back to research by noting: [connection]."
    },
    {
      "type": "resources",
      "title": "Resources & Further Learning",
      "items": [
        {
          "label": "Specific Book Title — Author (Year)",
          "description": "One sentence explaining relevance to this topic and where to get it"
        },
        {
          "label": "Specific Website or Organization Name",
          "description": "URL and what specific resources are available there"
        },
        {
          "label": "Specific Research Article or Framework",
          "description": "Citation and why it's foundational to this topic"
        },
        {
          "label": "Specific Tool, Protocol, or Curriculum",
          "description": "What it is and how educators can access or implement it"
        }
      ],
      "presenter_notes": "Walk through resources briefly — don't read each one. Highlight the 1-2 you most recommend as starting points. Mention that these will be shared digitally. Ask: Which of these resources would be most useful in your context right now?"
    },
    {
      "type": "action_steps",
      "title": "Your Action Steps",
      "items": [
        "Specific, concrete action participants can take THIS WEEK",
        "Specific action for THIS MONTH",
        "Specific longer-term implementation step (30-90 days)"
      ],
      "reflection_prompt": "What is ONE specific strategy from today that you will implement in your practice? Share with a colleague for accountability.",
      "presenter_notes": "Give participants 2-3 minutes to write down their personal action step. Emphasize the importance of accountability partners. Remind them of available resources. Thank participants specifically for their engagement and close with an affirming message about the importance of their work."
    }
  ]
}

CRITICAL: Generate ALL slides needed for ${duration}. Include ${counts.content} substantive content slides and ${counts.activity} activity slides between the objectives and resources slides. Every content slide must have specific research citations. Every slide must have detailed presenter_notes. The resources slide must have exactly 4-6 real, specific items. Do NOT leave any arrays empty.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 12000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content[0].text.trim()
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
    const slideData = JSON.parse(cleanJson)

    // Validate and fix any empty arrays
    if (!slideData.objectives || slideData.objectives.length === 0) {
      slideData.objectives = [
        `Participants will identify key evidence-based strategies related to ${title}`,
        `Participants will analyze the research foundation supporting ${category} practices`,
        `Participants will develop an action plan for implementing at least one strategy from this session`,
      ]
    }

    // Ensure every slide has presenter notes
    slideData.slides = slideData.slides.map(slide => ({
      ...slide,
      presenter_notes: slide.presenter_notes || `Present the content on this slide clearly and invite participant reactions. Ask: "What connections do you make between this content and your current practice?" Allow 1-2 minutes for responses before moving on.`
    }))

    // Fix any resources slide with empty items
    slideData.slides = slideData.slides.map(slide => {
      if (slide.type === 'resources' && (!slide.items || slide.items.length === 0)) {
        slide.items = [
          { label: 'CASEL.org — Collaborative for Academic, Social, and Emotional Learning', description: 'Free implementation guides, research briefs, and evidence-based program reviews at casel.org' },
          { label: `The Trauma-Sensitive School — Souers & Hall (2016)`, description: 'Practical strategies for creating trauma-informed learning environments. Available through Solution Tree Press.' },
          { label: 'Culturally Responsive Teaching & The Brain — Hammond (2015)', description: 'Research-based framework for equity-focused instruction. Corwin Press.' },
          { label: 'PBIS.org — Technical Assistance Center', description: 'Free Tier 1-3 implementation tools, fidelity measures, and training resources at pbis.org' },
        ]
      }
      return slide
    })

    // Save to documents
    if (userId) {
      await supabase.from('documents').insert({
        teacher_id: userId,
        title: `PD: ${slideData.title}`,
        doc_type: 'pd-generator',
        tool_type: 'pd-generator',
        tool_name: 'PD Generator',
        content: JSON.stringify(slideData),
        metadata: { category, audience, duration, outputMode },
      })
    }

    return Response.json({ slideData })

  } catch (error) {
    console.error('=== PD GENERATOR ERROR ===', error?.message)
    return Response.json({ error: error?.message || 'Failed to generate presentation' }, { status: 500 })
  }
}