import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      unitTopic,
      timeframe,
      totalDays,
      startDate,
      standardsFramework,
      customStandards,
      priorKnowledge,
      endGoals,
      texts,
      unitPortions,
      assessments,
      includeHolidays,
      holidays,
      additionalNotes,
    } = await request.json();

    if (!unitTopic || !gradeLevel || !subject) {
      return Response.json(
        { error: "Unit topic, grade level, and subject are required" },
        { status: 400 }
      );
    }

    const standardsMap = {
      "common-core": "Common Core State Standards (CCSS)",
      "ngss": "Next Generation Science Standards (NGSS)",
      "texas-teks": "Texas Essential Knowledge and Skills (TEKS)",
      "virginia-sol": "Virginia Standards of Learning (SOLs)",
      "california": "California State Standards",
      "florida-best": "Florida B.E.S.T. Standards",
      "new-york": "New York State Learning Standards",
    };

    // Build context for AI
    let textsContext = "";
    if (texts && texts.length > 0) {
      textsContext = `\nTEXTS TO INCORPORATE:\n${texts.map((t, i) => 
        `${i + 1}. "${t.title}"${t.author ? ` by ${t.author}` : ''} (${t.type || 'text'}) - ${t.chapters || ''} ${t.pages ? `pages ${t.pages}` : ''} - Target: ${t.targetDays || 'TBD'}${t.notes ? ` - ${t.notes}` : ''}`
      ).join('\n')}`;
    }

    let portionsContext = "";
    if (unitPortions && unitPortions.length > 0) {
      portionsContext = `\nUNIT PORTIONS TO FOLLOW:\n${unitPortions.map((p, i) => 
        `Part ${i + 1}: ${p.name} (Days ${p.startDay}-${p.endDay}) - Focus: ${p.focus}`
      ).join('\n')}`;
    }

    let assessmentsContext = "";
    if (assessments && assessments.length > 0) {
      assessmentsContext = `\nPLANNED ASSESSMENTS:\n${assessments.map(a => 
        `- ${a.name} (${a.type}) on Day ${a.day}: ${a.description || ''}`
      ).join('\n')}`;
    }

    let holidaysContext = "";
    if (includeHolidays && holidays) {
      holidaysContext = `\nHOLIDAYS/NO SCHOOL DAYS: ${holidays}`;
    }

    const numDays = parseInt(totalDays) || 15;

    const prompt = `You are an expert K-12 curriculum specialist. Create a detailed pacing guide.

UNIT DETAILS:
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Unit/Topic: ${unitTopic}
- Timeframe: ${timeframe || "3 weeks"}
- Total Instructional Days: ${numDays}
${startDate ? `- Start Date: ${startDate}` : ''}
- Standards: ${customStandards || standardsMap[standardsFramework] || "Common Core"}
${priorKnowledge ? `- Prior Knowledge: ${priorKnowledge}` : ''}
${endGoals ? `- End Goals: ${endGoals}` : ''}
${textsContext}
${portionsContext}
${assessmentsContext}
${holidaysContext}
${additionalNotes ? `\nADDITIONAL NOTES: ${additionalNotes}` : ''}

Create a pacing guide with EXACTLY ${numDays} days. Return your response as a JSON object with this structure:

{
  "unitOverview": {
    "title": "Unit title here",
    "gradeSubject": "${gradeLevel} ${subject}",
    "duration": "${numDays} days",
    "essentialQuestions": ["Question 1?", "Question 2?"],
    "enduringUnderstandings": ["Understanding 1", "Understanding 2"]
  },
  "standards": [
    {"code": "RL.5.1", "description": "Quote accurately from text", "type": "primary"}
  ],
  "textsOverview": [
    {"title": "Book Title", "author": "Author Name", "schedule": "Days 1-10, Chapters 1-5"}
  ],
  "dailyPlan": [
    {
      "day": 1,
      "date": "",
      "portion": "Part 1",
      "topic": "Introduction to the unit",
      "objective": "Students will be able to...",
      "reading": "Chapter 1, pages 1-15",
      "activities": "Read aloud, discussion, journal entry",
      "standards": "RL.5.1",
      "assessment": "Exit ticket",
      "materials": "Novel, chart paper",
      "homework": "Read pages 1-10",
      "notes": ""
    }
  ],
  "assessmentPlan": [
    {"name": "Quiz 1", "type": "formative", "day": 5, "description": "Character analysis"}
  ],
  "differentiation": {
    "struggling": "Provide graphic organizers, audio support",
    "advanced": "Independent research project",
    "flexDays": "Days 8 and 15 are built-in catch-up days"
  },
  "materials": ["Novels (class set)", "Chart paper", "Markers"],
  "teacherNotes": "Consider connecting with social studies teacher for cross-curricular opportunities."
}

IMPORTANT RULES:
1. Return ONLY the JSON object - no other text, no explanation, no markdown
2. Create exactly ${numDays} entries in the dailyPlan array (day 1 through day ${numDays})
3. All JSON must be valid - use double quotes, escape special characters
4. Do not wrap in code blocks or backticks
5. Start your response with { and end with }`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    
    // Clean up response - remove any markdown or extra text
    // Find the first { and last }
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    // Parse the JSON
    let pacingData;
    try {
      pacingData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError.message);
      console.error("Response text (first 1000 chars):", responseText.substring(0, 1000));
      
      // Fallback: Generate a basic structure from plain text
      pacingData = generateFallbackData(gradeLevel, subject, unitTopic, numDays, texts, assessments);
    }

    // Validate and fix the data structure
    pacingData = validateAndFixData(pacingData, gradeLevel, subject, unitTopic, numDays);

    // Generate plain text version
    const plainText = generatePlainText(pacingData);

    return Response.json({ 
      pacingData,
      pacingGuide: plainText
    });
  } catch (error) {
    console.error("Error generating pacing guide:", error);
    return Response.json(
      { error: "Failed to generate pacing guide: " + error.message },
      { status: 500 }
    );
  }
}

