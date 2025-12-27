import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      quizTitle,
      quizContent,
      answerKey,
      totalPoints,
      gradingMode,
      studentName,
      studentAnswers,
      batchStudentData,
      feedbackTone,
      includeExplanations,
      includeStudyTips,
    } = await request.json();

    if (!quizContent || !answerKey) {
      return Response.json(
        { error: "Quiz content and answer key are required" },
        { status: 400 }
      );
    }

    const toneDescriptions = {
      'encouraging': 'warm, encouraging, and supportive - celebrate what they got right before addressing mistakes',
      'constructive': 'constructive and direct - focus on specific improvements needed',
      'detailed': 'detailed and academic - thorough explanations with precise language',
      'brief': 'brief and to-the-point - just the essential feedback',
    };

    // Single Student Grading
    if (gradingMode === 'single') {
      if (!studentAnswers) {
        return Response.json({ error: "Student answers are required" }, { status: 400 });
      }

      const prompt = `You are an expert teacher grading a quiz. Be accurate and fair in your grading.

**QUIZ INFORMATION:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Quiz Title: ${quizTitle || 'Quiz'}
- Total Points: ${totalPoints || '100'}

**QUIZ QUESTIONS:**
${quizContent}

**ANSWER KEY:**
${answerKey}

**STUDENT'S ANSWERS (${studentName || 'Student'}):**
${studentAnswers}

**GRADING INSTRUCTIONS:**
1. Compare each student answer to the answer key
2. For multiple choice: exact match required
3. For short answer/essay: grade on accuracy, completeness, and understanding
4. Be fair but accurate

**FEEDBACK TONE:** ${toneDescriptions[feedbackTone] || toneDescriptions['encouraging']}
${includeExplanations ? '- Include explanations for why wrong answers are incorrect' : ''}
${includeStudyTips ? '- Include specific study tips for improvement' : ''}

**RETURN YOUR RESPONSE IN THIS EXACT JSON FORMAT (no markdown, no code blocks):**
{
  "score": "X/${totalPoints || '100'}",
  "percentage": 85,
  "feedback": "Overall feedback paragraph for the student...",
  "questionBreakdown": "Q1: ✓ Correct\\nQ2: ✗ Incorrect - the answer was B because...\\nQ3: ✓ Correct\\n..."
}

Grade accurately and provide helpful, ${feedbackTone} feedback.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      let responseText = message.content[0].text.trim();
      
      // Clean up response
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }

      let results;
      try {
        results = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        results = {
          score: `?/${totalPoints || '100'}`,
          percentage: 0,
          feedback: "Unable to parse grading results. Please try again.",
          questionBreakdown: responseText
        };
      }

      return Response.json({ results });
    }

    // Batch Grading
    if (gradingMode === 'batch') {
      if (!batchStudentData) {
        return Response.json({ error: "Student data is required" }, { status: 400 });
      }

      const batchPrompt = `You are an expert teacher grading quizzes for an entire class. Be accurate and fair.

**QUIZ INFORMATION:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Quiz Title: ${quizTitle || 'Quiz'}
- Total Points: ${totalPoints || '100'}

**QUIZ QUESTIONS:**
${quizContent}

**ANSWER KEY:**
${answerKey}

**ALL STUDENTS' ANSWERS:**
${batchStudentData}

**GRADING INSTRUCTIONS:**
1. Grade each student separately
2. For multiple choice: exact match required
3. For short answer/essay: grade on accuracy, completeness, and understanding
4. Be consistent across all students

**FEEDBACK TONE:** ${toneDescriptions[feedbackTone] || toneDescriptions['encouraging']}

**RETURN YOUR RESPONSE IN THIS EXACT JSON FORMAT (no markdown, no code blocks):**
{
  "results": [
    {
      "studentName": "Student Name",
      "score": "X/${totalPoints || '100'}",
      "percentage": 85,
      "feedback": "Brief personalized feedback for this student..."
    }
  ],
  "analytics": {
    "classAverage": 82,
    "highest": 95,
    "lowest": 65,
    "questionAnalysis": [
      {"question": 1, "percentCorrect": 90, "commonMistake": "None - most students got this right"},
      {"question": 2, "percentCorrect": 60, "commonMistake": "Students confused evaporation with condensation"}
    ],
    "reteachingSuggestions": "Based on the results, consider reteaching: ...",
    "overallNotes": "General observations about class performance..."
  }
}

Grade all students accurately and provide class-wide analytics.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: batchPrompt }],
      });

      let responseText = message.content[0].text.trim();
      
      // Clean up response
      const firstBrace = responseText.indexOf('{');
      const lastBrace = responseText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        responseText = responseText.substring(firstBrace, lastBrace + 1);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        return Response.json({ 
          error: "Failed to parse grading results. Please try again." 
        }, { status: 500 });
      }

      // Format analytics as readable text
      let analyticsText = '';
      if (data.analytics) {
        const a = data.analytics;
        analyticsText = `CLASS PERFORMANCE SUMMARY
${'='.repeat(40)}

📊 SCORE DISTRIBUTION
• Class Average: ${a.classAverage}%
• Highest Score: ${a.highest}%
• Lowest Score: ${a.lowest}%

📋 QUESTION-BY-QUESTION ANALYSIS
${'-'.repeat(40)}
`;
        if (a.questionAnalysis && Array.isArray(a.questionAnalysis)) {
          a.questionAnalysis.forEach(q => {
            const bar = '█'.repeat(Math.floor(q.percentCorrect / 10)) + '░'.repeat(10 - Math.floor(q.percentCorrect / 10));
            analyticsText += `
Question ${q.question}: ${q.percentCorrect}% correct ${bar}
${q.commonMistake ? `   ⚠️ Common mistake: ${q.commonMistake}` : '   ✓ No common mistakes'}
`;
          });
        }

        analyticsText += `
📚 RETEACHING SUGGESTIONS
${'-'.repeat(40)}
${a.reteachingSuggestions || 'No specific reteaching needed.'}

📝 OVERALL NOTES
${'-'.repeat(40)}
${a.overallNotes || 'No additional notes.'}
`;
      }

      return Response.json({ 
        results: data.results || [],
        analytics: analyticsText
      });
    }

    return Response.json({ error: "Invalid grading mode" }, { status: 400 });

  } catch (error) {
    console.error("Error grading quiz:", error);
    return Response.json(
      { error: "Failed to grade quiz" },
      { status: 500 }
    );
  }
}