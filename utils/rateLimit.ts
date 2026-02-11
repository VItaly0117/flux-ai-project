type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();

  const current = buckets.get(userId);
  if (!current || current.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(userId, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1, resetAt };
  }

  if (current.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  buckets.set(userId, current);
  return { allowed: true, remaining: Math.max(0, MAX_PER_WINDOW - current.count), resetAt: current.resetAt };
}