// Fallback data generator if JSON parsing fails
function generateFallbackData(gradeLevel, subject, unitTopic, numDays, texts, assessments) {
  const dailyPlan = [];
  for (let i = 1; i <= numDays; i++) {
    dailyPlan.push({
      day: i,
      date: "",
      portion: i <= Math.ceil(numDays / 3) ? "Part 1: Introduction" : 
               i <= Math.ceil(numDays * 2 / 3) ? "Part 2: Development" : "Part 3: Conclusion",
      topic: `Day ${i} - ${unitTopic}`,
      objective: "Students will continue building understanding of key concepts",
      reading: texts && texts.length > 0 ? texts[0].title : "",
      activities: "Direct instruction, guided practice, independent work",
      standards: "",
      assessment: i % 5 === 0 ? "Check for understanding" : "",
      materials: "",
      homework: "",
      notes: ""
    });
  }

  return {
    unitOverview: {
      title: unitTopic,
      gradeSubject: `${gradeLevel} ${subject}`,
      duration: `${numDays} days`,
      essentialQuestions: ["What are the key concepts?", "How do we apply this learning?"],
      enduringUnderstandings: ["Students will understand the core concepts", "Students will apply their learning"]
    },
    standards: [],
    textsOverview: texts ? texts.map(t => ({
      title: t.title || "",
      author: t.author || "",
      schedule: t.targetDays || "Throughout unit"
    })) : [],
    dailyPlan,
    assessmentPlan: assessments ? assessments.map(a => ({
      name: a.name || "Assessment",
      type: a.type || "formative",
      day: parseInt(a.day) || 1,
      description: a.description || ""
    })) : [],
    differentiation: {
      struggling: "Provide additional support and scaffolding",
      advanced: "Offer extension activities",
      flexDays: "Built-in flexibility for reteaching"
    },
    materials: ["Various classroom materials"],
    teacherNotes: "Adjust pacing as needed based on student needs."
  };
}

// Validate and fix data structure
function validateAndFixData(data, gradeLevel, subject, unitTopic, numDays) {
  // Ensure unitOverview exists
  if (!data.unitOverview) {
    data.unitOverview = {
      title: unitTopic,
      gradeSubject: `${gradeLevel} ${subject}`,
      duration: `${numDays} days`,
      essentialQuestions: [],
      enduringUnderstandings: []
    };
  }

  // Ensure dailyPlan exists and has correct number of days
  if (!data.dailyPlan || !Array.isArray(data.dailyPlan)) {
    data.dailyPlan = [];
  }

  // Fill in missing days if needed
  while (data.dailyPlan.length < numDays) {
    const dayNum = data.dailyPlan.length + 1;
    data.dailyPlan.push({
      day: dayNum,
      date: "",
      portion: "",
      topic: `Day ${dayNum}`,
      objective: "",
      reading: "",
      activities: "",
      standards: "",
      assessment: "",
      materials: "",
      homework: "",
      notes: ""
    });
  }

  // Ensure other arrays exist
  if (!data.standards) data.standards = [];
  if (!data.textsOverview) data.textsOverview = [];
  if (!data.assessmentPlan) data.assessmentPlan = [];
  if (!data.differentiation) data.differentiation = { struggling: "", advanced: "", flexDays: "" };
  if (!data.materials) data.materials = [];
  if (!data.teacherNotes) data.teacherNotes = "";

  return data;
}

