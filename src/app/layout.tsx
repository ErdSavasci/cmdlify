import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Cmdlify - Simplify Your Terminal Experience",
  description:
    "A comprehensive, cross-OS terminal command reference for macOS, Linux, and Windows.",
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
