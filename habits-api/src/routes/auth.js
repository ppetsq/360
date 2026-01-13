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

	// Define users
	const users = [
		{ id: 1, name: 'Petteri', passwordKey: 'USER_PETTERI_PASSWORD' },
		{ id: 2, name: 'Riikka', passwordKey: 'USER_RIIKKA_PASSWORD' },
	];

	try {
		const { password } = await request.json();

		// Find matching user
		const user = users.find((u) => password && env[u.passwordKey] && password === env[u.passwordKey]);

		if (!user) {
			// Record failed attempt
			await recordLoginAttempt(clientIP, env);
			return Response.json({ error: 'Invalid password' }, { status: 401, headers: corsHeaders });
		}

		// Clear rate limit on successful login
		await clearRateLimit(clientIP, env);

		// Generate JWT token with user info, valid for 7 days
		const token = await generateJWT(
			{ userId: user.id, name: user.name, role: 'admin' },
			env.USER_PETTERI_PASSWORD, // Use first user's password as JWT secret
			168 // 7 days
		);

		return Response.json({ success: true, token, user: { id: user.id, name: user.name } }, { headers: corsHeaders });
	} catch (e) {
		return Response.json({ error: 'Login failed' }, { status: 500, headers: corsHeaders });
	}
}
