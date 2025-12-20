import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      spaceType,
      budget,
      focusAreas,
      includeStrategies,
      includeVisuals,
      includeRules,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const focusDescriptions = {
      'anxiety': 'Anxiety/Worry - tools for calming worried thoughts',
      'anger': 'Anger/Frustration - strategies for cooling down',
      'sadness': 'Sadness - comfort items and emotional support',
      'overwhelm': 'Feeling Overwhelmed - simplification and decompression',
      'sensory': 'Sensory Needs - sensory tools and regulation',
      'focus': 'Focus/Attention - tools for regaining concentration',
    };

    const focusList = focusAreas.map(f => focusDescriptions[f] || f).join('\n- ');

    const prompt = `You are an expert in child psychology, self-regulation, and trauma-informed classroom design. Create a comprehensive plan for setting up a calming corner/self-regulation space.

**CALMING CORNER DETAILS:**
- Grade Level: ${gradeLevel}
- Space Type: ${spaceType}
- Budget: ${budget}
- Focus Areas:
  - ${focusList}

**CREATE A COMPLETE CALMING CORNER PLAN:**

---

# 🧘 Calming Corner Plan: ${spaceType}

**Grade Level:** ${gradeLevel}
**Budget:** ${budget}
**Focus Areas:** ${focusAreas.join(', ')}

---

## 📍 Space Setup

### Location Considerations
- [Where to place the calming corner]
- [Privacy considerations for ${gradeLevel}]
- [Visibility for teacher monitoring]
- [Away from high-traffic areas]

### Physical Setup for ${spaceType}
- **Dimensions needed:** [approximate size]
- **Seating:** [appropriate seating for ${gradeLevel} within ${budget}]
- **Boundaries:** [how to define the space]
- **Lighting:** [soft lighting options within budget]

---

## 🛒 Materials & Supplies Shopping List

### Within ${budget}:

**Seating/Comfort:**
| Item | Estimated Cost | Purpose |
|------|----------------|---------|
| [Item] | $[cost] | [why needed] |
| [Item] | $[cost] | [why needed] |

**Sensory Tools:**
| Item | Estimated Cost | Purpose |
|------|----------------|---------|
| [Item] | $[cost] | [why needed] |
| [Item] | $[cost] | [why needed] |
| [Item] | $[cost] | [why needed] |

**Calming Activities:**
| Item | Estimated Cost | Purpose |
|------|----------------|---------|
| [Item] | $[cost] | [why needed] |
| [Item] | $[cost] | [why needed] |

**DIY/Free Options:**
- [Free item 1 - what and how to make]
- [Free item 2 - what and how to make]
- [Free item 3 - what and how to make]

**Estimated Total:** $[total]

---

${includeStrategies ? `## 🌟 Calming Strategies to Include

### For Anxiety/Worry:
**Strategy 1: [Name]**
- Steps: [1-2-3 steps]
- Visual cue: [what to post]

**Strategy 2: [Name]**
- Steps: [1-2-3 steps]
- Visual cue: [what to post]

### For Anger/Frustration:
**Strategy 1: [Name]**
- Steps: [1-2-3 steps]
- Visual cue: [what to post]

**Strategy 2: [Name]**
- Steps: [1-2-3 steps]
- Visual cue: [what to post]

### For Feeling Overwhelmed:
**Strategy 1: [Name]**
- Steps: [1-2-3 steps]
- Visual cue: [what to post]

### Quick Reference for Students:
1. [Simple strategy name] - [one-line description]
2. [Simple strategy name] - [one-line description]
3. [Simple strategy name] - [one-line description]
4. [Simple strategy name] - [one-line description]
5. [Simple strategy name] - [one-line description]

---
` : ''}

${includeVisuals ? `## 🖼️ Visual Supports to Create

### 1. Feelings Check-In Chart
**Purpose:** Help students identify their emotion
**Design:**
- [Description of what to include]
- [Colors to use]
- [Size recommendation]

### 2. Calming Strategy Menu
**Purpose:** Give students choices for self-regulation
**Design:**
- [Strategy options to show]
- [Visual icons to use]
- [Format recommendation]

### 3. "I Need a Break" Signal
**Purpose:** Non-verbal way to request calming corner
**Options:**
- [Signal option 1]
- [Signal option 2]

### 4. Timer Visual
**Purpose:** Help students know how long to stay
**Recommendation:** [specific timer type for ${gradeLevel}]

### 5. Return-to-Class Checklist
**Purpose:** Help students self-assess readiness
**Include:**
- [ ] My body feels calm
- [ ] I took deep breaths
- [ ] I'm ready to learn
- [ ] [Additional age-appropriate item]

---
` : ''}

${includeRules ? `## 📋 Expectations & Guidelines

### When to Use the Calming Corner:
✅ **Yes, you can go when you:**
- Feel your body getting upset
- Need a break before you lose control
- Are asked by the teacher to take a break
- Need sensory input to focus

❌ **The calming corner is NOT for:**
- Avoiding work
- Playing with toys
- Hiding from consequences
- Socializing with friends

### How to Use It:
1. [Step 1 - signal to teacher or self-select]
2. [Step 2 - go quietly]
3. [Step 3 - choose a strategy]
4. [Step 4 - use timer]
5. [Step 5 - check readiness]
6. [Step 6 - return to learning]

### Time Limits:
- Recommended time: [appropriate for ${gradeLevel}]
- Maximum time: [limit]
- If more time needed: [what to do]

### Number of Students:
- [How many at once]
- [What to do if occupied]

### Taking Care of the Space:
- Put materials back
- Treat items gently
- Tell teacher if something breaks
- Keep the space calm for others

---
` : ''}

## 🎓 Teaching Students to Use the Space

### Week 1: Introduction
- [Day 1 activity]
- [Day 2 activity]
- [Day 3 activity]

### Week 2: Practice
- [Guided practice activities]
- [Role-playing scenarios]

### Ongoing:
- [How to reinforce]
- [When to reteach]

---

## 👩‍🏫 Teacher Tips

**Making It Successful:**
- Model using calming strategies yourself
- Praise students who use the space appropriately
- Never use as punishment
- Check in with frequent users

**Red Flags to Watch:**
- Student using space excessively (more than [x] times/day)
- Student not calming after [x] minutes
- Student refusing to leave

**When to Involve Support Staff:**
- [Situation 1]
- [Situation 2]

---

## ⚠️ Important Reminders

- The calming corner is for REGULATION, not PUNISHMENT
- Some students need co-regulation first (adult support)
- Teach the space when students are calm
- Regularly refresh materials to maintain interest
- Monitor but don't hover

---

**This calming corner is designed to help students develop lifelong self-regulation skills in a safe, supportive environment.**`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3500,
      messages: [{ role: "user", content: prompt }],
    });

    const plan = message.content[0].text;

    return Response.json({ plan });
  } catch (error) {
    console.error("Error generating calming corner plan:", error);
    return Response.json(
      { error: "Failed to generate calming corner plan" },
      { status: 500 }
    );
  }
}