import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { idea, format } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "No idea provided" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (format === "carousel") {
      prompt = `You are a social media content creator for Cuemath, an edtech company. 
Create a 6-slide Instagram carousel based on this idea: "${idea}"

Return ONLY a valid JSON object in this exact format:
{
  "topic": "short topic title",
  "format": "carousel",
  "slides": [
    {"title": "Hook title here", "content": "Engaging opening content here", "emoji": "🎯"},
    {"title": "Slide 2 title", "content": "Content here", "emoji": "📚"},
    {"title": "Slide 3 title", "content": "Content here", "emoji": "🧠"},
    {"title": "Slide 4 title", "content": "Content here", "emoji": "💡"},
    {"title": "Slide 5 title", "content": "Content here", "emoji": "✨"},
    {"title": "Strong CTA title", "content": "Call to action content", "emoji": "🚀"}
  ]
}

Rules:
- Slide 1: Strong hook that stops scrolling
- Slides 2-5: Build the story with valuable insights
- Slide 6: Clear call to action
- Keep each content under 60 words
- Make it educational and engaging for parents
- Return ONLY the JSON, no markdown, no backticks`;
    } else if (format === "post") {
      prompt = `You are a social media content creator for Cuemath, an edtech company.
Create a single Instagram post based on this idea: "${idea}"

Return ONLY a valid JSON object in this exact format:
{
  "topic": "short topic title",
  "format": "post",
  "slides": [
    {"title": "Catchy title here", "content": "Engaging content for the post here. Make it valuable and shareable for parents.", "emoji": "🎯"}
  ]
}

Rules:
- Make it punchy and valuable
- Target audience is parents
- Keep content under 100 words
- Return ONLY the JSON, no markdown, no backticks`;
    } else {
      prompt = `You are a social media content creator for Cuemath, an edtech company.
Create an Instagram story based on this idea: "${idea}"

Return ONLY a valid JSON object in this exact format:
{
  "topic": "short topic title", 
  "format": "story",
  "slides": [
    {"title": "Bold story title", "content": "Short punchy content for the story. Keep it brief and impactful.", "emoji": "⚡"}
  ]
}

Rules:
- Very short and punchy
- Target audience is parents
- Keep content under 50 words
- Return ONLY the JSON, no markdown, no backticks`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}
