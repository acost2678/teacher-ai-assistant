import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      studentNeeds,
      contentArea,
      activityType,
      specificChallenges,
      existingAccommodations,
      includeImplementation,
      includeMonitoring,
      includeParentCommunication,
    } = await request.json();

    if (!studentNeeds || studentNeeds.length === 0) {
      return Response.json(
        { error: "At least one student need must be selected" },
        { status: 400 }
      );
    }

    const studentNeedsDescriptions = {
      "iep-learning-disability": "IEP - Learning Disability (reading, writing, math specific)",
      "iep-adhd": "IEP/504 - ADHD/Executive Function challenges",
      "iep-autism": "IEP - Autism Spectrum (communication, sensory, routine needs)",
      "iep-speech": "IEP - Speech/Language Impairment",
      "iep-emotional": "IEP - Emotional/Behavioral Disability",
      "iep-intellectual": "IEP - Intellectual Disability",
      "iep-physical": "IEP - Physical/Motor Disability",
      "504-medical": "504 - Medical Condition (diabetes, epilepsy, etc.)",
      "504-anxiety": "504 - Anxiety/Mental Health",
      "ell-beginning": "ELL - Beginning/Entering (WIDA 1-2)",
      "ell-intermediate": "ELL - Intermediate (WIDA 3-4)",
      "ell-advanced": "ELL - Advanced (WIDA 5-6)",
      "gifted": "Gifted/Twice Exceptional",
      "trauma": "Trauma-Informed Needs",
      "sensory": "Sensory Processing Needs",
    };

    const activityTypes = {
      "instruction": "Direct Instruction/Lecture",
      "independent": "Independent Work",
      "group": "Group/Collaborative Work",
      "assessment": "Assessment/Testing",
      "reading": "Reading Activities",
      "writing": "Writing Activities",
      "math": "Math Activities",
      "discussion": "Class Discussion",
      "project": "Project-Based Learning",
      "transition": "Transitions",
    };

    const selectedNeeds = studentNeeds.map(n => studentNeedsDescriptions[n] || n).join("\n- ");

    const prompt = `You are an expert special education specialist and inclusion coach who creates practical, evidence-based accommodations that help students access learning while maintaining rigor.

**ACCOMMODATION PLANNING REQUEST:**

**Student Profile:**
- Grade Level: ${gradeLevel || "Not specified"}
- Identified Needs:
  - ${selectedNeeds}
- Content Area: ${contentArea || "General"}
- Activity Type: ${activityTypes[activityType] || activityTypes["instruction"]}
${specificChallenges ? `- Specific Challenges: ${specificChallenges}` : ""}
${existingAccommodations ? `- Current Accommodations: ${existingAccommodations}` : ""}

**GENERATE COMPREHENSIVE ACCOMMODATION PLAN:**

---

# ♿ Accommodation Plan

**Grade Level:** ${gradeLevel || "Not specified"}
**Content Area:** ${contentArea || "General"}
**Activity Type:** ${activityType || "Instruction"}

**Student Needs Addressed:**
${studentNeeds.map(n => `- ${studentNeedsDescriptions[n] || n}`).join('\n')}

---

## 📋 Accommodation Overview

### Presentation Accommodations
*How information is presented to the student*

| Accommodation | Purpose | Implementation |
|---------------|---------|----------------|
| [Specific accommodation] | [Why it helps] | [How to do it] |
| [Specific accommodation] | [Why it helps] | [How to do it] |
| [Specific accommodation] | [Why it helps] | [How to do it] |

### Response Accommodations
*How the student demonstrates learning*

| Accommodation | Purpose | Implementation |
|---------------|---------|----------------|
| [Specific accommodation] | [Why it helps] | [How to do it] |
| [Specific accommodation] | [Why it helps] | [How to do it] |
| [Specific accommodation] | [Why it helps] | [How to do it] |

### Setting Accommodations
*Where and when learning occurs*

| Accommodation | Purpose | Implementation |
|---------------|---------|----------------|
| [Specific accommodation] | [Why it helps] | [How to do it] |
| [Specific accommodation] | [Why it helps] | [How to do it] |

### Timing/Scheduling Accommodations
*Time-related supports*

| Accommodation | Purpose | Implementation |
|---------------|---------|----------------|
| [Specific accommodation] | [Why it helps] | [How to do it] |
| [Specific accommodation] | [Why it helps] | [How to do it] |

---

## 🎯 Specific Recommendations for ${activityType || "This Activity"}

### Before the Activity
- [ ] [Preparation step]
- [ ] [Preparation step]
- [ ] [Preparation step]

### During the Activity
- [ ] [Support to provide]
- [ ] [Check-in to do]
- [ ] [Adaptation to make]

### After the Activity
- [ ] [Follow-up support]
- [ ] [Assessment consideration]

---

${includeImplementation ? `
## 📝 Implementation Guide

