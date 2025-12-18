import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      vocabularySource,
      words,
      textContext,
      activityTypes,
      tierLevel,
      numberOfWords,
      includeDefinitions,
      includeContext,
      includeActivities,
      includeAssessment,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const tierDescriptions = {
      "tier1": "Tier 1 - Basic, everyday words (sight words, common nouns/verbs)",
      "tier2": "Tier 2 - High-utility academic words (analyze, compare, evidence)",
      "tier3": "Tier 3 - Domain-specific words (photosynthesis, metaphor, integer)",
      "mixed": "Mixed Tiers - Combination based on text/unit needs",
    };

    const activityDescriptions = {
      "context-clues": "Context Clues - Using surrounding text to determine meaning",
      "word-parts": "Word Parts - Prefixes, suffixes, roots",
      "semantic-mapping": "Semantic Mapping - Connections and categories",
      "frayer-model": "Frayer Model - Definition, characteristics, examples, non-examples",
      "word-sorts": "Word Sorts - Categorizing and classifying",
      "sentences": "Sentence Writing - Using words in context",
      "games": "Games & Interactive - Engaging practice activities",
      "mixed": "Mixed Activities - Variety of approaches",
    };

    let wordList = "";
    if (words && words.trim()) {
      wordList = `

**VOCABULARY WORDS PROVIDED:**
${words}

Create activities specifically for these words.
`;
    }

    let contextSection = "";
    if (textContext && textContext.trim()) {
      contextSection = `

**TEXT CONTEXT:**
The vocabulary words come from this text/unit:
---
${textContext.substring(0, 2000)}${textContext.length > 2000 ? '\n...[truncated]' : ''}
---

Use the text context to create meaningful, relevant examples and sentences.
`;
    }

    const prompt = `You are an expert literacy specialist who creates engaging, research-based vocabulary instruction that helps students deeply understand and use new words.

**VOCABULARY PARAMETERS:**
- Grade Level: ${gradeLevel}
- Word Tier: ${tierDescriptions[tierLevel] || tierDescriptions["tier2"]}
- Activity Focus: ${activityDescriptions[activityTypes] || activityDescriptions["mixed"]}
- Number of Words: ${numberOfWords || 10}
${wordList}
${contextSection}

**CREATE COMPREHENSIVE VOCABULARY MATERIALS:**

---

# 📚 Vocabulary Builder

**Grade Level:** ${gradeLevel}
**Word Tier:** ${tierLevel || "Tier 2"}
**Number of Words:** ${numberOfWords || 10}

---

${includeDefinitions !== false ? `
## 📖 Word Study Cards

${words ? `For each vocabulary word provided:` : `For ${numberOfWords || 10} grade-appropriate words:`}

### Word 1: [Word]

**Student-Friendly Definition:**
[Clear, simple definition a ${gradeLevel} student can understand]

**Part of Speech:** [noun/verb/adjective/etc.]

**Pronunciation:** [phonetic guide]

**Word Family:**
- Related words: [list 2-3]
- Word parts: [prefix/root/suffix breakdown if applicable]

**Synonyms:** [2-3 synonyms at appropriate level]
**Antonyms:** [1-2 antonyms if applicable]

---

[Repeat for each word]
` : ""}

${includeContext ? `
## 📝 Words in Context

### Sentence Examples

For each word, provide:

**Word: [Word]**

1. **From the text:** "[Sentence from provided text or literature]"
2. **Student-friendly example:** "[Relatable sentence for ${gradeLevel}]"
3. **Academic example:** "[Sentence showing academic use]"

**Context Clues Practice:**
Read this passage and use context clues to determine the meaning of [word]:
"[Short passage with the word used in context with helpful clues]"

What clues helped you? ________________________________

---
` : ""}

${includeActivities ? `
## 🎯 Vocabulary Activities

### Activity 1: Frayer Model

For each word, students complete:

