interface AIOrbProps {
  size?: number;
  className?: string;
}

// A small, self-contained "AI orb" — the rotating gradient circle used by
// a lot of AI product UIs (ChatGPT/Gemini voice mode, Siri, etc.) instead
// of a static icon. Built from two stacked elements rather than a hosted
// gif/image: the outer span owns the breathing scale, the inner span owns
// the spin, since a single element can't cleanly run two independent
// `animation`s that both touch `transform`. Pure CSS, so it stays crisp at
// icon size and doesn't depend on any external asset loading.
export default function AIOrb({ size = 20, className = "" }: AIOrbProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 animate-ai-orb-pulse rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="block h-full w-full animate-ai-orb-spin rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #8b5cf6, #3b82f6, #22d3ee, #8b5cf6)",
          boxShadow: "0 0 6px 1px rgba(139, 92, 246, 0.5)",
        }}
      />
    </span>
  );
}
