import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Replace with your actual production domain when you deploy
  const baseUrl = "https://cmdlify.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // If ever add private routes like a user dashboard, put here:
      // disallow: "/private/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
