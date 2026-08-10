interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum allowed requests per IP within windowMs
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const ip in store) {
      if (store[ip].resetTime < now) {
        delete store[ip];
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Lightweight sliding-window in-memory rate limiter for serverless API routes.
 * Returns { success: true } if allowed, or { success: false, remaining, resetInSeconds } if limited.
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60 * 1000, maxRequests: 60 }
): { success: boolean; limit: number; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = store[identifier];

  if (!record || record.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    return {
      success: true,
      limit: options.maxRequests,
      remaining: options.maxRequests - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (record.count >= options.maxRequests) {
    return {
      success: false,
      limit: options.maxRequests,
      remaining: 0,
      resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.maxRequests,
    remaining: options.maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}
