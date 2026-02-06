import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

const RATE_LIMIT_CONFIGS = {
  login: { interval: 60 * 1000, maxRequests: 5 }, // 5 requests per minute
  contactSubmit: { interval: 60 * 1000, maxRequests: 3 }, // 3 per minute
  adminAPI: { interval: 60 * 1000, maxRequests: 100 }, // 100 per minute
  publicAPI: { interval: 60 * 1000, maxRequests: 30 }, // 30 per minute
};

export function getRateLimitConfig(type: keyof typeof RATE_LIMIT_CONFIGS) {
  return RATE_LIMIT_CONFIGS[type];
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Clean up old entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }

  if (!store[key]) {
    store[key] = { count: 1, resetTime: now + config.interval };
    return { allowed: true, remaining: config.maxRequests - 1, resetTime: store[key].resetTime };
  }

  const record = store[key];

  if (record.count < config.maxRequests) {
    record.count++;
    return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime };
  }

  return { allowed: false, remaining: 0, resetTime: record.resetTime };
}

export function createRateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return new NextResponse(
    JSON.stringify({
      error: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'Content-Type': 'application/json',
      },
    }
  );
}

export function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : realIp ?? 'unknown';

  return ip;
}

