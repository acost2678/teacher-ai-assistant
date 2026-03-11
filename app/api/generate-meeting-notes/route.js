import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      meetingType,
      meetingDate,
      attendees,
      studentName,
      agenda,
      discussionPoints,
      decisions,
      actionItems,
      followUpDate,
      // New: raw transcript
      rawTranscript,
    } = await request.json();

    if (!discussionPoints && !rawTranscript) {
      return Response.json(
        { error: "Please enter discussion points or paste a transcript" },
        { status: 400 }
      );
    }

    const meetingTypeInstructions = {
      "Parent-Teacher Conference": `
- Open with student strengths before areas of concern
- Document parent questions and concerns with empathy
- Note specific examples of student work or behavior discussed
- Emphasize home-school partnership in action items`,
      "IEP Meeting": `
- Document present levels of performance updates discussed
- Note any IEP goal progress data reviewed
- Record any proposed goal modifications or new goals
- Document service hours, placement, and accommodations discussed
- Note team consensus — any disagreements must be documented
- Include parent rights discussed if applicable`,
      "SST/RTI Meeting": `
- Document student concerns and referral reason
- Note data and evidence reviewed (attendance, grades, behavior, assessments)
- Record Tier 1 strategies already attempted and their results
- Document new interventions recommended with specific implementation details
- Note any referrals for evaluation or additional services`,
      "PLC Meeting": `
- Document student data reviewed and key findings
- Note instructional strategies discussed
- Record collaborative decisions about curriculum or assessment
- Include any intervention groupings or differentiation decisions`,
      "504 Plan Meeting": `
- Document disability and how it impacts education discussed
- Note accommodations reviewed, added, or removed
- Record team agreement on all accommodations
- Document any evaluation data reviewed`,
    };

    const specificInstructions =
      meetingTypeInstructions[meetingType] ||
      "- Document all key discussion points thoroughly\n- Ensure action items are specific and assigned";

    const inputSource = rawTranscript
      ? `**RAW TRANSCRIPT TO PROCESS:**\n${rawTranscript}`
      : `**AGENDA / PURPOSE:**\n${agenda || "Not specified"}

**DISCUSSION POINTS:**
${discussionPoints}

**DECISIONS MADE:**
${decisions || "Not specified"}

**ACTION ITEMS:**
${actionItems || "Not specified"}`;

    const prompt = `You are an experienced school administrator and educator creating professional, legally sound meeting documentation. Generate polished meeting notes based on the information below.

**PRIVACY:** Use "[Student Name]" as a placeholder — never use the actual student name provided. This is a FERPA-compliant system.

---

**MEETING DETAILS:**
- Type: ${meetingType}
- Date: ${meetingDate || "[Date]"}
- Attendees: ${attendees || "Not specified"}
${studentName ? `- Student (use placeholder): [Student Name]` : ""}
${followUpDate ? `- Follow-up Date: ${followUpDate}` : ""}

${inputSource}

---

**MEETING-SPECIFIC GUIDELINES FOR THIS TYPE (${meetingType}):**
${specificInstructions}

---

Generate complete, professional meeting notes using EXACTLY this structure. Fill every section with specific content — do not leave empty placeholders. Write in professional, objective third-person language suitable for official school records.

---

## MEETING NOTES: ${meetingType.toUpperCase()}

**Date:** ${meetingDate || "[Date]"}
**Meeting Type:** ${meetingType}
**Attendees:** ${attendees || "[List attendees]"}
${studentName ? "**Student:** [Student Name]" : ""}
${followUpDate ? `**Follow-up Date:** ${followUpDate}` : ""}
**Notes Prepared By:** _______________

---

### 1. PURPOSE OF MEETING
[1–2 sentences stating why this meeting was held and what it intended to accomplish]

---

### 2. DISCUSSION SUMMARY
[Organized summary of the meeting discussion. Use subheadings if multiple topics were covered. Expand raw notes into complete, professional sentences. Capture all key points raised, data shared, and perspectives expressed. For IEP/SST meetings, include data referenced.]

---

### 3. KEY DECISIONS
[Bullet list of all decisions reached during the meeting. Each item should be specific and unambiguous — someone reading this 6 months later should know exactly what was decided.]

- 
- 
- 

---

### 4. ACTION ITEMS

| # | Action Item | Person Responsible | Deadline | Status |
|---|-------------|-------------------|----------|--------|
| 1 | | | | Pending |
| 2 | | | | Pending |
| 3 | | | | Pending |

[Add rows as needed. Deadlines should be specific dates where possible. If not specified, suggest reasonable timeframes based on meeting type.]

---

### 5. CONCERNS & FOLLOW-UP ITEMS
[Any unresolved concerns, items tabled for later, or topics that need further information before a decision can be made]

---

### 6. NEXT STEPS
- **Next Meeting:** ${followUpDate || "To be scheduled"}
- **Items for Next Agenda:** [List topics to revisit]
- **Pending Items:** [Anything awaiting information or decision]

---

### 7. ADDITIONAL NOTES
[Any other relevant information, context, or documentation notes that don't fit the above categories]

---

*These notes are a summary of the meeting discussion and do not constitute a verbatim transcript. Please contact [Name] with any corrections within 5 business days.*

---

**SIGNATURES**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| | | | |
| | | | |
| | | | |

---

After the meeting notes, output a separate section formatted EXACTLY like this — it will be parsed by the application:

===ACTION_ITEMS_START===
[List each action item on its own line in this format: TASK | PERSON | DEADLINE]
===ACTION_ITEMS_END===`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const fullResponse = message.content[0].text;

    // Parse out action items separately
    const actionItemsMatch = fullResponse.match(
      /===ACTION_ITEMS_START===\n([\s\S]*?)\n===ACTION_ITEMS_END===/
    );

    const parsedActionItems = actionItemsMatch
      ? actionItemsMatch[1]
          .trim()
          .split("\n")
          .filter((line) => line.includes("|"))
          .map((line) => {
            const [task, person, deadline] = line.split("|").map((s) => s.trim());
            return { task, person, deadline };
          })
      : [];

    // Clean notes — remove the action items section from the main output
    const notes = fullResponse
      .replace(/===ACTION_ITEMS_START===[\s\S]*?===ACTION_ITEMS_END===/g, "")
      .trim();

    return Response.json({ notes, actionItems: parsedActionItems });
  } catch (error) {
    console.error("Error generating meeting notes:", error);
    return Response.json(
      { error: "Failed to generate meeting notes" },
      { status: 500 }
    );
  }
}