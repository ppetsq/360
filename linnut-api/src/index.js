// ====================
// LINNUT API - Main Entry Point
// ====================

import { getCorsHeaders, handlePreflight } from './utils/cors.js';
import { handleLogin } from './routes/auth.js';
import { getAllSightings, getSighting, createSighting, updateSighting, deleteSighting } from './routes/sightings.js';
import { handleUpload } from './routes/upload.js';

// ====================
// ROUTER
// ====================

function matchRoute(path, pattern) {
	// Simple pattern matching for /api/sightings/:id
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
			// PUBLIC ROUTES
			// ====================

			// GET /api/images/:filename - Serve images from R2 (for local dev + fallback)
			if (path.startsWith('/api/images/') && method === 'GET') {
				const filename = path.replace('/api/images/', '');
				const object = await env.linnut_images.get(filename);

				if (!object) {
					return Response.json({ error: 'Image not found' }, { status: 404, headers: corsHeaders });
				}

				return new Response(object.body, {
					headers: {
						'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
						'Cache-Control': 'public, max-age=31536000',
						...corsHeaders,
					},
				});
			}

			// GET /api/sightings - List all sightings (with optional pagination)
			if (path === '/api/sightings' && method === 'GET') {
				return getAllSightings(request, env, corsHeaders);
			}

			// GET /api/sightings/:id - Get single sighting
			const getSingleMatch = matchRoute(path, '/api/sightings/:id');
			if (getSingleMatch && method === 'GET') {
				return getSighting(getSingleMatch.params.id, env, corsHeaders);
			}

			// ====================
			// AUTH ROUTES
			// ====================

			// POST /api/login - Authenticate
			if (path === '/api/login' && method === 'POST') {
				return handleLogin(request, env, corsHeaders);
			}

			// ====================
			// PROTECTED ROUTES
			// ====================

			// POST /api/sightings - Create new sighting
			if (path === '/api/sightings' && method === 'POST') {
				return createSighting(request, env, corsHeaders);
			}

			// PUT /api/sightings/:id - Update sighting
			const updateMatch = matchRoute(path, '/api/sightings/:id');
			if (updateMatch && method === 'PUT') {
				return updateSighting(updateMatch.params.id, request, env, corsHeaders);
			}

			// DELETE /api/sightings/:id - Delete sighting
			const deleteMatch = matchRoute(path, '/api/sightings/:id');
			if (deleteMatch && method === 'DELETE') {
				return deleteSighting(deleteMatch.params.id, request, env, corsHeaders);
			}

			// POST /api/upload - Upload image
			if (path === '/api/upload' && method === 'POST') {
				return handleUpload(request, env, corsHeaders);
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
