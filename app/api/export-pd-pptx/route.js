export async function POST(request) {
  try {
    const { slideData } = await request.json()
    if (!slideData) return Response.json({ error: 'slideData is required' }, { status: 400 })

    const PptxGenJS = (await import('pptxgenjs')).default
    const pres = new PptxGenJS()
    pres.layout = 'LAYOUT_16x9'
    pres.title = slideData.title

    // Color palette — professional teal/navy for education
    const C = {
      navy:    '1B3A6B',
      teal:    '0D7377',
      tealMid: '14A085',
      mint:    'E8F6F3',
      white:   'FFFFFF',
      offWhite:'F7F9FC',
      charcoal:'2C3E50',
      gray:    '7F8C8D',
      lightGray:'ECF0F1',
      accent:  'F39C12',
    }

    const makeShadow = () => ({ type: 'outer', blur: 8, offset: 3, angle: 135, color: '000000', opacity: 0.12 })

    // ─── SLIDE BUILDERS ────────────────────────────────────────────

    function buildTitleSlide(slide, s) {
      // Dark navy background
      slide.background = { color: C.navy }

      // Teal accent bar left side
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 0.12, h: 5.625,
        fill: { color: C.teal }, line: { color: C.teal }
      })

      // Bottom accent strip
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 4.9, w: 10, h: 0.725,
        fill: { color: C.teal }, line: { color: C.teal }
      })

      // Category badge
      if (slideData.category) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.6, y: 0.55, w: 2.2, h: 0.35,
          fill: { color: C.tealMid }, line: { color: C.tealMid }, rectRadius: 0.05
        })
        slide.addText(slideData.category.toUpperCase(), {
          x: 0.6, y: 0.55, w: 2.2, h: 0.35,
          fontSize: 9, bold: true, color: C.white,
          align: 'center', valign: 'middle', margin: 0
        })
      }

      // Main title
      slide.addText(s.title || slideData.title, {
        x: 0.6, y: 1.1, w: 8.6, h: 2.2,
        fontSize: 38, bold: true, color: C.white,
        align: 'left', valign: 'middle',
        fontFace: 'Calibri'
      })

      // Subtitle
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.6, y: 3.3, w: 8, h: 0.6,
          fontSize: 16, color: 'A8C8E8',
          align: 'left', italic: true, fontFace: 'Calibri'
        })
      }

      // Bottom bar info
      slide.addText(`${slideData.audience}  |  ${slideData.duration}`, {
        x: 0.3, y: 4.95, w: 9.4, h: 0.55,
        fontSize: 11, color: C.white, align: 'left', valign: 'middle', margin: 0
      })
    }

    function buildAgendaSlide(slide, s) {
      slide.background = { color: C.offWhite }
      // Top header bar
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 10, h: 1.0,
        fill: { color: C.navy }, line: { color: C.navy }
      })
      slide.addText(s.title || "Today's Agenda", {
        x: 0.5, y: 0, w: 9, h: 1.0,
        fontSize: 26, bold: true, color: C.white,
        align: 'left', valign: 'middle', fontFace: 'Calibri', margin: 0
      })

      const items = s.items || []
      items.forEach((item, i) => {
        const y = 1.2 + (i * 0.65)
        // Number circle
        slide.addShape(pres.shapes.OVAL, {
          x: 0.5, y: y + 0.05, w: 0.45, h: 0.45,
          fill: { color: C.teal }, line: { color: C.teal }
        })
        slide.addText(String(i + 1), {
          x: 0.5, y: y + 0.05, w: 0.45, h: 0.45,
          fontSize: 14, bold: true, color: C.white,
          align: 'center', valign: 'middle', margin: 0
        })
        // Item text
        slide.addText(item, {
          x: 1.1, y: y, w: 8.4, h: 0.55,
          fontSize: 15, color: C.charcoal,
          align: 'left', valign: 'middle', fontFace: 'Calibri'
        })
        // Divider line
        if (i < items.length - 1) {
          slide.addShape(pres.shapes.LINE, {
            x: 1.1, y: y + 0.58, w: 8.4, h: 0,
            line: { color: C.lightGray, width: 1 }
          })
        }
      })
    }

    function buildObjectivesSlide(slide, s) {
      slide.background = { color: C.offWhite }
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 10, h: 1.0,
        fill: { color: C.teal }, line: { color: C.teal }
      })
      slide.addText(s.title || 'Learning Objectives', {
        x: 0.5, y: 0, w: 9, h: 1.0,
        fontSize: 26, bold: true, color: C.white,
        align: 'left', valign: 'middle', fontFace: 'Calibri', margin: 0
      })

      const items = s.items || []
      items.forEach((item, i) => {
        const y = 1.2 + (i * 0.9)
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.5, y: y, w: 9, h: 0.75,
          fill: { color: C.white }, line: { color: C.lightGray, width: 1 },
          shadow: makeShadow()
        })
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.5, y: y, w: 0.08, h: 0.75,
          fill: { color: C.tealMid }, line: { color: C.tealMid }
        })
        slide.addText(item, {
          x: 0.75, y: y, w: 8.5, h: 0.75,
          fontSize: 13, color: C.charcoal,
          align: 'left', valign: 'middle', fontFace: 'Calibri'
        })
      })
    }

    function buildContentSlide(slide, s) {
      slide.background = { color: C.offWhite }
      // Header
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 10, h: 0.9,
        fill: { color: C.navy }, line: { color: C.navy }
      })
      slide.addText(s.title, {
        x: 0.5, y: 0, w: 9, h: 0.9,
        fontSize: 24, bold: true, color: C.white,
        align: 'left', valign: 'middle', fontFace: 'Calibri', margin: 0
      })

      // Stat callout (right column) if present
      const hasStatCol = !!s.stat
      const contentW = hasStatCol ? 6.2 : 9.0

      // Bullets
      if (s.bullets && s.bullets.length > 0) {
        const bulletItems = s.bullets.map((b, i) => ({
          text: b,
          options: { bullet: true, breakLine: i < s.bullets.length - 1, fontSize: 14, color: C.charcoal, paraSpaceAfter: 6 }
        }))
        slide.addText(bulletItems, {
          x: 0.5, y: 1.05, w: contentW, h: 4.2,
          fontFace: 'Calibri', valign: 'top'
        })
      }

      // Stat card
      if (s.stat) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 7.1, y: 1.05, w: 2.4, h: 4.2,
          fill: { color: C.navy }, line: { color: C.navy },
          shadow: makeShadow()
        })
        slide.addText(s.stat, {
          x: 7.1, y: 1.05, w: 2.4, h: 4.2,
          fontSize: 13, color: C.white, align: 'center', valign: 'middle',
          fontFace: 'Calibri', italic: true
        })
      }
    }

    function buildActivitySlide(slide, s) {
      slide.background = { color: C.mint }
      // Header with activity type
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 10, h: 1.0,
        fill: { color: C.tealMid }, line: { color: C.tealMid }
      })
      slide.addText(`✦ ${s.activity_type || 'Activity'}`, {
        x: 0.5, y: 0, w: 4, h: 0.5,
        fontSize: 11, bold: true, color: C.white,
        align: 'left', valign: 'middle', margin: 0
      })
      slide.addText(s.title, {
        x: 0.5, y: 0.45, w: 8, h: 0.55,
        fontSize: 22, bold: true, color: C.white,
        align: 'left', valign: 'middle', fontFace: 'Calibri', margin: 0
      })
      // Time badge
      if (s.time_estimate) {
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 7.8, y: 0.1, w: 1.7, h: 0.38,
          fill: { color: C.accent }, line: { color: C.accent }
        })
        slide.addText(`⏱ ${s.time_estimate}`, {
          x: 7.8, y: 0.1, w: 1.7, h: 0.38,
          fontSize: 10, bold: true, color: C.white,
          align: 'center', valign: 'middle', margin: 0
        })
      }

      // Prompt box
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0.5, y: 1.15, w: 9, h: 1.1,
        fill: { color: C.white }, line: { color: C.teal, width: 2 },
        shadow: makeShadow()
      })
      slide.addText(s.prompt || '', {
        x: 0.5, y: 1.15, w: 9, h: 1.1,
        fontSize: 15, bold: true, color: C.navy,
        align: 'center', valign: 'middle', fontFace: 'Calibri', italic: true
      })

      // Instructions
      if (s.instructions && s.instructions.length > 0) {
        slide.addText('Instructions:', {
          x: 0.5, y: 2.45, w: 9, h: 0.35,
          fontSize: 13, bold: true, color: C.teal, align: 'left', margin: 0
        })
        const instrItems = s.instructions.map((inst, i) => ({
          text: inst,
          options: { bullet: { type: 'number' }, breakLine: i < s.instructions.length - 1, fontSize: 13, color: C.charcoal, paraSpaceAfter: 4 }
        }))
        slide.addText(instrItems, {
          x: 0.5, y: 2.85, w: 9, h: 2.4,
          fontFace: 'Calibri', valign: 'top'
        })
      }
    }

    function buildResourcesSlide(slide, s) {
      slide.background = { color: C.offWhite }
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 10, h: 1.0,
        fill: { color: C.navy }, line: { color: C.navy }
      })
      slide.addText(s.title || 'Resources & Further Learning', {
        x: 0.5, y: 0, w: 9, h: 1.0,
        fontSize: 26, bold: true, color: C.white,
        align: 'left', valign: 'middle', fontFace: 'Calibri', margin: 0
      })

      const items = s.items || []
      const cols = items.length > 4 ? 2 : 1
      const colW = cols === 2 ? 4.5 : 9

      items.forEach((item, i) => {
        const col = cols === 2 ? i % 2 : 0
        const row = cols === 2 ? Math.floor(i / 2) : i
        const x = 0.5 + (col * 5.0)
        const y = 1.15 + (row * 1.1)

        slide.addShape(pres.shapes.RECTANGLE, {
          x, y, w: colW, h: 0.9,
          fill: { color: C.white }, line: { color: C.lightGray },
          shadow: makeShadow()
        })
        slide.addShape(pres.shapes.RECTANGLE, {
          x, y, w: 0.07, h: 0.9,
          fill: { color: C.accent }, line: { color: C.accent }
        })
        slide.addText(item.label || item, {
          x: x + 0.2, y, w: colW - 0.25, h: 0.38,
          fontSize: 13, bold: true, color: C.navy,
          align: 'left', valign: 'bottom', fontFace: 'Calibri'
        })
        if (item.description) {
          slide.addText(item.description, {
            x: x + 0.2, y: y + 0.38, w: colW - 0.25, h: 0.45,
            fontSize: 11, color: C.gray,
            align: 'left', valign: 'top', fontFace: 'Calibri'
          })
        }
      })
    }

    function buildActionStepsSlide(slide, s) {
      slide.background = { color: C.navy }
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 0, y: 0, w: 10, h: 1.0,
        fill: { color: C.teal }, line: { color: C.teal }
      })
      slide.addText(s.title || 'Action Steps', {
        x: 0.5, y: 0, w: 9, h: 1.0,
        fontSize: 26, bold: true, color: C.white,
        align: 'left', valign: 'middle', fontFace: 'Calibri', margin: 0
      })

      const items = s.items || []
      items.forEach((item, i) => {
        const y = 1.15 + (i * 0.75)
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.5, y, w: 8.5, h: 0.6,
          fill: { color: '1E4C8F' }, line: { color: '1E4C8F' }
        })
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.5, y, w: 0.5, h: 0.6,
          fill: { color: C.accent }, line: { color: C.accent }
        })
        slide.addText(String(i + 1), {
          x: 0.5, y, w: 0.5, h: 0.6,
          fontSize: 16, bold: true, color: C.white,
          align: 'center', valign: 'middle', margin: 0
        })
        slide.addText(item, {
          x: 1.1, y, w: 7.7, h: 0.6,
          fontSize: 13, color: C.white,
          align: 'left', valign: 'middle', fontFace: 'Calibri'
        })
      })

      // Reflection prompt
      if (s.reflection_prompt) {
        const reflY = 1.15 + (items.length * 0.75) + 0.15
        slide.addShape(pres.shapes.RECTANGLE, {
          x: 0.5, y: reflY, w: 9, h: 0.9,
          fill: { color: C.tealMid }, line: { color: C.tealMid }
        })
        slide.addText(`💭  ${s.reflection_prompt}`, {
          x: 0.5, y: reflY, w: 9, h: 0.9,
          fontSize: 13, color: C.white, italic: true,
          align: 'center', valign: 'middle', fontFace: 'Calibri'
        })
      }
    }

    // ─── BUILD ALL SLIDES ───────────────────────────────────────────
    const slides = slideData.slides || []

    for (const s of slides) {
      const slide = pres.addSlide()
      switch (s.type) {
        case 'title':       buildTitleSlide(slide, s); break
        case 'agenda':      buildAgendaSlide(slide, s); break
        case 'objectives':  buildObjectivesSlide(slide, s); break
        case 'activity':    buildActivitySlide(slide, s); break
        case 'resources':   buildResourcesSlide(slide, s); break
        case 'action_steps': buildActionStepsSlide(slide, s); break
        default:            buildContentSlide(slide, s); break
      }

      // Add presenter notes
      if (s.presenter_notes) {
        slide.addNotes(s.presenter_notes)
      }
    }

    // ─── EXPORT ────────────────────────────────────────────────────
    const buffer = await pres.write({ outputType: 'nodebuffer' })

    const fileName = (slideData.title || 'PD_Presentation').replace(/[^a-z0-9]/gi, '_')

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${fileName}.pptx"`,
      },
    })

  } catch (error) {
    console.error('=== PPTX EXPORT ERROR ===', error?.message)
    return Response.json({ error: error?.message || 'Failed to generate PPTX' }, { status: 500 })
  }
}