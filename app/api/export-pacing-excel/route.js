import ExcelJS from 'exceljs';

export async function POST(request) {
  try {
    const { pacingData, unitTopic } = await request.json();

    if (!pacingData || !pacingData.dailyPlan) {
      return Response.json({ error: 'No pacing data provided' }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Teacher AI Assistant';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: Unit Overview
    // ==========================================
    const overviewSheet = workbook.addWorksheet('Unit Overview');
    
    // Title
    overviewSheet.mergeCells('A1:F1');
    const titleCell = overviewSheet.getCell('A1');
    titleCell.value = pacingData.unitOverview?.title || unitTopic || 'Pacing Guide';
    titleCell.font = { bold: true, size: 18, color: { argb: 'FF7C3AED' } };
    titleCell.alignment = { horizontal: 'center' };
    
    // Unit Info
    overviewSheet.getCell('A3').value = 'Grade/Subject:';
    overviewSheet.getCell('B3').value = pacingData.unitOverview?.gradeSubject || '';
    overviewSheet.getCell('A4').value = 'Duration:';
    overviewSheet.getCell('B4').value = pacingData.unitOverview?.duration || '';
    
    overviewSheet.getCell('A3').font = { bold: true };
    overviewSheet.getCell('A4').font = { bold: true };
    
    // Essential Questions
    let row = 6;
    overviewSheet.getCell(`A${row}`).value = 'Essential Questions:';
    overviewSheet.getCell(`A${row}`).font = { bold: true };
    row++;
    
    if (pacingData.unitOverview?.essentialQuestions) {
      pacingData.unitOverview.essentialQuestions.forEach((q, i) => {
        overviewSheet.getCell(`A${row}`).value = `${i + 1}. ${q}`;
        row++;
      });
    }
    
    row++;
    overviewSheet.getCell(`A${row}`).value = 'Enduring Understandings:';
    overviewSheet.getCell(`A${row}`).font = { bold: true };
    row++;
    
    if (pacingData.unitOverview?.enduringUnderstandings) {
      pacingData.unitOverview.enduringUnderstandings.forEach((u, i) => {
        overviewSheet.getCell(`A${row}`).value = `${i + 1}. ${u}`;
        row++;
      });
    }
    
    // Standards
    if (pacingData.standards?.length > 0) {
      row += 2;
      overviewSheet.getCell(`A${row}`).value = 'Standards:';
      overviewSheet.getCell(`A${row}`).font = { bold: true };
      row++;
      
      pacingData.standards.forEach(s => {
        overviewSheet.getCell(`A${row}`).value = s.code;
        overviewSheet.getCell(`A${row}`).font = { bold: true };
        overviewSheet.getCell(`B${row}`).value = s.description;
        overviewSheet.getCell(`C${row}`).value = `(${s.type})`;
        row++;
      });
    }
    
    // Set column widths
    overviewSheet.getColumn('A').width = 25;
    overviewSheet.getColumn('B').width = 50;
    overviewSheet.getColumn('C').width = 15;

    // ==========================================
    // SHEET 2: Daily Pacing Guide (Main Table)
    // ==========================================
    const dailySheet = workbook.addWorksheet('Daily Pacing');
    
    // Define columns
    dailySheet.columns = [
      { header: 'Day', key: 'day', width: 6 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Portion/Phase', key: 'portion', width: 18 },
      { header: 'Topic', key: 'topic', width: 25 },
      { header: 'Learning Objective', key: 'objective', width: 35 },
      { header: 'Reading', key: 'reading', width: 25 },
      { header: 'Activities', key: 'activities', width: 35 },
      { header: 'Standards', key: 'standards', width: 15 },
      { header: 'Assessment', key: 'assessment', width: 20 },
      { header: 'Materials', key: 'materials', width: 20 },
      { header: 'Homework', key: 'homework', width: 20 },
      { header: 'Notes', key: 'notes', width: 25 },
    ];
    
    // Style header row
    const headerRow = dailySheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7C3AED' } // Purple
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 30;
    
    // Add data rows
    pacingData.dailyPlan.forEach((day, index) => {
      const dataRow = dailySheet.addRow({
        day: day.day,
        date: day.date || '',
        portion: day.portion || '',
        topic: day.topic || '',
        objective: day.objective || '',
        reading: day.reading || '',
        activities: day.activities || '',
        standards: day.standards || '',
        assessment: day.assessment || '',
        materials: day.materials || '',
        homework: day.homework || '',
        notes: day.notes || '',
      });
      
      // Alternate row colors
      if (index % 2 === 0) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF3F4F6' } // Light gray
        };
      }
      
      dataRow.alignment = { vertical: 'top', wrapText: true };
      dataRow.height = 45;
    });
    
    // Add borders to all cells
    dailySheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    });
    
    // Freeze header row
    dailySheet.views = [{ state: 'frozen', ySplit: 1 }];

    // ==========================================
    // SHEET 3: Texts & Readings
    // ==========================================
    if (pacingData.textsOverview?.length > 0) {
      const textsSheet = workbook.addWorksheet('Texts & Readings');
      
      textsSheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Author', key: 'author', width: 20 },
        { header: 'Schedule', key: 'schedule', width: 40 },
      ];
      
      // Style header
      const textsHeader = textsSheet.getRow(1);
      textsHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      textsHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF10B981' } // Green
      };
      
      pacingData.textsOverview.forEach(t => {
        textsSheet.addRow({
          title: t.title || '',
          author: t.author || '',
          schedule: t.schedule || '',
        });
      });
    }

    // ==========================================
    // SHEET 4: Assessment Plan
    // ==========================================
    if (pacingData.assessmentPlan?.length > 0) {
      const assessSheet = workbook.addWorksheet('Assessments');
      
      assessSheet.columns = [
        { header: 'Day', key: 'day', width: 8 },
        { header: 'Assessment', key: 'name', width: 25 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Description', key: 'description', width: 50 },
      ];
      
      // Style header
      const assessHeader = assessSheet.getRow(1);
      assessHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      assessHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF59E0B' } // Orange
      };
      
      pacingData.assessmentPlan.forEach(a => {
        const row = assessSheet.addRow({
          day: a.day,
          name: a.name || '',
          type: a.type || '',
          description: a.description || '',
        });
        
        // Color summative assessments differently
        if (a.type === 'summative') {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' } // Light yellow
          };
        }
      });
    }

    // ==========================================
    // SHEET 5: Differentiation & Materials
    // ==========================================
    const notesSheet = workbook.addWorksheet('Notes & Materials');
    
    notesSheet.getCell('A1').value = 'DIFFERENTIATION STRATEGIES';
    notesSheet.getCell('A1').font = { bold: true, size: 14 };
    
    let notesRow = 3;
    if (pacingData.differentiation) {
      notesSheet.getCell(`A${notesRow}`).value = 'Struggling Learners:';
      notesSheet.getCell(`A${notesRow}`).font = { bold: true };
      notesSheet.getCell(`B${notesRow}`).value = pacingData.differentiation.struggling || '';
      notesRow++;
      
      notesSheet.getCell(`A${notesRow}`).value = 'Advanced Learners:';
      notesSheet.getCell(`A${notesRow}`).font = { bold: true };
      notesSheet.getCell(`B${notesRow}`).value = pacingData.differentiation.advanced || '';
      notesRow++;
      
      notesSheet.getCell(`A${notesRow}`).value = 'Flex Days:';
      notesSheet.getCell(`A${notesRow}`).font = { bold: true };
      notesSheet.getCell(`B${notesRow}`).value = pacingData.differentiation.flexDays || '';
      notesRow++;
    }
    
    notesRow += 2;
    notesSheet.getCell(`A${notesRow}`).value = 'MATERIALS NEEDED';
    notesSheet.getCell(`A${notesRow}`).font = { bold: true, size: 14 };
    notesRow += 2;
    
    if (pacingData.materials?.length > 0) {
      pacingData.materials.forEach(m => {
        notesSheet.getCell(`A${notesRow}`).value = `• ${m}`;
        notesRow++;
      });
    }
    
    notesRow += 2;
    if (pacingData.teacherNotes) {
      notesSheet.getCell(`A${notesRow}`).value = 'TEACHER NOTES';
      notesSheet.getCell(`A${notesRow}`).font = { bold: true, size: 14 };
      notesRow += 2;
      notesSheet.getCell(`A${notesRow}`).value = pacingData.teacherNotes;
    }
    
    notesSheet.getColumn('A').width = 25;
    notesSheet.getColumn('B').width = 60;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Pacing_Guide_${(unitTopic || 'Unit').replace(/\s+/g, '_')}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting pacing guide to Excel:', error);
    return Response.json({ error: 'Failed to export to Excel' }, { status: 500 });
  }
}