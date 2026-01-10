// Save as: app/api/export-rubric-table/route.js

import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, ShadingType, VerticalAlign, HeadingLevel } from 'docx'

export async function POST(request) {
  try {
    const { rubricContent, assignmentType, gradeLevel, subject, pointScale } = await request.json()

    if (!rubricContent) {
      return NextResponse.json({ error: 'No rubric content provided' }, { status: 400 })
    }

    // Parse the rubric content to extract criteria and levels
    const parsedRubric = parseRubricContent(rubricContent, pointScale)
    
    // Create the document with tables
    const doc = createRubricDocument(parsedRubric, assignmentType, gradeLevel, subject, pointScale)

    // Generate the .docx file
    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Rubric_Table_${assignmentType.replace(/\s+/g, '_')}.docx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export rubric table' }, { status: 500 })
  }
}

function parseRubricContent(content, pointScale) {
  // Define performance level headers based on point scale
  const levelHeaders = {
    '3': ['Proficient (3)', 'Developing (2)', 'Beginning (1)'],
    '4': ['Exceeds (4)', 'Meets (3)', 'Approaching (2)', 'Beginning (1)'],
    '5': ['Exemplary (5)', 'Proficient (4)', 'Developing (3)', 'Beginning (2)', 'Not Yet (1)'],
    '100': ['A (90-100%)', 'B (80-89%)', 'C (70-79%)', 'D (60-69%)', 'F (0-59%)']
  }

  const levels = levelHeaders[pointScale] || levelHeaders['4']
  
  // Try to parse structured criteria from the content
  const criteria = []
  const lines = content.split('\n')
  
  let currentCriterion = null
  let currentDescriptions = {}
  
  // Common criterion patterns to look for
  const criterionPatterns = [
    /^(?:Criterion|Category|Standard|Skill)?\s*\d*[.:)]\s*\*?\*?([A-Za-z][A-Za-z\s&\/]+)/i,
    /^\*\*([A-Za-z][A-Za-z\s&\/]+)\*\*/,
    /^###?\s*([A-Za-z][A-Za-z\s&\/]+)/,
    /^([A-Z][A-Za-z\s&\/]+):$/
  ]
  
  // Level patterns
  const levelPatterns = [
    /^[-•]\s*(Exceeds|Exemplary|Proficient|Meets|Developing|Approaching|Beginning|Not Yet|A\s*[\(\[]|B\s*[\(\[]|C\s*[\(\[]|D\s*[\(\[]|F\s*[\(\[])[^:]*[:\-]\s*(.+)/i,
    /^\s*(4|3|2|1|5|0)\s*[-–:]\s*(Exceeds|Exemplary|Proficient|Meets|Developing|Approaching|Beginning|Not Yet)?[:\-]?\s*(.+)/i,
    /^(Exceeds|Exemplary|Proficient|Meets|Developing|Approaching|Beginning|Not Yet)[:\-]\s*(.+)/i
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Check if this is a new criterion
    let isCriterion = false
    for (const pattern of criterionPatterns) {
      const match = line.match(pattern)
      if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
        // Save previous criterion if exists
        if (currentCriterion && Object.keys(currentDescriptions).length > 0) {
          criteria.push({
            name: currentCriterion,
            descriptions: { ...currentDescriptions }
          })
        }
        currentCriterion = match[1].trim().replace(/\*\*/g, '')
        currentDescriptions = {}
        isCriterion = true
        break
      }
    }

    if (isCriterion) continue

    // Check if this is a level description
    if (currentCriterion) {
      for (const pattern of levelPatterns) {
        const match = line.match(pattern)
        if (match) {
          const levelText = (match[1] + (match[2] || '')).toLowerCase()
          const description = (match[3] || match[2] || '').trim()
          
          // Map to standard level names
          let levelIndex = -1
          if (levelText.includes('exceed') || levelText.includes('exemplary') || levelText.includes('4') || levelText.includes('5') || levelText.startsWith('a')) {
            levelIndex = 0
          } else if (levelText.includes('proficient') || levelText.includes('meet') || levelText.includes('3') || levelText.startsWith('b')) {
            levelIndex = pointScale === '5' ? 1 : (pointScale === '3' ? 0 : 1)
          } else if (levelText.includes('develop') || levelText.includes('approach') || levelText.includes('2') || levelText.startsWith('c')) {
            levelIndex = pointScale === '5' ? 2 : (pointScale === '3' ? 1 : 2)
          } else if (levelText.includes('begin') || levelText.includes('1') || levelText.startsWith('d')) {
            levelIndex = pointScale === '5' ? 3 : (pointScale === '3' ? 2 : 3)
          } else if (levelText.includes('not yet') || levelText.includes('0') || levelText.startsWith('f')) {
            levelIndex = pointScale === '5' ? 4 : 4
          }

          if (levelIndex >= 0 && levelIndex < levels.length && description) {
            currentDescriptions[levels[levelIndex]] = description
          }
          break
        }
      }
    }
  }

  // Don't forget the last criterion
  if (currentCriterion && Object.keys(currentDescriptions).length > 0) {
    criteria.push({
      name: currentCriterion,
      descriptions: { ...currentDescriptions }
    })
  }

  // If parsing didn't work well, create a simple structure from content
  if (criteria.length === 0) {
    // Fallback: Create basic criteria from content sections
    const sections = content.split(/\n\n+/)
    let criteriaCount = 0
    
    for (const section of sections) {
      if (section.length > 50 && criteriaCount < 6) {
        const firstLine = section.split('\n')[0].substring(0, 40).replace(/[*#\-:]/g, '').trim()
        if (firstLine.length > 3) {
          const criterion = {
            name: firstLine || `Criterion ${criteriaCount + 1}`,
            descriptions: {}
          }
          
          // Add placeholder descriptions
          levels.forEach((level, idx) => {
            criterion.descriptions[level] = `See detailed rubric for ${level.split('(')[0].trim()} level expectations.`
          })
          
          criteria.push(criterion)
          criteriaCount++
        }
      }
    }
    
    // If still no criteria, create generic ones
    if (criteria.length === 0) {
      const genericCriteria = ['Content & Understanding', 'Organization', 'Quality of Work', 'Presentation']
      genericCriteria.forEach(name => {
        const criterion = { name, descriptions: {} }
        levels.forEach(level => {
          criterion.descriptions[level] = `Evaluate ${name.toLowerCase()} at the ${level.split('(')[0].trim()} level.`
        })
        criteria.push(criterion)
      })
    }
  }

  return { criteria, levels }
}

function createRubricDocument(parsedRubric, assignmentType, gradeLevel, subject, pointScale) {
  const { criteria, levels } = parsedRubric

  // Calculate column widths
  const criteriaColWidth = 1800 // About 1.25 inches for criteria names
  const levelColWidth = Math.floor((9000 - criteriaColWidth) / levels.length) // Distribute remaining space

  // Create header row
  const headerCells = [
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: 'Criteria', bold: true, size: 22, color: 'FFFFFF' })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { fill: '7C3AED', type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
      width: { size: criteriaColWidth, type: WidthType.DXA },
    }),
    ...levels.map(level => 
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: level, bold: true, size: 20, color: 'FFFFFF' })],
          alignment: AlignmentType.CENTER,
        })],
        shading: { fill: '7C3AED', type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        width: { size: levelColWidth, type: WidthType.DXA },
      })
    )
  ]

  const headerRow = new TableRow({
    children: headerCells,
    tableHeader: true,
  })

  // Create data rows for each criterion
  const dataRows = criteria.map((criterion, index) => {
    const isEvenRow = index % 2 === 0
    const rowShading = isEvenRow ? 'F5F3FF' : 'FFFFFF' // Light purple alternating

    const cells = [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: criterion.name, bold: true, size: 20 })],
          alignment: AlignmentType.LEFT,
        })],
        shading: { fill: 'EDE9FE', type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        width: { size: criteriaColWidth, type: WidthType.DXA },
      }),
      ...levels.map(level => 
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ 
              text: criterion.descriptions[level] || '—', 
              size: 18 
            })],
            alignment: AlignmentType.LEFT,
          })],
          shading: { fill: rowShading, type: ShadingType.CLEAR },
          verticalAlign: VerticalAlign.TOP,
          width: { size: levelColWidth, type: WidthType.DXA },
        })
      )
    ]

    return new TableRow({ children: cells })
  })

  // Create scoring row at the bottom
  const scoringCells = [
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: 'Score', bold: true, size: 20 })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { fill: 'DDD6FE', type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
    }),
    ...levels.map(() => 
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: '____', size: 20 })],
          alignment: AlignmentType.CENTER,
        })],
        shading: { fill: 'DDD6FE', type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
      })
    )
  ]

  const scoringRow = new TableRow({ children: scoringCells })

  // Create the main rubric table
  const rubricTable = new Table({
    rows: [headerRow, ...dataRows, scoringRow],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  })

  // Create total score section
  const totalScoreTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Total Score:', bold: true, size: 22 })],
              alignment: AlignmentType.RIGHT,
            })],
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: `_____ / ${criteria.length * parseInt(pointScale === '100' ? '100' : pointScale)}`, size: 22 })],
              alignment: AlignmentType.LEFT,
            })],
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } },
          }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  })

  // Build the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch margins
        },
      },
      children: [
        // Title
        new Paragraph({
          children: [new TextRun({ text: `${assignmentType} Rubric`, bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
        
        // Subtitle
        new Paragraph({
          children: [new TextRun({ text: `${gradeLevel} • ${subject}`, size: 22, color: '666666' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),

        // Student info section
        new Paragraph({
          children: [
            new TextRun({ text: 'Student Name: ', bold: true, size: 20 }),
            new TextRun({ text: '________________________________    ', size: 20 }),
            new TextRun({ text: 'Date: ', bold: true, size: 20 }),
            new TextRun({ text: '______________', size: 20 }),
          ],
          spacing: { after: 300 },
        }),

        // Main rubric table
        rubricTable,

        // Spacing
        new Paragraph({ spacing: { before: 300 } }),

        // Total score
        totalScoreTable,

        // Comments section
        new Paragraph({
          children: [new TextRun({ text: 'Comments:', bold: true, size: 22 })],
          spacing: { before: 400, after: 120 },
        }),
        
        new Paragraph({
          children: [new TextRun({ text: '________________________________________________________________________________', size: 20 })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '________________________________________________________________________________', size: 20 })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: '________________________________________________________________________________', size: 20 })],
        }),
      ],
    }],
  })

  return doc
}