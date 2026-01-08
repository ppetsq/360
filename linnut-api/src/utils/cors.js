// ====================
// CORS CONFIGURATION
// ====================

const ALLOWED_ORIGINS = [
	'https://petsq.works',
	'https://www.petsq.works',
	'https://360.petsq.works',
	'http://localhost:8080',
	'http://localhost:8000',
	'http://localhost:5500',
	'http://localhost:3000',
	'http://localhost:8787',
	'http://127.0.0.1:8080',
	'http://127.0.0.1:8000',
	'http://127.0.0.1:5500',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:8787',
];

export function getCorsHeaders(request) {
	const origin = request.headers.get('Origin');
	const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

	return {
		'Access-Control-Allow-Origin': allowedOrigin,
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		Vary: 'Origin',
	};
}

export function handlePreflight(request) {
	return new Response(null, { headers: getCorsHeaders(request) });
}
