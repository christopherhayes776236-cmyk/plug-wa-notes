import type { Metadata, Viewport } from "next";
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
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
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
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/nd4ofxfu/image/upload/v1789866745/plug-wa-notes/kid-study.gif"
        />
        {/* Preload critical media files so they buffer during the 13s loader */}
        <link rel="preload" as="video" href="/media/notes-overview.mp4" />
        <link rel="preload" as="video" href="/media/video-overview.mp4" />
        <link rel="preload" as="video" href="/media/Audio.mp4" />
        <link rel="preload" as="image" href="/media/slides/image1.png" />
        <link rel="preload" as="image" href="/media/slides/image2.png" />
        <link rel="preload" as="image" href="/media/slides/image3.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F6F4EF] text-[#23211E]">
        {children}
        <script
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
