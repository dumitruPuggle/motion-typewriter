import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  interpolate,
  spring,
  Sequence,
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

  const FULL_TEXT = "Hello world";
  const HIGHLIGHT_WORD = "world";
  const CARET_SYMBOL = "▌";

  const PADDING = Math.max(40, Math.round(width * 0.06));

  const FONT_SIZE = Math.max(64, Math.round(width * 0.08));
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
        padding: PADDING,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          opacity: containerOpacity,
          transform: `translateX(${containerTranslateX}px)`,
        }}
      >
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
    </AbsoluteFill>
  );
};