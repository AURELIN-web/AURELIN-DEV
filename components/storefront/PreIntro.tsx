"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "aurelin_intro_seen";

export default function PreIntro() {
  const [isClosing, setIsClosing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [phase, setPhase] = useState(0);

  const closeIntro = useCallback(() => {
    setIsClosing(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
      document.documentElement.classList.add("intro-seen");
    } catch {
      // ignore
    }
    const timer = setTimeout(() => {
      setRemoved(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if already seen
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        setRemoved(true);
        return;
      }
    } catch {
      // ignore
    }

    // Sequence timeline
    const t1 = setTimeout(() => setPhase(1), 50);    // Logo appears
    const t2 = setTimeout(() => setPhase(2), 450);   // Gold rule & Maison subtitle reveal
    const t3 = setTimeout(() => closeIntro(), 1700);  // Smooth glide-up curtain exit

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [closeIntro]);

  // Click anywhere or press any key to skip immediately
  useEffect(() => {
    if (removed) return;

    const handleSkip = () => closeIntro();
    window.addEventListener("click", handleSkip);
    window.addEventListener("keydown", handleSkip);

    return () => {
      window.removeEventListener("click", handleSkip);
      window.removeEventListener("keydown", handleSkip);
    };
  }, [removed, closeIntro]);

  if (removed) return null;

  return (
    <div
      id="aurelin-pre-intro"
      className="fixed inset-0 z-[999999] flex items-center justify-center select-none cursor-pointer overflow-hidden"
      style={{
        backgroundColor: "#101C32",
        transform: isClosing ? "translateY(-100%)" : "translateY(0)",
        opacity: isClosing ? 0.96 : 1,
        transition: "transform 0.65s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.65s ease",
      }}
    >
      {/* Center Refined Logo (Clean, Understated, Pure Solid Navy) */}
      <div
        className="relative z-20 flex flex-col items-center justify-center p-6 text-center"
        style={{
          transform: phase >= 1 ? "scale(1)" : "scale(0.97)",
          opacity: phase >= 1 ? (isClosing ? 0 : 1) : 0,
          transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease",
        }}
      >
        {/* Slightly reduced elegant logo size */}
        <div className="w-52 sm:w-60 md:w-68 max-w-[80vw]">
          <svg
            viewBox="0 0 200 76"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            aria-label="AURELIN & CO."
          >
            {/* Top Ornamental Diamond */}
            <polygon points="100,4 102.5,8 100,12 97.5,8" fill="#B9A77A" />

            {/* AURELIN */}
            <text
              x="100"
              y="37"
              textAnchor="middle"
              fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
              fontSize="21"
              fontWeight="400"
              letterSpacing="9"
              fill="#F8F6F0"
            >
              AURELIN
            </text>

            {/* & CO. */}
            <text
              x="100"
              y="51"
              textAnchor="middle"
              fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
              fontSize="9.5"
              fontWeight="300"
              letterSpacing="5"
              fill="#D8C8AF"
            >
              &amp; CO.
            </text>

            {/* Delicate Gold Rule */}
            <line
              x1="58"
              y1="57"
              x2="142"
              y2="57"
              stroke="#B9A77A"
              strokeWidth="0.65"
              style={{
                transform: phase >= 2 ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "100px 57px",
                transition: "transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            />

            {/* MAISON DE L'HOMME */}
            <text
              x="100"
              y="66"
              textAnchor="middle"
              fontFamily="var(--font-inter), system-ui, sans-serif"
              fontSize="4.8"
              fontWeight="600"
              letterSpacing="3.5"
              fill="#B9A77A"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transform: phase >= 2 ? "translateY(0)" : "translateY(2px)",
                transition: "opacity 0.45s ease, transform 0.45s ease",
              }}
            >
              MAISON DE L&apos;HOMME
            </text>
          </svg>
        </div>

        {/* Quiet Luxury Caption */}
        <p
          className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.28em] text-[#D8C8AF]/50 mt-3.5 font-light"
          style={{
            fontFamily: "var(--font-inter)",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "translateY(0)" : "translateY(2px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          QUIET LUXURY MENSWEAR
        </p>
      </div>

      {/* Skip Hint */}
      <div
        className="absolute bottom-6 z-20 text-[8.5px] uppercase tracking-[0.2em] text-[#D8C8AF]/30 hover:text-[#D8C8AF]/70 transition-colors"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        TAP TO ENTER
      </div>
    </div>
  );
}
