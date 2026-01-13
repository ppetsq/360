// ====================
// HABITS API - Main Entry Point
// ====================

import { getCorsHeaders, handlePreflight } from './utils/cors.js';
import { handleLogin } from './routes/auth.js';
import { getAllHabits, createHabit, updateHabit, deleteHabit, toggleCompletion } from './routes/habits.js';

// ====================
// ROUTER
// ====================

function matchRoute(path, pattern) {
	// Pattern matching for /api/habits/:id and /api/habits/:id/toggle
	if (pattern.includes(':id')) {
		const regex = new RegExp('^' + pattern.replace(':id', '(\\d+)') + '$');
		const match = path.match(regex);
		if (match) {
			return { params: { id: match[1] } };
		}
		return null;
	}
	return path === pattern ? { params: {} } : null;
}

// ====================
// MAIN EXPORT
// ====================

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		// Get CORS headers based on request origin
		const corsHeaders = getCorsHeaders(request);

		// Handle preflight requests
		if (method === 'OPTIONS') {
			return handlePreflight(request);
		}

		try {
			// ====================
			// AUTH ROUTES
			// ====================

			// POST /api/login - Authenticate
			if (path === '/api/login' && method === 'POST') {
				return handleLogin(request, env, corsHeaders);
			}

			// ====================
			// HABITS ROUTES (all protected)
			// ====================

			// GET /api/habits - List all habits with completions and streaks
			if (path === '/api/habits' && method === 'GET') {
				return getAllHabits(request, env, corsHeaders);
			}

			// POST /api/habits - Create new habit
			if (path === '/api/habits' && method === 'POST') {
				return createHabit(request, env, corsHeaders);
			}

			// POST /api/habits/:id/toggle - Toggle completion
			const toggleMatch = matchRoute(path, '/api/habits/:id/toggle');
			if (toggleMatch && method === 'POST') {
				return toggleCompletion(toggleMatch.params.id, request, env, corsHeaders);
			}

			// PUT /api/habits/:id - Update habit
			const updateMatch = matchRoute(path, '/api/habits/:id');
			if (updateMatch && method === 'PUT') {
				return updateHabit(updateMatch.params.id, request, env, corsHeaders);
			}

			// DELETE /api/habits/:id - Delete habit
			const deleteMatch = matchRoute(path, '/api/habits/:id');
			if (deleteMatch && method === 'DELETE') {
				return deleteHabit(deleteMatch.params.id, request, env, corsHeaders);
			}

			// ====================
			// 404 - Not Found
			// ====================
			return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
		} catch (error) {
			// Log error server-side but return generic message
			console.error('Server error:', error);
			return Response.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
		}
	},
};
