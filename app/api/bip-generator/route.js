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

    const behaviorsFormatted = problemBehaviors
      .map(
        (pb, i) =>
          `Behavior ${i + 1}: ${pb.behavior}
  - Operational Definition: ${pb.definition || "Not specified"}
  - Baseline Frequency: ${pb.frequency || "Not specified"}
  - Baseline Duration: ${pb.duration || "Not specified"}
  - Intensity: ${pb.intensity || "Not specified"}
  - Latency: ${pb.latency || "Not specified"}
  - Settings: ${pb.settings || "Not specified"}`
      )
      .join("\n\n");

    const replacementsFormatted =
      replacementBehaviors && replacementBehaviors.length > 0
        ? replacementBehaviors
            .map(
              (rb, i) =>
                `Replacement ${i + 1}: ${rb.behavior}
  - How it meets the function: ${rb.howItMeetsFunction || "Not specified"}
  - Teaching plan: ${rb.teachingPlan || "Not specified"}`
            )
            .join("\n\n")
        : "Not specified";

    const prompt = `You are a Board Certified Behavior Analyst (BCBA) with extensive school-based experience creating legally compliant, research-grounded Behavior Intervention Plans under IDEA. Your BIPs are used directly by IEP teams and must meet federal requirements for positive behavioral supports.

**CRITICAL PRIVACY REQUIREMENT:**
Use "[Student Name]" as a placeholder throughout — never invent or use any real name. This system is FERPA-compliant.

---

**STUDENT INFORMATION:**
- Student Identifier (for your reference only): ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Primary Setting: ${setting}
${disabilityCategory ? `- Disability Category: ${disabilityCategory}` : ""}
- BIP Date: ${bipDate || "[Date]"}
- Review Date: ${reviewDate || "[Date]"}

**STUDENT STRENGTHS:** ${studentStrengths || "Not specified"}
**STUDENT INTERESTS / REINFORCERS:** ${studentInterests || "Not specified"}

---

**TARGET BEHAVIOR(S) WITH BASELINE DATA:**
${behaviorsFormatted}

---

**FUNCTION OF BEHAVIOR (FROM FBA):**
- Primary Function: ${primaryFunction || "Not specified"}
${secondaryFunction ? `- Secondary Function: ${secondaryFunction}` : ""}
- Hypothesis Statement: ${functionHypothesis || "Not specified"}
- Antecedents/Triggers: ${antecedents || "Not specified"}
- Maintaining Consequences: ${consequences || "Not specified"}

---

**REPLACEMENT BEHAVIORS:**
${replacementsFormatted}

---

**INTERVENTION STRATEGIES:**

Antecedent Strategies:
${antecedentStrategies || "Not specified"}

Teaching Strategies:
${teachingStrategies || "Not specified"}

Consequence Strategies:
${consequenceStrategies || "Not specified"}

Reinforcement Plan:
${reinforcementPlan || "Not specified"}

---

**PREVIOUS INTERVENTIONS TRIED:** ${previousInterventions || "Not specified"}

---

**PROGRESS MONITORING:**
- Data Collection Method: ${dataCollectionMethod || "Not specified"}
- Monitoring Frequency: ${monitoringFrequency || "Not specified"}
- Goal / Success Criteria: ${goalCriteria || "Not specified"}

---

**IMPLEMENTATION:**
- Staff Responsible: ${staffResponsible || "Not specified"}
- Training Needed: ${trainingNeeded || "Not specified"}
- Communication Plan: ${communicationPlan || "Not specified"}

${
  extractedDocumentText
    ? `---
