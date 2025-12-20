import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      conflictType,
      outputType,
      scenario,
      includeRolePlay,
      includeVisual,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const outputDescriptions = {
      'script': 'Mediation Script - A step-by-step script for immediate use when mediating a conflict',
      'lesson': 'Full Lesson Plan - A complete lesson teaching conflict resolution skills',
      'guide': 'Student Problem-Solving Guide - A guide students can use independently',
      'scenarios': 'Practice Scenarios - Role-play scenarios for teaching and practice',
      'poster': 'Classroom Poster Content - Visual poster content for display',
    };

    let prompt = `You are an expert in restorative practices, conflict resolution, and social-emotional learning for K-12 students. Create trauma-informed, restorative conflict resolution content for teachers.

**CONFLICT RESOLUTION REQUEST:**
- Grade Level: ${gradeLevel}
- Conflict Type: ${conflictType}
- Output Needed: ${outputDescriptions[outputType] || outputType}
${scenario ? `- Specific Scenario: ${scenario}` : ''}
${includeRolePlay ? '- Include role-play practice scenarios' : ''}
${includeVisual ? '- Include visual support ideas' : ''}

**CREATE THE FOLLOWING:**

`;

    // Customize prompt based on output type
    if (outputType === 'script') {
      prompt += `
---

# 🤝 Conflict Resolution Mediation Script

**Grade Level:** ${gradeLevel}
**Conflict Type:** ${conflictType}
${scenario ? `**Scenario:** ${scenario}` : ''}

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

**Set Up:**
- Private, calm space
- Enough time (15-20 minutes minimum)
- Seating at equal level

---

## 📜 Step-by-Step Mediation Script

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

[Same process - summarize and validate]

---

### Step 3: Identify the Impact (3 min)

**To Student 1:**
"[Name], when you hear what [Student 2] said, what stands out to you?"

**To Student 2:**
"[Name], when you hear what [Student 1] shared, is there anything that surprises you?"

**Facilitate:**
"It sounds like you both felt [emotion]. That makes sense."

---

### Step 4: Find Solutions (5 min)

**Ask both students:**
"What do you think would help fix this?"
"What do you need from each other to move forward?"
"What could you do differently next time?"

**If they're stuck, offer ideas:**
- Taking a break when frustrated
- Using "I feel" statements
- Getting a teacher to help before it gets big
- Agreeing to disagree respectfully

---

### Step 5: Close & Commit (2 min)

**Say:**
"Thank you both for working through this. That took courage."
"Let's make a plan: You've agreed to [summarize agreement]."
"I'm going to check in with both of you [when] to see how things are going."

---

## 💬 Helpful Phrases

**For Validation:**
- "That sounds really frustrating."
- "I can understand why you felt that way."

**For Clarification:**
- "Help me understand what you mean by..."
- "Can you tell me more about that?"

**For Redirection:**
- "Let's focus on how we can fix this."
- "We're here to solve this, not to decide who's right."

---

${includeRolePlay ? `
## 🎭 Practice Scenarios

**Scenario 1:** [Age-appropriate ${conflictType} scenario for ${gradeLevel}]
- What happened: [Brief description]
- Practice the script with this situation

**Scenario 2:** [Different variation of ${conflictType}]
- What happened: [Brief description]
- How might this conversation go differently?
` : ''}

${includeVisual ? `
## 🖼️ Visual Support Ideas

**Conflict Resolution Steps Poster:**
1. STOP - Take a breath
2. TALK - Use "I feel" statements
3. LISTEN - Hear the other side
4. SOLVE - Find a solution together
5. MOVE ON - Let it go

**Feeling Words Chart:** Include emotion vocabulary appropriate for ${gradeLevel}

**"I Feel" Statement Starter:** "I feel ___ when ___ because ___. I need ___."
` : ''}

---

## ⚠️ When to Escalate

Get additional support if:
- Physical safety is a concern
- Bullying pattern is present
- Student discloses abuse/harm
- Same conflict keeps repeating
`;
    } else if (outputType === 'lesson') {
      prompt += `
---

# 📚 Conflict Resolution Lesson Plan

**Grade Level:** ${gradeLevel}
**Focus:** ${conflictType}
**Duration:** 30-45 minutes

---

## 🎯 Learning Objectives

By the end of this lesson, students will be able to:
- Identify steps in peaceful conflict resolution
- Practice using "I feel" statements
- Demonstrate active listening skills
- Apply problem-solving strategies to conflicts

## 📚 CASEL Competencies

- Relationship Skills
- Responsible Decision-Making
- Self-Management

---

## 📋 Materials Needed

- [List specific materials]
- Chart paper or whiteboard
- Conflict resolution steps poster
- Role-play scenario cards

---

## 🎬 Lesson Outline

### Opening (5-7 min)
**Hook:**
[Engaging opening activity or question about conflicts]

**Discussion:**
"Has anyone ever had a disagreement with a friend? How did it feel?"

---

### Direct Instruction (10 min)

**Teach the Steps:**
[Step-by-step conflict resolution process appropriate for ${gradeLevel}]

**Model:**
Think-aloud demonstration of using the steps

---

### Guided Practice (10-15 min)

**Partner Practice:**
[Structured activity for practicing skills]

**Scenarios to Use:**
${scenario ? `- ${scenario}` : '[Age-appropriate scenarios]'}
- [Additional scenario]
- [Additional scenario]

---

### Independent Practice (5-10 min)

[Activity for students to apply learning]

---

### Closing (5 min)

**Reflection:**
"What's one thing you'll try next time you have a conflict?"

**Commitment:**
Students share or write one strategy they'll use

---

${includeRolePlay ? `
## 🎭 Role-Play Scenarios

**Scenario 1:** [Detailed ${conflictType} scenario]
- Characters: [Who's involved]
- Setup: [What happened]
- Practice Goal: [What skill to practice]

**Scenario 2:** [Another scenario]
- Characters: [Who's involved]
- Setup: [What happened]
- Practice Goal: [What skill to practice]

**Debrief Questions:**
- How did it feel to be heard?
- What was hardest about staying calm?
- What helped you find a solution?
` : ''}

${includeVisual ? `
## 🖼️ Visual Supports

**Anchor Chart Content:**
[Content for a conflict resolution anchor chart]

**Student Reference Card:**
[Pocket-sized steps students can keep at desk]
` : ''}

---

## 📊 Assessment

**Formative:**
- Observe role-play participation
- Listen to partner discussions
- Exit ticket responses

**Success Criteria:**
- Student can name the steps
- Student uses "I feel" statements
- Student demonstrates listening

---

## 🔄 Differentiation

**For struggling students:**
- [Modifications]

**For advanced students:**
- [Extensions]
`;
    } else if (outputType === 'guide') {
      prompt += `
---

# 🤝 Problem-Solving Guide for Students

**Grade Level:** ${gradeLevel}
**Topic:** ${conflictType}

---

## When You Have a Problem With Someone...

### Step 1: STOP 🛑
- Take a deep breath
- Count to 5 in your head
- Wait until you feel calmer

### Step 2: THINK 🧠
- What happened?
- How do I feel?
- How might they feel?

### Step 3: TALK 💬
Use an "I feel" statement:
"I feel _____ when _____ because _____."

### Step 4: LISTEN 👂
- Let them talk
- Don't interrupt
- Try to understand their side

### Step 5: SOLVE 💡
- What can we do to fix this?
- What ideas do you have?
- What will we both agree to?

### Step 6: MOVE ON ➡️
- Shake hands or say "okay"
- Let it go
- Go back to having fun

---

## Words You Can Use

**To say how you feel:**
[Age-appropriate feeling words for ${gradeLevel}]

**To ask for what you need:**
- "Can we take turns?"
- "I need some space right now."
- "Can we talk about this?"

**To find a solution:**
- "What if we..."
- "How about..."
- "Would it help if..."

---

## When to Get an Adult

Get a teacher if:
- Someone is being hurt
- Someone won't stop
- You've tried and it's not working
- You feel unsafe

---

${includeVisual ? `
## 🖼️ Visual Version

[Describe a visual flowchart or step-by-step picture guide appropriate for ${gradeLevel}]
` : ''}

${includeRolePlay ? `
## Practice Situations

**Situation 1:** ${scenario || '[Common ' + conflictType + ' scenario]'}
- What would you say?
- What would you do?

**Situation 2:** [Another scenario]
- Practice using the steps
` : ''}
`;
    } else if (outputType === 'scenarios') {
      prompt += `
---

# 🎭 Conflict Resolution Practice Scenarios

**Grade Level:** ${gradeLevel}
**Conflict Type:** ${conflictType}

---

## How to Use These Scenarios

1. Read the scenario aloud or give to partners
2. Students role-play using conflict resolution steps
3. Debrief: What worked? What was hard?
4. Try again with different approaches

---

## Scenarios

### Scenario 1
${scenario ? scenario : '[Detailed ' + conflictType + ' scenario appropriate for ' + gradeLevel + ']'}

**Characters:** [Who's involved]
**What happened:** [The conflict]
**Practice focus:** [Which skill to emphasize]

**Discussion questions:**
- How might each person feel?
- What could they say to each other?
- What solutions might work?

---

### Scenario 2
[Different ${conflictType} situation]

**Characters:** [Who's involved]
**What happened:** [The conflict]
**Practice focus:** [Which skill to emphasize]

---

### Scenario 3
[Another variation]

**Characters:** [Who's involved]
**What happened:** [The conflict]
**Practice focus:** [Which skill to emphasize]

---

### Scenario 4
[More complex situation]

**Characters:** [Who's involved]
**What happened:** [The conflict]
**Practice focus:** [Which skill to emphasize]

---

### Scenario 5
[Challenging scenario]

**Characters:** [Who's involved]
**What happened:** [The conflict]
**Practice focus:** [Which skill to emphasize]

---

## Debrief Questions

After each role-play, discuss:
- What did you try? Did it work?
- How did it feel to be heard?
- What would you do differently?
- What was the hardest part?

---

${includeVisual ? `
## 🖼️ Visual Supports

**Scenario Cards:** Create cards with each scenario that students can draw from a pile

**Role Labels:** Give students character name tags to wear during role-play

**Steps Reminder:** Post the conflict resolution steps where students can see them during practice
` : ''}
`;
    } else if (outputType === 'poster') {
      prompt += `
---

# 🖼️ Conflict Resolution Poster Content

**Grade Level:** ${gradeLevel}
**Focus:** ${conflictType}

---

## Poster 1: "Solve It Together" Steps

**Title:** SOLVE IT TOGETHER! 🤝

**The Steps:**

1️⃣ **STOP**
Take a breath. Calm your body.

2️⃣ **TALK**
Use "I feel ___ when ___ because ___"

3️⃣ **LISTEN**
Hear their side. Don't interrupt.

4️⃣ **BRAINSTORM**
Think of solutions together.

5️⃣ **AGREE**
Pick one that works for both.

6️⃣ **TRY IT**
Give it a chance!

---

## Poster 2: "I Feel" Statements

**Title:** SPEAK UP WITH "I FEEL" 💬

**The Formula:**
"I feel _____ when _____ because _____. I need _____."

**Examples:**
[Age-appropriate examples for ${gradeLevel}]

---

## Poster 3: Problem-Solving Solutions

**Title:** WAYS TO SOLVE IT 💡

**Options:**
- Take turns
- Share
- Trade
- Compromise
- Get help
- Walk away and cool down
- Agree to disagree
- Say sorry and move on

---

## Poster 4: Feelings Vocabulary

**Title:** HOW DO YOU FEEL? 😊😢😠

[Grid of feeling words with emoji faces appropriate for ${gradeLevel}]

---

## Design Recommendations

**Colors:** Calming colors like blue, green, purple
**Size:** Large enough to read from across the room
**Placement:** Eye level, near conflict-prone areas or calm down corner
**Icons:** Use simple icons for non-readers
**Language:** Simple, positive wording

${includeVisual ? `
**Additional Visual Elements:**
- Diverse student illustrations
- Step-by-step arrows or numbers
- Border with peaceful imagery
- QR code linking to practice videos (optional)
` : ''}
`;
    }

    prompt += `

---

**GUIDELINES:**
- All content must be developmentally appropriate for ${gradeLevel}
- Use trauma-informed, non-punitive language
- Focus on restoration, not punishment
- Validate all feelings while addressing behaviors
- Never force apologies
- Maintain equity and avoid assumptions`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].text;

    return Response.json({ content });
  } catch (error) {
    console.error("Error generating conflict resolution content:", error);
    return Response.json(
      { error: "Failed to generate conflict resolution content" },
      { status: 500 }
    );
  }
}