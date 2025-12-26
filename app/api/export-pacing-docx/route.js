import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from 'docx';

export async function POST(request) {
  try {
    const { pacingData, unitTopic } = await request.json();

    if (!pacingData || !pacingData.dailyPlan) {
      return Response.json({ error: 'No pacing data provided' }, { status: 400 });
    }

    const children = [];

    // ==========================================
    // TITLE
    // ==========================================
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: pacingData.unitOverview?.title || unitTopic || 'Pacing Guide',
            bold: true,
            size: 48,
            color: '7C3AED',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    // ==========================================
    // UNIT OVERVIEW
    // ==========================================
    children.push(
      new Paragraph({
        text: 'Unit Overview',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Grade/Subject: ', bold: true }),
          new TextRun({ text: pacingData.unitOverview?.gradeSubject || '' }),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Duration: ', bold: true }),
          new TextRun({ text: pacingData.unitOverview?.duration || '' }),
        ],
        spacing: { after: 200 },
      })
    );

    // Essential Questions
    if (pacingData.unitOverview?.essentialQuestions?.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Essential Questions:', bold: true })],
          spacing: { before: 200, after: 100 },
        })
      );
      pacingData.unitOverview.essentialQuestions.forEach((q, i) => {
        children.push(
          new Paragraph({
            text: `${i + 1}. ${q}`,
            indent: { left: 360 },
            spacing: { after: 50 },
          })
        );
      });
    }

    // Enduring Understandings
    if (pacingData.unitOverview?.enduringUnderstandings?.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Enduring Understandings:', bold: true })],
          spacing: { before: 200, after: 100 },
        })
      );
      pacingData.unitOverview.enduringUnderstandings.forEach((u, i) => {
        children.push(
          new Paragraph({
            text: `${i + 1}. ${u}`,
            indent: { left: 360 },
            spacing: { after: 50 },
          })
        );
      });
    }

    // ==========================================
    // STANDARDS
    // ==========================================
    if (pacingData.standards?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Standards',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      pacingData.standards.forEach(s => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${s.code}: `, bold: true }),
              new TextRun({ text: s.description }),
              new TextRun({ text: ` (${s.type})`, italics: true, color: '666666' }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    // ==========================================
    // TEXTS & READINGS
    // ==========================================
    if (pacingData.textsOverview?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Texts & Readings',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const textsTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Header row
          new TableRow({
            children: [
              createHeaderCell('Title', 35),
              createHeaderCell('Author', 25),
              createHeaderCell('Schedule', 40),
            ],
          }),
          // Data rows
          ...pacingData.textsOverview.map(t =>
            new TableRow({
              children: [
                createCell(t.title || ''),
                createCell(t.author || ''),
                createCell(t.schedule || ''),
              ],
            })
          ),
        ],
      });

      children.push(textsTable);
    }

    // ==========================================
    // DAILY PACING TABLE
    // ==========================================
    children.push(
      new Paragraph({
        text: 'Daily Pacing Guide',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Create the main pacing table
    const dailyTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        // Header row
        new TableRow({
          children: [
            createHeaderCell('Day', 5),
            createHeaderCell('Topic', 15),
            createHeaderCell('Objective', 20),
            createHeaderCell('Reading', 15),
            createHeaderCell('Activities', 20),
            createHeaderCell('Standards', 10),
            createHeaderCell('Assessment', 15),
          ],
        }),
        // Data rows
        ...pacingData.dailyPlan.map((day, index) =>
          new TableRow({
            children: [
              createCell(String(day.day), index % 2 === 0),
              createCell(day.topic || '', index % 2 === 0),
              createCell(day.objective || '', index % 2 === 0),
              createCell(day.reading || '', index % 2 === 0),
              createCell(day.activities || '', index % 2 === 0),
              createCell(day.standards || '', index % 2 === 0),
              createCell(day.assessment || '', index % 2 === 0),
            ],
          })
        ),
      ],
    });

    children.push(dailyTable);

    // ==========================================
    // ASSESSMENT PLAN
    // ==========================================
    if (pacingData.assessmentPlan?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Assessment Plan',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      const assessTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createHeaderCell('Day', 10),
              createHeaderCell('Assessment', 25),
              createHeaderCell('Type', 15),
              createHeaderCell('Description', 50),
            ],
          }),
          ...pacingData.assessmentPlan.map(a =>
            new TableRow({
              children: [
                createCell(String(a.day)),
                createCell(a.name || ''),
                createCell(a.type || '', false, a.type === 'summative' ? 'FEF3C7' : null),
                createCell(a.description || ''),
              ],
            })
          ),
        ],
      });

      children.push(assessTable);
    }

    // ==========================================
    // DIFFERENTIATION
    // ==========================================
    if (pacingData.differentiation) {
      children.push(
        new Paragraph({
          text: 'Differentiation Strategies',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      if (pacingData.differentiation.struggling) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Struggling Learners: ', bold: true }),
              new TextRun({ text: pacingData.differentiation.struggling }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (pacingData.differentiation.advanced) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Advanced Learners: ', bold: true }),
              new TextRun({ text: pacingData.differentiation.advanced }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      if (pacingData.differentiation.flexDays) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Flex Days: ', bold: true }),
              new TextRun({ text: pacingData.differentiation.flexDays }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    }

    // ==========================================
    // MATERIALS
    // ==========================================
    if (pacingData.materials?.length > 0) {
      children.push(
        new Paragraph({
          text: 'Materials Needed',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      pacingData.materials.forEach(m => {
        children.push(
          new Paragraph({
            text: `• ${m}`,
            spacing: { after: 50 },
          })
        );
      });
    }

    // ==========================================
    // TEACHER NOTES
    // ==========================================
    if (pacingData.teacherNotes) {
      children.push(
        new Paragraph({
          text: 'Teacher Notes',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      children.push(
        new Paragraph({
          text: pacingData.teacherNotes,
          spacing: { after: 100 },
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Pacing_Guide_${(unitTopic || 'Unit').replace(/\s+/g, '_')}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting pacing guide to Word:', error);
    return Response.json({ error: 'Failed to export to Word' }, { status: 500 });
  }
}

// Helper function to create header cells
function createHeaderCell(text, widthPercent) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: true,
            color: 'FFFFFF',
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: {
      type: ShadingType.SOLID,
      color: '7C3AED',
      fill: '7C3AED',
    },
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  });
}

// Helper function to create data cells
function createCell(text, isAlternate = false, customColor = null) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            size: 18,
          }),
        ],
      }),
    ],
    shading: customColor
      ? { type: ShadingType.SOLID, color: customColor, fill: customColor }
      : isAlternate
      ? { type: ShadingType.SOLID, color: 'F3F4F6', fill: 'F3F4F6' }
      : undefined,
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  });
}