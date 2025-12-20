import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const {
      emailDraft,
      context,
      relationship,
    } = await request.json();

    if (!emailDraft || emailDraft.trim().length < 20) {
      return Response.json(
        { error: "Please provide an email draft to analyze" },
        { status: 400 }
      );
    }

    const relationshipContext = {
      positive: "The teacher has a good relationship with this family.",
      neutral: "The teacher has had limited interaction with this family.",
      strained: "There have been previous conflicts or tension with this family. Extra care is needed.",
      new: "This is the first communication with this family. First impressions matter.",
    };

    const prompt = `Analyze this teacher-to-parent email for tone issues. Return ONLY a JSON object.

RELATIONSHIP: ${relationshipContext[relationship] || relationshipContext.neutral}
CONTEXT: ${context || 'None'}

EMAIL:
${emailDraft}

Score 1-10 (10=excellent collaborative tone, 1=high conflict risk).
Find accusatory, blaming, threatening, or cold language.
Provide a warmer, more collaborative revision.

Return ONLY this JSON (no other text):
{"score": NUMBER, "issues": [{"type": "TYPE", "phrase": "QUOTE", "suggestion": "FIX"}], "strengths": ["STRENGTH"], "revisedEmail": "FULL REVISED EMAIL"}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: "You are a JSON API. You ONLY return valid JSON objects. Never include any other text, markdown, or explanation.",
      messages: [{ role: "user", content: prompt }],
    });

    let responseText = message.content[0].text.trim();
    
    // Clean up response if it has markdown code blocks
    if (responseText.includes('```json')) {
      responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    } else if (responseText.includes('```')) {
      responseText = responseText.replace(/```\s*/g, '');
    }
    
    // Try to extract JSON if there's other text around it
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(responseText);
      return Response.json({
        analysis: {
          score: parsed.score || 5,
          issues: parsed.issues || [],
          strengths: parsed.strengths || [],
        },
        revisedEmail: parsed.revisedEmail || emailDraft,
      });
    } catch (parseError) {
      console.error("Failed to parse AI response:", responseText);
      // Return a fallback response instead of error
      return Response.json({
        analysis: {
          score: 5,
          issues: [{ type: "Analysis", phrase: "Could not fully analyze", suggestion: "Please try again or simplify your email" }],
          strengths: ["Email received for analysis"],
        },
        revisedEmail: emailDraft,
      });
    }
  } catch (error) {
    console.error("Error in diplomat mode:", error);
    return Response.json(
      { error: "Failed to analyze email" },
      { status: 500 }
    );
  }
}