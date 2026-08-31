import Link from "next/link";
import AurelinLogo from "@/components/storefront/AurelinLogo";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-20 text-center"
      style={{ backgroundColor: "#F8F6F0" }}
    >
      <AurelinLogo className="h-10 mb-8" />
      <p
        className="text-[#B9A77A] text-xs uppercase tracking-[0.2em] font-semibold mb-3"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        404 — Page Not Found
      </p>
      <h1
        className="text-3xl sm:text-4xl text-[#172744] font-normal mb-4"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        The Garment or Page You Seek Does Not Exist
      </h1>
      <p
        className="text-xs text-charcoal/60 max-w-md mx-auto mb-8 leading-relaxed"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        The piece you requested may have been archived or moved to another seasonal collection.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="px-8 py-3.5 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-widest rounded-xs hover:bg-[#101C32] transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/shop"
          className="px-8 py-3.5 border border-[#172744] text-[#172744] text-xs font-semibold uppercase tracking-widest rounded-xs hover:bg-[#172744] hover:text-[#F8F6F0] transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
