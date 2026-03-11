import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Bypass SSL certificate inspection (corporate VPN/proxy - dev only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const anthropic = new Anthropic();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      gradeLevel,
      pageType,
      theme,
      customTopic,
      complexity,
      includeTitle,
      includeInstructions,
    } = body;

    if (!pageType || !gradeLevel) {
      return Response.json(
        { error: "Page type and grade level are required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const topic = customTopic || theme;
    console.log("Generating coloring page for:", { gradeLevel, pageType, topic, complexity });

    // Step 1: Claude crafts the optimal DALL-E prompt
    const promptCraftMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are an expert at writing DALL-E 3 image generation prompts for printable children's coloring pages.

Write a single DALL-E 3 prompt for a printable coloring page:

- Grade Level: ${gradeLevel}
- Topic: ${topic}
- Complexity: ${complexity === "simple" ? "very thick outlines, large simple shapes, minimal detail" : complexity === "medium" ? "clear outlines, moderate detail" : "detailed outlines, intricate patterns"}
${includeTitle ? `- Include title text at the top: "${topic}"` : "- No title"}
${includeInstructions ? '- Include "Color Me!" at the bottom' : ""}

CRITICAL: Pure black and white line art only. No shading, no gray fills, no color. White background, black outlines only. Coloring book style. Kid-friendly and cheerful.

Return ONLY the prompt text. Nothing else.`,
        },
      ],
    });

    const dallePrompt = promptCraftMessage.content[0].text.trim();
    console.log("DALL-E prompt:", dallePrompt.substring(0, 120) + "...");

    // Step 2: Generate with DALL-E 3
    console.log("Calling DALL-E 3...");
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural",
    });

    const imageUrl = imageResponse.data[0].url;
    const pageTitle = customTopic ? `${pageType}: ${customTopic}` : `${pageType}: ${theme}`;

    console.log("Success! Image URL:", imageUrl.substring(0, 60) + "...");
    return Response.json({ imageUrl, pageTitle });

  } catch (error) {
    console.error("=== COLORING PAGE ERROR ===");
    console.error("Message:", error?.message);
    console.error("Status:", error?.status);
    console.error("Code:", error?.code);
    console.error("Type:", error?.type);
    console.error("Full:", JSON.stringify(error, null, 2));

    if (error?.status === 401) return Response.json({ error: "Invalid OpenAI API key." }, { status: 401 });
    if (error?.status === 429) return Response.json({ error: "OpenAI quota exceeded. Check billing at platform.openai.com." }, { status: 429 });
    if (error?.status === 400) return Response.json({ error: "Image request rejected. Try a different topic." }, { status: 400 });

    return Response.json(
      { error: error?.message || "Failed to generate coloring page." },
      { status: 500 }
    );
  }
}
