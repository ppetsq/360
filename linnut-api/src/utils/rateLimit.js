// ====================
// RATE LIMITING
// ====================

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_LOGIN_ATTEMPTS = 5; // Max attempts per window

/**
 * Check if a client IP is rate limited for login attempts
 * Uses KV storage to track attempts per IP
 */
export async function checkRateLimit(clientIP, env) {
	if (!env.rate_limit_kv) {
		// KV not configured, skip rate limiting (log warning in production)
		console.warn('Rate limiting KV not configured');
		return { allowed: true };
	}

	const key = `login:${clientIP}`;

	try {
		const data = await env.rate_limit_kv.get(key, { type: 'json' });

		if (!data) {
			// First attempt
			return { allowed: true, attempts: 0 };
		}

		const now = Date.now();
		const windowStart = now - RATE_LIMIT_WINDOW;

		// Filter out attempts outside the current window
		const recentAttempts = data.attempts.filter((timestamp) => timestamp > windowStart);

		if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
			const oldestAttempt = Math.min(...recentAttempts);
			const resetTime = Math.ceil((oldestAttempt + RATE_LIMIT_WINDOW - now) / 1000);

			return {
				allowed: false,
				attempts: recentAttempts.length,
				resetInSeconds: resetTime,
			};
		}

		return { allowed: true, attempts: recentAttempts.length };
	} catch (e) {
		console.error('Rate limit check error:', e);
		// On error, allow the request but log
		return { allowed: true };
	}
}

/**
 * Record a login attempt for rate limiting
 */
export async function recordLoginAttempt(clientIP, env) {
	if (!env.rate_limit_kv) {
		return;
	}

	const key = `login:${clientIP}`;
	const now = Date.now();
	const windowStart = now - RATE_LIMIT_WINDOW;

	try {
		const data = await env.rate_limit_kv.get(key, { type: 'json' });
		let attempts = [];

		if (data && data.attempts) {
			// Keep only recent attempts within the window
			attempts = data.attempts.filter((timestamp) => timestamp > windowStart);
		}

		attempts.push(now);

		// Store with TTL of 2 minutes (slightly longer than window to ensure cleanup)
		await env.rate_limit_kv.put(key, JSON.stringify({ attempts }), {
			expirationTtl: 120,
		});
	} catch (e) {
		console.error('Rate limit record error:', e);
	}
}

/**
 * Clear rate limit on successful login (optional - rewards good behavior)
 */
export async function clearRateLimit(clientIP, env) {
	if (!env.rate_limit_kv) {
		return;
	}

	const key = `login:${clientIP}`;

	try {
		await env.rate_limit_kv.delete(key);
	} catch (e) {
		console.error('Rate limit clear error:', e);
	}
}
