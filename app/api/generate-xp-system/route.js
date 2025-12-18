import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      gradeLevel,
      classSize,
      systemTheme,
      trackingMethod,
      rewardTypes,
      includeLeaderboard,
      includeLevels,
      includeShop,
      focusAreas,
      customBehaviors,
    } = await request.json();

    if (!gradeLevel) {
      return Response.json(
        { error: "Grade level is required" },
        { status: 400 }
      );
    }

    const themes = {
      "adventure": "Adventure/RPG - Students are heroes gaining experience",
      "space": "Space Exploration - Students are astronauts earning flight points",
      "sports": "Sports League - Students earn team points like athletes",
      "minecraft": "Building/Crafting - Students collect resources and build",
      "pokemon": "Creature Training - Students level up their characters",
      "simple": "Simple Points - Clean, straightforward point system",
    };

    const prompt = `You are an expert in classroom management and gamification. Create a complete XP (experience point) system for a classroom that motivates students and tracks progress.

**XP SYSTEM DETAILS:**
- Grade Level: ${gradeLevel}
- Class Size: ${classSize || "25 students"}
- Theme: ${themes[systemTheme] || themes["simple"]}
- Tracking Method: ${trackingMethod || "Digital and physical"}
${focusAreas ? `- Focus Areas: ${focusAreas}` : ""}
${customBehaviors ? `- Custom Behaviors to Reward: ${customBehaviors}` : ""}
${includeLeaderboard ? "- Include class leaderboard system" : ""}
${includeLevels ? "- Include leveling system with titles" : ""}
${includeShop ? "- Include reward shop where students spend points" : ""}

**CREATE A COMPLETE XP SYSTEM:**

---

# ⚡ CLASSROOM XP SYSTEM

**Theme:** ${systemTheme || "Simple Points"}
**Grade Level:** ${gradeLevel}
**Class Size:** ${classSize || "25 students"}

---

## 📖 System Overview

### The Concept
[2-3 sentences explaining the theme and how students earn/use XP. Make it exciting and age-appropriate for ${gradeLevel}.]

### Key Terms
- **XP:** [What students call their points in this theme]
- **Level:** [What advancement is called]
- **Reward:** [What they can earn]

---

## ⚡ EARNING XP

### Academic XP
| Action | XP Earned | Notes |
|--------|-----------|-------|
| Complete homework on time | +10 XP | |
| Score 90%+ on quiz | +25 XP | |
| Score 80-89% on quiz | +15 XP | |
| Improve test score from last time | +20 XP | Growth bonus |
| Ask a thoughtful question | +5 XP | |
| Help explain concept to classmate | +15 XP | |
| Complete bonus challenge | +30 XP | |
| Perfect attendance (week) | +25 XP | |

### Behavior XP
| Action | XP Earned | Notes |
|--------|-----------|-------|
| On task during work time | +5 XP | Per class |
| Positive participation | +5 XP | |
| Helping a classmate | +10 XP | |
| Showing kindness | +10 XP | |
| Following directions first time | +5 XP | |
| Clean up without being asked | +5 XP | |
| Respectful disagreement | +15 XP | |
| Leadership moment | +20 XP | |

### Bonus XP Opportunities
| Action | XP Earned | Notes |
|--------|-----------|-------|
| Random act of kindness caught | +15 XP | Surprise bonus |
| "Caught being awesome" | +10 XP | Teacher discretion |
| Class goal achieved | +25 XP | Everyone earns |
| Weekly challenge completed | +50 XP | Optional |
| Boss Battle participation | +20 XP | Win bonus +30 |

### XP Penalties (Optional - Use Sparingly)
| Action | XP Lost | Notes |
|--------|---------|-------|
| Disruptive behavior (after warning) | -5 XP | Max 1x per day |
| Unkind words/actions | -10 XP | Requires reflection |
| Missing homework (pattern) | -5 XP | After 3rd time |

**Important:** Focus on EARNING, not losing. Ratio should be 10:1 positive to negative.

---

${includeLevels ? `
## 📊 LEVELING SYSTEM

### Level Progression
| Level | Title | XP Required | Reward |
|-------|-------|-------------|--------|
| 1 | [Beginner Title] | 0 XP | Starting badge |
| 2 | [Title] | 100 XP | [Small privilege] |
| 3 | [Title] | 250 XP | [Privilege] |
| 4 | [Title] | 500 XP | [Better privilege] |
| 5 | [Title] | 800 XP | [Special privilege] |
| 6 | [Title] | 1200 XP | [Great privilege] |
| 7 | [Title] | 1700 XP | [Amazing privilege] |
| 8 | [Title] | 2300 XP | [Top privilege] |
| 9 | [Title] | 3000 XP | [Elite privilege] |
| 10 | [Master Title] | 4000 XP | [Ultimate reward] |

### Level-Up Celebration
When a student levels up:
1. Announce to class: "[Student] has reached Level [X]: [Title]!"
2. Award level-up certificate
3. Grant new privileges
4. Update class display
` : ""}

${includeShop ? `
## 🛒 REWARD SHOP

Students can SPEND earned XP on rewards:

### Small Rewards (25-50 XP)
| Reward | Cost | Stock |
|--------|------|-------|
| Sit in special seat for day | 25 XP | Unlimited |
| Choose brain break activity | 30 XP | 1/day |
| First in lunch line | 25 XP | 1/day |
| Use special supplies | 35 XP | Unlimited |
| 5 minutes free reading | 40 XP | Unlimited |
| Sticker/stamp of choice | 25 XP | Unlimited |

### Medium Rewards (75-150 XP)
| Reward | Cost | Stock |
|--------|------|-------|
| Homework pass | 100 XP | 2/month |
| Choose class music | 75 XP | 1/week |
| Extra recess (5 min) | 100 XP | 1/week |
| Lunch with teacher | 125 XP | 1/week |
| Show and tell slot | 75 XP | 1/week |
| Class game choice | 150 XP | 1/week |

### Big Rewards (200-500 XP)
| Reward | Cost | Stock |
|--------|------|-------|
| Treasure chest pick | 200 XP | Unlimited |
| Be teacher's helper for day | 250 XP | 1/week |
| Extra credit opportunity | 300 XP | 2/month |
| Pajama day pass | 400 XP | 1/month |
| Prize from prize box | 350 XP | Unlimited |
| Call home to share good news | 250 XP | Unlimited |

### Epic Rewards (500+ XP)
| Reward | Cost | Stock |
|--------|------|-------|
| Homework-free night | 500 XP | 1/month |
| Choose class activity | 600 XP | 1/month |
| Principal's VIP lunch | 750 XP | 1/month |
| Bring a stuffed animal for day | 500 XP | 1/week |

**Shop Rules:**
- Shop is open [when - e.g., Friday afternoons]
- Students must have XP available (can't go negative)
- Some rewards have limited stock
- Unused XP carries over
` : ""}

${includeLeaderboard ? `
## 🏆 LEADERBOARD SYSTEM

### Weekly Leaderboard
Display top XP earners each week:
- Top 5 students highlighted
- Everyone's progress visible
- Resets each Monday

### How to Display
**Physical:** Poster with moveable name cards
**Digital:** Google Sheets, ClassDojo, or Slides

### Leaderboard Bonuses
- #1 for the week: +25 bonus XP
- #2 for the week: +15 bonus XP
- #3 for the week: +10 bonus XP
- Most improved: +20 bonus XP

### Fairness Notes
- Also celebrate "Most Improved"
- Recognize effort, not just totals
- Consider team competitions too
- Some students may prefer private tracking
` : ""}

---

## 📋 TRACKING METHODS

### Option 1: Physical Tracking
**XP Cards:** Each student has an index card
- Teacher stamps/marks XP earned
- Students track their own totals
- Weekly check-ins to verify

**Class Chart:** Large poster
- Rows for each student
- Stickers or stamps for XP
- Visual progress for all

### Option 2: Digital Tracking
**Spreadsheet:** Google Sheets
- Columns: Student, Date, Action, XP, Total
- Students can view their own
- Easy to calculate totals

**Apps:** ClassDojo, Classcraft, LiveSchool
- Automatic tracking
- Parent visibility
- Built-in rewards

### Option 3: Hybrid
- Daily XP tracked on paper
- Weekly totals entered digitally
- Monthly certificates printed

---

## 🚀 GETTING STARTED

### Week 1: Introduction
- [ ] Explain the XP system to students
- [ ] Set up tracking method
- [ ] Hand out starter XP (everyone starts with 50 XP)
- [ ] Create class display

### Week 2: Practice
- [ ] Focus on positive XP earning
- [ ] Catch students being good
- [ ] Do daily XP celebrations
- [ ] Address questions

### Week 3+: Full Implementation
- [ ] Open reward shop
- [ ] Start leaderboard
- [ ] Add special events (Boss Battles, Double XP days)
- [ ] Celebrate level-ups

---

## 💡 PRO TIPS

1. **Be Generous Early** - Give lots of XP at first to build excitement
2. **Catch the Quiet Kids** - Make sure all students earn XP, not just the loud ones
3. **Celebrate Loudly** - Make earning XP feel special
4. **Stay Consistent** - Same behaviors = same XP every time
5. **Add Surprises** - Random "Double XP" moments keep it fresh
6. **Involve Students** - Let them suggest new ways to earn or spend XP
7. **Parent Communication** - Send home weekly XP reports

---

## 📄 PRINTABLES NEEDED

- [ ] Student XP tracking cards
- [ ] Class XP chart/poster
- [ ] Level-up certificates
- [ ] Reward shop menu
- [ ] Weekly XP report (for parents)

---

**This system is designed to be:**
- ✅ Easy to implement
- ✅ Motivating for all students
- ✅ Focused on positive behavior
- ✅ Flexible and customizable
- ✅ Fun for ${gradeLevel}!`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const xpSystem = message.content[0].text;

    return Response.json({ xpSystem });
  } catch (error) {
    console.error("Error generating XP system:", error);
    return Response.json(
      { error: "Failed to generate XP system" },
      { status: 500 }
    );
  }
}