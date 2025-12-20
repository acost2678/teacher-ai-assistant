import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      dayLength,
      classInfo,
      existingPlans,
      specialConsiderations,
      includeEmergencyInfo,
      includeClassMap,
      includeStudentNotes,
    } = await request.json();

    const dayLengths = {
      "full": "Full Day",
      "half-am": "Half Day (Morning)",
      "half-pm": "Half Day (Afternoon)",
      "single-period": "Single Period/Class",
    };

    const prompt = `You are an expert teacher who creates comprehensive, easy-to-follow substitute teacher plans that ensure a smooth day for both the sub and students.

**SUBSTITUTE PLAN REQUEST:**

**Class Information:**
- Grade Level: ${gradeLevel || "Elementary"}
- Subject(s): ${subject || "All Subjects"}
- Day Type: ${dayLengths[dayLength] || "Full Day"}
${classInfo ? `- Class Details: ${classInfo}` : ""}
${existingPlans ? `- Lesson Plans Available: ${existingPlans}` : ""}
${specialConsiderations ? `- Special Considerations: ${specialConsiderations}` : ""}

---

# 📋 Substitute Teacher Plans

**Grade/Subject:** ${gradeLevel || "___"} - ${subject || "___"}
**Date:** _______________
**Regular Teacher:** _______________
**Day Type:** ${dayLengths[dayLength] || "Full Day"}

---

## 👋 Welcome!

Thank you for being here today! This packet contains everything you need for a successful day. Please don't hesitate to ask the teacher next door or the office if you have questions.

**Your Classroom Neighbor(s):**
- Room ___: Mr./Ms. _______________ (Can help with questions)
- Room ___: Mr./Ms. _______________ (Backup)

**Office Extension:** _______________

---

## ⏰ Daily Schedule

| Time | Activity | Location | Notes |
|------|----------|----------|-------|
| [Start time] | Arrival / Morning Routine | Classroom | [Brief notes] |
| | [Subject/Activity 1] | | |
| | [Subject/Activity 2] | | |
| | Recess/Break | [Location] | Duty: [Yes/No] |
| | [Subject/Activity 3] | | |
| | Lunch | [Location] | Students [walk self/need escort] |
| | [Subject/Activity 4] | | |
| | [Subject/Activity 5] | | |
| | Specials/Related Arts | [Location] | [Teacher picks up/you walk] |
| | Pack Up / Dismissal | Classroom | [Dismissal procedures] |

---

## 🚪 Arrival Procedures

**When Students Arrive:**
1. [What students should do when they enter]
2. [Morning work/activity]
3. [Attendance procedure]
4. [Lunch count if applicable]

**Morning Work (on desks/board):**
[Describe the independent work students should do]

---

## 📚 Lesson Plans

### [Subject/Period 1]: _______________

**Time:** _____ to _____

**Materials:** 
- [Item 1 - location]
- [Item 2 - location]

**Lesson:**
1. [Step 1 - detailed instruction for sub]
2. [Step 2]
3. [Step 3]

**If Students Finish Early:**
- [Option 1]
- [Option 2]

**Collect:** [What to collect, where to put it]

---

### [Subject/Period 2]: _______________

**Time:** _____ to _____

**Materials:**
- [Item 1 - location]
- [Item 2 - location]

**Lesson:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**If Students Finish Early:**
- [Early finisher options]

---

### [Subject/Period 3]: _______________

**Time:** _____ to _____

**Materials:**
- [Materials needed]

**Lesson:**
[Detailed instructions]

---

## 🆘 Emergency Plans

**If Technology Doesn't Work:**
[Backup activity - no tech required]

**If Lesson Runs Short:**
- [Extra activity 1]
- [Extra activity 2]
- Silent reading
- [Educational game/activity]

**If Lesson Runs Long:**
- It's okay to stop at a good point
- [What can be skipped/shortened]

---

${includeEmergencyInfo ? `
## 🚨 Emergency Procedures

**Fire Drill:**
- Exit: [Which door/route]
- Line up: [Where outside]
- Take: Attendance clipboard (by door)

**Lockdown:**
- Lock door
- Lights off
- Students to [location in room]
- Away from [doors/windows]
- Silent

**Medical Emergency:**
- Call office: [extension]
- [Student name] has [condition] - see health notes
- First aid kit: [location]

**Severe Weather:**
- Move to: [interior location]
- Students sit: [position]

---
` : ""}

${includeClassMap ? `
## 🗺️ Classroom Map

\`\`\`
[Basic ASCII layout of classroom]

FRONT (Board/Screen)
═══════════════════════════════

    [Desk]  [Desk]  [Desk]  [Desk]
    [Desk]  [Desk]  [Desk]  [Desk]
    [Desk]  [Desk]  [Desk]  [Desk]
    [Desk]  [Desk]  [Desk]  [Desk]
    [Desk]  [Desk]  [Desk]  [Desk]

                        [Teacher Desk]
    
DOOR                            WINDOWS

\`\`\`

**Key Locations:**
- Teacher desk: [location]
- Sub folder: [location]
- Supplies: [location]
- Bathroom passes: [location]
- Tissues: [location]
- First aid: [location]

---
` : ""}

${includeStudentNotes ? `
## 👤 Student Notes

### Students Who May Need Support
| Student | Need | How to Help |
|---------|------|-------------|
| | | |
| | | |
| | | |

### Reliable Helpers
These students can help with procedures/questions:
- [Student name]
- [Student name]
- [Student name]

### Health/Medical Notes
| Student | Condition | Action |
|---------|-----------|--------|
| | | |
| | | |

### Behavior Notes
| Student | What to Watch For | What Helps |
|---------|-------------------|------------|
| | | |
| | | |

---
` : ""}

## ✅ Classroom Procedures

### Bathroom
[Procedure - how many at a time, passes, etc.]

### Getting Help
[Procedure - raise hand, ask neighbor first, etc.]

### Sharpening Pencils
[Procedure]

### Turning in Work
[Procedure - where to put completed work]

### Early Finishers
[What students should do when done]

### Attention Signal
[Your attention signal - what you say/do, what students do]

---

## 🎒 Dismissal Procedures

**[Time] Before Dismissal:**
1. [Clean up instruction]
2. [Pack up instruction]
3. [Stack chairs/push in chairs]

**Dismissal Groups:**
- Bus Riders: [Procedure]
- Car Riders: [Procedure]
- Walkers: [Procedure]
- After School: [Students who stay]

**Order of Dismissal:**
1. [First group]
2. [Second group]
3. [Third group]

---

## 📝 Please Leave Notes

**At the End of the Day, Please:**
- [ ] Note how the day went (back of this page)
- [ ] List any behavior issues
- [ ] Note what was/wasn't completed
- [ ] Leave on my desk

**Behavior to Report:**
[Space for sub to write]

**Lessons Completed:**
[Space for sub to check/write]

**General Notes:**
[Space for sub to write]

---

## 💡 Helpful Tips

- Students may test boundaries - stay consistent with procedures
- If unsure, ask [neighbor teacher]
- It's okay if you don't get to everything
- Your presence and management are most important
- Thank you for being here!

---

**Important Contacts:**
- Office: _______________
- Principal: _______________
- Nurse: _______________
- My personal cell (emergencies only): _______________`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const subPlan = message.content[0].text;

    return Response.json({ subPlan });
  } catch (error) {
    console.error("Error generating sub plan:", error);
    return Response.json(
      { error: "Failed to generate sub plan" },
      { status: 500 }
    );
  }
}