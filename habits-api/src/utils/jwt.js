// ====================
// JWT AUTHENTICATION HELPERS
// ====================

// Generate JWT token with expiration
export async function generateJWT(payload, secret, expiresInHours = 24) {
	const header = { alg: 'HS256', typ: 'JWT' };
	const now = Math.floor(Date.now() / 1000);

	const jwtPayload = {
		...payload,
		iat: now,
		exp: now + expiresInHours * 3600,
	};

	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
	const signatureInput = `${encodedHeader}.${encodedPayload}`;

	const signature = await signHmacSha256(signatureInput, secret);
	const encodedSignature = base64UrlEncode(signature);

	return `${signatureInput}.${encodedSignature}`;
}

// Verify JWT token
export async function verifyJWT(token, secret) {
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

// Check if request is authorized and return user info
export async function getAuthUser(request, env) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader) return null;

	const token = authHeader.replace('Bearer ', '');
	const payload = await verifyJWT(token, env.USER_PETTERI_PASSWORD);

	if (!payload || payload.role !== 'admin') return null;

	return { userId: payload.userId, name: payload.name };
}

// Check if request is authorized (backwards compatible)
export async function isAuthorized(request, env) {
	const user = await getAuthUser(request, env);
	return user !== null;
}

// HMAC SHA-256 signing
async function signHmacSha256(data, secret) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);

	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));

	return new Uint8Array(signature);
}

// Base64 URL encoding
function base64UrlEncode(data) {
	if (data instanceof Uint8Array) {
		let binary = '';
		for (let i = 0; i < data.length; i++) {
			binary += String.fromCharCode(data[i]);
		}
		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
	} else {
		return btoa(unescape(encodeURIComponent(data))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
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
