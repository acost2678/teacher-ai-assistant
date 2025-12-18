import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      readingLevel,
      bookTitle,
      textDescription,
      focusSkill,
      groupSize,
      sessionLength,
      numberOfSessions,
      includeWordWork,
      includeWriting,
      includeAssessment,
    } = await request.json();

    if (!gradeLevel || !readingLevel) {
      return Response.json(
        { error: "Grade level and reading level are required" },
        { status: 400 }
      );
    }

    const focusSkills = {
      "decoding": "Decoding - Phonics patterns, word-solving strategies",
      "fluency": "Fluency - Accuracy, rate, expression, phrasing",
      "vocabulary": "Vocabulary - Word meanings in context",
      "comprehension": "Comprehension - Understanding and thinking about text",
      "retelling": "Retelling/Summarizing - Recounting key details and events",
      "inferring": "Inferring - Reading between the lines",
      "predicting": "Predicting - Using clues to anticipate what comes next",
      "questioning": "Questioning - Asking questions before, during, after",
      "visualizing": "Visualizing - Creating mental images",
      "connections": "Making Connections - Text-to-self, text-to-text, text-to-world",
      "main-idea": "Main Idea - Identifying central message and details",
      "mixed": "Mixed Skills - Multiple focus areas",
    };

    const prompt = `You are an expert reading specialist who creates effective guided reading lessons using research-based practices (Fountas & Pinnell, Jan Richardson, etc.).

**GUIDED READING PARAMETERS:**
- Grade Level: ${gradeLevel}
- Reading Level: ${readingLevel} (Fountas & Pinnell or equivalent)
- Book/Text: ${bookTitle || "[Text to be selected]"}
${textDescription ? `- Text Description: ${textDescription}` : ""}
- Focus Skill: ${focusSkills[focusSkill] || focusSkills["comprehension"]}
- Group Size: ${groupSize || "4-6 students"}
- Session Length: ${sessionLength || "15-20 minutes"}
- Number of Sessions: ${numberOfSessions || 1}

**CREATE GUIDED READING LESSON PLAN(S):**

---

# 📖 Guided Reading Lesson Plan

**Book Title:** ${bookTitle || "[Title]"}
**Reading Level:** ${readingLevel}
**Grade Level:** ${gradeLevel}
**Focus Skill:** ${focusSkill || "Comprehension"}
**Group Size:** ${groupSize || "4-6 students"}
**Session Length:** ${sessionLength || "15-20 minutes"}

---

${Array.from({length: parseInt(numberOfSessions) || 1}, (_, sessionNum) => `
## Session ${(numberOfSessions || 1) > 1 ? (sessionNum + 1) : ''}: ${sessionNum === 0 ? 'Introduction' : sessionNum === (parseInt(numberOfSessions) - 1) ? 'Conclusion' : 'Continued Reading'}

### 📋 Lesson Overview

**Focus Skill:** ${focusSkills[focusSkill] || "Comprehension"}
**Pages/Chapters:** [Specify section]
**Learning Objective:** Students will be able to [specific, measurable objective]

---

### 🎯 Before Reading (3-5 min)

**Book Introduction:**
[Script for introducing the text - build background, set purpose, introduce key vocabulary]

"Today we're going to read [title/section]. This book is about [brief, engaging preview]. Before we read, let's think about..."

**Picture Walk / Preview:**
- [What to point out on pages ___]
- [What to point out on pages ___]
- [Vocabulary to highlight: ___]

**Set the Purpose:**
"As you read today, I want you to think about [focus question/skill]..."

**Teaching Point:**
[Brief mini-lesson on the focus skill - model strategy if needed]

---

### 📖 During Reading (8-12 min)

**Students Read:**
- Students read independently at their own pace (whisper or silent reading based on level)
- Teacher listens to individuals, taking notes

**Prompting Guide:**
Use these prompts as needed while listening:

**For Decoding:**
- "Try that again."
- "Look at the first letter. What sound does it make?"
- "Does that look right? Does it sound right? Does it make sense?"
- "Look for a chunk you know."

**For Fluency:**
- "Make it sound like talking."
- "Try that again with expression."
- "Put those words together."

**For Comprehension:**
- "What's happening now?"
- "Why do you think the character did that?"
- "What do you think will happen next?"

**Observation Notes:**
| Student | Observation | Next Step |
|---------|-------------|-----------|
| | | |
| | | |
| | | |

---

### 💬 After Reading (3-5 min)

**Discussion:**
[Questions to facilitate discussion - start with literal, move to inferential]

1. [Literal question - who, what, when, where]
2. [Inferential question - why, how]
3. [Connection to focus skill]

**Return to Teaching Point:**
"Remember, we were working on [skill]. Let's talk about how you used that strategy..."

**Sharing:**
"Who can share an example of when you [used the strategy]?"

---

${includeWordWork ? `
### 🔤 Word Work (3-5 min)

**Focus:** [Phonics pattern, word family, or high-frequency words from text]

**Activity:**
[Specific word work activity - magnetic letters, white boards, word sorts, etc.]

**Words from Text:**
- [word 1] - [pattern/teaching point]
- [word 2] - [pattern/teaching point]
- [word 3] - [pattern/teaching point]

**Quick Activity:**
[Describe activity: Make and break, word ladders, word sorts, etc.]

---
` : ""}

${includeWriting ? `
### ✏️ Writing Connection (3-5 min)

**Writing Response:**
[Quick write or sentence stems connected to reading]

**Prompt:**
"[Writing prompt connected to the text and focus skill]"

**Sentence Stems:**
- "[Sentence starter 1]..."
- "[Sentence starter 2]..."

---
` : ""}
`).join('\n')}

## 📊 Progress Monitoring

### Running Record Notes
Complete a running record for 1-2 students per session

**Accuracy Rate:** ____% (Independent: 95-100%, Instructional: 90-94%, Frustration: Below 90%)

**Self-Correction Rate:** 1:___

### Comprehension Check
- [ ] Retells with key details
- [ ] Makes inferences
- [ ] Uses text evidence
- [ ] Makes connections

### Fluency Notes
- [ ] Reads accurately
- [ ] Appropriate rate
- [ ] Reads with expression
- [ ] Attends to punctuation

---

${includeAssessment ? `
## 📋 Assessment & Next Steps

**Mastery Indicators:**
- [ ] Student can [indicator 1]
- [ ] Student can [indicator 2]
- [ ] Student can [indicator 3]

**Next Steps by Student:**
| Student | Strength | Growth Area | Next Instructional Move |
|---------|----------|-------------|------------------------|
| | | | |
| | | | |

**Group Next Steps:**
- Continue with [same skill] or move to [next skill]
- Ready for level [___] texts? Yes / Not yet
- Regroup needed? Yes / No

---
` : ""}

## 📚 Text Selection Criteria

For ${readingLevel} readers, look for texts with:
- [Characteristic 1 for this level]
- [Characteristic 2 for this level]
- [Characteristic 3 for this level]
- [Vocabulary considerations]
- [Text structure considerations]

**Suggested Texts at This Level:**
- [Title suggestion 1]
- [Title suggestion 2]
- [Title suggestion 3]

---

**GUIDELINES:**
- Lessons follow gradual release: I do → We do → You do
- Most time should be spent with students reading
- Teacher's role during reading is to observe and prompt
- Teaching point should be focused and brief
- Word work should connect to text when possible`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const lesson = message.content[0].text;

    return Response.json({ lesson });
  } catch (error) {
    console.error("Error generating guided reading lesson:", error);
    return Response.json(
      { error: "Failed to generate lesson" },
      { status: 500 }
    );
  }
}