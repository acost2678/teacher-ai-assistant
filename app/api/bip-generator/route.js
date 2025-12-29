import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      studentIdentifier,
      gradeLevel,
      setting,
      disabilityCategory,
      bipDate,
      reviewDate,
      problemBehaviors,
      primaryFunction,
      secondaryFunction,
      functionHypothesis,
      antecedents,
      consequences,
      replacementBehaviors,
      antecedentStrategies,
      teachingStrategies,
      consequenceStrategies,
      reinforcementPlan,
      studentStrengths,
      studentInterests,
      previousInterventions,
      dataCollectionMethod,
      monitoringFrequency,
      goalCriteria,
      staffResponsible,
      trainingNeeded,
      communicationPlan,
      extractedDocumentText,
      includeDataSheet,
      includeCrisisPlan,
    } = await request.json();

    if (!problemBehaviors || problemBehaviors.length === 0) {
      return Response.json(
        { error: "At least one problem behavior is required" },
        { status: 400 }
      );
    }

    // Format problem behaviors
    const behaviorsFormatted = problemBehaviors.map((pb, i) => 
      `Behavior ${i + 1}: ${pb.behavior}
  - Definition: ${pb.definition || 'Not specified'}
  - Baseline Frequency: ${pb.frequency || 'Not specified'}
  - Baseline Duration: ${pb.duration || 'Not specified'}
  - Intensity: ${pb.intensity || 'Not specified'}
  - Latency: ${pb.latency || 'Not specified'}
  - Settings: ${pb.settings || 'Not specified'}`
    ).join('\n\n');

    // Format replacement behaviors
    const replacementsFormatted = replacementBehaviors && replacementBehaviors.length > 0
      ? replacementBehaviors.map((rb, i) => 
          `Replacement ${i + 1}: ${rb.behavior}
  - How it meets the function: ${rb.howItMeetsFunction || 'Not specified'}
  - Teaching plan: ${rb.teachingPlan || 'Not specified'}`
        ).join('\n\n')
      : 'Not specified';

    const prompt = `You are an experienced Board Certified Behavior Analyst (BCBA) creating a comprehensive Behavior Intervention Plan (BIP) that meets IDEA requirements.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder throughout - NEVER invent a name
- This is a privacy-first system for FERPA compliance

---

**STUDENT INFORMATION:**
- Student Identifier: ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Primary Setting: ${setting}
${disabilityCategory ? `- Disability Category: ${disabilityCategory}` : ''}
- BIP Date: ${bipDate || '[Date]'}
- Review Date: ${reviewDate || '[Date]'}

**STUDENT STRENGTHS:** ${studentStrengths || 'Not specified'}

**STUDENT INTERESTS/REINFORCERS:** ${studentInterests || 'Not specified'}

---

**TARGET BEHAVIOR(S) WITH BASELINE DATA:**
${behaviorsFormatted}

---

**FUNCTION OF BEHAVIOR:**
- Primary Function: ${primaryFunction || 'Not specified'}
${secondaryFunction ? `- Secondary Function: ${secondaryFunction}` : ''}
- Hypothesis: ${functionHypothesis || 'Not specified'}
- Antecedents/Triggers: ${antecedents || 'Not specified'}
- Consequences (what happens after): ${consequences || 'Not specified'}

---

**REPLACEMENT BEHAVIORS:**
${replacementsFormatted}

---

**INTERVENTION STRATEGIES:**

Antecedent Strategies:
${antecedentStrategies || 'Not specified'}

Teaching Strategies:
${teachingStrategies || 'Not specified'}

Consequence Strategies:
${consequenceStrategies || 'Not specified'}

Reinforcement Plan:
${reinforcementPlan || 'Not specified'}

---

**PREVIOUS INTERVENTIONS:** ${previousInterventions || 'Not specified'}

---

**PROGRESS MONITORING:**
- Data Collection Method: ${dataCollectionMethod || 'Not specified'}
- Monitoring Frequency: ${monitoringFrequency || 'Not specified'}
- Goal/Success Criteria: ${goalCriteria || 'Not specified'}

---

**IMPLEMENTATION:**
- Staff Responsible: ${staffResponsible || 'Not specified'}
- Training Needed: ${trainingNeeded || 'Not specified'}
- Communication Plan: ${communicationPlan || 'Not specified'}

${extractedDocumentText ? `
---
**INFORMATION FROM UPLOADED DOCUMENTS:**
${extractedDocumentText}
---
` : ''}

**GENERATE A COMPLETE BIP USING THIS FORMAT:**

# BEHAVIOR INTERVENTION PLAN

## Student Information
| Field | Information |
|-------|-------------|
| Student Name | [Student Name] |
| Grade Level | ${gradeLevel} |
| Primary Setting | ${setting} |
| Disability Category | ${disabilityCategory || '[Category]'} |
| BIP Date | ${bipDate || '[Date]'} |
| Review Date | ${reviewDate || '[Date]'} |

## Student Strengths & Interests
[Write a paragraph about the student's strengths, positive qualities, and interests that can be used for reinforcement]

## Target Behavior(s)

### Behavior Definition Table
| Behavior | Operational Definition | Baseline Frequency | Duration | Intensity |
|----------|----------------------|-------------------|----------|-----------|
[Fill in for each behavior]

### Settings Where Behavior Occurs
[List the settings, times, and contexts where behavior is most likely]

## Function of Behavior

### Hypothesis Statement
[Write a clear hypothesis statement: "When [antecedent], [Student Name] engages in [behavior] in order to [function]. This is supported by [evidence]."]

### Antecedents/Triggers
[List specific antecedents that trigger the behavior]

### Maintaining Consequences
[What happens after the behavior that reinforces it? What does the student get or avoid?]

## Replacement Behavior(s)

For each replacement behavior, include:
| Replacement Behavior | How It Meets Same Function | How It Will Be Taught |
|---------------------|---------------------------|----------------------|
[Fill in table]

## Intervention Strategies

### Antecedent Strategies (Prevention)
[List strategies to prevent behavior from occurring - bullet points]

### Teaching Strategies
[List strategies for teaching replacement behaviors - bullet points]

### Consequence Strategies

**When replacement behavior occurs:**
[List how staff should respond positively]

**When problem behavior occurs:**
[List how staff should respond - minimize reinforcement of problem behavior]

### Reinforcement Plan
[Describe the reinforcement system in detail]

## Progress Monitoring

### Data Collection
- **Method:** ${dataCollectionMethod || '[Specify method]'}
- **Frequency:** ${monitoringFrequency || '[Specify frequency]'}
- **Responsible Party:** [Who collects data]

### Goal Criteria
${goalCriteria || '[Specify measurable goals]'}

### Schedule for Measuring Effectiveness
[Specify when progress will be reviewed and reported]

## Implementation Plan

### Staff Responsibilities
[List each staff member and their specific role]

### Training Requirements
[List training needed before implementation]

### Communication Plan
[How will progress be shared with parents and team?]

${includeCrisisPlan ? `
## Crisis/Safety Plan

