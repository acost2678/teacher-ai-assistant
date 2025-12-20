import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      studentIdentifier,
      gradeLevel,
      setting,
      disabilityCategory,
      targetBehavior,
      behaviorDescription,
      abcObservations,
      settingEvents,
      additionalContext,
      frequency,
      duration,
      intensity,
      peakTimes,
      peakSettings,
      includeRecommendations,
    } = await request.json();

    if (!targetBehavior || !abcObservations || abcObservations.length === 0) {
      return Response.json(
        { error: "Target behavior and ABC observations are required" },
        { status: 400 }
      );
    }

    // Format ABC observations for the prompt
    const abcFormatted = abcObservations.map((obs, i) => 
      `Observation ${i + 1}${obs.date ? ` (${obs.date}` : ''}${obs.time ? `, ${obs.time}` : ''}${obs.setting ? `, ${obs.setting}` : ''}${obs.date ? ')' : ''}:
  - Antecedent: ${obs.antecedent}
  - Behavior: ${obs.behavior}
  - Consequence: ${obs.consequence}`
    ).join('\n\n');

    const prompt = `You are an experienced Board Certified Behavior Analyst (BCBA) writing a Functional Behavioral Assessment (FBA). Generate a comprehensive, professional FBA document based on the data provided.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder throughout - NEVER invent a name
- This is a privacy-first system for FERPA compliance

**STUDENT INFORMATION:**
- Student Identifier: ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Primary Setting: ${setting}
${disabilityCategory ? `- Disability Category: ${disabilityCategory}` : ''}

**TARGET BEHAVIOR:**
- Behavior: ${targetBehavior}
- Description: ${behaviorDescription || 'See ABC data for behavioral descriptions'}

**ABC OBSERVATION DATA:**
${abcFormatted}

**SETTING EVENTS/ANTECEDENT CONDITIONS:**
${settingEvents && settingEvents.length > 0 ? settingEvents.join(', ') : 'None specified'}

**ADDITIONAL CONTEXT:**
${additionalContext || 'None provided'}

**DATA SUMMARY:**
- Frequency: ${frequency || 'Not specified'}
- Duration: ${duration || 'Not specified'}
- Intensity: ${intensity || 'Not specified'}
- Peak Times: ${peakTimes && peakTimes.length > 0 ? peakTimes.join(', ') : 'Not specified'}
- Peak Settings: ${peakSettings && peakSettings.length > 0 ? peakSettings.join(', ') : 'Not specified'}

**GENERATE A COMPLETE FBA WITH THE FOLLOWING SECTIONS:**

1. **REASON FOR REFERRAL**
   - Brief statement of why the FBA was conducted

2. **STUDENT BACKGROUND**
   - Relevant information about the student (grade, setting, disability if applicable)
   - Use "[Student Name]" throughout

3. **TARGET BEHAVIOR DEFINITION**
   - Operational definition that is observable and measurable
   - Include examples and non-examples

4. **DATA COLLECTION METHODS**
   - Describe ABC observation method used
   - Number of observations collected

5. **OBSERVATION DATA SUMMARY**
   - Summarize the ABC data patterns
   - Include frequency, duration, intensity information

6. **ANTECEDENT ANALYSIS**
   - What triggers or precedes the behavior?
   - Identify patterns in antecedents
   - Include setting events

7. **CONSEQUENCE ANALYSIS**
   - What typically follows the behavior?
   - What does the student gain or avoid?

8. **HYPOTHESIS OF BEHAVIOR FUNCTION**
   - State the hypothesized function(s): Attention, Escape/Avoidance, Access to Tangibles, or Sensory/Automatic
   - Provide a clear hypothesis statement in this format:
     "When [antecedent/trigger], [Student Name] engages in [behavior] in order to [function - what they get or avoid]. This hypothesis is supported by [evidence from data]."
   - Explain the evidence supporting this hypothesis

9. **SUMMARY AND CONCLUSIONS**
   - Synthesize findings
   - Restate the function hypothesis

${includeRecommendations ? `
10. **BEHAVIOR INTERVENTION PLAN (BIP) RECOMMENDATIONS**

    **Prevention Strategies (Antecedent Modifications):**
    - List 3-4 specific strategies to prevent the behavior from occurring
    
    **Replacement Behavior:**
    - Identify a functionally equivalent replacement behavior
    - Explain how it serves the same function as the target behavior
    
    **Teaching Strategies:**
    - How will the replacement behavior be taught?
    - Include specific skill instruction recommendations
    
    **Response Strategies:**
    - How should staff respond WHEN the behavior occurs?
    - How should staff respond when replacement behavior is used?
    
    **Reinforcement:**
    - What reinforcement strategies are recommended?
    - How will appropriate behavior be acknowledged?
    
    **Data Collection for BIP:**
    - What data should be collected to monitor progress?
` : ''}

**FORMATTING REQUIREMENTS:**
- Use clear section headers
- Write in professional, objective language
- Use "[Student Name]" consistently - never invent names
- Be specific and reference the actual data provided
- Make the function hypothesis evidence-based
- Keep the document comprehensive but focused

Write the complete FBA document now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const fba = message.content[0].text;

    return Response.json({ fba });
  } catch (error) {
    console.error("Error generating FBA:", error);
    return Response.json(
      { error: "Failed to generate FBA" },
      { status: 500 }
    );
  }
}