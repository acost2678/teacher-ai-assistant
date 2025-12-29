import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      studentIdentifier,
      gradeLevel,
      setting,
      disabilityCategory,
      studentStrengths,
      studentInterests,
      whatWorks,
      reinforcers,
      problemBehaviors,
      slowTriggers,
      slowTriggersOther,
      fastTriggers,
      abcObservations,
      primaryFunction,
      secondaryFunction,
      functionNotes,
      additionalContext,
      extractedDocumentText,
      includeRecommendations,
    } = await request.json();

    if (!problemBehaviors || problemBehaviors.length === 0) {
      return Response.json(
        { error: "At least one problem behavior is required" },
        { status: 400 }
      );
    }

    // Format problem behaviors table
    const behaviorsFormatted = problemBehaviors.map((pb, i) => 
      `Behavior ${i + 1}: ${pb.behavior}
  - Definition: ${pb.definition || 'Not specified'}
  - Frequency: ${pb.frequency || 'Not specified'}
  - Duration: ${pb.duration || 'Not specified'}
  - Intensity: ${pb.intensity || 'moderate'}`
    ).join('\n\n');

    // Format ABC observations
    const abcFormatted = abcObservations && abcObservations.length > 0 
      ? abcObservations.map((obs, i) => 
          `Observation ${i + 1}${obs.date ? ` (${obs.date}` : ''}${obs.time ? `, ${obs.time}` : ''}${obs.setting ? `, ${obs.setting}` : ''}${obs.date || obs.time || obs.setting ? ')' : ''}:
  - Antecedent: ${obs.antecedent || 'Not recorded'}
  - Behavior: ${obs.behavior || 'Not recorded'}
  - Consequence: ${obs.consequence || 'Not recorded'}`
        ).join('\n\n')
      : 'No ABC observations provided';

    const prompt = `You are an experienced Board Certified Behavior Analyst (BCBA) writing a comprehensive Functional Behavioral Assessment (FBA). Generate a professional FBA document based on the data provided.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder throughout - NEVER invent a name
- This is a privacy-first system for FERPA compliance

---

**STUDENT INFORMATION:**
- Student Identifier: ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Primary Setting: ${setting}
${disabilityCategory ? `- Disability Category: ${disabilityCategory}` : ''}

**STUDENT STRENGTHS:**
${studentStrengths || 'Not specified'}

**STUDENT INTERESTS:**
${studentInterests || 'Not specified'}

**WHAT WORKS FOR THIS STUDENT:**
${whatWorks || 'Not specified'}

**EFFECTIVE REINFORCERS:**
${reinforcers || 'Not specified'}

---

**PROBLEM BEHAVIORS:**
${behaviorsFormatted}

---

**SETTING CONDITIONS/ANTECEDENTS:**

Slow Triggers (Setting Events):
${slowTriggers && slowTriggers.length > 0 ? slowTriggers.join(', ') : 'None specified'}
${slowTriggersOther ? `\nAdditional: ${slowTriggersOther}` : ''}

Fast Triggers (Immediate Antecedents):
${fastTriggers || 'Not specified'}

---

**ABC OBSERVATION DATA:**
${abcFormatted}

---

**FUNCTION HYPOTHESIS:**
Primary Function: ${primaryFunction || 'Not specified'}
${secondaryFunction ? `Secondary Function: ${secondaryFunction}` : ''}
${functionNotes ? `Notes: ${functionNotes}` : ''}

---

**ADDITIONAL CONTEXT:**
${additionalContext || 'None provided'}

${extractedDocumentText ? `
---
**INFORMATION FROM UPLOADED DOCUMENTS:**
${extractedDocumentText}
---
` : ''}

**GENERATE A COMPLETE FBA USING THIS EXACT FORMAT:**

# Functional Behavior Assessment

The following information was gathered by reviewing the student's records and informal interviews with parents and staff. An FBA is a process for gathering information to maximize the efficiency of behavioral support.

## Student Strengths

[Write 2-3 paragraphs about the student's strengths, including:
- What parents/family report about the student's positive qualities
- What the student is good at
- Positive social skills observed
- What the student likes at school
- What reinforcement/acknowledgment works for this student
- Include specific examples from the data provided]

## Setting Conditions/Antecedents

### Slow Triggers (Setting Events):
[Write a paragraph describing the background conditions that make behavior more likely - things that don't directly cause the behavior but "set the stage." Include items from the slow triggers list and any additional context.]

### Fast Triggers (Immediate):
[Create a bulleted list of specific situations that immediately precede/trigger the behavior. Use the fast triggers provided and any patterns from ABC data.]

## Problem Behavior

[Create a formatted table with these columns:]

| Behavior | Definition | Frequency | Duration | Intensity |
|----------|------------|-----------|----------|-----------|
[Fill in each problem behavior with its details]

## Maintaining Consequences (Function of the behavior)

[Write 2-3 paragraphs analyzing:
- The hypothesized function(s) of the behavior
- Evidence supporting this hypothesis from the ABC data
- How the behavior serves the student (what they get or avoid)
- Note any complexity in the student's behavior patterns
- End with a clear hypothesis statement]

**Hypothesis Statement:**
It is hypothesized that [Student Name] engages in [behaviors] to [function - what they get or avoid]. [Supporting evidence from data.]

${includeRecommendations ? `
## Replacement Behaviors

(Strategies that make problem behavior irrelevant, ineffective, and inefficient)

### Setting Event Strategies
[List 4-6 specific strategies to address the slow triggers/setting events. Format as bullet points starting with action verbs.]

### Predictor Strategies
[List 4-6 specific strategies to prevent the immediate triggers. Include proactive approaches like previewing, warnings, reducing pressure.]

### Teaching Strategies
[List 4-6 specific strategies for teaching new skills and providing instruction in a way that works for this student. Include how to break down tasks, provide support, and allow for the student's needs.]

### Consequence Strategies
[List 3-4 strategies for:
- How to respond when appropriate behavior occurs (reinforcement)
- How to respond when replacement behavior is used
- How to respond when problem behavior occurs
- What to limit or provide contingently]
` : ''}

---

**Assessment Conducted By:** [Name, Title]
**Date:** [Current Date]

---

*This Functional Behavior Assessment provides hypotheses about the function of [Student Name]'s behavior based on available data. Recommendations should be reviewed by qualified professionals and implemented with ongoing data collection to verify effectiveness.*

---

**FORMATTING REQUIREMENTS:**
- Use markdown formatting with ## for section headers
- Use bullet points (- ) for lists
- Create the Problem Behavior section as a proper table
- Write in professional, objective language
- Use "[Student Name]" consistently - never invent names
- Be specific and reference the actual data provided
- Make all recommendations practical and implementable
- If data is missing, note what additional information would be helpful

Write the complete FBA document now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      messages: [{ role: "user", content: prompt }],
    });

    const fba = message.content[0].text;

    return Response.json({ fba });
  } catch (error) {
    console.error("Error generating FBA:", error);
    return Response.json(
      { error: "Failed to generate FBA" },
      { status: 500 }
    );
  }
}