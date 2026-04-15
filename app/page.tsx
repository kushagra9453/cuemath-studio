"use client";
import { useState } from "react";

type Slide = {
  title: string;
  content: string;
  emoji: string;
};

type Creative = {
  slides: Slide[];
  format: string;
  topic: string;
};

export default function Home() {
  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState("carousel");
  const [loading, setLoading] = useState(false);
  const [creative, setCreative] = useState<Creative | null>(null);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const generate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError("");
    setCreative(null);
    setCurrentSlide(0);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, format }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCreative(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  ];

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1 style={{ fontSize: "42px", fontWeight: "800", background: "linear-gradient(135deg, #667eea, #764ba2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Cuemath Social Studio
        </h1>
        <p style={{ color: "#888", marginTop: "12px", fontSize: "18px" }}>
          Turn any idea into a beautiful social media creative
        </p>
      </div>

      {/* Input Section */}
      <div style={{ maxWidth: "700px", margin: "0 auto 48px" }}>
        <div className="card" style={{ padding: "32px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", color: "#ccc" }}>
            Your Idea
          </label>
          <textarea
            rows={4}
            placeholder='e.g. "Carousel for parents about why kids forget what they learn — explain the forgetting curve — end with how spaced repetition fixes it"'
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            style={{ marginBottom: "20px" }}
          />

          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#ccc", fontSize: "14px" }}>
                Format
              </label>
              <select value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="carousel">📱 Instagram Carousel</option>
                <option value="post">🖼️ Single Post (1:1)</option>
                <option value="story">📖 Story (9:16)</option>
              </select>
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                className="btn-primary"
                onClick={generate}
                disabled={loading || !idea.trim()}
                style={{ opacity: loading || !idea.trim() ? 0.6 : 1 }}
              >
                {loading ? "✨ Generating..." : "✨ Generate Creative"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: "700px", margin: "0 auto 24px", background: "#2a1a1a", border: "1px solid #ff4444", borderRadius: "8px", padding: "16px", color: "#ff6666" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Output */}
      {creative && (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700" }}>
              ✅ Your {format === "carousel" ? "Carousel" : format === "story" ? "Story" : "Post"} is Ready!
            </h2>
            <p style={{ color: "#888", marginTop: "8px" }}>Topic: {creative.topic}</p>
          </div>

          {/* Slides */}
          {format === "carousel" && (
            <>
              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
                {creative.slides.map((_: Slide, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: currentSlide === i ? "#667eea" : "#2a2a2a",
                      border: "none", cursor: "pointer", color: "white",
                      fontWeight: "600", fontSize: "12px"
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Current Slide */}
              <div style={{ maxWidth: "400px", margin: "0 auto 24px" }}>
                <div className="slide" style={{ background: gradients[currentSlide % gradients.length] }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    {creative.slides[currentSlide].emoji}
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "12px", lineHeight: "1.3" }}>
                    {creative.slides[currentSlide].title}
                  </h3>
                  <p style={{ fontSize: "15px", opacity: 0.9, lineHeight: "1.6" }}>
                    {creative.slides[currentSlide].content}
                  </p>
                  <div style={{ position: "absolute", bottom: "16px", right: "20px", fontSize: "12px", opacity: 0.6 }}>
                    {currentSlide + 1} / {creative.slides.length}
                  </div>
                </div>
              </div>

              {/* Prev Next */}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
                <button className="btn-secondary" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
                  ← Prev
                </button>
                <button className="btn-secondary" onClick={() => setCurrentSlide(Math.min(creative.slides.length - 1, currentSlide + 1))} disabled={currentSlide === creative.slides.length - 1}>
                  Next →
                </button>
              </div>
            </>
          )}

          {/* Single Post */}
          {format === "post" && (
            <div style={{ maxWidth: "400px", margin: "0 auto" }}>
              <div className="slide" style={{ background: gradients[0] }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {creative.slides[0].emoji}
                </div>
                <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>
                  {creative.slides[0].title}
                </h3>
                <p style={{ fontSize: "15px", opacity: 0.9, lineHeight: "1.6" }}>
                  {creative.slides[0].content}
                </p>
              </div>
            </div>
          )}

          {/* Story */}
          {format === "story" && (
            <div style={{ maxWidth: "300px", margin: "0 auto" }}>
              <div className="slide-story" style={{ background: gradients[1] }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {creative.slides[0].emoji}
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "12px" }}>
                  {creative.slides[0].title}
                </h3>
                <p style={{ fontSize: "14px", opacity: 0.9, lineHeight: "1.6" }}>
                  {creative.slides[0].content}
                </p>
              </div>
            </div>
          )}

          {/* Regenerate */}
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button className="btn-primary" onClick={generate}>
              🔄 Regenerate
            </button>
          </div>
        </div>
      )}
    </main>
  );
}