import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { 
      meetingType,
      meetingDate,
      meetingTime,
      duration,
      attendees,
      studentName,
      meetingPurpose,
      discussionNotes,
      decisionsReached,
      concerns
    } = await request.json();

    const meetingTypeLabels = {
      "parent-teacher": "Parent-Teacher Conference",
      "iep": "IEP Meeting",
      "team-plc": "Team/PLC Meeting",
      "sst": "Student Support Team (SST) Meeting",
      "504": "504 Plan Meeting",
      "general": "General Meeting"
    };

    const meetingLabel = meetingTypeLabels[meetingType] || "Meeting";

    let meetingSpecificInstructions = "";
    
    if (meetingType === "parent-teacher") {
      meetingSpecificInstructions = `
- Focus on student progress, strengths, and areas for growth
- Include specific examples discussed
- Note parent questions and concerns addressed
- Emphasize partnership between home and school`;
    } else if (meetingType === "iep") {
      meetingSpecificInstructions = `
- Reference IEP goals discussed
- Document any goal modifications or updates
- Note services discussed
- Include present levels of performance updates
- Document team consensus on decisions`;
    } else if (meetingType === "team-plc") {
      meetingSpecificInstructions = `
- Focus on instructional strategies discussed
- Note data reviewed and conclusions
- Document collaborative decisions
- Include curriculum or assessment discussions`;
    } else if (meetingType === "sst") {
      meetingSpecificInstructions = `
- Document student concerns discussed
- Note interventions recommended
- Include data/evidence reviewed
- Document support strategies agreed upon
- Note referrals or next steps for evaluation if applicable`;
    }

    const prompt = `You are an experienced educator helping to create professional meeting documentation. Generate well-organized meeting notes based on the following information:

**Meeting Type:** ${meetingLabel}
**Date:** ${meetingDate}
**Time:** ${meetingTime}
**Duration:** ${duration || 'Not specified'}

**Attendees:**
${attendees}

${studentName ? `**Student Being Discussed:** ${studentName}` : ''}

**Purpose of Meeting:**
${meetingPurpose}

**Discussion Notes from Teacher:**
${discussionNotes}

**Decisions Reached:**
${decisionsReached || 'To be determined from discussion'}

**Concerns Raised:**
${concerns || 'None specified'}

---

Generate professional meeting notes with the following sections:

## MEETING NOTES: ${meetingLabel.toUpperCase()}

**1. MEETING INFORMATION**
Format the date, time, duration, and attendees in a clean, professional header.

**2. MEETING PURPOSE**
State the purpose clearly in 1-2 sentences.

**3. DISCUSSION SUMMARY**
Expand the teacher's notes into a well-organized summary of the discussion. Include:
- Key topics covered
- Important points raised by participants
- Any data or evidence reviewed
${meetingSpecificInstructions}

**4. DECISIONS & OUTCOMES**
List the decisions reached during the meeting in a clear, bulleted format. Be specific about what was agreed upon.

**5. ACTION ITEMS**
Create a table or structured list with:
- Task/Action needed
- Person responsible
- Deadline (suggest reasonable timeframes if not specified)

Format example:
| Action Item | Responsible Party | Deadline |
|-------------|------------------|----------|

**6. FOLLOW-UP**
- Next meeting date (if applicable)
- Items to be reviewed at next meeting
- Any pending decisions

**7. ADDITIONAL NOTES**
Any other relevant information or concerns to document.

---

Guidelines:
- Keep tone professional but accessible
- Be specific and actionable
- Use clear, concise language
- Organize information logically
- Make action items measurable and trackable

Write the meeting notes now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const notesContent = message.content[0].text;

    return Response.json({ notes: notesContent });
  } catch (error) {
    console.error("Error generating meeting notes:", error);
    return Response.json(
      { error: "Failed to generate meeting notes" },
      { status: 500 }
    );
  }
}