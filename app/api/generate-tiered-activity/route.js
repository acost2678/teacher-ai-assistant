import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      topic,
      learningObjective,
      activityType,
      tieringStrategy,
      includeRubric,
      includeMaterials,
      includeGroupingTips,
    } = await request.json();

    if (!gradeLevel || !topic) {
      return Response.json(
        { error: "Grade level and topic are required" },
        { status: 400 }
      );
    }

    const tieringStrategies = {
      "readiness": "Readiness-Based - Tiers based on skill level (approaching, on-level, advanced)",
      "learning-profile": "Learning Profile - Tiers based on how students learn (visual, auditory, kinesthetic)",
      "interest": "Interest-Based - Same skill, different contexts/topics",
      "process": "Process Differentiation - Same content, different ways to engage",
      "product": "Product Differentiation - Same content, different ways to show learning",
    };

    const activityTypes = {
      "practice": "Practice Activity - Reinforcing a skill",
      "exploration": "Exploration - Discovering a concept",
      "application": "Application - Using learning in new context",
      "assessment": "Assessment Activity - Demonstrating mastery",
      "collaborative": "Collaborative - Group-based learning",
      "independent": "Independent - Self-paced work",
    };

    const prompt = `You are an expert in differentiated instruction who creates precisely tiered activities that meet ALL learners where they are. Your tiering is intentional and substantive - not just "easy, medium, hard."

**TIERED ACTIVITY PARAMETERS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject || "General"}
- Topic: ${topic}
${learningObjective ? `- Learning Objective: ${learningObjective}` : ""}
- Activity Type: ${activityTypes[activityType] || activityTypes["practice"]}
- Tiering Strategy: ${tieringStrategies[tieringStrategy] || tieringStrategies["readiness"]}

**CREATE THREE PRECISELY TIERED ACTIVITIES:**

---

# 🎯 Tiered Activity: ${topic}

**Grade Level:** ${gradeLevel}
**Subject:** ${subject || "General"}
**Learning Objective:** ${learningObjective || `Students will demonstrate understanding of ${topic}`}
**Tiering Strategy:** ${tieringStrategy || "Readiness-Based"}

---

## 📊 Activity Overview

**Core Concept:** All tiers address the SAME essential understanding
**Essential Question:** [Question all students should be able to answer]
**Success Criteria:** [What mastery looks like - same for all tiers]

---

## 🟢 Tier 1: Approaching Grade Level

**For Students Who:** Need additional support, scaffolding, or concrete representations

### Activity Description
[Detailed activity description - NOT just a simpler version, but thoughtfully scaffolded]

### Scaffolds Provided
- [ ] Graphic organizer/template
- [ ] Word bank/sentence starters
- [ ] Worked examples
- [ ] Manipulatives/visuals
- [ ] Reduced number of items
- [ ] Chunked instructions
- [ ] Partner support

### Step-by-Step Instructions
1. [Clear, chunked step]
2. [Clear, chunked step]
3. [Clear, chunked step]
4. [Clear, chunked step]

### Materials Needed
- [Specific materials with scaffolds noted]

### Teacher Support
- Check in at: [specific checkpoints]
- Common struggles: [what to watch for]
- Intervention if stuck: [specific help to offer]

### Success Looks Like
- [Observable behavior showing understanding]
- [Minimum expectations to demonstrate mastery]

---

## 🟡 Tier 2: On Grade Level

**For Students Who:** Are working at expected level, need standard instruction

### Activity Description
[Grade-level appropriate activity that matches the learning objective directly]

### Supports Available (as needed)
- [ ] Reference materials
- [ ] Peer collaboration option
- [ ] Self-check tools

### Step-by-Step Instructions
1. [Clear step]
2. [Clear step]
3. [Clear step]
4. [Clear step]
5. [Clear step]

### Materials Needed
- [Standard materials]

### Teacher Support
- Check in at: [midpoint and end]
- Look for: [evidence of understanding]
- Extension if finishing early: [quick enrichment option]

### Success Looks Like
- [Observable behavior showing solid understanding]
- [Grade-level expectations]

---

## 🔵 Tier 3: Advanced/Exceeding

**For Students Who:** Need additional challenge, deeper complexity, or extension

### Activity Description
[Activity that goes DEEPER, not just MORE - requires higher-order thinking, connections, or application]

### Complexity Added
- [ ] Open-ended problem
- [ ] Multiple solutions/approaches
- [ ] Real-world application
- [ ] Cross-curricular connection
- [ ] Creation/design element
- [ ] Analysis/evaluation required
- [ ] Teaching others

### Instructions
1. [Step allowing for student choice/direction]
2. [Step requiring analysis or synthesis]
3. [Step with open-ended outcome]
4. [Step connecting to broader concepts]

### Materials Needed
- [Materials that allow for extension]

### Teacher Support
- Initial launch, then: [student-directed]
- Push thinking with: [probing questions]
- Avoid: [giving answers, over-scaffolding]

### Success Looks Like
- [Evidence of deeper understanding]
- [Creative or analytical application]
- [Ability to explain/teach concept]

---

## 🔄 How the Tiers Connect

| Element | Tier 1 | Tier 2 | Tier 3 |
|---------|--------|--------|--------|
| **Same Content** | ✓ ${topic} | ✓ ${topic} | ✓ ${topic} |
| **Same Objective** | ✓ | ✓ | ✓ |
| **Complexity** | Foundational | Grade-level | Extended |
| **Scaffolding** | High | Moderate | Minimal |
| **Student Choice** | Limited | Some | High |
| **Thinking Level** | Remember/Understand | Apply/Analyze | Analyze/Evaluate/Create |

---

${includeGroupingTips ? `
## 👥 Grouping Recommendations

