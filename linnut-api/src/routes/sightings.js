// ====================
// SIGHTINGS ROUTES
// ====================

import { isAuthorized } from '../utils/jwt.js';
import { validateSightingData, sanitizeSightingData } from '../utils/validation.js';

// Default pagination settings
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * GET /api/sightings
 * Get all sightings (public) with pagination support
 */
export async function getAllSightings(request, env, corsHeaders) {
	const url = new URL(request.url);

	// Parse pagination params
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
	const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get('limit') || String(DEFAULT_LIMIT), 10)));
	const offset = (page - 1) * limit;

	// Check if pagination is requested (if no params, return all for backwards compatibility)
	const usePagination = url.searchParams.has('page') || url.searchParams.has('limit');

	if (usePagination) {
		// Get total count
		const countResult = await env.linnut_db.prepare('SELECT COUNT(*) as total FROM sightings').first();
		const total = countResult?.total || 0;
		const totalPages = Math.ceil(total / limit);

		// Get paginated results
		const { results } = await env.linnut_db.prepare('SELECT * FROM sightings ORDER BY date DESC LIMIT ? OFFSET ?').bind(limit, offset).all();

		return Response.json(
			{
				data: results,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			},
			{ headers: corsHeaders }
		);
	}

	// Backwards compatible: return all sightings
	const { results } = await env.linnut_db.prepare('SELECT * FROM sightings ORDER BY date DESC').all();
	return Response.json(results, { headers: corsHeaders });
}

/**
 * GET /api/sightings/:id
 * Get single sighting (public)
 */
export async function getSighting(id, env, corsHeaders) {
	const result = await env.linnut_db.prepare('SELECT * FROM sightings WHERE id = ?').bind(id).first();

	if (!result) {
		return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
	}

	return Response.json(result, { headers: corsHeaders });
}

/**
 * POST /api/sightings
 * Create new sighting (protected)
 */
export async function createSighting(request, env, corsHeaders) {
	if (!(await isAuthorized(request, env))) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	const rawData = await request.json();

	// Validate input
	const validation = validateSightingData(rawData);
	if (!validation.isValid) {
		return Response.json({ error: 'Validation failed', details: validation.errors }, { status: 400, headers: corsHeaders });
	}

	// Sanitize and normalize data
	const data = sanitizeSightingData(rawData);

	const result = await env.linnut_db
		.prepare(
			`INSERT INTO sightings (species, latin_name, location, date, image_url, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
		)
		.bind(data.species, data.latin_name, data.location, data.date, data.image_url, data.notes)
		.run();

	return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
}

/**
 * PUT /api/sightings/:id
 * Update sighting (protected)
 */
export async function updateSighting(id, request, env, corsHeaders) {
	if (!(await isAuthorized(request, env))) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	const rawData = await request.json();

	// Validate input
	const validation = validateSightingData(rawData);
	if (!validation.isValid) {
		return Response.json({ error: 'Validation failed', details: validation.errors }, { status: 400, headers: corsHeaders });
	}

	// Sanitize and normalize data
	const data = sanitizeSightingData(rawData);

	// Check if record exists
	const existing = await env.linnut_db.prepare('SELECT id FROM sightings WHERE id = ?').bind(id).first();

	if (!existing) {
		return Response.json({ error: 'Sighting not found' }, { status: 404, headers: corsHeaders });
	}

	await env.linnut_db
		.prepare(
			`UPDATE sightings SET
       species = ?, latin_name = ?, location = ?, date = ?, image_url = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`
		)
		.bind(data.species, data.latin_name, data.location, data.date, data.image_url, data.notes, id)
		.run();

	return Response.json({ success: true }, { headers: corsHeaders });
}

/**
 * DELETE /api/sightings/:id
 * Delete sighting (protected)
 */
export async function deleteSighting(id, request, env, corsHeaders) {
	if (!(await isAuthorized(request, env))) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	// Check if record exists first
	const existing = await env.linnut_db.prepare('SELECT id FROM sightings WHERE id = ?').bind(id).first();

	if (!existing) {
		return Response.json({ error: 'Sighting not found' }, { status: 404, headers: corsHeaders });
	}

	await env.linnut_db.prepare('DELETE FROM sightings WHERE id = ?').bind(id).run();

	return Response.json({ success: true }, { headers: corsHeaders });
}
