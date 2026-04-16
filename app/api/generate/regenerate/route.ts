import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { idea, format, slideIndex, totalSlides } = await req.json();

    const position =
      slideIndex === 0 ? "opening hook" :
      slideIndex === totalSlides - 1 ? "closing call to action" :
      `middle insight slide ${slideIndex + 1}`;

    const prompt = `You are a social media content creator for Cuemath edtech.
Regenerate ONE slide for a ${format} about: "${idea}"
This is the ${position} slide.

Return ONLY valid JSON:
{"title": "title here", "content": "content under 60 words", "emoji": "🎯"}

No markdown. No backticks. JSON only.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const slide = JSON.parse(clean);
    return NextResponse.json({ slide });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to regenerate." }, { status: 500 });
  }
}