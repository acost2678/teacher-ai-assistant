import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      selCompetency,
      topic,
      worksheetType,
      includeVisuals,
      quantity,
    } = await request.json();

    if (!gradeLevel || !selCompetency) {
      return Response.json(
        { error: "Grade level and CASEL competency are required" },
        { status: 400 }
      );
    }

    const competencyDescriptions = {
      "Self-Awareness": "The ability to understand one's own emotions, thoughts, and values and how they influence behavior across contexts",
      "Self-Management": "The ability to manage one's emotions, thoughts, and behaviors effectively in different situations",
      "Social Awareness": "The ability to understand the perspectives of and empathize with others",
      "Relationship Skills": "The ability to establish and maintain healthy and supportive relationships",
      "Responsible Decision-Making": "The ability to make caring and constructive choices about personal behavior and social interactions",
    };

    const worksheetTypeDescriptions = {
      "Reflection": "Reflection Worksheet - Writing prompts and journaling for self-discovery",
      "Coping Skills": "Coping Skills Worksheet - Strategies for managing difficult emotions",
      "Goal Setting": "Goal Setting Worksheet - Planning for personal growth and improvement",
      "Feelings/Emotions": "Feelings Worksheet - Identifying and understanding emotions",
      "Problem-Solving": "Problem-Solving Worksheet - Steps for working through challenges",
      "Gratitude": "Gratitude Worksheet - Practicing thankfulness and appreciation",
      "Self-Portrait/Identity": "Identity Worksheet - Exploring who I am and my strengths",
      "Scenario Analysis": "Scenario Analysis - Reading situations and choosing best responses",
    };

    const prompt = `You are an expert in Social-Emotional Learning curriculum design, specializing in the CASEL framework. Create engaging, developmentally appropriate worksheets that help students develop SEL skills.

**WORKSHEET DETAILS:**
- Grade Level: ${gradeLevel}
- CASEL Competency: ${selCompetency}
- Competency Description: ${competencyDescriptions[selCompetency] || selCompetency}
- Worksheet Type: ${worksheetTypeDescriptions[worksheetType] || worksheetType}
${topic ? `- Specific Topic: ${topic}` : ''}
- Number of Worksheets: ${quantity}
${includeVisuals ? '- Include visual elements (drawing boxes, emoji scales, graphic organizers)' : ''}

**CREATE ${quantity} SEL WORKSHEET(S):**

---

# 📝 SEL Worksheet: ${selCompetency}

**CASEL Competency:** ${selCompetency}
**Grade Level:** ${gradeLevel}
**Type:** ${worksheetType}
${topic ? `**Topic:** ${topic}` : ''}

---

## 🎯 Learning Objectives

By completing this worksheet, students will:
- Develop ${selCompetency.toLowerCase()} skills
- [Specific, measurable SEL objective related to ${worksheetType}]
- [Another objective related to ${topic || selCompetency}]

---

${Array.from({length: parseInt(quantity) || 1}, (_, i) => `
## ${parseInt(quantity) > 1 ? `Worksheet ${i + 1}: ` : ''}[Creative Worksheet Title Related to ${topic || selCompetency}]

### 📋 Student Worksheet

**Name:** _________________________ **Date:** _____________

---

${worksheetType === 'Reflection' ? `
### ✏️ Reflection: ${topic || selCompetency}

**Think about ${topic || selCompetency.toLowerCase()}...**

**1. What does ${topic || selCompetency.toLowerCase()} mean to you?**
_________________________________________________________________
_________________________________________________________________

**2. Think of a time when you showed ${topic || selCompetency.toLowerCase()}. What happened?**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

**3. How did it make you feel?**
_________________________________________________________________

**4. What can you do to practice ${topic || selCompetency.toLowerCase()} this week?**
_________________________________________________________________
_________________________________________________________________

${includeVisuals ? `
**5. Draw a picture of yourself using ${topic || selCompetency.toLowerCase()}:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│                                                                │
│                                                                │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
` : ''}

**My Reflection:** Today I learned that ${topic || selCompetency.toLowerCase()} is important because...
_________________________________________________________________
` : ''}