**INFORMATION FROM UPLOADED DOCUMENTS:**
${extractedDocumentText}
---`
    : ""
}

---

Generate a complete, polished, IDEA-compliant Behavior Intervention Plan using the exact structure below. Write all content in professional, objective language. Fill every section with specific, actionable content based on the data above — do not leave empty brackets. Use "[Student Name]" consistently throughout.

---

# BEHAVIOR INTERVENTION PLAN

## Student Information

| Field | Information |
|-------|-------------|
| Student Name | [Student Name] |
| Grade Level | ${gradeLevel} |
| Primary Setting | ${setting} |
| Disability Category | ${disabilityCategory || "—"} |
| BIP Date | ${bipDate || "—"} |
| Review Date | ${reviewDate || "—"} |

---

## Student Strengths & Interests

[Write a strengths-based paragraph about the student's positive qualities, skills, and interests. Frame this as an asset inventory — what the student brings to the environment. Include how these strengths and interests will be leveraged in the intervention.]

---

## Target Behavior(s)

### Operational Definitions

| # | Behavior | Operational Definition | What It Does NOT Include |
|---|----------|----------------------|--------------------------|
[Fill in one row per behavior. Definition must be observable and measurable — two observers should reach the same conclusion.]

### Baseline Data

| Behavior | Frequency | Duration | Intensity | Latency | Primary Setting |
|----------|-----------|----------|-----------|---------|-----------------|
[Fill in baseline measures for each behavior]

### Behavior Patterns & Contexts
[Describe when, where, and under what conditions the behavior is most and least likely to occur. Include time of day, subject area, social context, and any patterns identified in the FBA data.]

---

## Functional Behavioral Assessment Summary

### Function of Behavior

**Primary Function:** [State clearly]
${secondaryFunction ? "**Secondary Function:** [State if applicable]" : ""}

### Hypothesis Statement
"When [specific antecedent], [Student Name] engages in [behavior] in order to [function]. This behavior is maintained by [consequence]. This hypothesis is supported by [2–3 specific data points or observations]."

### ABC Summary

**Antecedents / Triggers:**
[List specific, identified antecedents in order of frequency/impact]

**Maintaining Consequences:**
[What does the student obtain or escape/avoid? Be specific about what reinforces the behavior.]

**Setting Events / Slow Triggers:**
[Conditions that increase behavior probability even without direct triggers — hunger, fatigue, prior conflict, medication, transitions, etc.]

---

## Replacement Behavior(s)

[For each replacement behavior, explain why it is functionally equivalent — it must serve the SAME function as the problem behavior and be easier to perform.]

| Replacement Behavior | Functional Equivalence | Teaching Method | Prompting Strategy |
|---------------------|----------------------|-----------------|-------------------|
[Fill in one row per replacement behavior]

### Replacement Behavior Teaching Plan

**Direct Instruction Protocol:**
[Step-by-step how to teach each replacement behavior explicitly — include scripting, modeling, role play, and practice schedule]

**Prompting Hierarchy:**
[Full → Partial → Gestural → Independent — how to fade prompts over time]

**Criterion for Mastery:**
[How will you know the student has learned the replacement behavior? Specify rate, accuracy, and consistency criteria.]

---

## Intervention Strategies

### Antecedent Strategies (Prevention)

[Strategies that modify the environment or task demands to reduce trigger exposure. Grounded in the function hypothesis.]

| Strategy | Implementation Steps | Addresses | Who |
|----------|---------------------|-----------|-----|
[5–7 rows minimum, each specific and actionable]

### Teaching Strategies

[How replacement behaviors and related skills will be explicitly taught. Include schedule, method, and materials.]

- [Strategy 1 — specific and implementable]
- [Strategy 2]
- [Strategy 3]
- [Continue as needed]

### Consequence Strategies

**✅ When [Student Name] Uses the REPLACEMENT Behavior:**

[Describe exactly how staff respond — must immediately honor the function. Reinforce every instance initially.]

- Immediate response:
- Reinforcement provided:
- Behavior-specific praise script: "[Example word-for-word praise]"
- Reinforcement schedule: [Initial: continuous → Fading plan]

**🚫 When the TARGET BEHAVIOR Occurs:**

**Staff DO:**
[3–4 specific, calm responses that minimize reinforcement of the problem behavior]

**Staff DO NOT:**
[2–3 things that would inadvertently reinforce or escalate — critical for implementation fidelity]

**Extinction Procedure:** [If applicable — describe planned ignoring or withholding of reinforcer]

**Redirection Script:**
"[Word-for-word what staff say to redirect to replacement behavior]"

### Reinforcement Plan

[Describe the complete reinforcement system: what reinforcers, schedule, how delivered, who delivers, fading plan. Tie directly to student interests identified above.]

**Reinforcement Inventory:**
- Social reinforcers:
- Activity reinforcers:
- Tangible reinforcers (if applicable):

**Token Economy / Behavior Chart (if applicable):**
[Describe system if used]

---

## Progress Monitoring

### Measurable Goals

[Write SMART behavioral goals — Specific, Measurable, Attainable, Relevant, Time-bound]

**Goal 1 (Reduction):** By [review date], [Student Name] will reduce [target behavior] from a baseline of [baseline] to [target level] as measured by [data method] across [number] consecutive [time period].

**Goal 2 (Replacement):** By [review date], [Student Name] will independently use [replacement behavior] in [X]% of trigger situations as measured by [data method].

### Data Collection Protocol

- **Method:** ${dataCollectionMethod || "[Specify — frequency count, duration recording, interval recording, ABC data]"}
- **Frequency:** ${monitoringFrequency || "[Daily / twice weekly / weekly]"}
- **Collected By:** [Role]
- **Stored In:** [Location — behavior log, data system, folder]

### Decision Rules

| Data Pattern | Action |
|-------------|--------|
| 4+ consecutive data points above goal line | Begin fading — reduce prompt level or reinforcement frequency |
| 4+ consecutive data points below goal line | Team problem-solve — check fidelity first, then adjust plan |
| No change after 2 weeks of consistent implementation | Revisit function hypothesis; consider additional FBA data |
| Behavior increasing despite plan | Immediate team meeting; consider referral for more intensive assessment |

### Progress Review Schedule

| Review | Timeframe | Who |
|--------|-----------|-----|
| Initial fidelity check | After 1 week | Implementation team |
| Data review | Bi-weekly | Special ed teacher + data collector |
| Formal progress review | After 4–6 weeks | Full IEP team |
| Annual BIP review | Per IEP calendar | IEP team + family |

---

## Implementation Plan

### Staff Responsibilities

| Role | Staff Member | Specific Responsibilities |
|------|-------------|--------------------------|
| Primary Implementer | | Antecedent strategies, prompting, reinforcement delivery |
| Data Collector | | Daily data, weekly summary |
| Plan Coordinator | | Fidelity monitoring, team communication |
| Parent/Family Contact | | Weekly updates, home consistency |

### Training Requirements

[List specific training each staff member needs BEFORE implementation begins. Include who provides training and by what date.]

### Implementation Fidelity Checklist (Daily)

- [ ] Antecedent strategies implemented before trigger situations
- [ ] Replacement behavior prompted using correct hierarchy
- [ ] Replacement behavior reinforced consistently and immediately
- [ ] Correct staff response used when target behavior occurred
- [ ] Data collected and recorded
- [ ] Any incidents documented

### Communication Plan

[How and how often will progress be communicated to parents, team members, and administration? Include format and frequency.]

---

${
  includeCrisisPlan
    ? `## Crisis / Safety Plan

