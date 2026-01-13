// ====================
// HABITS ROUTES
// ====================

import { getAuthUser } from '../utils/jwt.js';

/**
 * Calculate current streak for a habit
 * @param {string[]} completions - Array of date strings (YYYY-MM-DD) sorted descending
 * @returns {number} Current streak count
 */
function calculateStreak(completions) {
	if (completions.length === 0) return 0;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	const todayStr = formatDate(today);
	const yesterdayStr = formatDate(yesterday);

	// Check if the most recent completion is today or yesterday
	const firstCompletion = completions[0];
	if (firstCompletion !== todayStr && firstCompletion !== yesterdayStr) {
		return 0; // Streak broken
	}

	let streak = 0;
	let expectedDate = new Date(firstCompletion + 'T00:00:00');

	for (const dateStr of completions) {
		const expectedStr = formatDate(expectedDate);

		if (dateStr === expectedStr) {
			streak++;
			expectedDate.setDate(expectedDate.getDate() - 1);
		} else if (dateStr < expectedStr) {
			// Gap found, streak ends
			break;
		}
	}

	return streak;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

/**
 * GET /api/habits
 * List all habits with completions and streaks
 */
export async function getAllHabits(request, env, corsHeaders) {
	// Require authentication
	const user = await getAuthUser(request, env);
	if (!user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	try {
		// Get weeks parameter (default 12)
		const url = new URL(request.url);
		const weeks = parseInt(url.searchParams.get('weeks') || '12', 10);
		const days = weeks * 7;

		// Calculate start date
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		const startDateStr = formatDate(startDate);

		// Get habits for this user
		const habits = await env.habits_db
			.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY sort_order ASC, id ASC')
			.bind(user.userId)
			.all();

		// Get completions for user's habits within date range
		const habitIds = habits.results.map((h) => h.id);
		let completions = { results: [] };
		if (habitIds.length > 0) {
			completions = await env.habits_db
				.prepare(`SELECT habit_id, completed_date FROM completions WHERE habit_id IN (${habitIds.join(',')}) AND completed_date >= ? ORDER BY completed_date DESC`)
				.bind(startDateStr)
				.all();
		}

		// Group completions by habit
		const completionsByHabit = {};
		for (const c of completions.results) {
			if (!completionsByHabit[c.habit_id]) {
				completionsByHabit[c.habit_id] = [];
			}
			completionsByHabit[c.habit_id].push(c.completed_date);
		}

		// Build response with habits, completions, and streaks
		const habitsWithData = habits.results.map((habit) => {
			const habitCompletions = completionsByHabit[habit.id] || [];
			return {
				id: habit.id,
				name: habit.name,
				description: habit.description,
				sort_order: habit.sort_order,
				type: habit.type || 'daily',
				completions: habitCompletions,
				streak: calculateStreak(habitCompletions),
				total_count: habitCompletions.length,
			};
		});

		return Response.json({ habits: habitsWithData }, { headers: corsHeaders });
	} catch (e) {
		console.error('Error fetching habits:', e);
		return Response.json({ error: 'Failed to fetch habits' }, { status: 500, headers: corsHeaders });
	}
}

/**
 * POST /api/habits
 * Create a new habit
 */
export async function createHabit(request, env, corsHeaders) {
	const user = await getAuthUser(request, env);
	if (!user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	try {
		const { name, description, type } = await request.json();

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return Response.json({ error: 'Name is required' }, { status: 400, headers: corsHeaders });
		}

		if (name.length > 100) {
			return Response.json({ error: 'Name must be 100 characters or less' }, { status: 400, headers: corsHeaders });
		}

		// Validate type
		const habitType = type === 'occasional' ? 'occasional' : 'daily';

		// Get max sort_order for this user
		const maxOrder = await env.habits_db
			.prepare('SELECT MAX(sort_order) as max_order FROM habits WHERE user_id = ?')
			.bind(user.userId)
			.first();
		const sortOrder = (maxOrder?.max_order || 0) + 1;

		const result = await env.habits_db
			.prepare('INSERT INTO habits (name, description, sort_order, user_id, type) VALUES (?, ?, ?, ?, ?)')
			.bind(name.trim(), description?.trim() || null, sortOrder, user.userId, habitType)
			.run();

		return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
	} catch (e) {
		console.error('Error creating habit:', e);
		return Response.json({ error: 'Failed to create habit' }, { status: 500, headers: corsHeaders });
	}
}

/**
 * PUT /api/habits/:id
 * Update a habit
 */
export async function updateHabit(id, request, env, corsHeaders) {
	const user = await getAuthUser(request, env);
	if (!user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	try {
		const { name, description, sort_order, type } = await request.json();

		// Check habit exists and belongs to user
		const habit = await env.habits_db
			.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
			.bind(id, user.userId)
			.first();
		if (!habit) {
			return Response.json({ error: 'Habit not found' }, { status: 404, headers: corsHeaders });
		}

		// Build update query
		const updates = [];
		const values = [];

		if (name !== undefined) {
			if (typeof name !== 'string' || name.trim().length === 0) {
				return Response.json({ error: 'Name cannot be empty' }, { status: 400, headers: corsHeaders });
			}
			if (name.length > 100) {
				return Response.json({ error: 'Name must be 100 characters or less' }, { status: 400, headers: corsHeaders });
			}
			updates.push('name = ?');
			values.push(name.trim());
		}

		if (description !== undefined) {
			updates.push('description = ?');
			values.push(description?.trim() || null);
		}

		if (sort_order !== undefined) {
			updates.push('sort_order = ?');
			values.push(sort_order);
		}

		if (type !== undefined) {
			const habitType = type === 'occasional' ? 'occasional' : 'daily';
			updates.push('type = ?');
			values.push(habitType);
		}

		if (updates.length === 0) {
			return Response.json({ error: 'No fields to update' }, { status: 400, headers: corsHeaders });
		}

		values.push(id);
		await env.habits_db.prepare(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

		return Response.json({ success: true }, { headers: corsHeaders });
	} catch (e) {
		console.error('Error updating habit:', e);
		return Response.json({ error: 'Failed to update habit' }, { status: 500, headers: corsHeaders });
	}
}

/**
 * DELETE /api/habits/:id
 * Delete a habit and all its completions
 */
export async function deleteHabit(id, request, env, corsHeaders) {
	const user = await getAuthUser(request, env);
	if (!user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	try {
		// Check habit exists and belongs to user
		const habit = await env.habits_db
			.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
			.bind(id, user.userId)
			.first();
		if (!habit) {
			return Response.json({ error: 'Habit not found' }, { status: 404, headers: corsHeaders });
		}

		// Delete completions first (foreign key)
		await env.habits_db.prepare('DELETE FROM completions WHERE habit_id = ?').bind(id).run();

		// Delete habit
		await env.habits_db.prepare('DELETE FROM habits WHERE id = ?').bind(id).run();

		return Response.json({ success: true }, { headers: corsHeaders });
	} catch (e) {
		console.error('Error deleting habit:', e);
		return Response.json({ error: 'Failed to delete habit' }, { status: 500, headers: corsHeaders });
	}
}

/**
 * POST /api/habits/:id/toggle
 * Toggle completion for a specific date
 */
export async function toggleCompletion(id, request, env, corsHeaders) {
	const user = await getAuthUser(request, env);
	if (!user) {
		return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
	}

	try {
		const { date } = await request.json();

		// Validate date format (YYYY-MM-DD)
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return Response.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400, headers: corsHeaders });
		}

		// Don't allow future dates
		const today = formatDate(new Date());
		if (date > today) {
			return Response.json({ error: 'Cannot mark future dates as complete' }, { status: 400, headers: corsHeaders });
		}

		// Check habit exists and belongs to user
		const habit = await env.habits_db
			.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?')
			.bind(id, user.userId)
			.first();
		if (!habit) {
			return Response.json({ error: 'Habit not found' }, { status: 404, headers: corsHeaders });
		}

		// Check if completion exists
		const existing = await env.habits_db
			.prepare('SELECT * FROM completions WHERE habit_id = ? AND completed_date = ?')
			.bind(id, date)
			.first();

		if (existing) {
			// Delete completion
			await env.habits_db.prepare('DELETE FROM completions WHERE habit_id = ? AND completed_date = ?').bind(id, date).run();
			return Response.json({ success: true, completed: false }, { headers: corsHeaders });
		} else {
			// Insert completion
			await env.habits_db.prepare('INSERT INTO completions (habit_id, completed_date) VALUES (?, ?)').bind(id, date).run();
			return Response.json({ success: true, completed: true }, { headers: corsHeaders });
		}
	} catch (e) {
		console.error('Error toggling completion:', e);
		return Response.json({ error: 'Failed to toggle completion' }, { status: 500, headers: corsHeaders });
	}
}