${worksheetType === 'Coping Skills' ? `
### 🧘 Coping Skills: ${topic || 'Managing Big Feelings'}

**When I feel stressed or upset, I can use these coping strategies:**

${includeVisuals ? `
**How am I feeling right now?** (Circle one)

😊 Happy    😐 Okay    😟 Worried    😢 Sad    😠 Angry    😰 Stressed
` : ''}

**My Coping Toolbox:**

**1. BREATHE** 🌬️
Take 5 deep breaths. Breathe in slowly... breathe out slowly...
How do you feel after? _____________________________________________

**2. MOVE** 🏃
Sometimes our bodies need to move! List 3 ways you can move your body:
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

**3. TALK** 💬
Who can you talk to when you're upset?
- At school: ______________________________________________________
- At home: _______________________________________________________

**4. THINK** 🧠
Change negative thoughts to positive ones!
- Instead of "I can't do this," I can say: ___________________________
- Instead of "This is too hard," I can say: __________________________

**5. RELAX** 😌
What helps you feel calm? (Check all that apply)
□ Listening to music    □ Drawing    □ Reading
□ Being alone           □ Being with others    □ Going outside
□ Other: _____________________

**My Go-To Coping Strategy:** When I feel ${topic || 'upset'}, I will try...
_________________________________________________________________
` : ''}

${worksheetType === 'Goal Setting' ? `
### 🎯 Goal Setting: ${topic || 'My Personal Goal'}

**What is a goal?** A goal is something you want to achieve or get better at!

**My ${selCompetency} Goal:**

**I want to get better at:** _______________________________________

**Why is this important to me?**
_________________________________________________________________

**My SMART Goal:**

🎯 **S**pecific - What exactly will I do?
_________________________________________________________________

📏 **M**easurable - How will I know I did it?
_________________________________________________________________

✅ **A**chievable - Can I really do this?
□ Yes, I can do this!    □ I might need some help

🎪 **R**elevant - Why does this matter to me?
_________________________________________________________________

⏰ **T**ime - When will I do this by?
_________________________________________________________________

**My Action Steps:**
1. First, I will _________________________________________________
2. Then, I will _________________________________________________
3. Finally, I will _______________________________________________

**Who can help me reach my goal?** ________________________________

${includeVisuals ? `
**Draw yourself achieving your goal:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                                                                │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
` : ''}

**I will check my progress on:** __________________________________
` : ''}

${worksheetType === 'Feelings/Emotions' ? `
### 💭 Feelings & Emotions: ${topic || 'Understanding My Feelings'}

**All feelings are okay! Let's learn about our emotions.**

${includeVisuals ? `
**Feelings Faces:** Draw how each feeling looks on your face!

| Happy | Sad | Angry | Scared | Excited |
|-------|-----|-------|--------|---------|
|  😊   |  😢  |  😠   |  😨    |   🤩    |
| [draw]|[draw]|[draw] | [draw] | [draw]  |
` : ''}

**1. Right now, I feel:** _________________________________________

**2. I feel this way because:** ___________________________________

**3. Where do I feel this emotion in my body?** (Circle)
Head    Chest    Stomach    Hands    All over    Other: _______

**4. Match the feeling to what might cause it:**

| Feeling | What might cause it |
|---------|---------------------|
| Happy   | ___________________ |
| Sad     | ___________________ |
| Angry   | ___________________ |
| Worried | ___________________ |
| Proud   | ___________________ |

**5. When I feel a BIG emotion, I can:**
_________________________________________________________________

**6. It's okay to feel my feelings because:**
_________________________________________________________________

**Remember:** There are no "bad" feelings. All feelings give us information!
` : ''}

${worksheetType === 'Problem-Solving' ? `
### 🔧 Problem-Solving: ${topic || 'Working Through Challenges'}

**When we have a problem, we can use these steps to solve it!**

**The Problem-Solving Steps:**

**Step 1: STOP** 🛑
What is the problem?
_________________________________________________________________

**Step 2: THINK** 🧠
How am I feeling about this problem?
_________________________________________________________________

**Step 3: BRAINSTORM** 💡
What are some possible solutions? (List at least 3)
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

**Step 4: EVALUATE** ⚖️
Look at your solutions. For each one, ask:
- Is it safe? - Is it fair? - How will everyone feel?

Best solution: ___________________________________________________

**Step 5: TRY IT** ✅
What happened when you tried your solution?
_________________________________________________________________

**Step 6: REFLECT** 🪞
Did it work? What would you do differently next time?
_________________________________________________________________

${includeVisuals ? `
**Problem-Solving Flowchart:**
Draw your own problem-solving journey!
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  PROBLEM → FEELINGS → IDEAS → CHOICE → TRY → RESULT           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
` : ''}
` : ''}

