// ====================
// FILE UPLOAD ROUTES
// ====================

import { isAuthorized } from '../utils/jwt.js';
import { validateImageFile, sanitizeFilename } from '../utils/validation.js';

/**
 * POST /api/upload
 * Upload image to R2 (protected)
 */
export async function handleUpload(request, env, corsHeaders) {
	if (!(await isAuthorized(request, env))) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file');

		// Validate file
		const validation = await validateImageFile(file);
		if (!validation.isValid) {
			return Response.json({ error: 'File validation failed', details: validation.errors }, { status: 400, headers: corsHeaders });
		}

		// Sanitize and generate unique filename
		const timestamp = Date.now();
		const randomSuffix = Math.random().toString(36).substring(2, 8);
		const sanitizedName = sanitizeFilename(file.name);
		const filename = `${timestamp}-${randomSuffix}-${sanitizedName}`;

		// Upload to R2 with validated content type
		await env.linnut_images.put(filename, file.stream(), {
			httpMetadata: {
				contentType: file.type,
				cacheControl: 'public, max-age=31536000',
			},
		});

		// Return URL based on environment
		// Local dev: use worker route, Production: use R2 public URL
		const requestUrl = new URL(request.url);
		const isLocal = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1';
		const imageUrl = isLocal
			? `${requestUrl.origin}/api/images/${filename}`
			: `https://pub-a9fe856f6ccb42b886d01627a9bf9021.r2.dev/${filename}`;

		return Response.json({ success: true, url: imageUrl, filename }, { headers: corsHeaders });
	} catch (e) {
		console.error('Upload error:', e);
		return Response.json({ error: 'Upload failed' }, { status: 500, headers: corsHeaders });
	}
}
