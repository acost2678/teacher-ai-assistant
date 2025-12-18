import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { 
      studentName, 
      gradeLevel, 
      incidentDate,
      incidentTime,
      incidentLocation,
      incidentType,
      description,
      witnesses,
      actionsTaken,
      parentContacted,
      adminNotified
    } = await request.json();

    const incidentTypeDescriptions = {
      "behavior-disruption": "Behavioral Incident - Classroom Disruption",
      "behavior-defiance": "Behavioral Incident - Defiance/Non-Compliance",
      "behavior-verbal": "Behavioral Incident - Verbal Altercation",
      "safety-physical": "Safety Incident - Physical Altercation",
      "safety-injury": "Safety Incident - Injury",
      "safety-property": "Safety Incident - Property Damage",
      "bullying-verbal": "Bullying/Harassment - Verbal",
      "bullying-physical": "Bullying/Harassment - Physical",
      "bullying-cyber": "Bullying/Harassment - Cyber/Online",
      "bullying-social": "Bullying/Harassment - Social/Relational",
      "other": "Other Incident"
    };

    const incidentTypeLabel = incidentTypeDescriptions[incidentType] || "Incident";

    const prompt = `You are an experienced school administrator helping teachers write professional incident reports. You follow PBIS (Positive Behavioral Interventions and Supports) guidelines, which emphasize:
- Objective, factual language (no judgments, opinions, or assumptions)
- Describing observable behaviors, not interpretations
- Using neutral, non-labeling language
- Focusing on what happened, not why

Write a formal incident report based on the following information:

**Student Name:** ${studentName}
**Grade Level:** ${gradeLevel}
**Incident Type:** ${incidentTypeLabel}
**Date of Incident:** ${incidentDate}
**Time of Incident:** ${incidentTime}
**Location:** ${incidentLocation}

**Teacher's Description of What Happened:**
${description}

**Witnesses Present:** ${witnesses || 'None identified'}

**Immediate Actions Taken:** ${actionsTaken || 'None specified'}

**Parent/Guardian Contacted:** ${parentContacted ? 'Yes' : 'No'}
**Administration Notified:** ${adminNotified ? 'Yes' : 'No'}

---

Generate a professional incident report with the following sections:

## INCIDENT REPORT

**1. INCIDENT SUMMARY**
Write a brief 2-3 sentence summary of the incident using objective, PBIS-aligned language.

**2. DETAILED ACCOUNT OF EVENTS**
Expand the teacher's description into a clear, chronological narrative. Use:
- Specific, observable behaviors (e.g., "Student raised voice" not "Student was angry")
- Factual statements only
- Timeline markers (e.g., "At approximately...", "Following this...")
- Neutral language throughout
- Third person perspective

**3. INDIVIDUALS INVOLVED**
List all individuals involved or present, including their role (student, teacher, witness, etc.)

**4. IMMEDIATE RESPONSE**
Document the actions taken at the time of the incident in a clear, bulleted format.

**5. NOTIFICATIONS**
Document who was notified and when.

**6. DOCUMENTATION NOTES**
Add a brief note about any follow-up documentation needed (e.g., "Photographs taken of damage", "Student statement to be collected", etc.)

---

Important guidelines:
- Use ONLY objective, observable language
- Do NOT include assumptions about intent, feelings, or motivations
- Do NOT use labeling language (e.g., "troublemaker", "aggressive student")
- Keep tone professional and neutral throughout
- Format for easy reading and official documentation

Write the incident report now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reportContent = message.content[0].text;

    return Response.json({ report: reportContent });
  } catch (error) {
    console.error("Error generating incident report:", error);
    return Response.json(
      { error: "Failed to generate incident report" },
      { status: 500 }
    );
  }
}