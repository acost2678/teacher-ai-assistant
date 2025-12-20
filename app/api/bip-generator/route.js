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
      behaviorDefinition,
      baselineData,
      primaryFunction,
      functionExplanation,
      replacementBehavior,
      studentStrengths,
      studentInterests,
      previousInterventions,
      staffInvolved,
      includeDataSheet,
      includeCrisisPlan,
    } = await request.json();

    if (!targetBehavior || !primaryFunction) {
      return Response.json(
        { error: "Target behavior and function are required" },
        { status: 400 }
      );
    }

    const functionLabels = {
      escape: "Escape/Avoidance",
      attention: "Attention",
      access: "Access to Tangibles",
      sensory: "Sensory/Automatic",
      multiple: "Multiple Functions",
    };

    const functionStrategies = {
      escape: {
        prevention: [
          "Provide choices within tasks",
          "Break tasks into smaller, manageable chunks",
          "Pre-teach difficult concepts",
          "Use visual schedules and timers",
          "Modify task difficulty or length",
          "Provide frequent breaks built into schedule",
        ],
        teaching: [
          "Teach appropriate break request",
          "Teach help-seeking skills",
          "Build frustration tolerance gradually",
          "Practice coping strategies",
        ],
        reinforcement: [
          "Provide breaks contingent on work completion",
          "Praise effort and persistence",
          "Use escape as reinforcement for appropriate behavior",
        ],
      },
      attention: {
        prevention: [
          "Provide frequent positive attention for appropriate behavior",
          "Schedule regular check-ins",
          "Assign classroom jobs/helper roles",
          "Use proximity and non-verbal cues",
          "Teach and reinforce attention-seeking alternatives",
        ],
        teaching: [
          "Teach appropriate ways to get attention",
          "Practice waiting skills",
          "Role-play appropriate conversation starters",
        ],
        reinforcement: [
          "Provide immediate attention for replacement behavior",
          "Use behavior-specific praise",
          "Implement peer attention systems",
        ],
      },
      access: {
        prevention: [
          "Provide access to preferred items/activities contingently",
          "Use first-then boards",
          "Create clear expectations for earning access",
          "Offer choices of preferred items",
        ],
        teaching: [
          "Teach appropriate requesting",
          "Practice waiting and turn-taking",
          "Teach self-management for delayed gratification",
        ],
        reinforcement: [
          "Provide immediate access for appropriate requests",
          "Use token economy tied to preferred items",
          "Offer surprise reinforcers for sustained appropriate behavior",
        ],
      },
      sensory: {
        prevention: [
          "Provide sensory diet throughout the day",
          "Create sensory-friendly environment",
          "Schedule movement breaks",
          "Provide fidgets or sensory tools",
          "Modify sensory input (lighting, noise)",
        ],
        teaching: [
          "Teach self-regulation strategies",
          "Identify sensory needs and preferences",
          "Practice appropriate sensory-seeking alternatives",
        ],
        reinforcement: [
          "Provide access to preferred sensory activities",
          "Reinforce use of appropriate sensory tools",
          "Create sensory breaks as earned reinforcement",
        ],
      },
      multiple: {
        prevention: [
          "Address each function with targeted strategies",
          "Create comprehensive antecedent modifications",
          "Ensure all maintaining variables are addressed",
        ],
        teaching: [
          "Teach multiple replacement behaviors for different contexts",
          "Practice identifying own needs/triggers",
        ],
        reinforcement: [
          "Match reinforcement to function in each context",
          "Use varied reinforcement menu",
        ],
      },
    };

    const strategies = functionStrategies[primaryFunction] || functionStrategies.escape;

    const prompt = `You are an experienced Board Certified Behavior Analyst (BCBA) writing a Behavior Intervention Plan (BIP). Generate a comprehensive, legally-compliant BIP based on the FBA data provided.

**IMPORTANT PRIVACY INSTRUCTION:**
- Use "[Student Name]" as a placeholder throughout - NEVER invent a name
- This is a privacy-first system for FERPA compliance

**STUDENT INFORMATION:**
- Student Identifier: ${studentIdentifier}
- Grade Level: ${gradeLevel}
- Primary Setting: ${setting}
${disabilityCategory ? `- Disability Category: ${disabilityCategory}` : ''}

**FROM THE FBA:**

Target Behavior: ${targetBehavior}
${behaviorDefinition ? `Operational Definition: ${behaviorDefinition}` : ''}
${baselineData ? `Baseline Data: ${baselineData}` : ''}

Function of Behavior: ${functionLabels[primaryFunction]}
${functionExplanation ? `Hypothesis Statement: ${functionExplanation}` : ''}

**BIP DEVELOPMENT INPUT:**
${replacementBehavior ? `Proposed Replacement Behavior: ${replacementBehavior}` : ''}
${studentStrengths ? `Student Strengths: ${studentStrengths}` : ''}
${studentInterests ? `Student Interests/Motivators: ${studentInterests}` : ''}
${previousInterventions ? `Previous Interventions Tried: ${previousInterventions}` : ''}
${staffInvolved ? `Staff Involved: ${staffInvolved}` : ''}

**FUNCTION-BASED STRATEGY SUGGESTIONS:**
Prevention Strategies for ${functionLabels[primaryFunction]}: ${strategies.prevention.join(', ')}
Teaching Strategies: ${strategies.teaching.join(', ')}
Reinforcement Strategies: ${strategies.reinforcement.join(', ')}

**GENERATE A COMPLETE BIP WITH THESE SECTIONS:**

1. **STUDENT INFORMATION**
   - Basic demographic info using [Student Name]
   - Date of BIP
   - Team members involved

2. **BEHAVIOR SUMMARY (from FBA)**
   - Target behavior and operational definition
   - Baseline data
   - Function of behavior
   - Hypothesis statement

3. **REPLACEMENT BEHAVIOR**
   - Functionally equivalent replacement behavior
   - Why this serves the same function
   - Observable and measurable definition

4. **BEHAVIOR GOALS**
   - Measurable goal for reducing target behavior
   - Measurable goal for increasing replacement behavior
   - Timeline for goals

5. **PREVENTION STRATEGIES (Antecedent Interventions)**
   - Environmental modifications
   - Curricular/instructional modifications
   - Setting event strategies
   - At least 4-5 specific strategies based on the function

6. **TEACHING STRATEGIES (Skill Building)**
   - How will the replacement behavior be taught?
   - Social skill instruction
   - Coping/self-regulation strategies
   - Include specific teaching procedures

7. **RESPONSE STRATEGIES**
   - How to respond when replacement behavior is used (reinforce!)
   - How to respond when target behavior occurs (minimize reinforcement)
   - De-escalation procedures
   - What NOT to do

8. **REINFORCEMENT PLAN**
   - What reinforcers will be used (based on student interests)
   - Schedule of reinforcement
   - Token economy or point system if applicable

9. **DATA COLLECTION**
   - What data will be collected
   - Who will collect it
   - How often
   - Method (frequency, duration, ABC, etc.)

10. **IMPLEMENTATION PLAN**
    - Staff training needs
    - Implementation timeline
    - Fidelity checks

11. **REVIEW SCHEDULE**
    - When will the team review progress?
    - Decision rules (when to modify)
    - Criteria for success/fading

${includeCrisisPlan ? `
12. **CRISIS/SAFETY PLAN**
    - Warning signs of escalation
    - De-escalation procedures
    - When to call for support
    - Physical safety considerations
    - Post-crisis procedures
` : ''}

${includeDataSheet ? `
13. **DATA COLLECTION TEMPLATE**
    - Create a simple data collection sheet format
    - Include date, time, antecedent, behavior, consequence, duration columns
    - Include space for notes
` : ''}

**FORMATTING REQUIREMENTS:**
- Use clear section headers
- Write in professional, objective language
- Use "[Student Name]" consistently - never invent names
- Be specific and actionable
- Include measurable criteria where possible
- Reference the function throughout - strategies must match function

Write the complete BIP document now:`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      messages: [{ role: "user", content: prompt }],
    });

    const bip = message.content[0].text;

    return Response.json({ bip });
  } catch (error) {
    console.error("Error generating BIP:", error);
    return Response.json(
      { error: "Failed to generate BIP" },
      { status: 500 }
    );
  }
}