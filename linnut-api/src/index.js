// Simple password protection - we'll set this as a secret
const ADMIN_PASSWORD = 'LINNUT_ADMIN_PASSWORD';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for your frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

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

      // PROTECTED: Add new sighting
      if (path === '/api/sightings' && request.method === 'POST') {
        if (!isAuthorized(request, env)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const data = await request.json();
        const result = await env.linnut_db.prepare(
          `INSERT INTO sightings (species, latin_name, location, date, image_url, notes) 
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          data.species,
          data.latin_name || null,
          data.location || null,
          data.date,
          data.image_url || null,
          data.notes || null
        ).run();

        return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
      }

      // PROTECTED: Update sighting
      if (path.match(/^\/api\/sightings\/\d+$/) && request.method === 'PUT') {
        if (!isAuthorized(request, env)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const id = path.split('/').pop();
        const data = await request.json();
        
        await env.linnut_db.prepare(
          `UPDATE sightings SET 
           species = ?, latin_name = ?, location = ?, date = ?, image_url = ?, notes = ?, updated_at = datetime('now')
           WHERE id = ?`
        ).bind(
          data.species,
          data.latin_name || null,
          data.location || null,
          data.date,
          data.image_url || null,
          data.notes || null,
          id
        ).run();

        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // PROTECTED: Delete sighting
      if (path.match(/^\/api\/sightings\/\d+$/) && request.method === 'DELETE') {
        if (!isAuthorized(request, env)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const id = path.split('/').pop();
        await env.linnut_db.prepare('DELETE FROM sightings WHERE id = ?').bind(id).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // PROTECTED: Upload image
      if (path === '/api/upload' && request.method === 'POST') {
        if (!isAuthorized(request, env)) {
          return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
          return Response.json({ error: 'No file provided' }, { status: 400, headers: corsHeaders });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        
        // Upload to R2
        await env.linnut_images.put(filename, file.stream(), {
          httpMetadata: { contentType: file.type }
        });

        // Return the public URL
        const imageUrl = `https://pub-a9fe856f6ccb42b886d01627a9bf9021.r2.dev/${filename}`;
        
        return Response.json({ success: true, url: imageUrl, filename }, { headers: corsHeaders });
      }

      // 404 for everything else
      return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

    } catch (error) {
      return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
  }
};

// Simple auth check
function isAuthorized(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  
  const password = authHeader.replace('Bearer ', '');
  return password === env.LINNUT_ADMIN_PASSWORD;
}