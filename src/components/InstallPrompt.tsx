"use client";

import { useEffect, useState, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const DISMISSED_KEY = "install_hint_dismissed_at";
const DISMISSED_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in navigator &&
      (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < DISMISSED_DURATION_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export default function InstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode() || wasDismissedRecently()) return;

    if (isIOS()) {
      // iOS: show hint strip after short delay
      const t = setTimeout(() => {
        setMode("ios");
        requestAnimationFrame(() => setVisible(true));
      }, 2000);
      return () => clearTimeout(t);
    }

    // Android / Chrome / Edge: capture the event so we can call prompt() on demand
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // prevent auto mini-infobar (we show our own strip)
      deferredPrompt.current = e;
      setMode("android");
      requestAnimationFrame(() => setVisible(true));
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      handleDismiss();
    }
  }

  function handleDismiss() {
    markDismissed();
    setVisible(false);
    setTimeout(() => setMode(null), 350);
  }

  if (!mode) return null;

  return (
    <>
      {/* Slim top banner */}
      <div
        role="banner"
        aria-label="Install app prompt"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: visible ? "translateY(0)" : "translateY(-110%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            background: "#2450C8",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            fontSize: "13px",
            lineHeight: "1.3",
          }}
        >
          {/* App icon thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: 8, flexShrink: 0 }}
          />

          {/* Message */}
          <span style={{ flex: 1 }}>
            {mode === "android" ? (
              <>
                <strong>Plug Wa Notes</strong> — Add to your home screen for quick access
              </>
            ) : (
              <>
                Tap <strong>Share ↑</strong> then <strong>Add to Home Screen</strong>
              </>
            )}
          </span>

          {/* Android: Install button */}
          {mode === "android" && (
            <button
              id="pwa-install-btn"
              onClick={handleInstall}
              style={{
                background: "#fff",
                color: "#2450C8",
                border: "none",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              Install
            </button>
          )}

          {/* Dismiss × */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: 24,
              height: 24,
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Spacer so page content isn't hidden under the banner */}
      {visible && <div style={{ height: 52 }} aria-hidden="true" />}
    </>
  );
}