${worksheetType === 'Gratitude' ? `
### 🙏 Gratitude: ${topic || 'Being Thankful'}

**What is gratitude?** Gratitude means noticing and being thankful for the good things in our lives!

**Today I am grateful for...**

**1. A person I'm thankful for:** _________________________________
Why? _____________________________________________________________

**2. Something that made me smile today:** ________________________
_________________________________________________________________

**3. Something I have that I'm grateful for:** ____________________
_________________________________________________________________

**4. A place I love:** ___________________________________________
Why? _____________________________________________________________

**5. Something about myself I appreciate:** _______________________
_________________________________________________________________

${includeVisuals ? `
**Gratitude Jar:** Draw or write things you're grateful for in the jar!
┌─────────────────────────────────────┐
│             ┌─────┐                 │
│             │     │                 │
│         ┌───┴─────┴───┐             │
│         │             │             │
│         │             │             │
│         │             │             │
│         │             │             │
│         └─────────────┘             │
└─────────────────────────────────────┘
` : ''}

**Gratitude Challenge:** This week, I will tell _________________ 
that I am thankful for them because _______________________________

**How does being grateful make you feel?**
_________________________________________________________________
` : ''}

${worksheetType === 'Self-Portrait/Identity' ? `
### 🌟 All About Me: ${topic || 'My Identity'}

**Let's explore who you are!**

${includeVisuals ? `
**My Self-Portrait:**
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                        [Draw yourself!]                        │
│                                                                │
│                                                                │
│                                                                │
└────────────────────────────────────────────────────────────────┘
` : ''}

**My name is:** ___________________________________________________

**Three words that describe me:**
1. _______________ 2. _______________ 3. _______________

**My Strengths (things I'm good at):**
⭐ ________________________________________________________________
⭐ ________________________________________________________________
⭐ ________________________________________________________________

**Things I like about myself:**
💚 ________________________________________________________________
💚 ________________________________________________________________

**Things I'm still learning:**
📚 ________________________________________________________________
📚 ________________________________________________________________

**My favorite things:**
- Color: _________________ - Food: _________________
- Activity: _______________ - Subject: ______________

**People who are important to me:**
_________________________________________________________________

**When I grow up, I want to:** ____________________________________

**I am unique because:** __________________________________________
_________________________________________________________________
` : ''}

${worksheetType === 'Scenario Analysis' ? `
### 📖 Scenario Analysis: ${topic || selCompetency}

**Read each scenario and answer the questions.**

**Scenario 1:**
[Age-appropriate scenario about ${topic || selCompetency.toLowerCase()} for ${gradeLevel}]

- What is happening in this situation?
  _________________________________________________________________

- How might the people involved feel?
  _________________________________________________________________

- What would be a good choice? Why?
  _________________________________________________________________
  _________________________________________________________________

---

**Scenario 2:**
[Another scenario about ${topic || selCompetency.toLowerCase()}]

- What is the problem?
  _________________________________________________________________

- What are two different choices the person could make?
  1. _______________________________________________________________
  2. _______________________________________________________________

- What might happen with each choice?
  1. _______________________________________________________________
  2. _______________________________________________________________

- What would YOU do? Why?
  _________________________________________________________________

---

**Scenario 3:**
[A third scenario involving ${selCompetency}]

- Describe what's happening:
  _________________________________________________________________

- How does this connect to ${selCompetency.toLowerCase()}?
  _________________________________________________________________

- What advice would you give?
  _________________________________________________________________
` : ''}

---

### 💭 Final Reflection

**One thing I learned today:** ____________________________________
_________________________________________________________________

**I will use this skill when:** ___________________________________
_________________________________________________________________

---
`).join('\n')}

---

**GUIDELINES:**
- All content must be developmentally appropriate for ${gradeLevel}
- Use inclusive, affirming language
- Avoid scenarios that could trigger trauma
- Make activities engaging and meaningful
- Connect skills to real-life situations students face
- Provide adequate space for student responses`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const worksheet = message.content[0].text;

    return Response.json({ worksheet });
  } catch (error) {
    console.error("Error generating SEL worksheet:", error);
    return Response.json(
      { error: "Failed to generate SEL worksheet" },
      { status: 500 }
    );
  }
}