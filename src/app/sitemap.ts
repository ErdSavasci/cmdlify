import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://cmdlify.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1, // 1 tells Google this is the most important page
    },
    // Note: If ever add separate pages (e.g., an about page or blog),
    // add them to this array
  ];
}
