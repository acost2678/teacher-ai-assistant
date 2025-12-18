import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { 
      studentName, 
      gradeLevel, 
      disabilityCategory,
      currentChallenges,
      teacherObservations,
      existingGoals,
      generateNewGoals,
      generateAccommodations,
      currentPerformance,
      strengthsInterests,
      areasOfNeed,
      uploadedContent,
    } = await request.json();

    const disabilityCategoryContext = {
      "learning-disability-reading": "Learning Disability in Reading (Dyslexia) - focusing on phonemic awareness, decoding, fluency, and reading comprehension skills",
      "learning-disability-writing": "Learning Disability in Written Expression (Dysgraphia) - focusing on handwriting, spelling, grammar, and written composition skills",
      "learning-disability-math": "Learning Disability in Mathematics (Dyscalculia) - focusing on number sense, computation, math reasoning, and problem-solving skills",
      "speech-language": "Speech/Language Impairment - focusing on articulation, expressive language, receptive language, pragmatic/social language skills",
      "autism": "Autism Spectrum Disorder - focusing on social communication, social interaction, restricted/repetitive behaviors, sensory needs, and executive function",
      "adhd-executive-function": "ADHD/Executive Function Deficits - focusing on attention, impulse control, organization, time management, working memory, and task initiation",
      "emotional-behavioral": "Emotional/Behavioral Disability - focusing on emotional regulation, behavior management, social skills, coping strategies, and self-advocacy",
      "multiple": "Multiple Disabilities - addressing needs across several areas"
    };

    const categoryDescription = disabilityCategoryContext[disabilityCategory] || "the identified disability area";

    let uploadedContentSection = "";
    if (uploadedContent && uploadedContent.trim()) {
      uploadedContentSection = `

**REFERENCE DOCUMENTS PROVIDED BY TEACHER:**
The teacher has uploaded previous IEP documents, evaluation reports, or other reference materials:
---
${uploadedContent.substring(0, 4000)}${uploadedContent.length > 4000 ? '\n...[content truncated]' : ''}
---
Use this information to ensure continuity and accuracy in the IEP update.
`;
    }

    let prompt = `You are an experienced special education teacher and IEP specialist with deep knowledge of IDEA (Individuals with Disabilities Education Act) requirements. You write legally compliant, educationally sound IEP documentation.
${uploadedContentSection}
Student Information:
- Name: ${studentName}
- Grade Level: ${gradeLevel}
- Disability Category: ${categoryDescription}

Teacher's Observations of Current Challenges:
${currentChallenges}

Additional Teacher Observations:
${teacherObservations || 'None provided'}

${existingGoals ? `Current IEP Goals Being Reviewed:\n${existingGoals}` : ''}

Please provide the following:

---

## 1. PRESENT LEVELS OF PERFORMANCE (PLAAFP)

Based on the teacher's input, write a detailed, polished Present Levels of Academic Achievement and Functional Performance statement. This should:
- Expand on the teacher's observations with professional language
- Describe how the disability affects involvement in the general curriculum
- Include specific, measurable baseline data where possible
- Be written in objective, strength-based language
- Be thorough but concise (1-2 paragraphs)

---`;

    if (generateNewGoals) {
      prompt += `

## 2. MEASURABLE ANNUAL IEP GOALS

Generate 2-3 SMART IEP goals that follow IDEA requirements. Each goal MUST include ALL of these components:

1. **Timeframe**: "Within the next school year..." or "By [date]..."
2. **Condition**: "Given [specific supports, materials, or settings]..."
3. **Student**: "[Student name] will..."
4. **Behavior**: [specific, observable, measurable skill]
5. **Criteria**: [how well - accuracy %, rubric score, etc.]
6. **Measurement Method**: "...as measured by [data collection method]"
7. **Frequency**: "...in [X] out of [Y] trials/opportunities"

Format each goal as a single, complete sentence that includes ALL components above.

Example format:
"Within the next school year, given graphic organizers and teacher modeling, ${studentName} will write a 3-paragraph essay including an introduction with a thesis statement, two body paragraphs with supporting details, and a conclusion, scoring at least 3 out of 4 on the classroom writing rubric, in 4 out of 5 writing assignments as measured by teacher-scored writing samples."

For each goal, also provide:
- **Short-term objectives/benchmarks** (2-3 stepping stones toward the annual goal)
- **How progress will be measured and reported**

---`;
    }

    if (generateAccommodations) {
      prompt += `

## 3. RECOMMENDED ACCOMMODATIONS

Based on the student's disability category and identified needs, provide specific, appropriate accommodations organized by category:

**Presentation Accommodations** (how information is presented to the student)
**Response Accommodations** (how the student can respond/demonstrate learning)  
**Setting Accommodations** (where the student learns/is assessed)
**Timing/Scheduling Accommodations** (when and how long)

For each accommodation:
- Be specific (not just "extended time" but "extended time of 1.5x for tests and quizzes")
- Explain briefly why this accommodation addresses the student's specific needs
- Ensure accommodations are appropriate for the grade level

---`;
    }

    prompt += `

## 4. SUMMARY & RECOMMENDATIONS

Provide a brief summary with:
- Key priorities for the IEP team to consider
- Suggestions for progress monitoring frequency
- Any additional supports or services to consider

---

Write all sections now, using professional special education terminology while remaining clear and parent-friendly:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const iepContent = message.content[0].text;

    return Response.json({ iep: iepContent });
  } catch (error) {
    console.error("Error generating IEP content:", error);
    return Response.json(
      { error: "Failed to generate IEP content" },
      { status: 500 }
    );
  }
}