### Daily Accommodations Checklist

**Morning/Start of Class:**
- [ ] [Specific action]
- [ ] [Specific action]
- [ ] [Specific action]

**During Instruction:**
- [ ] [Specific action]
- [ ] [Specific action]
- [ ] [Specific action]

**During Independent Work:**
- [ ] [Specific action]
- [ ] [Specific action]

**During Assessments:**
- [ ] [Specific action]
- [ ] [Specific action]
- [ ] [Specific action]

**End of Day/Class:**
- [ ] [Specific action]
- [ ] [Specific action]

### Quick Reference Card (for substitute/support staff)

**Student Needs:** [Brief summary]

**Essential Accommodations:**
1. [Most important accommodation]
2. [Second most important]
3. [Third most important]

**If Struggling, Try:**
- [De-escalation/support strategy]
- [Alternative approach]

**Avoid:**
- [What not to do]
- [Common mistakes]

---
` : ""}

${includeMonitoring ? `
## 📊 Monitoring & Progress

### Accommodation Effectiveness Tracking

| Accommodation | Working Well | Needs Adjustment | Notes |
|---------------|--------------|------------------|-------|
| [Accommodation 1] | □ | □ | |
| [Accommodation 2] | □ | □ | |
| [Accommodation 3] | □ | □ | |

### Signs Accommodations Are Working
- [Observable behavior 1]
- [Observable behavior 2]
- [Observable behavior 3]

### Signs Accommodations Need Adjustment
- [Warning sign 1]
- [Warning sign 2]
- [Warning sign 3]

### Data Collection Ideas
- [Simple data to track]
- [What to observe]
- [When to reassess]

### Fading Plan (when appropriate)
Some accommodations may be gradually reduced as skills develop:

| Accommodation | Current Level | Target | Fading Steps |
|---------------|---------------|--------|--------------|
| [Accommodation] | [Current] | [Goal] | [Steps] |

---
` : ""}

${includeParentCommunication ? `
## 👨‍👩‍👧 Parent Communication

### Sample Email to Parents

Subject: Classroom Accommodations for [Student]

Dear [Parent Name],

I wanted to share the accommodations we're using in class to support [Student Name]'s learning. These accommodations are designed to help [Student] access the same rigorous curriculum as their peers while addressing their specific needs.

**Accommodations We're Using:**
- [Accommodation 1]: [Brief parent-friendly explanation]
- [Accommodation 2]: [Brief parent-friendly explanation]
- [Accommodation 3]: [Brief parent-friendly explanation]

**How You Can Support at Home:**
- [Home strategy 1]
- [Home strategy 2]
- [Home strategy 3]

I'm happy to discuss these accommodations further or answer any questions you might have. 

Best regards,
[Teacher Name]

---

### Home-School Connection

**What Parents Can Do:**
- [Specific home support 1]
- [Specific home support 2]
- [Specific home support 3]

**Communication Plan:**
- [How often to update parents]
- [What information to share]
- [How to request parent input]

---
` : ""}

## ⚖️ Legal Compliance Notes

**Remember:**
- Accommodations provide ACCESS, not advantage
- Accommodations do NOT change the content/standard
- Accommodations must be consistently implemented
- Document accommodation use for assessments
- Students should understand their accommodations

**Modification vs. Accommodation:**
- **Accommodation:** Changes HOW student learns (what we're planning here)
- **Modification:** Changes WHAT student learns (requires IEP team decision)

---

## 🔧 Troubleshooting

### Common Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Student refuses accommodation | [Strategy] |
| Accommodation disrupts class | [Strategy] |
| Accommodation not helping | [Strategy] |
| Peers asking about accommodation | [Strategy] |
| Time constraints | [Strategy] |

---

**ACCOMMODATION PRINCIPLES:**
- Start with the student's strengths
- Accommodations should be invisible when possible
- Promote independence, not dependence
- Regularly review and adjust
- Involve the student in understanding their accommodations
- Consistency across settings is crucial`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const accommodationPlan = message.content[0].text;

    return Response.json({ accommodationPlan });
  } catch (error) {
    console.error("Error generating accommodation plan:", error);
    return Response.json(
      { error: "Failed to generate accommodation plan" },
      { status: 500 }
    );
  }
}