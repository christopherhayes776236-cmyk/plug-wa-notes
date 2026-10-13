import type { Metadata, Viewport } from "next";
import Script from "next/script";
import InstallPrompt from "@/components/InstallPrompt";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2450C8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Plug Wa Notes — Study materials for Kisii University SOEN 2.1",
  description:
    "Get clean notes, explainer videos, slides and full study packs for COMP 102, SOEN 201, 202, 203, 220 and 240. Pay via M-Pesa, download instantly.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plug Notes",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" as="image" href="/media/kid-study.webp" type="image/webp" />
        <link rel="preload" as="image" href="/media/slides/image1.png" />
        <style dangerouslySetInnerHTML={{ __html: `
          #splash-screen {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background-color: #F6F4EF;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            animation: splashFadeOut 0.25s ease 1.5s forwards;
            pointer-events: none;
          }
          @keyframes splashFadeOut {
            to { opacity: 0; visibility: hidden; }
          }
          #splash-img-wrap {
            width: min(86vw, 280px);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 12px 32px -4px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
            border: 1px solid rgba(0,0,0,0.08);
            background-color: #000;
            margin-bottom: 1.25rem;
          }
          #splash-img-wrap img {
            width: 100%;
            height: auto;
            display: block;
            aspect-ratio: 4 / 3;
            object-fit: cover;
          }
          #splash-title {
            font-family: 'Space Grotesk', system-ui, sans-serif;
            font-weight: 600;
            font-size: 1.35rem;
            color: #0F172A;
            letter-spacing: -0.02em;
            text-align: center;
          }
          #splash-sub {
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 0.8125rem;
            color: #64748B;
            margin-top: 0.25rem;
            text-align: center;
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col bg-[#F6F4EF] text-[#23211E]" suppressHydrationWarning>
        {/* Splash screen — pure HTML/CSS, renders before any JS runs */}
        <div id="splash-screen" aria-hidden="true">
          <div id="splash-img-wrap">
            <picture>
              <source srcSet="/media/kid-study.webp" type="image/webp" />
              <img src="/media/kid-study.gif" alt="" />
            </picture>
          </div>
          <div id="splash-title">Plug Wa Notes</div>
          <div id="splash-sub">Loading study materials...</div>
        </div>
        {children}
        <InstallPrompt />
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