### Behavior Escalation Cycle

| Level | Signs | Staff Response |
|-------|-------|----------------|
| Calm (baseline) | [Observable indicators] | [Preventive supports in place] |
| Trigger | [Early warning signs] | [Pre-correction, prompt replacement behavior] |
| Agitation | [Escalating indicators] | [De-escalation strategies] |
| Acceleration | [Moderate escalation signs] | [Space, minimal language, safety positioning] |
| Peak | [Crisis behavior] | [Safety protocol, contact admin] |
| De-escalation | [Calming signs] | [Calm support, avoid processing immediately] |
| Recovery | [Return to baseline] | [Re-entry plan, brief debrief when ready] |

### De-escalation Strategies

[List specific, trained de-escalation techniques appropriate for this student. Include what works and what to avoid.]

**What works for this student:**
-
-

**What to avoid (known escalators):**
-
-

### Crisis Response Procedures

[Step-by-step response protocol if behavior reaches crisis level. Include who to call, in what order, and documentation requirements.]

1.
2.
3.
4.

### Post-Crisis Procedures

- **Debriefing:** [When and how to debrief with student]
- **Staff Debriefing:** [Team debrief process]
- **Documentation:** [What must be documented and within what timeframe]
- **Return to Routine:** [How to support re-entry to the classroom]
- **Parent Contact:** [When and how to notify family]

### Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Administrator on Duty | | |
| School Counselor | | |
| Parent/Guardian | | |
| District Behavior Support | | |

---
`
    : ""
}

${
  includeDataSheet
    ? `## Data Collection Sheet

**Student:** [Student Name] &nbsp;&nbsp;&nbsp; **Week of:** _____________ &nbsp;&nbsp;&nbsp; **Completed by:** _____________

**Target Behavior:** ${problemBehaviors[0]?.behavior || "[Behavior]"}
**Replacement Behavior:** ${replacementBehaviors?.[0]?.behavior || "[Replacement]"}

### ABC / Incident Log

| Date | Time | Setting | Antecedent | Target Behavior (describe) | Consequence | Duration | Intensity (L/M/H) | Replacement Used? |
|------|------|---------|------------|---------------------------|-------------|----------|-------------------|-------------------|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

### Daily Frequency Summary

| Day | Target Behavior Count | Replacement Behavior Count | Notes |
|-----|----------------------|---------------------------|-------|
| Monday | | | |
| Tuesday | | | |
| Wednesday | | | |
| Thursday | | | |
| Friday | | | |
| **Weekly Total** | | | |

### Fidelity Tracker

| Day | Antecedent strategies used? | Replacement reinforced? | Correct response to target behavior? | Data collected? |
|-----|----------------------------|------------------------|--------------------------------------|----------------|
| Mon | Y / N | Y / N | Y / N | Y / N |
| Tue | Y / N | Y / N | Y / N | Y / N |
| Wed | Y / N | Y / N | Y / N | Y / N |
| Thu | Y / N | Y / N | Y / N | Y / N |
| Fri | Y / N | Y / N | Y / N | Y / N |

### Weekly Summary Notes
_____________________________________________________________________________
_____________________________________________________________________________

---
`
    : ""
}

## Signatures & Team Agreement

| Role | Printed Name | Signature | Date |
|------|-------------|-----------|------|
| Parent / Guardian | | | |
| General Education Teacher | | | |
| Special Education Teacher | | | |
| School Psychologist / BCBA | | | |
| Administrator | | | |
| Other: _________________ | | | |

---

**Next Review Date:** ${reviewDate || "[Date]"}

*This Behavior Intervention Plan was developed based on Functional Behavioral Assessment data and is grounded in positive behavioral supports consistent with IDEA requirements. The plan must be reviewed at least annually and revised based on progress monitoring data. All staff responsible for implementation must receive training prior to plan initiation.*`;

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