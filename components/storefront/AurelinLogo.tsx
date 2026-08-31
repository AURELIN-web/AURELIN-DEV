import { SVGProps } from "react";

export default function AurelinLogo({
  className = "h-12",
  ...props
}: SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 72"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AURELIN & CO."
      role="img"
      {...props}
    >
      {/* Decorative top element */}
      <g fill="#172744">
        {/* Small ornamental diamond */}
        <polygon points="100,2 103,8 100,14 97,8" opacity="0.7" />
        <line x1="100" y1="14" x2="100" y2="20" stroke="#172744" strokeWidth="0.75" />

        {/* AURELIN */}
        <text
          x="100"
          y="38"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="22"
          fontWeight="500"
          letterSpacing="10"
          fill="#172744"
        >
          AURELIN
        </text>

        {/* & CO. */}
        <text
          x="100"
          y="52"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fontSize="11"
          fontWeight="400"
          letterSpacing="5"
          fill="#172744"
        >
          &amp; CO.
        </text>

        {/* Thin rule */}
        <line x1="52" y1="58" x2="148" y2="58" stroke="#B9A77A" strokeWidth="0.5" />

        {/* MAISON DE L'HOMME */}
        <text
          x="100"
          y="68"
          textAnchor="middle"
          fontFamily="'Inter', system-ui, sans-serif"
          fontSize="6"
          fontWeight="400"
          letterSpacing="4"
          fill="#172744"
          opacity="0.7"
        >
          MAISON DE L&apos;HOMME
        </text>
      </g>
    </svg>
  );
}
