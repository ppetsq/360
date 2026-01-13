// ====================
// AUTHENTICATION ROUTES
// ====================

import { generateJWT } from '../utils/jwt.js';
import { checkRateLimit, recordLoginAttempt, clearRateLimit } from '../utils/rateLimit.js';

/**
 * POST /api/login
 * Authenticate and return JWT token
 */
export async function handleLogin(request, env, corsHeaders) {
	// Get client IP for rate limiting
	const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

	// Check rate limit before processing
	const rateLimit = await checkRateLimit(clientIP, env);

	if (!rateLimit.allowed) {
		return Response.json(
			{
				error: 'Too many login attempts',
				message: `Please try again in ${rateLimit.resetInSeconds} seconds`,
				retryAfter: rateLimit.resetInSeconds,
			},
			{
				status: 429,
				headers: {
					...corsHeaders,
					'Retry-After': String(rateLimit.resetInSeconds),
				},
			}
		);
	}

	try {
		const { password } = await request.json();

		if (!password || password !== env.HABITS_ADMIN_PASSWORD) {
			// Record failed attempt
			await recordLoginAttempt(clientIP, env);

			return Response.json({ error: 'Invalid password' }, { status: 401, headers: corsHeaders });
		}

		// Clear rate limit on successful login
		await clearRateLimit(clientIP, env);

		// Generate JWT token valid for 24 hours
		const token = await generateJWT({ role: 'admin' }, env.HABITS_ADMIN_PASSWORD, 24);

		return Response.json({ success: true, token }, { headers: corsHeaders });
	} catch (e) {
		return Response.json({ error: 'Login failed' }, { status: 500, headers: corsHeaders });
	}
}
