// ====================
// JWT AUTHENTICATION HELPERS
// ====================

// Generate JWT token with expiration
async function generateJWT(payload, secret, expiresInHours = 24) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (expiresInHours * 3600)
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = await signHmacSha256(signatureInput, secret);
  const encodedSignature = base64UrlEncode(signature);

  return `${signatureInput}.${encodedSignature}`;
}

// Verify JWT token
async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
    const expectedSignature = await signHmacSha256(signatureInput, secret);
    const expectedEncoded = base64UrlEncode(expectedSignature);

    if (encodedSignature !== expectedEncoded) return null;

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(encodedPayload));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

// HMAC SHA-256 signing
async function signHmacSha256(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  return new Uint8Array(signature);
}

// Base64 URL encoding
function base64UrlEncode(data) {
  if (data instanceof Uint8Array) {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } else {
    return btoa(unescape(encodeURIComponent(data)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// Base64 URL decoding
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) {
    str += '='.repeat(4 - pad);
  }
  return decodeURIComponent(escape(atob(str)));
}

// ====================
// INPUT VALIDATION HELPERS
// ====================

function validateSightingData(data) {
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
        if (url.protocol !== 'https:') {
          errors.push('Image URL must use HTTPS');
        }
      } catch (e) {
        errors.push('Invalid image URL format');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeSightingData(data) {
  return {
    species: data.species?.trim() || '',
    latin_name: data.latin_name?.trim() || null,
    location: data.location?.trim() || null,
    date: data.date,
    image_url: data.image_url?.trim() || null,
    notes: data.notes?.trim() || null
  };
}

// ====================
// FILE UPLOAD VALIDATION
// ====================

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function validateImageFile(file) {
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
      (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) ||
      // PNG: 89 50 4E 47
      (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) ||
      // GIF: 47 49 46
      (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) ||
      // WebP: RIFF ... WEBP
      (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
       bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50);

    if (!isValidImage) {
      errors.push('File content does not match image format');
    }
  } catch (e) {
    errors.push('Failed to verify file content');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeFilename(filename) {
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

// ====================
// CORS CONFIGURATION
// ====================

const ALLOWED_ORIGINS = [
  'https://petsq.works',
  'https://www.petsq.works',
  'https://360.petsq.works',
  'http://localhost:8080',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000'
];

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin'
  };
}

// ====================
// AUTHENTICATION
// ====================

async function isAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');

  // Verify JWT token
  const payload = await verifyJWT(token, env.LINNUT_ADMIN_PASSWORD);
  return payload !== null && payload.role === 'admin';
}

// ====================
// MAIN EXPORT
// ====================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Get CORS headers based on request origin
    const corsHeaders = getCorsHeaders(request);

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // PUBLIC: Get all sightings
      if (path === '/api/sightings' && request.method === 'GET') {
        const { results } = await env.linnut_db.prepare(
          'SELECT * FROM sightings ORDER BY date DESC'
        ).all();
        return Response.json(results, { headers: corsHeaders });
      }

      // PUBLIC: Get single sighting
      if (path.match(/^\/api\/sightings\/\d+$/) && request.method === 'GET') {
        const id = path.split('/').pop();
        const result = await env.linnut_db.prepare(
          'SELECT * FROM sightings WHERE id = ?'
        ).bind(id).first();

        if (!result) {
          return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
        }
        return Response.json(result, { headers: corsHeaders });
      }

      // LOGIN: Authenticate and get JWT token
      if (path === '/api/login' && request.method === 'POST') {
        try {
          const { password } = await request.json();

          if (!password || password !== env.LINNUT_ADMIN_PASSWORD) {
            return Response.json(
              { error: 'Invalid password' },
              { status: 401, headers: corsHeaders }
            );
          }

          // Generate JWT token valid for 24 hours
          const token = await generateJWT(
            { role: 'admin' },
            env.LINNUT_ADMIN_PASSWORD,
            24
          );

          return Response.json(
            { success: true, token },
            { headers: corsHeaders }
          );
        } catch (e) {
          return Response.json(
            { error: 'Login failed' },
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // PROTECTED: Add new sighting
      if (path === '/api/sightings' && request.method === 'POST') {
        if (!(await isAuthorized(request, env))) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const rawData = await request.json();

        // Validate input
        const validation = validateSightingData(rawData);
        if (!validation.isValid) {
          return Response.json(
            { error: 'Validation failed', details: validation.errors },
            { status: 400, headers: corsHeaders }
          );
        }

        // Sanitize and normalize data
        const data = sanitizeSightingData(rawData);

        const result = await env.linnut_db.prepare(
          `INSERT INTO sightings (species, latin_name, location, date, image_url, notes)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          data.species,
          data.latin_name,
          data.location,
          data.date,
          data.image_url,
          data.notes
        ).run();

        return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
      }

      // PROTECTED: Update sighting
      if (path.match(/^\/api\/sightings\/\d+$/) && request.method === 'PUT') {
        if (!(await isAuthorized(request, env))) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const id = path.split('/').pop();
        const rawData = await request.json();

        // Validate input
        const validation = validateSightingData(rawData);
        if (!validation.isValid) {
          return Response.json(
            { error: 'Validation failed', details: validation.errors },
            { status: 400, headers: corsHeaders }
          );
        }

        // Sanitize and normalize data
        const data = sanitizeSightingData(rawData);

        // Check if record exists
        const existing = await env.linnut_db.prepare(
          'SELECT id FROM sightings WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
          return Response.json(
            { error: 'Sighting not found' },
            { status: 404, headers: corsHeaders }
          );
        }

        await env.linnut_db.prepare(
          `UPDATE sightings SET
           species = ?, latin_name = ?, location = ?, date = ?, image_url = ?, notes = ?, updated_at = datetime('now')
           WHERE id = ?`
        ).bind(
          data.species,
          data.latin_name,
          data.location,
          data.date,
          data.image_url,
          data.notes,
          id
        ).run();

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // PROTECTED: Delete sighting
      if (path.match(/^\/api\/sightings\/\d+$/) && request.method === 'DELETE') {
        if (!(await isAuthorized(request, env))) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const id = path.split('/').pop();
        await env.linnut_db.prepare('DELETE FROM sightings WHERE id = ?').bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // PROTECTED: Upload image
      if (path === '/api/upload' && request.method === 'POST') {
        if (!(await isAuthorized(request, env))) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        try {
          const formData = await request.formData();
          const file = formData.get('file');

          // Validate file
          const validation = await validateImageFile(file);
          if (!validation.isValid) {
            return Response.json(
              { error: 'File validation failed', details: validation.errors },
              { status: 400, headers: corsHeaders }
            );
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
              cacheControl: 'public, max-age=31536000'
            }
          });

          // Return the public URL
          const imageUrl = `https://pub-a9fe856f6ccb42b886d01627a9bf9021.r2.dev/${filename}`;

          return Response.json({ success: true, url: imageUrl, filename }, { headers: corsHeaders });
        } catch (e) {
          return Response.json(
            { error: 'Upload failed' },
            { status: 500, headers: corsHeaders }
          );
        }
      }

      // 404 for everything else
      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

    } catch (error) {
      // Log error server-side but return generic message
      console.error('Server error:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
