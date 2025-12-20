import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      gradeLevel,
      subject,
      assignmentType,
      originalAssignment,
      learningObjective,
      additionalNotes,
      generateBelow,
      generateOn,
      generateAbove,
    } = await request.json();

    if (!originalAssignment) {
      return Response.json(
        { error: "Please provide the original assignment" },
        { status: 400 }
      );
    }

    const tiersToGenerate = [];
    if (generateBelow) tiersToGenerate.push('below');
    if (generateOn) tiersToGenerate.push('on');
    if (generateAbove) tiersToGenerate.push('above');

    if (tiersToGenerate.length === 0) {
      return Response.json(
        { error: "Please select at least one tier to generate" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert at differentiating instruction. Create ${tiersToGenerate.length} tiered versions of this assignment.

**ASSIGNMENT DETAILS:**
- Grade Level: ${gradeLevel}
- Subject: ${subject}
- Type: ${assignmentType}
${learningObjective ? `- Learning Objective: ${learningObjective}` : ''}
${additionalNotes ? `- Additional Notes: ${additionalNotes}` : ''}

**ORIGINAL ASSIGNMENT:**
${originalAssignment}

**CREATE THESE TIERS:**
${generateBelow ? `
📘 TIER 1 - APPROACHING GRADE LEVEL (Below):
- Reduce reading level by 1-2 grades
- Break complex tasks into smaller steps
- Add sentence starters, word banks, or graphic organizers
- Fewer items but same concepts
- More concrete examples
- Visual supports where helpful
- Same learning objective, more scaffolding
` : ''}
${generateOn ? `
📗 TIER 2 - ON GRADE LEVEL:
- Grade-appropriate vocabulary and complexity
- Standard expectations for the grade
- Clear instructions
- Can be similar to original or refined version
- Same learning objective, standard access
` : ''}
${generateAbove ? `
📕 TIER 3 - ABOVE GRADE LEVEL (Advanced):
- Extend with deeper analysis or application
- Add open-ended questions requiring synthesis
- Include research or real-world connections
- Higher-order thinking (analyze, evaluate, create)
- Same learning objective, extended depth
` : ''}

**IMPORTANT GUIDELINES:**
1. ALL tiers target the SAME learning objective
2. Don't water down content for below-level - scaffold ACCESS to same content
3. Don't just add more work for above-level - increase DEPTH
4. Keep the same general format/structure across tiers
5. Each tier should be a complete, ready-to-use assignment

**RESPOND IN THIS EXACT JSON FORMAT:**
{
  ${generateBelow ? '"below": "FULL APPROACHING-LEVEL ASSIGNMENT TEXT HERE",' : ''}
  ${generateOn ? '"on": "FULL ON-GRADE-LEVEL ASSIGNMENT TEXT HERE",' : ''}
  ${generateAbove ? '"above": "FULL ABOVE-LEVEL ASSIGNMENT TEXT HERE"' : ''}
}

Return ONLY the JSON object, no other text.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: "You are a JSON API that creates differentiated assignments. Return ONLY valid JSON.",
      messages: [{ role: "user", content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    
    // Clean up response
    if (responseText.includes('```json')) {
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    } else if (responseText.includes('```')) {
      responseText = responseText.replace(/```\s*/g, '');
    }
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    try {
      const tiers = JSON.parse(responseText);
      return Response.json({ tiers });
    } catch (parseError) {
      console.error("Failed to parse:", responseText);
      return Response.json({
        tiers: {
          below: generateBelow ? "Error generating this tier. Please try again." : null,
          on: generateOn ? originalAssignment : null,
          above: generateAbove ? "Error generating this tier. Please try again." : null,
        }
      });
    }
  } catch (error) {
    console.error("Error generating differentiated assignments:", error);
    return Response.json(
      { error: "Failed to generate differentiated assignments" },
      { status: 500 }
    );
  }
}