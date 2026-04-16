"use client";
import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState("carousel");
  const [loading, setLoading] = useState(false);
  const [creative, setCreative] = useState(null as any);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editedSlides, setEditedSlides] = useState([] as any[]);
  const [editingIndex, setEditingIndex] = useState(null as number | null);
  const [copied, setCopied] = useState(false);
  const [colorScheme, setColorScheme] = useState(0);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [showBranding, setShowBranding] = useState(true);

  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  ];

  const colorNames = ["Purple", "Pink", "Blue", "Green", "Sunset", "Lavender"];

  // ─── Pollinations: generate image URL for a slide ───────────────────────────
  const getPollinationsUrl = (prompt: string, seed: number) => {
    const encoded = encodeURIComponent(
      `${prompt}, educational, kids math, vibrant, cartoon style, clean background`
    );
    return `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`;
  };

  // ─── Generate images for all slides ─────────────────────────────────────────
  const generateImages = async (slides: any[], topic: string) => {
    setImagesLoading(true);
    const urls = slides.map((slide: any, i: number) =>
      getPollinationsUrl(`${topic} - ${slide.title}`, i * 42 + 7)
    );
    setSlideImages(urls);
    setImagesLoading(false);
  };

  const generate = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError("");
    setCreative(null);
    setCurrentSlide(0);
    setEditingIndex(null);
    setSlideImages([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, format }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCreative(data);
      setEditedSlides(data.slides);
      await generateImages(data.slides, data.topic);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const updated = [...editedSlides];
    updated[index] = { ...updated[index], [field]: value };
    setEditedSlides(updated);
  };

  const copyCaption = () => {
    if (!creative) return;
    navigator.clipboard.writeText(`${creative.caption}\n\n${creative.hashtags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateSlide = async (index: number) => {
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          format,
          slideIndex: index,
          totalSlides: editedSlides.length,
        }),
      });
      const data = await res.json();
      if (data.slide) {
        const updated = [...editedSlides];
        updated[index] = data.slide;
        setEditedSlides(updated);
        // Regenerate image for this slide
        const newImages = [...slideImages];
        newImages[index] = getPollinationsUrl(
          `${creative.topic} - ${data.slide.title}`,
          index * 42 + Math.floor(Math.random() * 100)
        );
        setSlideImages(newImages);
      }
    } catch {
      alert("Failed to regenerate. Try again.");
    }
  };

  const currentGradient = gradients[colorScheme];

  // ─── Slide Card with image + branding ───────────────────────────────────────
  const SlideCard = ({
    slide,
    index,
    style = {},
  }: {
    slide: any;
    index: number;
    style?: React.CSSProperties;
  }) => (
    <div
      style={{
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        background: currentGradient,
        width: "100%",
        aspectRatio: format === "story" ? "9/16" : "1/1",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        color: "white",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {/* AI Background Image */}
      {slideImages[index] && (
        <img
          src={slideImages[index]}
          alt="AI generated"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.25,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}

      {/* Gradient overlay so text is readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)",
        }}
      />

      {/* @cuemath Branding — top left */}
      {showBranding && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: "700",
            color: "white",
            letterSpacing: "0.5px",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <span style={{ fontSize: "16px" }}>📐</span>
          @cuemath
        </div>
      )}

      {/* Slide number — top right */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "16px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          borderRadius: "12px",
          padding: "4px 10px",
          fontSize: "11px",
          fontWeight: "600",
          color: "white",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {index + 1} / {editedSlides.length}
      </div>

      {/* Content */}
      <div style={{ position: "relative", padding: "20px" }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>{slide.emoji}</div>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "800",
            marginBottom: "8px",
            lineHeight: "1.3",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {slide.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            opacity: 0.9,
            lineHeight: "1.6",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {slide.content}
        </p>

        {/* Bottom branding bar */}
        {showBranding && (
          <div
            style={{
              marginTop: "14px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "10px",
              opacity: 0.8,
            }}
          >
            <span>📐 Cuemath — Learn Math Right</span>
            <span>cuemath.com</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "32px" }}>📐</span>
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Cuemath Social Studio
          </h1>
        </div>
        <p style={{ color: "#888", marginTop: "4px", fontSize: "18px" }}>
          Turn any idea into a beautiful branded social media creative
        </p>
        <p style={{ color: "#555", marginTop: "6px", fontSize: "13px" }}>
          Powered by Groq AI + Pollinations Image AI
        </p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: "700px", margin: "0 auto 48px" }}>
        <div className="card" style={{ padding: "32px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "600",
              color: "#ccc",
            }}
          >
            Your Idea
          </label>
          <textarea
            rows={4}
            placeholder='e.g. "Carousel for parents about why kids forget what they learn"'
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#ccc",
                  fontSize: "14px",
                }}
              >
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="carousel">📱 Instagram Carousel</option>
                <option value="post">🖼️ Single Post (1:1)</option>
                <option value="story">📖 Story (9:16)</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#ccc",
                  fontSize: "14px",
                }}
              >
                Color Theme
              </label>
              <select
                value={colorScheme}
                onChange={(e) => setColorScheme(Number(e.target.value))}
              >
                {colorNames.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#ccc",
                  fontSize: "14px",
                }}
              >
                Branding
              </label>
              <select
                value={showBranding ? "on" : "off"}
                onChange={(e) => setShowBranding(e.target.value === "on")}
              >
                <option value="on">✅ @cuemath ON</option>
                <option value="off">❌ Branding OFF</option>
              </select>
            </div>
            <button
              className="btn-primary"
              onClick={generate}
              disabled={loading || !idea.trim()}
              style={{
                opacity: loading || !idea.trim() ? 0.6 : 1,
                marginBottom: "2px",
              }}
            >
              {loading ? "✨ Generating..." : "✨ Generate Creative"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto 24px",
            background: "#2a1a1a",
            border: "1px solid #ff4444",
            borderRadius: "8px",
            padding: "16px",
            color: "#ff6666",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Output */}
      {creative && editedSlides.length > 0 && (
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700" }}>
              ✅ Your{" "}
              {format === "carousel"
                ? "Carousel"
                : format === "story"
                ? "Story"
                : "Post"}{" "}
              is Ready!
            </h2>
            <p style={{ color: "#888", marginTop: "8px" }}>
              Topic: {creative.topic}
            </p>
            {imagesLoading && (
              <p style={{ color: "#667eea", marginTop: "6px", fontSize: "13px" }}>
                🖼️ AI images loading via Pollinations...
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "32px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Left - Preview */}
            <div style={{ flex: "0 0 320px" }}>
              {format === "carousel" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    {editedSlides.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentSlide(i);
                          setEditingIndex(null);
                        }}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background:
                            currentSlide === i ? "#667eea" : "#2a2a2a",
                          border: "none",
                          cursor: "pointer",
                          color: "white",
                          fontWeight: "600",
                          fontSize: "11px",
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <SlideCard slide={editedSlides[currentSlide]} index={currentSlide} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "12px",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setCurrentSlide(Math.max(0, currentSlide - 1))
                      }
                      disabled={currentSlide === 0}
                    >
                      ← Prev
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setCurrentSlide(
                          Math.min(editedSlides.length - 1, currentSlide + 1)
                        )
                      }
                      disabled={currentSlide === editedSlides.length - 1}
                    >
                      Next →
                    </button>
                  </div>
                </>
              )}

              {(format === "post" || format === "story") && (
                <SlideCard slide={editedSlides[0]} index={0} />
              )}
            </div>

            {/* Right - Edit Panel */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3
                style={{ fontWeight: "700", marginBottom: "16px", color: "#ccc" }}
              >
                ✏️ Edit Slides
              </h3>
              {editedSlides.map((slide: any, i: number) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "16px",
                    marginBottom: "12px",
                    border:
                      editingIndex === i
                        ? "1px solid #667eea"
                        : "1px solid #2a2a2a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#888" }}>
                      Slide {i + 1}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                        onClick={() => {
                          setEditingIndex(editingIndex === i ? null : i);
                          setCurrentSlide(i);
                        }}
                      >
                        {editingIndex === i ? "✓ Done" : "✏️ Edit"}
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                        onClick={() => regenerateSlide(i)}
                      >
                        🔄 Redo
                      </button>
                    </div>
                  </div>
                  {editingIndex === i ? (
                    <div>
                      <input
                        value={slide.emoji}
                        onChange={(e) => updateSlide(i, "emoji", e.target.value)}
                        style={{
                          background: "#111",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          color: "white",
                          padding: "6px 10px",
                          width: "60px",
                          marginBottom: "8px",
                          fontSize: "20px",
                        }}
                      />
                      <input
                        value={slide.title}
                        onChange={(e) =>
                          updateSlide(i, "title", e.target.value)
                        }
                        style={{
                          background: "#111",
                          border: "1px solid #333",
                          borderRadius: "6px",
                          color: "white",
                          padding: "8px 12px",
                          width: "100%",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      />
                      <textarea
                        rows={3}
                        value={slide.content}
                        onChange={(e) =>
                          updateSlide(i, "content", e.target.value)
                        }
                        style={{ fontSize: "13px" }}
                      />
                    </div>
                  ) : (
                    <div>
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#fff",
                          marginBottom: "4px",
                        }}
                      >
                        {slide.emoji} {slide.title}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#888",
                          lineHeight: "1.5",
                        }}
                      >
                        {slide.content.substring(0, 80)}...
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Caption & Hashtags */}
              <div className="card" style={{ padding: "16px", marginTop: "8px" }}>
                <h4
                  style={{
                    fontWeight: "600",
                    marginBottom: "12px",
                    color: "#ccc",
                  }}
                >
                  📝 Caption & Hashtags
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#aaa",
                    lineHeight: "1.6",
                    marginBottom: "8px",
                  }}
                >
                  {creative.caption}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#667eea",
                    lineHeight: "1.8",
                  }}
                >
                  {creative.hashtags}
                </p>
                <button
                  className="btn-secondary"
                  style={{ marginTop: "12px", width: "100%", fontSize: "13px" }}
                  onClick={copyCaption}
                >
                  {copied ? "✅ Copied!" : "📋 Copy Caption + Hashtags"}
                </button>
              </div>

              {/* Hashtag Suggestions */}
              <div className="card" style={{ padding: "16px", marginTop: "12px" }}>
                <h4
                  style={{
                    fontWeight: "600",
                    marginBottom: "10px",
                    color: "#ccc",
                  }}
                >
                  #️⃣ Suggested Hashtags by Category
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {[
                    "#Cuemath",
                    "#MathForKids",
                    "#EdTech",
                    "#LearningTips",
                    "#KidsEducation",
                    "#ParentingTips",
                    "#MathLearning",
                    "#OnlineLearning",
                    "#SmartKids",
                    "#MathIsFun",
                    "#SchoolLife",
                    "#LearnWithCuemath",
                    "#GrowthMindset",
                    "#StudentLife",
                    "#IndiaEdTech",
                  ].map((tag) => (
                    <span
                      key={tag}
                      onClick={() => {
                        navigator.clipboard.writeText(tag);
                      }}
                      style={{
                        background: "#1a1a2e",
                        border: "1px solid #667eea44",
                        color: "#667eea",
                        borderRadius: "20px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      title="Click to copy"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: "#555", marginTop: "8px" }}>
                  💡 Click any hashtag to copy it
                </p>
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", marginTop: "16px" }}
                onClick={generate}
              >
                🔄 Regenerate All
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}