import Link from "next/link";

interface AtelierCuriosityCardProps {
  title?: string;
  subtitle?: string;
}

export default function AtelierCuriosityCard({
  title = "New Arrivals Will Be Added Soon",
  subtitle = "Our master tailors are putting the final touches on our upcoming seasonal edit. Crafted from 100% pure European linen with bespoke textures and relaxed Mediterranean silhouettes.",
}: AtelierCuriosityCardProps) {
  const whatsappUrl =
    "https://wa.me/919645032855?text=" +
    encodeURIComponent(
      "Hello Aurelin & Co., I would like to receive VIP early access notification when the new arrivals drop."
    );

  return (
    <div className="w-full relative rounded-xs overflow-hidden border border-[#D8C8AF]/60 bg-gradient-to-b from-[#FAF9F5] to-[#F3EFE6] p-6 sm:p-10 md:p-14 shadow-[0_4px_24px_rgba(23,39,68,0.03)]">
      {/* Subtle Luxury Corner Accents */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#B9A77A]/60 pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#B9A77A]/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#B9A77A]/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#B9A77A]/60 pointer-events-none" />

      {/* Main Content Grid */}
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Star / Insignia */}
        <div className="w-8 h-8 rounded-full bg-[#B9A77A]/10 border border-[#B9A77A]/30 flex items-center justify-center mb-4 text-[#B9A77A]">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>

        {/* Live Atelier Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#B9A77A]/40 bg-[#B9A77A]/10 text-[#B9A77A] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B9A77A] animate-pulse" />
          <span
            className="font-medium tracking-[0.22em] uppercase"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.625rem",
            }}
          >
            ATELIER IN CRAFT • PRIVATE PREVIEW
          </span>
        </div>

        {/* Heading */}
        <h3
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(1.75rem, 3.8vw, 2.75rem)",
            fontWeight: 400,
            letterSpacing: "0.03em",
            color: "#172744",
            lineHeight: 1.15,
          }}
          className="mb-4"
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="max-w-xl text-charcoal/70 font-light leading-relaxed mb-8"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "clamp(0.8125rem, 1.5vw, 0.9375rem)",
          }}
        >
          {subtitle}
        </p>

        {/* 3 Luxury Craftsmanship Pillars (Curiosity Builders) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mb-8 text-left">
          <div className="p-4 rounded-xs border border-[#D8C8AF]/40 bg-white/70 backdrop-blur-xs">
            <p className="text-[0.625rem] tracking-[0.18em] uppercase text-[#B9A77A] font-semibold mb-1">
              01 • PURE LINEN
            </p>
            <p className="text-xs text-charcoal/80 font-normal leading-snug">
              Naturally breathable European flax with pre-washed vintage drape.
            </p>
          </div>

          <div className="p-4 rounded-xs border border-[#D8C8AF]/40 bg-white/70 backdrop-blur-xs">
            <p className="text-[0.625rem] tracking-[0.18em] uppercase text-[#B9A77A] font-semibold mb-1">
              02 • TAILORED CUTS
            </p>
            <p className="text-xs text-charcoal/80 font-normal leading-snug">
              Bespoke resort collars, textured knits & effortless silhouettes.
            </p>
          </div>

          <div className="p-4 rounded-xs border border-[#D8C8AF]/40 bg-white/70 backdrop-blur-xs">
            <p className="text-[0.625rem] tracking-[0.18em] uppercase text-[#B9A77A] font-semibold mb-1">
              03 • LIMITED RUNS
            </p>
            <p className="text-xs text-charcoal/80 font-normal leading-snug">
              Produced in small atelier quantities to maintain exclusivity.
            </p>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs font-medium text-[0.6875rem] tracking-[0.18em] uppercase transition-all duration-300 shadow-xs hover:shadow-md"
            style={{
              backgroundColor: "#172744",
              color: "#F8F6F0",
              fontFamily: "var(--font-inter)",
            }}
          >
            {/* WhatsApp Icon */}
            <svg className="w-4 h-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.112.551 4.095 1.516 5.823l-1.61 5.882 6.037-1.583c1.668.908 3.58 1.424 5.617 1.424 6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84c-1.897 0-3.664-.527-5.184-1.444l-.372-.224-3.568.936.952-3.48-.246-.391c-1.028-1.637-1.582-3.535-1.582-5.497 0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/>
            </svg>
            NOTIFY ME ON WHATSAPP
          </a>

          <Link
            href="/care-guide"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-xs border border-[#172744]/20 hover:border-[#172744] text-charcoal hover:text-navy transition-all duration-300 font-medium text-[0.6875rem] tracking-[0.18em] uppercase"
            style={{
              fontFamily: "var(--font-inter)",
            }}
          >
            EXPLORE OUR FABRICS →
          </Link>
        </div>
      </div>
    </div>
  );
}
