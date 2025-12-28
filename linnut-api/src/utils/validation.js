// ====================
// INPUT VALIDATION HELPERS
// ====================

export function validateSightingData(data) {
	const errors = [];

	// Required: species (string, 1-200 chars)
	if (!data.species || typeof data.species !== 'string') {
		errors.push('Species is required and must be a string');
	} else if (data.species.trim().length === 0) {
		errors.push('Species cannot be empty');
	} else if (data.species.length > 200) {
		errors.push('Species name too long (max 200 characters)');
	}

	// Required: date (valid ISO date format YYYY-MM-DD)
	if (!data.date || typeof data.date !== 'string') {
		errors.push('Date is required and must be a string');
	} else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
		errors.push('Date must be in YYYY-MM-DD format');
	} else {
		const dateObj = new Date(data.date);
		if (isNaN(dateObj.getTime())) {
			errors.push('Invalid date');
		}
		if (dateObj > new Date()) {
			errors.push('Date cannot be in the future');
		}
		if (dateObj.getFullYear() < 1900) {
			errors.push('Date must be after 1900');
		}
	}

	// Optional: latin_name (string, max 200 chars)
	if (data.latin_name !== null && data.latin_name !== undefined) {
		if (typeof data.latin_name !== 'string') {
			errors.push('Latin name must be a string');
		} else if (data.latin_name.length > 200) {
			errors.push('Latin name too long (max 200 characters)');
		}
	}

	// Optional: location (string, max 200 chars)
	if (data.location !== null && data.location !== undefined) {
		if (typeof data.location !== 'string') {
			errors.push('Location must be a string');
		} else if (data.location.length > 200) {
			errors.push('Location too long (max 200 characters)');
		}
	}

	// Optional: notes (string, max 2000 chars)
	if (data.notes !== null && data.notes !== undefined) {
		if (typeof data.notes !== 'string') {
			errors.push('Notes must be a string');
		} else if (data.notes.length > 2000) {
			errors.push('Notes too long (max 2000 characters)');
		}
	}

	// Optional: image_url (string, max 500 chars, must be valid URL if provided)
	if (data.image_url !== null && data.image_url !== undefined) {
		if (typeof data.image_url !== 'string') {
			errors.push('Image URL must be a string');
		} else if (data.image_url.length > 500) {
			errors.push('Image URL too long (max 500 characters)');
		} else if (data.image_url.length > 0) {
			try {
				const url = new URL(data.image_url);
				// Allow HTTP only for localhost (local development)
				const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
				if (url.protocol !== 'https:' && !isLocalhost) {
					errors.push('Image URL must use HTTPS');
				}
			} catch (e) {
				errors.push('Invalid image URL format');
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

export function sanitizeSightingData(data) {
	return {
		species: data.species?.trim() || '',
		latin_name: data.latin_name?.trim() || null,
		location: data.location?.trim() || null,
		date: data.date,
		image_url: data.image_url?.trim() || null,
		is_original_image: data.is_original_image ? 1 : 0,
		notes: data.notes?.trim() || null,
	};
}

// ====================
// FILE UPLOAD VALIDATION
// ====================

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateImageFile(file) {
	const errors = [];

	if (!file) {
		errors.push('No file provided');
		return { isValid: false, errors };
	}

	// Check MIME type
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
		errors.push(`Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
	}

	// Check file size
	if (file.size > MAX_FILE_SIZE) {
		errors.push(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
	}

	if (file.size === 0) {
		errors.push('File is empty');
	}

	// Verify actual file content matches declared MIME type (magic bytes check)
	try {
		const buffer = await file.slice(0, 12).arrayBuffer();
		const bytes = new Uint8Array(buffer);

		const isValidImage =
			// JPEG: FF D8 FF
			(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
			// PNG: 89 50 4E 47
			(bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
			// GIF: 47 49 46
			(bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) ||
			// WebP: RIFF ... WEBP
			(bytes[0] === 0x52 &&
				bytes[1] === 0x49 &&
				bytes[2] === 0x46 &&
				bytes[3] === 0x46 &&
				bytes[8] === 0x57 &&
				bytes[9] === 0x45 &&
				bytes[10] === 0x42 &&
				bytes[11] === 0x50);

		if (!isValidImage) {
			errors.push('File content does not match image format');
		}
	} catch (e) {
		errors.push('Failed to verify file content');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

export function sanitizeFilename(filename) {
	// Remove any path traversal attempts
	filename = filename.replace(/\.\./g, '');
	filename = filename.replace(/[\/\\]/g, '');

	// Keep only alphanumeric, dots, dashes, underscores
	filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

	// Limit length
	if (filename.length > 100) {
		const ext = filename.split('.').pop();
		filename = filename.substring(0, 90) + '.' + ext;
	}

	return filename;
}
