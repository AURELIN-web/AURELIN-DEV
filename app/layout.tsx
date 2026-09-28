import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_URL } from "@/config/site";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#172744" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE} | Luxury Linen Menswear`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,

  keywords: [
    // Brand
    "Aurelin & Co", "Aurelin", "Aurelinco", "AURELIN CO", "Maison de l'Homme",
    // Product
    "pure linen shirts men", "luxury linen shirts India", "premium linen menswear",
    "Cuban collar linen shirt", "linen resort shirt", "linen overshirt",
    "linen trousers men", "European linen shirt", "breathable linen clothing",
    // Style
    "quiet luxury menswear", "old money aesthetic men", "capsule wardrobe men India",
    "minimalist luxury menswear", "bespoke tailored linen", "resort wear men India",
    "atelier menswear India",
    // Category
    "designer menswear India", "luxury clothing brand India", "handcrafted menswear",
    "premium shirts India", "signature linen shirts", "summer linen collection men",
    // Long-tail / international
    "luxury linen brand South Asia", "high end menswear online India",
    "best linen shirts for men India",
  ],

  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Luxury Menswear",
  classification: "Shopping > Clothing > Men > Luxury",

  verification: {
    google: "J0CgIfSZq4--eVQ0Sv_XhM3pa9HuGibaPLirOCjzPiw",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US", "en_GB", "en_AE"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE} | Luxury Linen Menswear`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Maison de l'Homme | Luxury Linen Menswear`,
        type: "image/png",
        secureUrl: `${SITE_URL}/og-image.png`,
      },
    ],
    countryName: "India",
  },

  twitter: {
    card: "summary_large_image",
    site: "@aurelinco",
    creator: "@aurelinco",
    title: `${SITE_NAME} — Luxury Linen Menswear`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        alt: `${SITE_NAME} — Luxury Linen Menswear`,
        width: 1200,
        height: 630,
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-IN": SITE_URL,
      "en-US": SITE_URL,
      "x-default": SITE_URL,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["ClothingStore", "Brand", "Organization"],
      "@id": `${SITE_URL}/#organization`,
      name: "AURELIN & CO.",
      legalName: "AURELIN & CO.",
      alternateName: ["Aurelin Co", "Aurelinco", "AURELIN"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.svg`,
        contentUrl: `${SITE_URL}/logo.svg`,
        width: 180,
        height: 60,
        caption: "AURELIN & CO. — Maison de l'Homme",
      },
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
      description:
        "AURELIN & CO. is a luxury menswear maison specialising in pure European linen shirts, relaxed tailoring, and limited atelier editions crafted for the modern gentleman.",
      slogan: "Maison de l'Homme — True elegance is never excessive.",
      foundingDate: "2024",
      priceRange: "₹₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, Credit Card, UPI, WhatsApp",
      telephone: "+91 96450 32855",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressRegion: "Kerala",
      },
      areaServed: [
        { "@type": "Country", name: "India" },
        { "@type": "Country", name: "United Arab Emirates" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "United States" },
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91 96450 32855",
          contactType: "customer support",
          contactOption: "TollFree",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi", "Malayalam"],
        },
        {
          "@type": "ContactPoint",
          telephone: "+91 96450 32855",
          contactType: "sales",
          areaServed: "IN",
          availableLanguage: ["English"],
        },
      ],
      sameAs: [
        "https://www.instagram.com/aurelinco",
        "https://www.facebook.com/aurelinco",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "AURELIN & CO.",
      description: SITE_DESCRIPTION,
      inLanguage: ["en-IN", "en-US", "en-GB"],
      publisher: { "@id": `${SITE_URL}/#organization` },
      copyrightYear: new Date().getFullYear(),
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: `AURELIN & CO. — ${SITE_TAGLINE} | Luxury Linen Menswear`,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ],
      },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", ".brand-tagline"],
      },
      inLanguage: "en-IN",
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('aurelin_intro_seen')==='true'){document.documentElement.classList.add('intro-seen');}}catch(e){}`,
          }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </CartProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#172744",
              color: "#F8F6F0",
              border: "1px solid #D8C8AF",
              fontFamily: "var(--font-inter)",
              fontSize: "0.8125rem",
              letterSpacing: "0.03em",
            },
          }}
        />
      </body>
    </html>
  );
}
