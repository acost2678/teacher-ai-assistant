import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      classSize,
      roomSetup,
      studentConsiderations,
      groupingGoal,
      constraints,
      includeStrategies,
      includeAlternatives,
    } = await request.json();

    if (!classSize) {
      return Response.json(
        { error: "Class size is required" },
        { status: 400 }
      );
    }

    const roomSetups = {
      "rows": "Traditional Rows - Desks facing front in rows",
      "pairs": "Partner Pairs - Desks in pairs facing front",
      "groups-4": "Groups of 4 - Cluster desks in groups of 4",
      "groups-6": "Groups of 6 - Cluster desks in groups of 6",
      "u-shape": "U-Shape/Horseshoe - Desks around perimeter",
      "flexible": "Flexible Seating - Mixed setup with options",
    };

    const groupingGoals = {
      "academic-mixed": "Academically Mixed - Heterogeneous ability grouping",
      "behavior": "Behavior Management - Strategic separation/pairing",
      "social": "Social Development - Building peer relationships",
      "collaborative": "Collaborative Learning - Optimized for group work",
      "focus": "Focus & Attention - Minimize distractions",
    };

    const prompt = `You are an expert classroom management specialist who creates strategic seating arrangements.

**SEATING CHART REQUEST:**
- Grade Level: ${gradeLevel || "Elementary"}
- Class Size: ${classSize} students
- Room Setup: ${roomSetups[roomSetup] || roomSetups["groups-4"]}
- Grouping Goal: ${groupingGoals[groupingGoal] || groupingGoals["academic-mixed"]}
${studentConsiderations ? `- Student Considerations: ${studentConsiderations}` : ""}
${constraints ? `- Constraints: ${constraints}` : ""}

---

# 🪑 Seating Chart Plan

**Class Size:** ${classSize} students
**Room Setup:** ${roomSetups[roomSetup] || "Groups of 4"}
**Primary Goal:** ${groupingGoals[groupingGoal] || "Academically Mixed"}

---

## 📐 Room Layout

\`\`\`
FRONT OF ROOM / BOARD
═══════════════════════════════════════

[Create ASCII diagram for ${classSize} students in ${roomSetup || "groups-4"} arrangement]

\`\`\`

### Key Positions

| Position | Best For | Reasoning |
|----------|----------|-----------|
| Front center | Students needing focus support | Direct teacher proximity |
| Front sides | Visual/hearing needs | Clear sightlines |
| Middle | Self-directed learners | Balance of access |
| Near door | Students needing breaks | Easy exit/entry |
| Near teacher desk | Students needing check-ins | Quick support access |

---

## 🎯 Grouping Guidelines

### Ideal Group Composition:
| Role | Characteristics | Contribution |
|------|-----------------|--------------|
| Leader | Organized, responsible | Keeps group on track |
| Contributor | Active participant | Shares ideas readily |
| Questioner | Curious, thoughtful | Deepens discussion |
| Supporter | Patient, kind | Helps struggling peers |

### Avoid Grouping Together:
- Two high-social students (off-task risk)
- Two students with same attention needs
- Known conflict pairs

---

## 👤 Placement Strategies

### Front Placement:
- Vision/hearing accommodations
- Attention/focus support needs
- Frequent teacher check-ins needed

### Flexible Placement:
- Self-directed learners
- Strong focus skills
- Potential peer mentors

### Strategic Separations:
- Students who distract each other
- Known social conflicts
- Similar off-task patterns

### Strategic Pairings:
- Patient peer + struggling student
- Quiet student + encouraging peer
- ELL + bilingual helper

---

${includeStrategies ? `
## 💡 Implementation

### Day 1 Script:
"I've thought carefully about where everyone sits. Your seat helps you learn best - it's not a punishment or reward."

### First Week Monitoring:
- [ ] Watch for off-task groups
- [ ] Note productive partnerships
- [ ] Identify needed adjustments

### When to Change:
- After 4-6 weeks (routine refresh)
- After breaks/holidays
- When behavior issues persist
- For different project types

---
` : ""}

${includeAlternatives ? `
## 🔄 Quick-Change Options

| Activity | Arrangement | Time |
|----------|-------------|------|
| Direct instruction | Current setup | N/A |
| Partner work | Turn to neighbor | 30 sec |
| Group projects | Combine pairs | 2 min |
| Testing | Spread out/rows | 3-5 min |
| Discussion | Circle/horseshoe | 3-5 min |

---
` : ""}

## 📋 Group Assignment Template

**Group 1:** _______, _______, _______, _______
**Group 2:** _______, _______, _______, _______
**Group 3:** _______, _______, _______, _______
**Group 4:** _______, _______, _______, _______
**Group 5:** _______, _______, _______, _______
**Group 6:** _______, _______, _______, _______

### Placement Notes

| Student | Seat | Reason | Pair With/Avoid |
|---------|------|--------|-----------------|
| | | | |
| | | | |
| | | | |

---

## ⚠️ Common Pitfalls

| Avoid | Instead |
|-------|---------|
| All high achievers together | Mix abilities per group |
| Best friends always together | Strategic separation |
| Isolating struggling students | Pair with supportive peer |
| Never changing seats | Rotate every 4-6 weeks |

---

## 📊 2-Week Check

| Metric | Rating 1-5 | Notes |
|--------|------------|-------|
| Student focus | | |
| Collaboration quality | | |
| Behavior incidents | | |
| Traffic flow | | |`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const seatingPlan = message.content[0].text;

    return Response.json({ seatingPlan });
  } catch (error) {
    console.error("Error generating seating plan:", error);
    return Response.json(
      { error: "Failed to generate seating plan" },
      { status: 500 }
    );
  }
}