**Flexible Grouping Reminder:** These tiers are NOT fixed tracks. Students should move between tiers based on the specific skill/content.

**How to Assign Tiers:**
- Pre-assessment data: [what to look for]
- Observation: [behaviors indicating tier]
- Student choice: [when appropriate]

**During the Activity:**
- Tier 1 students may be ready for Tier 2 mid-activity if: [signs of readiness]
- Tier 2 students may need Tier 1 support if: [signs of struggle]
- Tier 3 students may mentor others when: [appropriate moments]

**Avoiding Stigma:**
- Present all activities as different "paths" to the same destination
- Rotate which tier you introduce first
- Celebrate growth, not just achievement
- Allow students to self-select when appropriate

---
` : ""}

${includeRubric ? `
## 📋 Universal Rubric (All Tiers)

**All students are assessed on the SAME criteria - the activity differs, not the expectation for quality.**

| Criteria | 4 - Exceeds | 3 - Meets | 2 - Approaching | 1 - Beginning |
|----------|-------------|-----------|-----------------|---------------|
| **Understanding of ${topic}** | Demonstrates deep understanding with connections | Shows solid understanding | Shows partial understanding | Shows limited understanding |
| **Completion** | All components complete with extras | All components complete | Most components complete | Few components complete |
| **Quality of Work** | Exceptional care and detail | Meets quality expectations | Some attention to quality | Needs improvement |
| **Explanation** | Can teach others the concept | Can explain thinking clearly | Can explain with support | Struggles to explain |

---
` : ""}

${includeMaterials ? `
## 📦 Materials Checklist

### Tier 1 Materials
- [ ] [Specific item with scaffold]
- [ ] [Graphic organizer - template provided below or attached]
- [ ] [Word bank]
- [ ] [Visual supports]

### Tier 2 Materials
- [ ] [Standard item]
- [ ] [Reference materials]
- [ ] [Self-check tool]

### Tier 3 Materials
- [ ] [Open-ended resource]
- [ ] [Extension materials]
- [ ] [Research/creation tools]

### Prep Notes
- Must prepare in advance: [items needing prep]
- Can reuse from: [previous lessons]
- Student-provided: [what students bring]

---
` : ""}

## 💡 Teacher Reflection

After the lesson, consider:
- Were tiers appropriately matched to students?
- Did any students need to switch tiers?
- What adjustments for next time?
- Which students are ready for different placement next time?

---

**CRITICAL DIFFERENTIATION PRINCIPLES:**
- ALL tiers work toward the SAME learning objective
- Tiers differ in COMPLEXITY and SCAFFOLDING, not in rigor
- Tier 3 is DEEPER thinking, not just MORE work
- Tier 1 is SUPPORTED learning, not EASIER learning
- Assessment criteria are the SAME across tiers
- Grouping is FLEXIBLE, not fixed`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const tieredActivity = message.content[0].text;

    return Response.json({ tieredActivity });
  } catch (error) {
    console.error("Error generating tiered activity:", error);
    return Response.json(
      { error: "Failed to generate tiered activity" },
      { status: 500 }
    );
  }
}