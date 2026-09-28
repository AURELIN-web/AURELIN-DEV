import { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/account/", "/checkout/", "/api/", "/cart/", "/login/", "/register/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin/", "/account/", "/checkout/", "/api/", "/cart/", "/login/", "/register/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/", "/checkout/", "/api/", "/cart/", "/login/", "/register/", "/_next/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