function generatePlainText(data) {
  let text = '';
  
  // Unit Overview
  text += `PACING GUIDE: ${data.unitOverview?.title || 'Unit'}\n`;
  text += `${'='.repeat(60)}\n\n`;
  text += `Grade/Subject: ${data.unitOverview?.gradeSubject || ''}\n`;
  text += `Duration: ${data.unitOverview?.duration || ''}\n\n`;
  
  if (data.unitOverview?.essentialQuestions?.length > 0) {
    text += `Essential Questions:\n`;
    data.unitOverview.essentialQuestions.forEach((q, i) => {
      text += `  ${i + 1}. ${q}\n`;
    });
    text += '\n';
  }
  
  if (data.unitOverview?.enduringUnderstandings?.length > 0) {
    text += `Enduring Understandings:\n`;
    data.unitOverview.enduringUnderstandings.forEach((u, i) => {
      text += `  ${i + 1}. ${u}\n`;
    });
    text += '\n';
  }
  
  // Standards
  if (data.standards?.length > 0) {
    text += `STANDARDS\n${'-'.repeat(40)}\n`;
    data.standards.forEach(s => {
      text += `${s.code}: ${s.description} (${s.type})\n`;
    });
    text += '\n';
  }
  
  // Texts Overview
  if (data.textsOverview?.length > 0) {
    text += `TEXTS & READINGS\n${'-'.repeat(40)}\n`;
    data.textsOverview.forEach(t => {
      text += `• "${t.title}"${t.author ? ` by ${t.author}` : ''} - ${t.schedule}\n`;
    });
    text += '\n';
  }
  
  // Daily Plan
  if (data.dailyPlan?.length > 0) {
    text += `DAILY PLAN\n${'='.repeat(60)}\n\n`;
    data.dailyPlan.forEach(day => {
      text += `DAY ${day.day}${day.date ? ` - ${day.date}` : ''}\n`;
      text += `${'-'.repeat(40)}\n`;
      if (day.portion) text += `Portion: ${day.portion}\n`;
      if (day.topic) text += `Topic: ${day.topic}\n`;
      if (day.objective) text += `Objective: ${day.objective}\n`;
      if (day.reading) text += `Reading: ${day.reading}\n`;
      if (day.activities) text += `Activities: ${day.activities}\n`;
      if (day.standards) text += `Standards: ${day.standards}\n`;
      if (day.assessment) text += `Assessment: ${day.assessment}\n`;
      if (day.materials) text += `Materials: ${day.materials}\n`;
      if (day.homework) text += `Homework: ${day.homework}\n`;
      if (day.notes) text += `Notes: ${day.notes}\n`;
      text += '\n';
    });
  }
  
  // Assessment Plan
  if (data.assessmentPlan?.length > 0) {
    text += `ASSESSMENT PLAN\n${'-'.repeat(40)}\n`;
    data.assessmentPlan.forEach(a => {
      text += `• Day ${a.day}: ${a.name} (${a.type}) - ${a.description}\n`;
    });
    text += '\n';
  }
  
  // Differentiation
  if (data.differentiation) {
    text += `DIFFERENTIATION\n${'-'.repeat(40)}\n`;
    if (data.differentiation.struggling) text += `Struggling Learners: ${data.differentiation.struggling}\n`;
    if (data.differentiation.advanced) text += `Advanced Learners: ${data.differentiation.advanced}\n`;
    if (data.differentiation.flexDays) text += `Flex Days: ${data.differentiation.flexDays}\n`;
    text += '\n';
  }
  
  // Materials
  if (data.materials?.length > 0) {
    text += `MATERIALS NEEDED\n${'-'.repeat(40)}\n`;
    data.materials.forEach(m => {
      text += `• ${m}\n`;
    });
    text += '\n';
  }
  
  // Teacher Notes
  if (data.teacherNotes) {
    text += `TEACHER NOTES\n${'-'.repeat(40)}\n`;
    text += `${data.teacherNotes}\n`;
  }
  
  return text;
}