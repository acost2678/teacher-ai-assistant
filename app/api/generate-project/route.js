import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request) {
  try {
    const {
      mode,
      gradeLevel,
      subject,
      lessonContent,
      learningObjectives,
      demonstrationMethod,
      projectFormat,
      timeAvailable,
      materialsAvailable,
      preferredProjectTypes,
      differentiationNeeds,
      selectedIdea,
    } = await request.json();

    if (!lessonContent) {
      return Response.json(
        { error: "Lesson content is required" },
        { status: 400 }
      );
    }

    const formatLabels = {
      'individual': 'Individual project',
      'pairs': 'Partner project (pairs)',
      'small-groups': 'Small group project (3-4 students)',
      'large-groups': 'Large group project (5+ students)',
      'flexible': 'Flexible grouping (student choice)',
    };

    const projectTypeLabels = {
      'poster': 'Poster/Display Board',
      'slideshow': 'Slideshow/Presentation',
      'video': 'Video/Documentary',
      'model': 'Model/Diorama',
      'essay': 'Essay/Written Report',
      'infographic': 'Infographic',
      'brochure': 'Brochure/Pamphlet',
      'website': 'Website/Digital Portfolio',
      'podcast': 'Podcast/Audio Recording',
      'comic': 'Comic Strip/Graphic Novel',
      'game': 'Game/Interactive Activity',
      'experiment': 'Experiment/Investigation',
      'performance': 'Performance/Skit/Play',
      'song': 'Song/Rap/Jingle',
      'art': 'Art Project',
      'interview': 'Interview/Documentary',
      'social-media': 'Mock Social Media Campaign',
      'news': 'News Report/Broadcast',
      'childrens-book': "Children's Book",
      'magazine': 'Magazine/Newspaper',
      'timeline': 'Timeline/Visual Timeline',
      'map': 'Annotated Map',
      'letter': 'Letter/Diary Entry',
      'debate': 'Debate/Argumentative Presentation',
      'museum': 'Museum Exhibit',
      'tutorial': 'How-To Guide/Tutorial',
      'board-game': 'Board Game',
      'escape-room': 'Escape Room',
      'stem-challenge': 'STEM Challenge',
      'research': 'Research Project',
    };

    // Mode 1: Generate Ideas
    if (mode === 'ideas') {
      const preferredTypesText = preferredProjectTypes && preferredProjectTypes.length > 0
        ? `Teacher prefers these project types: ${preferredProjectTypes.map(t => projectTypeLabels[t] || t).join(', ')}`
        : 'No specific project type preference - suggest a variety of creative options';

      const prompt = `You are an expert K-12 curriculum specialist who creates engaging, standards-aligned projects.

A teacher has taught the following lesson and wants project ideas for students to demonstrate their learning.

**LESSON INFORMATION:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Lesson Content: ${lessonContent}
${learningObjectives ? `- Learning Objectives: ${learningObjectives}` : ''}
${demonstrationMethod ? `- How students should demonstrate learning: ${demonstrationMethod}` : ''}

**PROJECT CONSTRAINTS:**
- Format: ${formatLabels[projectFormat] || projectFormat}
- Time Available: ${timeAvailable}
- Materials Available: ${materialsAvailable || 'Standard classroom supplies'}
- ${preferredTypesText}
${differentiationNeeds ? `- Differentiation Needs: ${differentiationNeeds}` : ''}

**GENERATE 6 CREATIVE PROJECT IDEAS**

Return your response as a JSON array with exactly 6 project ideas. Each idea should have:
- icon: An emoji that represents this project type
- title: A catchy, specific project title
- description: 2-3 sentences describing what students will create
- whyItWorks: 1 sentence explaining why this project is perfect for this lesson

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
[
  {
    "icon": "📊",
    "title": "Project Title Here",
    "description": "Description of what students will create and do.",
    "whyItWorks": "Why this project effectively demonstrates learning."
  }
]

Make the projects:
- Age-appropriate for ${gradeLevel}
- Achievable within ${timeAvailable}
- Varied in style (mix of creative, technical, hands-on)
- Directly connected to the lesson content
- Engaging and student-centered`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      let responseText = message.content[0].text.trim();
      
      // Clean up response
      const firstBracket = responseText.indexOf('[');
      const lastBracket = responseText.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1) {
        responseText = responseText.substring(firstBracket, lastBracket + 1);
      }

      let ideas = [];
      try {
        ideas = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        // Fallback ideas
        ideas = [
          { icon: "📊", title: "Visual Presentation", description: "Create a visual presentation demonstrating key concepts from the lesson.", whyItWorks: "Allows creative expression while showing understanding." },
          { icon: "📝", title: "Written Report", description: "Write an informative report explaining the main ideas.", whyItWorks: "Develops writing skills while reinforcing content knowledge." },
          { icon: "🎨", title: "Creative Poster", description: "Design an illustrated poster showcasing learning.", whyItWorks: "Appeals to visual learners and encourages creativity." },
          { icon: "🎬", title: "Video Explanation", description: "Record a video teaching others about the topic.", whyItWorks: "Teaching others deepens understanding." },
          { icon: "🎮", title: "Educational Game", description: "Create a game that helps others learn the concepts.", whyItWorks: "Gamification increases engagement and retention." },
          { icon: "📖", title: "Illustrated Book", description: "Create an illustrated book explaining the topic.", whyItWorks: "Combines writing and art for comprehensive expression." },
        ];
      }

      return Response.json({ ideas });
    }

    // Mode 2: Generate Full Project
    if (mode === 'full' && selectedIdea) {
      const fullProjectPrompt = `You are an expert K-12 curriculum specialist creating a complete project packet.

**LESSON INFORMATION:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Lesson Content: ${lessonContent}
${learningObjectives ? `- Learning Objectives: ${learningObjectives}` : ''}
${demonstrationMethod ? `- How students should demonstrate learning: ${demonstrationMethod}` : ''}

**PROJECT CONSTRAINTS:**
- Format: ${formatLabels[projectFormat] || projectFormat}
- Time Available: ${timeAvailable}
- Materials Available: ${materialsAvailable || 'Standard classroom supplies'}
${differentiationNeeds ? `- Differentiation Needs: ${differentiationNeeds}` : ''}

**SELECTED PROJECT:**
- Title: ${selectedIdea.title}
- Description: ${selectedIdea.description}

**CREATE A COMPLETE PROJECT PACKET FOR TEACHERS**

Include ALL of the following sections:

1. **PROJECT OVERVIEW**
   - Project Title
   - Grade Level & Subject
   - Time Required
   - Grouping Format
   - Project Summary

2. **LEARNING OBJECTIVES**
   - 3-4 specific, measurable objectives aligned to the lesson
   - What students will know and be able to do

3. **STANDARDS ALIGNMENT**
   - Relevant standards this project addresses

4. **MATERIALS NEEDED**
   - Complete list of all materials
   - Technology requirements
   - Optional materials for enhancement

5. **PROJECT TIMELINE/MILESTONES**
   - Day-by-day or phase-by-phase breakdown
   - Specific tasks for each time period
   - Checkpoints for teacher monitoring

6. **STEP-BY-STEP INSTRUCTIONS**
   - Detailed procedure for implementing the project
   - Teacher facilitation notes at each step
   - Tips for keeping students on track

7. **RUBRIC**
   Create a 4-level rubric with these categories:
   - Content/Accuracy (Does it demonstrate understanding?)
   - Creativity/Presentation (Is it well-designed and engaging?)
   - Completeness (Are all requirements met?)
   - ${projectFormat === 'individual' ? 'Effort/Growth' : 'Collaboration/Teamwork'}
   
   For each category, describe what Exceeds (4), Meets (3), Approaching (2), and Beginning (1) looks like.

8. **DIFFERENTIATION STRATEGIES**
   - Modifications for struggling learners
   - Extensions for advanced learners
   - ELL supports
   ${differentiationNeeds ? `- Specific accommodations for: ${differentiationNeeds}` : ''}

9. **TEACHER TIPS**
   - Common pitfalls to avoid
   - How to troubleshoot issues
   - Ways to extend or modify

10. **REFLECTION QUESTIONS**
    - Questions for students to reflect on their learning
    - Self-assessment prompts`;

      const studentHandoutPrompt = `You are creating a STUDENT-FACING handout for the following project. Write in student-friendly language appropriate for ${gradeLevel}.

**PROJECT:**
- Title: ${selectedIdea.title}
- Description: ${selectedIdea.description}
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Time Available: ${timeAvailable}
- Format: ${formatLabels[projectFormat] || projectFormat}

**CREATE A STUDENT HANDOUT WITH:**

1. **PROJECT TITLE & OVERVIEW**
   - Catchy title
   - 2-3 sentences explaining what they'll create

2. **YOUR MISSION** (Learning Goals)
   - 3-4 "I can..." statements
   - Written in student-friendly language

3. **WHAT YOU NEED**
   - Simple materials list
   - Checklist format

4. **STEP-BY-STEP DIRECTIONS**
   - Numbered steps students can follow
   - Clear, simple language
   - Include helpful tips in parentheses

5. **TIMELINE/CHECKPOINTS**
   - When each part should be done
   - Simple milestone checklist

6. **SUCCESS CRITERIA** (Kid-Friendly Rubric)
   - What does an AMAZING project look like?
   - What does a GOOD project look like?
   - What needs MORE WORK?
   - Use stars or emojis: ⭐⭐⭐⭐ / ⭐⭐⭐ / ⭐⭐ / ⭐

7. **SELF-CHECK QUESTIONS**
   - 3-4 questions students ask themselves before submitting
   - "Did I...?" format

8. **REFLECTION**
   - Space for students to write what they learned
   - What they're proud of
   - What was challenging

Make it visually organized with clear headers that a ${gradeLevel} student can easily follow. Use encouraging language!`;

      // Generate both in parallel
      const [projectResponse, handoutResponse] = await Promise.all([
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [{ role: "user", content: fullProjectPrompt }],
        }),
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: studentHandoutPrompt }],
        }),
      ]);

      const project = projectResponse.content[0].text;
      const studentHandout = handoutResponse.content[0].text;

      return Response.json({ project, studentHandout });
    }

    return Response.json({ error: "Invalid mode or missing data" }, { status: 400 });

  } catch (error) {
    console.error("Error generating project:", error);
    return Response.json(
      { error: "Failed to generate project" },
      { status: 500 }
    );
  }
}