import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cmdlify - Simplify Your Terminal Experience",
    short_name: "Cmdlify",
    description:
      "A comprehensive, cross-OS terminal command reference for macOS, Linux, and Windows.",
    start_url: "/",
    display: "standalone", // Makes it look like a native app if added to a home screen
    background_color: "#0d1117",
    theme_color: "#22c55e",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
