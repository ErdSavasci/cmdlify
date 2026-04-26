import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // This specifically prevents the "zoom on focus" bug on mobile Safari
};

export const metadata: Metadata = {
  //This tells Next.js the root domain for all social images and canonical links
  metadataBase: new URL("https://cmdlify.com"),
  title: "Cmdlify - Simplify Your Terminal Experience",
  description:
    "A comprehensive, cross-OS terminal command reference for macOS, Linux, and Windows.",
  keywords: [
    "terminal",
    "command line",
    "CLI",
    "linux commands",
    "macos terminal",
    "windows cmd",
    "powershell",
    "bash",
    "zsh",
    "developer tools",
    "command cheat sheet",
    "cmdlify",
  ],
  authors: [{ name: "VirtuEng Software", url: "https://www.virtue.ng" }],
  creator: "VirtuEng Software",
  publisher: "VirtuEng Software",

  // Canonical URL prevents duplicate content penalties if your site is accessed via http vs https
  alternates: {
    canonical: "/",
  },

  // OpenGraph controls how your site looks when shared on Discord, LinkedIn, iMessage, etc.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Cmdlify - Simplify Your Terminal Experience",
    description:
      "A comprehensive, cross-OS terminal command reference for macOS, Linux, and Windows.",
    siteName: "Cmdlify",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cmdlify - Simplify Your Terminal Experience",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Cmdlify - Simplify Your Terminal Experience",
    description:
      "A comprehensive, cross-OS terminal command reference for macOS, Linux, and Windows.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Cmdlify" />

        {/* Using a raw script here so it executes synchronously before the body is parsed.
            This prevents the 300ms CSS transition animation from triggering on load.
            Adding suppressHydrationWarning here silences the React dev-mode warnings.
        */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('cmdlify-theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>

      <body className="min-h-screen flex flex-col font-mono antialiased transition-colors duration-300 bg-gray-50 text-gray-900 dark:bg-[#0d1117] dark:text-gray-300">
        {children}
      </body>
    </html>
  );
}
