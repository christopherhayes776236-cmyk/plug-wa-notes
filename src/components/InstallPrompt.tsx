"use client";

import { useEffect, useState } from "react";

// Extend Window to include the non-standard beforeinstallprompt event
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

const DISMISSED_KEY = "pwa_install_dismissed";
const DISMISSED_DURATION_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function wasDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Date.now() - ts < DISMISSED_DURATION_MS;
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed or dismissed recently — skip
    if (isInStandaloneMode() || wasDismissedRecently()) return;

    if (isIOS()) {
      const t = setTimeout(() => {
        setShowIOS(true);
        requestAnimationFrame(() => setVisible(true));
      }, 2500);
      return () => clearTimeout(t);
    }

    // Chrome / Android — wait for browser event
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
      requestAnimationFrame(() => setVisible(true));
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      handleDismiss();
    });
  }

  function handleDismiss() {
    markDismissed();
    setVisible(false);
    setTimeout(() => {
      setShowAndroid(false);
      setShowIOS(false);
    }, 350);
  }

  if (!showAndroid && !showIOS) return null;

  return (
    <div
      role="dialog"
      aria-label="Install App"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "0 16px 16px",
        transform: visible ? "translateY(0)" : "translateY(120%)",
        transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1a3aa8 0%, #2450C8 60%, #3a65e8 100%)",
          borderRadius: "20px",
          padding: "20px 20px 16px",
          boxShadow: "0 -4px 32px rgba(36,80,200,0.35), 0 8px 32px rgba(0,0,0,0.22)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          maxWidth: "480px",
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
          {/* App icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <span style={{ fontSize: 26 }}>📚</span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "16px", lineHeight: "1.2", marginBottom: 4 }}>
              Install Plug Wa Notes
            </div>
            <div style={{ fontSize: "13px", opacity: 0.85, lineHeight: "1.4" }}>
              {showAndroid ? (
                "Add to your home screen for quick access — no browser needed!"
              ) : (
                <>
                  Tap the <strong>Share</strong> button, then{" "}
                  <strong>Add to Home Screen</strong>.
                </>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 16,
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* iOS instruction hint */}
        {showIOS && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: "13px",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 20 }}>⬆️</span>
            <span>
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>
            </span>
          </div>
        )}

        {/* Android CTA buttons */}
        {showAndroid && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleDismiss}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Not now
            </button>
            <button
              id="pwa-install-btn"
              onClick={handleInstall}
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: 12,
                border: "none",
                background: "#fff",
                color: "#2450C8",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Install App
            </button>
          </div>
        )}

        {/* iOS: single dismiss */}
        {showIOS && (
          <button
            onClick={handleDismiss}
            style={{
              padding: "10px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Got it
          </button>
        )}
      </div>
    </div>
  );
}
