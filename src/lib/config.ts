// Centralized configuration for Plug Wa Notes launch and promotions

/**
 * FREE WEEKEND TOGGLE
 * Set to `true` to give students free 1-tap downloads for the weekend.
 * Set to `false` when Safaricom paybill is live to effortlessly revert to paid M-Pesa mode.
 */
export const FREE_WEEKEND_ACTIVE = true;

/**
 * Checks if Free Weekend mode is currently active.
 * 1. Checks environment variable override (if set in Vercel: NEXT_PUBLIC_FREE_WEEKEND).
 * 2. Checks FREE_WEEKEND_ACTIVE constant.
 * 3. Checks if current day is Friday, Saturday, or Sunday in Kenyan time (EAT, UTC+3).
 */
export function isFreeWeekend(): boolean {
  if (process.env.NEXT_PUBLIC_FREE_WEEKEND === 'true') return true;
  if (process.env.NEXT_PUBLIC_FREE_WEEKEND === 'false') return false;

  if (FREE_WEEKEND_ACTIVE) return true;

  // Auto-detect weekend in EAT (UTC+3)
  const now = new Date();
  const eatHours = now.getUTCHours() + 3;
  const eatDay = (now.getUTCDay() + Math.floor(eatHours / 24)) % 7; // 0=Sun, 5=Fri, 6=Sat
  return eatDay === 5 || eatDay === 6 || eatDay === 0;
}
