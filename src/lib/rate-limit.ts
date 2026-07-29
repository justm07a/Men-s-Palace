const hits = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 60,
};

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs, maxRequests } = { ...DEFAULT_CONFIG, ...config };
  const now = Date.now();
  const record = hits.get(identifier);

  if (!record || now > record.resetAt) {
    hits.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

export function getRateLimitHeaders(
  identifier: string,
  result: { remaining: number; resetAt: number }
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(DEFAULT_CONFIG.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Policy": "sliding-window",
  };
}

const PRESETS: Record<string, RateLimitConfig> = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  upload: { windowMs: 60 * 1000, maxRequests: 20 },
  write: { windowMs: 60 * 1000, maxRequests: 30 },
  read: { windowMs: 60 * 1000, maxRequests: 120 },
};

export function rateLimit(
  req: Request,
  preset: keyof typeof PRESETS = "read"
): { allowed: boolean; headers: Record<string, string> } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const identifier = `${ip}:${preset}`;
  const result = checkRateLimit(identifier, PRESETS[preset]);
  return {
    allowed: result.allowed,
    headers: getRateLimitHeaders(identifier, result),
  };
}

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

export function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, record] of hits.entries()) {
    if (now > record.resetAt) hits.delete(key);
  }
}
