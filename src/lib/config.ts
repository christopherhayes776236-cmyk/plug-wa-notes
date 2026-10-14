// Centralized configuration for Plug Wa Notes launch and promotions

/**
 * FREE WEEKEND TOGGLE
 * Set to `true` to give students free 1-tap downloads for the weekend.
 * Set to `false` when Safaricom paybill is live to effortlessly revert to paid M-Pesa mode.
 */
export const FREE_WEEKEND_ACTIVE = false;

/**
 * Checks if Free Weekend mode is currently active.
 * 1. Checks environment variable override (if set in Vercel: NEXT_PUBLIC_FREE_WEEKEND).
 * 2. Checks FREE_WEEKEND_ACTIVE constant.
 * 3. Checks if current day is Friday, Saturday, or Sunday in Kenyan time (EAT, UTC+3).
 */
export function isFreeWeekend(): boolean {
  if (process.env.NEXT_PUBLIC_FREE_WEEKEND === 'true') return true;
  if (process.env.NEXT_PUBLIC_FREE_WEEKEND === 'false') return false;

  // Explicit toggle: default to false for secure paid production launch
  return FREE_WEEKEND_ACTIVE;
}
