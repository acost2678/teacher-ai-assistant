import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      conflictType,
      numberOfStudents,
      setting,
      includeRolePlay,
      includeFollowUp,
      specificScenario,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const conflictTypes = {
      "peer-argument": "Peer Argument - Disagreement between students",
      "exclusion": "Exclusion/Left Out - Student feeling excluded from group",
      "physical": "Physical Conflict - Pushing, hitting, taking items",
      "verbal": "Verbal Conflict - Name-calling, teasing, mean words",
      "rumor-gossip": "Rumors/Gossip - Spreading stories or social drama",
      "sharing-turns": "Sharing/Turn-Taking - Disputes over materials or turns",
      "group-work": "Group Work Conflict - Disagreements during collaboration",
      "misunderstanding": "Misunderstanding - Miscommunication causing hurt",
      "general": "General - Multiple conflict types",
    };

    const prompt = `You are an expert in restorative practices, conflict resolution, and social-emotional learning. Create trauma-informed, restorative conflict resolution scripts and guidance for teachers.

**CONFLICT RESOLUTION DETAILS:**
- Grade Level: ${gradeLevel}
- Conflict Type: ${conflictTypes[conflictType] || conflictTypes["general"]}
- Number of Students Involved: ${numberOfStudents || "2"}
- Setting: ${setting || "Classroom"}
${specificScenario ? `- Specific Scenario: ${specificScenario}` : ""}
${includeRolePlay ? "- Include role-play scenarios for teaching" : ""}
${includeFollowUp ? "- Include follow-up check-in plan" : ""}

**CREATE A COMPREHENSIVE CONFLICT RESOLUTION GUIDE:**

---

# 🤝 Conflict Resolution: ${conflictType ? conflictType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Peer Conflict'}

**Grade Level:** ${gradeLevel}
**Conflict Type:** ${conflictType || "General"}
**Students Involved:** ${numberOfStudents || "2"}

---

## 🎯 Goals of This Conversation

- Help all students feel heard and validated
- Understand what happened from each perspective
- Identify the impact on everyone involved
- Collaboratively create a solution
- Restore the relationship

---

## 📋 Before You Begin

**Check Yourself:**
- Am I calm enough to facilitate this?
- Do I have any bias about who's "at fault"?
- Is this the right time and place?

**Check the Students:**
- Are they regulated enough to talk?
- Do they need calming time first?
- Is anyone too upset to participate?

**Set Up:**
- Private, calm space
- Enough time (15-20 minutes minimum)
- Tissues available
- Seating at equal level (no power dynamics)

---

## 📜 Conflict Resolution Script

### Step 1: Set the Stage (2 min)

**Say:**
"Thank you both for being willing to talk this through. I'm here to help, not to get anyone in trouble. My job is to help you both feel heard and to figure this out together."

"There are some rules for our conversation:
- One person talks at a time
- We use kind words, even when we're upset
- We listen to understand, not to argue back
- Everything we say stays private"

"Does that work for both of you?"

---

### Step 2: Hear Each Side (5-8 min)

**To Student 1:**
"[Name], tell me what happened from your point of view. Take your time."

**Listen fully, then reflect:**
"So what I hear you saying is... [summarize]. Did I get that right?"

**Then ask:**
"How did that make you feel?"
"What do you need right now?"

**To Student 2:**
"[Name], now I'd like to hear what happened from your point of view."

**Same process - summarize and validate**

---

### Step 3: Identify the Impact (3 min)

**To Student 1:**
"[Name], when you hear what [Student 2] said, what stands out to you?"

**To Student 2:**
"[Name], when you hear what [Student 1] shared, is there anything that surprises you or that you want to respond to?"

**Facilitate:**
"It sounds like you both felt [emotion]. That makes sense. This has been hard for both of you."

---

### Step 4: Find Solutions (5 min)

**Ask both students:**
"What do you think would help fix this?"
"What do you need from each other to move forward?"
"What could you do differently next time?"

**If they're stuck:**
"Some students have tried... would any of those work for you?"
- Taking a break when frustrated
- Using "I feel" statements
- Getting a teacher to help before it gets big
- Agreeing to disagree

**Help them agree:**
"So it sounds like you're both willing to [solution]. Is that right?"

---

### Step 5: Close & Commit (2 min)

**Say:**
"Thank you both for working through this. That took courage."

"Let's make a plan: You've agreed to [summarize agreement]."

"I'm going to check in with both of you [when] to see how things are going."

"Is there anything else either of you needs before we finish?"

**Optional - if appropriate:**
"Would you like to shake hands / do a fist bump / say anything to each other?"

---

## 💬 Helpful Phrases

**For Validation:**
- "That sounds really frustrating."
- "I can understand why you felt that way."
- "It makes sense that you're upset."

**For Clarification:**
- "Help me understand what you mean by..."
- "Can you tell me more about that part?"
- "What happened right before that?"

**For Redirection:**
- "Let's focus on how we can fix this."
- "I hear that you're upset, but let's use kind words."
- "We're here to solve this, not to decide who's right."

**For Encouragement:**
- "You're doing a great job talking this through."
- "I can see you're really trying."
- "This is hard, and you're handling it well."

---

${includeRolePlay ? `
## 🎭 Role-Play Scenarios for Teaching

**Scenario 1: [Conflict type situation]**
- Setup: [Brief scenario appropriate for ${gradeLevel}]
- Practice: Students role-play using conflict resolution steps
- Debrief: "What worked? What was hard?"

**Scenario 2: [Different situation]**
- Setup: [Another age-appropriate scenario]
- Practice: Try different approaches
- Debrief: "How did it feel to be heard?"

**Teaching Tips:**
- Model being both mediator and participant
- Celebrate effort, not perfection
- Practice when everyone is calm
` : ""}

${includeFollowUp ? `
## 📅 Follow-Up Plan

**Same Day:**
- Check in briefly with each student separately
- "How are you feeling about our conversation?"

**Next Day:**
- Observe interactions
- Brief check-in: "How did things go?"

**One Week Later:**
- Longer check-in: "Has the agreement been working?"
- Adjust if needed

**Document:**
- Date and nature of conflict
- Resolution reached
- Follow-up notes
- Any patterns to watch
` : ""}

---

## ⚠️ When to Escalate

**Get additional support if:**
- Physical safety is a concern
- Bullying pattern is present
- Student discloses abuse/harm
- Student is in crisis
- You don't feel equipped to handle it
- Same conflict keeps repeating

**Who to involve:**
- School counselor
- Administrator
- Parent/guardian
- School psychologist

---

## 🌟 Prevention Strategies

**Build skills before conflicts happen:**
- Teach "I feel" statements
- Practice active listening
- Role-play scenarios
- Create classroom agreements together
- Celebrate peaceful problem-solving

---

**GUIDELINES:**
- All language must be developmentally appropriate for ${gradeLevel}
- Use trauma-informed, non-punitive approaches
- Focus on restoration, not punishment
- Validate all feelings while addressing behaviors
- Never force apologies
- Maintain equity - no assumptions about who's "right"`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const resolution = message.content[0].text;

    return Response.json({ resolution });
  } catch (error) {
    console.error("Error generating conflict resolution:", error);
    return Response.json(
      { error: "Failed to generate conflict resolution script" },
      { status: 500 }
    );
  }
}