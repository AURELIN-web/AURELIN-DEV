import { Suspense } from "react";
import { getSiteSettings } from "@/lib/queries";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import AnnouncementBar from "@/components/storefront/AnnouncementBar";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const whatsappNumber = settings.whatsapp?.number
    ? `${settings.whatsapp.country_code || "91"}${settings.whatsapp.number}`.replace(/\D/g, "")
    : undefined;

  return (
    <>
      <AnnouncementBar settings={settings.announcementBar} />
      <Header whatsappNumber={whatsappNumber} />
      <main className="min-h-screen">{children}</main>
      <Footer
        description={
          (settings.footer as { description?: string } | null)?.description
        }
        newsletterText={
          (settings.footer as { newsletter_text?: string } | null)?.newsletter_text
        }
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
