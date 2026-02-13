import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

export const MyAnimation = () => {
  /*
   * A centered "Hello world" types in from left to right with a smoothly blinking caret that follows the text.
   * After the full phrase is revealed, the word "world" transitions into a final state with a yellow highlight behind it.
   * The background stays white and the text remains black for maximum contrast and readability.
   */
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const COLOR_BG = "#FFFFFF";
  const COLOR_TEXT = "#111111";
  const COLOR_HIGHLIGHT = "#FFE44D";

  // Design (from reference image)
  const COLOR_WARM_1 = "#FFF6E8";
  const COLOR_WARM_2 = "#FFFFFF";
  const DOT_COLOR = "rgba(17, 17, 17, 0.08)";
  const HEADING_TEXT = "How can i help?";
  const CARD_BG = "rgba(255, 255, 255, 0.92)";
  const CARD_BORDER = "rgba(17, 17, 17, 0.06)";

  const FULL_TEXT = "Hello world";
  const HIGHLIGHT_WORD = "world";
  const CARET_SYMBOL = "▌";

  const PADDING = Math.max(48, Math.round(width * 0.06));

  // Text inside the card is smaller in the reference
  const FONT_SIZE = Math.max(44, Math.round(width * 0.045));
  const FONT_WEIGHT = 800;
  const LINE_HEIGHT = 1.05;
  const LETTER_SPACING = -0.8;

  const CHAR_FRAMES = 3;
  const CURSOR_BLINK_FRAMES = 16;

  const CONTAINER_IN_DURATION = 18;

  const HIGHLIGHT_DELAY = 10;
  const HIGHLIGHT_SPRING_DURATION = 22;

  const CROSSFADE_DURATION = 10;

  const containerIn = spring({
    fps,
    frame,
    config: { damping: 18, stiffness: 160, mass: 0.9 },
    durationInFrames: CONTAINER_IN_DURATION,
  });

  const containerOpacity = interpolate(containerIn, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const containerTranslateX = interpolate(containerIn, [0, 1], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardTranslateY = interpolate(containerIn, [0, 1], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardScale = interpolate(containerIn, [0, 1], [0.985, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const typedChars = Math.min(FULL_TEXT.length, Math.floor(frame / CHAR_FRAMES));
  const typedText = FULL_TEXT.slice(0, typedChars);
  const typingDone = typedChars >= FULL_TEXT.length;

  const caretOpacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const typeEndFrame = FULL_TEXT.length * CHAR_FRAMES;
  const highlightStart = typeEndFrame + HIGHLIGHT_DELAY;

  const typedLayerOpacity = interpolate(
    frame,
    [highlightStart - CROSSFADE_DURATION, highlightStart],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const finalLayerOpacity = interpolate(
    frame,
    [highlightStart, highlightStart + CROSSFADE_DURATION],
    [0, 1],
    { extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const highlightWordIndex = FULL_TEXT.indexOf(HIGHLIGHT_WORD);
  const hasHighlight = highlightWordIndex >= 0;

  const preText = hasHighlight ? FULL_TEXT.slice(0, highlightWordIndex) : "";
  const postText = hasHighlight
    ? FULL_TEXT.slice(highlightWordIndex + HIGHLIGHT_WORD.length)
    : "";

  const highlightIn = spring({
    fps,
    frame: frame - highlightStart,
    config: { damping: 20, stiffness: 220, mass: 0.8 },
    durationInFrames: HIGHLIGHT_SPRING_DURATION,
  });

  const highlightScaleX = interpolate(highlightIn, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const highlightOpacity = interpolate(highlightIn, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const caretTranslateX = interpolate(
    spring({
      fps,
      frame: frame - typeEndFrame + 6,
      config: { damping: 14, stiffness: 180, mass: 0.9 },
      durationInFrames: 14,
    }),
    [0, 1],
    [0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLOR_BG,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Warm gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1200px 600px at 50% 35%, ${COLOR_WARM_2} 0%, ${COLOR_WARM_1} 55%, ${COLOR_WARM_1} 100%)`,
        }}
      />

      {/* Dotted grid overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${DOT_COLOR} 1px, transparent 1px)`,
          backgroundSize: "34px 34px",
          backgroundPosition: "center",
          opacity: 0.55,
        }}
      />

      <div
        style={{
          flex: 1,
          padding: PADDING,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: Math.max(24, Math.round(width * 0.02)),
        }}
      >
        {/* Heading */}
        <div
          style={{
            color: COLOR_TEXT,
            fontSize: Math.max(44, Math.round(width * 0.05)),
            fontWeight: 700,
            letterSpacing: -1.2,
            opacity: containerOpacity,
            transform: `translateY(${interpolate(containerIn, [0, 1], [6, 0])}px)`,
          }}
        >
          {HEADING_TEXT}
        </div>

        {/* Input card */}
        <div
          style={{
            width: Math.min(1200, Math.round(width * 0.84)),
            borderRadius: 28,
            backgroundColor: CARD_BG,
            border: `1px solid ${CARD_BORDER}`,
            boxShadow:
              "0 18px 50px rgba(17, 17, 17, 0.10), 0 2px 8px rgba(17, 17, 17, 0.05)",
            padding: "34px 44px",
            position: "relative",
            opacity: containerOpacity,
            transform: `translateX(${containerTranslateX}px) translateY(${cardTranslateY}px) scale(${cardScale})`,
          }}
        >
          {/* Typewriter + highlight container (kept from original) */}
          <div style={{ position: "relative" }}>
            {/* Typewriter layer */}
            <div
              style={{
                color: COLOR_TEXT,
                fontSize: FONT_SIZE,
                fontWeight: FONT_WEIGHT,
                lineHeight: LINE_HEIGHT,
                letterSpacing: LETTER_SPACING,
                whiteSpace: "pre",
                opacity: typedLayerOpacity,
              }}
            >
              <span>{typedText}</span>
              {!typingDone ? (
                <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
              ) : (
                <span
                  style={{
                    opacity: caretOpacity,
                    display: "inline-block",
                    transform: `translateX(${caretTranslateX}px)`,
                  }}
                >
                  {CARET_SYMBOL}
                </span>
              )}
            </div>

            {/* Final highlighted layer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                color: COLOR_TEXT,
                fontSize: FONT_SIZE,
                fontWeight: FONT_WEIGHT,
                lineHeight: LINE_HEIGHT,
                letterSpacing: LETTER_SPACING,
                whiteSpace: "pre",
                opacity: finalLayerOpacity,
              }}
            >
              {hasHighlight ? (
                <>
                  <span>{preText}</span>
                  <span style={{ position: "relative", display: "inline-block" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "-0.12em",
                        right: "-0.12em",
                        top: "50%",
                        height: "1.05em",
                        transform: `translateY(-50%) scaleX(${highlightScaleX})`,
                        transformOrigin: "left center",
                        backgroundColor: COLOR_HIGHLIGHT,
                        borderRadius: "0.22em",
                        opacity: highlightOpacity,
                        zIndex: 0,
                      }}
                    />
                    <span style={{ position: "relative", zIndex: 1 }}>
                      {HIGHLIGHT_WORD}
                    </span>
                  </span>
                  <span>{postText}</span>
                  <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
                </>
              ) : (
                <>
                  <span>{FULL_TEXT}</span>
                  <span style={{ opacity: caretOpacity }}>{CARET_SYMBOL}</span>
                </>
              )}
            </div>
          </div>

          {/* Right-side icons (simple approximations) */}
          <div
            style={{
              position: "absolute",
              right: 26,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              opacity: 0.95,
            }}
          >
            {[
              { label: "📎", bg: "rgba(255,255,255,0.9)" },
              { label: "🎤", bg: "rgba(255,255,255,0.9)" },
            ].map((b, i) => (
              <div
                key={i}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: b.bg,
                  border: "1px solid rgba(17,17,17,0.08)",
                  boxShadow: "0 6px 18px rgba(17,17,17,0.06)",
                  fontSize: 18,
                }}
              >
                {b.label}
              </div>
            ))}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#2F6BFF",
                color: "white",
                boxShadow: "0 14px 28px rgba(47,107,255,0.30)",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              ↑
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};