import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { idea, format } = await req.json();
    if (!idea) return NextResponse.json({ error: "No idea provided" }, { status: 400 });

    const slideCount = format === "carousel" ? 6 : 1;
    const slidesTemplate = Array.from({ length: slideCount }, (_, i) =>
      `{"title": "title ${i + 1}", "content": "content here under 60 words", "emoji": "🎯"}`
    ).join(",\n    ");

    const prompt = `You are a social media content creator for Cuemath, an edtech company.
Create a ${format === "carousel" ? "6-slide Instagram carousel" : format === "story" ? "Instagram story" : "single Instagram post"} based on this idea: "${idea}"

Return ONLY valid JSON:
{
  "topic": "short topic title",
  "format": "${format}",
  "caption": "Engaging 2-3 sentence Instagram caption for parents",
  "hashtags": "#Cuemath #MathLearning #KidsEducation #LearningTips #EdTech #MathForKids #ParentingTips",
  "slides": [
    ${slidesTemplate}
  ]
}

${format === "carousel" ? "Slide 1: strong hook. Slides 2-5: insights. Slide 6: call to action." : "Keep it punchy under 100 words."}
Target: parents of school kids. Tone: educational, warm, trustworthy.
Return ONLY the JSON. No markdown. No backticks. No explanation.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate. Please try again." }, { status: 500 });
  }
}