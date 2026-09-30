"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "ios_install_hint_dismissed";
const DISMISSED_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

/**
 * InstallPrompt
 *
 * Android / Chrome / Edge:
 *   We do NOT intercept beforeinstallprompt — the browser shows its own
 *   native install UI automatically (mini-infobar or install icon in address bar).
 *
 * iOS / Safari:
 *   Shows a slim top banner since iOS has no beforeinstallprompt support.
 */
export default function InstallPrompt() {
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode() || wasDismissedRecently()) return;
    if (!isIOS()) return;

    // Show iOS hint after a short delay
    const t = setTimeout(() => {
      setShowIOSHint(true);
      requestAnimationFrame(() => setVisible(true));
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  function handleDismiss() {
    markDismissed();
    setVisible(false);
    setTimeout(() => setShowIOSHint(false), 300);
  }

  if (!showIOSHint) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
      }}
    >
      <div
        style={{
          background: "#2450C8",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          fontSize: "13px",
          gap: 10,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>📲</span>
          <span>
            Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> to install
          </span>
        </span>
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
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
