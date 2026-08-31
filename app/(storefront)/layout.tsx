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

  return (
    <>
      <AnnouncementBar settings={settings.announcementBar} />
      <Header whatsappNumber={settings.whatsapp?.number} />
      <main className="min-h-screen">{children}</main>
      <Footer
        description={
          (settings.footer as { description?: string } | null)?.description
        }
        newsletterText={
          (settings.footer as { newsletter_text?: string } | null)?.newsletter_text
        }
        whatsappNumber={settings.whatsapp?.number}
      />
    </>
  );
}