### Warning Signs (Precursor Behaviors)
[List early warning signs that behavior may escalate]

### De-escalation Strategies
[List strategies to use when warning signs appear]

### Crisis Response Procedures
[Step-by-step response if behavior becomes dangerous]

### Post-Crisis Procedures
[What to do after a crisis - debriefing, documentation, return to routine]

### Emergency Contacts
[List who to contact in emergency]
` : ''}

${includeDataSheet ? `
## Data Collection Sheet Template

**Student:** [Student Name]
**Week of:** _____________
**Target Behavior:** ${problemBehaviors[0]?.behavior || '[Behavior]'}

| Date | Time | Antecedent | Behavior | Consequence | Duration | Intensity | Staff Initials |
|------|------|------------|----------|-------------|----------|-----------|----------------|
|      |      |            |          |             |          |           |                |
|      |      |            |          |             |          |           |                |
|      |      |            |          |             |          |           |                |

**Daily Totals:**
- Total incidents: ____
- Replacement behavior used: ____ times

**Notes:**
_________________________________________________
` : ''}

---

## Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Parent/Guardian | | | |
| General Ed Teacher | | | |
| Special Ed Teacher | | | |
| Administrator | | | |
| Other: _________ | | | |

---

**Next Review Date:** ${reviewDate || '[Date]'}

*This Behavior Intervention Plan is based on the results of a Functional Behavioral Assessment and includes positive behavioral supports. The plan must be reviewed at least annually and revised as needed based on progress monitoring data.*

---

**FORMATTING REQUIREMENTS:**
- Use markdown formatting with ## for section headers
- Use tables where specified
- Use bullet points for lists
- Write in professional, objective language
- Use "[Student Name]" consistently
- Make all strategies specific and implementable
- Include baseline data for measuring progress

Generate the complete BIP now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const bip = message.content[0].text;

    return Response.json({ bip });
  } catch (error) {
    console.error("Error generating BIP:", error);
    return Response.json(
      { error: "Failed to generate BIP" },
      { status: 500 }
    );
  }
}