┌─────────────────────┬─────────────────────┐
│    DEFINITION       │   CHARACTERISTICS   │
│  (in your words)    │   (what it's like)  │
│                     │                     │
│                     │                     │
├─────────────────────┼─────────────────────┤
│     EXAMPLES        │    NON-EXAMPLES     │
│                     │                     │
│                     │                     │
│                     │                     │
└─────────────────────┴─────────────────────┘

### Activity 2: Word Sort

Sort the vocabulary words into categories:

| Category 1: [Label] | Category 2: [Label] | Category 3: [Label] |
|---------------------|---------------------|---------------------|
| [word]              | [word]              | [word]              |
| [word]              | [word]              | [word]              |

### Activity 3: Context Clues Detective

For each word, identify the type of context clue:
- Definition clue (word is defined in the sentence)
- Synonym clue (similar word nearby)
- Antonym clue (opposite word nearby)
- Example clue (examples given)
- Inference clue (figure it out from situation)

### Activity 4: Word Relationships

Complete the analogies:
1. [word] is to [related word] as [word] is to ________
2. [word] : [synonym] :: [word] : ________

### Activity 5: Sentence Completion

Fill in the blank with the best vocabulary word:
1. _________________________________________________ [word bank]
2. _________________________________________________ [word bank]
3. _________________________________________________ [word bank]

### Activity 6: Word Sketch

Draw a picture or symbol that represents each word. Explain your sketch.

### Activity 7: Vocabulary Conversation

With a partner, have a conversation using at least 5 vocabulary words. 
Topics to discuss: [relevant topic suggestions]

---
` : ""}

${includeAssessment ? `
## 📊 Assessment

### Quick Check: Matching
Match each word to its definition:

| Word | | Definition |
|------|---|------------|
| 1. [word] | ___ | A. [definition] |
| 2. [word] | ___ | B. [definition] |
| 3. [word] | ___ | C. [definition] |
| 4. [word] | ___ | D. [definition] |
| 5. [word] | ___ | E. [definition] |

### Multiple Choice
Circle the best answer:

1. Which sentence uses "[word]" correctly?
   a) [correct usage]
   b) [incorrect usage]
   c) [incorrect usage]
   d) [incorrect usage]

2. What does "[word]" most likely mean in this sentence: "[sentence]"?
   a) [definition options]
   b) 
   c) 
   d) 

### Short Response
Use each word in a sentence that shows you understand its meaning:

1. [word]: _________________________________________________
2. [word]: _________________________________________________
3. [word]: _________________________________________________

### Extended Response
Write a paragraph using at least 4 vocabulary words correctly. 
Underline each vocabulary word you use.

_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---
` : ""}

## 🎮 Vocabulary Games

### Game 1: Vocabulary Bingo
Create bingo cards with definitions. Call out words; students cover the matching definition.

### Game 2: Word Charades
Act out vocabulary words for teammates to guess.

### Game 3: $100,000 Pyramid
Give clues to help teammates guess vocabulary words without saying the word.

### Game 4: Vocabulary Jeopardy
Categories: Definitions, Synonyms, Antonyms, Use in a Sentence, Word Parts

---

## 📅 Weekly Vocabulary Routine

| Day | Activity | Time |
|-----|----------|------|
| Monday | Introduce words, student-friendly definitions | 15 min |
| Tuesday | Context clues practice, word parts | 10 min |
| Wednesday | Frayer model or semantic mapping | 15 min |
| Thursday | Games and partner practice | 10 min |
| Friday | Assessment and word wall update | 15 min |

---

**GUIDELINES:**
- Definitions must be student-friendly for ${gradeLevel}
- Include multiple exposures to each word
- Connect words to student experiences
- Provide visual and kinesthetic activities
- Build from receptive to productive knowledge`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const vocabulary = message.content[0].text;

    return Response.json({ vocabulary });
  } catch (error) {
    console.error("Error generating vocabulary materials:", error);
    return Response.json(
      { error: "Failed to generate vocabulary materials" },
      { status: 500 }
    );
  }
}