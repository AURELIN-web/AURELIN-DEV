"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play, VolumeX, Volume2, Maximize2 } from "lucide-react";
import type { HeroSettings } from "@/types/database";

interface Props {
  settings: HeroSettings | null;
}

export default function HeroVideo({ settings }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hero = settings ?? {
    eyebrow: "SPRING / SUMMER",
    heading: "THE ART OF\nDRESSING WELL",
    subheading: "Quiet confidence.\nTimeless character.",
    primary_cta_text: "DISCOVER THE COLLECTION",
    primary_cta_url: "/collections",
    secondary_cta_text: "SHOP NEW ARRIVALS",
    secondary_cta_url: "/new-arrivals",
    overlay_strength: 0.35,
    desktop_video_url: null,
    mobile_video_url: null,
    poster_image_url: null,
    is_active: true,
    autoplay: true,
    loop: true,
    is_muted: true,
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Ensure hero video stream is never degraded by aggressive CDN compression
  const cleanVideoUrl = (url?: string | null): string | null => {
    if (!url) return null;
    return url
      .replace(/\/f_auto,q_auto\//g, "/")
      .replace(/\/q_auto:[^/]+\//g, "/")
      .replace(/\/q_auto\//g, "/")
      .replace(/\/vc_auto\//g, "/");
  };

  const rawSrc = isMobile
    ? (hero.mobile_video_url || hero.desktop_video_url)
    : hero.desktop_video_url;

  const videoSrc = cleanVideoUrl(rawSrc);

  // Auto-play video immediately when source is available
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const hasVideo = !!videoSrc;

  return (
    <section
      className="relative w-full overflow-hidden h-[calc(100dvh-61px)] md:h-[calc(100dvh-73px)]"
      aria-label="Hero section"
    >
      {/* Background: Video or Poster Image */}
      {hasVideo ? (
        <video
          ref={videoRef}
          key={videoSrc}
          className="absolute inset-0 w-full h-full object-cover object-top"
          autoPlay={hero.autoplay}
          muted={isMuted}
          loop={hero.loop}
          playsInline
          poster={hero.poster_image_url || undefined}
          preload="metadata"
          src={videoSrc}
          onCanPlay={() => setVideoLoaded(true)}
          onError={() => setVideoLoaded(false)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : hero.poster_image_url ? (
        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url(${hero.poster_image_url})` }}
        />
      ) : (
        /* Brand dark luxury backdrop */
        <div className="absolute inset-0 bg-gradient-to-b from-[#101C32] to-[#172744]" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full container-luxury pb-12 md:pb-16">
        <div className="max-w-xl">
          {/* Eyebrow */}
          <p
            className="mb-4 text-beige"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.6875rem",
              letterSpacing: "0.2em",
              fontWeight: 400,
              textTransform: "uppercase",
            }}
          >
            {hero.eyebrow}
          </p>

          {/* Heading */}
          <h1
            className="text-ivory mb-5 leading-none"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2.75rem, 6vw, 4.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              whiteSpace: "pre-line",
            }}
          >
            {hero.heading}
          </h1>

          {/* Subheading */}
          <p
            className="text-ivory/80 mb-9"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
              fontWeight: 300,
              letterSpacing: "0.01em",
              whiteSpace: "pre-line",
              lineHeight: 1.7,
            }}
          >
            {hero.subheading}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={hero.primary_cta_url}
              className="inline-block px-8 py-3.5 border border-ivory text-ivory hover:bg-ivory hover:text-navy transition-colors duration-300"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.6875rem",
                letterSpacing: "0.16em",
                fontWeight: 500,
                textTransform: "uppercase",
              }}
            >
              {hero.primary_cta_text}
            </Link>

            {hero.secondary_cta_text && (
              <Link
                href={hero.secondary_cta_url}
                className="inline-block px-6 py-3.5 text-ivory/80 hover:text-ivory transition-colors duration-200 underline-hover"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.16em",
                  fontWeight: 400,
                  textTransform: "uppercase",
                }}
              >
                {hero.secondary_cta_text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Video Controls */}
      {hasVideo && (
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3">
          {/* Progress line */}
          <div className="hidden md:flex items-center gap-2 opacity-70">
            <div className="w-20 h-px bg-ivory/40" />
            <div className="w-8 h-px bg-ivory" />
            <div className="w-12 h-px bg-ivory/40" />
          </div>

          <button
            onClick={togglePlay}
            className="text-ivory/70 hover:text-ivory transition-colors"
            aria-label={isPaused ? "Play video" : "Pause video"}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>

          <button
            onClick={toggleMute}
            className="text-ivory/70 hover:text-ivory transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      )}
    </section>
  );
}
