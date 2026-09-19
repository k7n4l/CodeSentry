import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// NOTE: This in-memory store is suitable for a single instance during development, but it will not share
// rate-limit state across multiple server instances. In production, switch to a shared Redis store.

const jsonRateLimitHandler = (req, res) => {
  const retryAfterSeconds = req.rateLimit?.resetTime
    ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
    : 60;

  return res.status(429).json({
    error: "Too many requests",
    retryAfter: retryAfterSeconds,
  });
};

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.userId || "anonymous-user"),
  handler: jsonRateLimitHandler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || req.socket?.remoteAddress || "unknown-ip"),
  handler: (req, res) => {
    const retryAfterSeconds = req.rateLimit?.resetTime
      ? Math.max(1, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000))
      : 900;

    return res.status(429).json({
      error: "Too many authentication attempts",
      retryAfter: retryAfterSeconds,
    });
  },
});
