// ============================================================
// NutriScan AI — API Routes: Assessment
// ============================================================

import { Hono } from 'hono';
import type { Bindings, ChildProfile } from '../types/index.js';
import {
  assessMalnutrition,
  calculateWHZ,
  calculateHAZ,
  calculateBMI
} from '../lib/assessment.js';
import { generateDietPlan } from '../lib/dietplan.js';

const assessmentRoutes = new Hono<{ Bindings: Bindings }>();

// POST /api/assess — Full assessment + diet plan
assessmentRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json() as ChildProfile;

    // Validate required fields
    const required = ['name', 'age_months', 'gender', 'weight_kg', 'height_cm', 'muac_cm'];
    for (const field of required) {
      if (body[field as keyof ChildProfile] === undefined || body[field as keyof ChildProfile] === '') {
        return c.json({ error: `Missing required field: ${field}` }, 400);
      }
    }

    // Validate ranges
    if (body.age_months < 0 || body.age_months > 60) {
      return c.json({ error: 'Age must be between 0 and 60 months' }, 400);
    }
    if (body.weight_kg < 1 || body.weight_kg > 30) {
      return c.json({ error: 'Weight must be between 1 and 30 kg' }, 400);
    }
    if (body.height_cm < 30 || body.height_cm > 130) {
      return c.json({ error: 'Height must be between 30 and 130 cm' }, 400);
    }
    if (body.muac_cm < 5 || body.muac_cm > 30) {
      return c.json({ error: 'MUAC must be between 5 and 30 cm' }, 400);
    }

    // Generate unique IDs
    const childId = `CHD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    body.id = childId;

    // Run assessment
    const assessment = assessMalnutrition(body);
    
    // Generate diet plan
    const dietPlan = generateDietPlan(body, assessment.nutrition_status);
    
    const dietSummary = `${assessment.nutrition_status} — ${dietPlan.daily_calories} kcal/day — ${dietPlan.duration_weeks} weeks`;

    // Store in D1 if available
    if (c.env.DB) {
      try {
        // Insert child record
        await c.env.DB.prepare(`
          INSERT OR REPLACE INTO children (id, name, age_months, gender, guardian_name, guardian_contact, location, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          childId,
          body.name,
          body.age_months,
          body.gender,
          body.guardian_name || null,
          body.guardian_contact || null,
          body.location || null
        ).run();

        // Insert assessment
        await c.env.DB.prepare(`
          INSERT INTO assessments (
            id, child_id, weight_kg, height_cm, muac_cm, recent_illness,
            mother_bmi, diet_diversity_score, nutrition_status, confidence,
            weight_for_height_z, height_for_age_z, bmi, calorie_estimate,
            risk_factors, clinical_notes, diet_summary, image_data, assessed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          assessment.id,
          childId,
          body.weight_kg,
          body.height_cm,
          body.muac_cm,
          body.recent_illness ? 1 : 0,
          body.mother_bmi || null,
          body.diet_diversity_score || null,
          assessment.nutrition_status,
          assessment.confidence,
          assessment.weight_for_height_z,
          assessment.height_for_age_z,
          assessment.bmi,
          assessment.calorie_estimate,
          JSON.stringify(assessment.risk_factors),
          assessment.clinical_notes,
          dietSummary,
          body.image_base64 ? body.image_base64.substring(0, 500) : null
        ).run();

        // Insert diet plan
        const planId = `PLAN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        await c.env.DB.prepare(`
          INSERT INTO diet_plans (id, assessment_id, child_id, daily_calories, duration_weeks, plan_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          planId,
          assessment.id,
          childId,
          dietPlan.daily_calories,
          dietPlan.duration_weeks,
          JSON.stringify(dietPlan)
        ).run();
      } catch (dbErr) {
        console.error('DB write error (non-fatal):', dbErr);
      }
    }

    return c.json({
      success: true,
      child: {
        id: childId,
        name: body.name,
        age_months: body.age_months,
        gender: body.gender,
      },
      assessment,
      diet_plan: dietPlan,
      generated_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Assessment failed', details: message }, 500);
  }
});

// GET /api/assess/history — Paginated assessment history
assessmentRoutes.get('/history', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ records: [], total: 0, message: 'Database not configured' });
    }

    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const status = c.req.query('status') || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.id, a.child_id, c.name, c.age_months, c.gender,
        a.weight_kg, a.height_cm, a.muac_cm, a.nutrition_status,
        a.confidence, a.bmi, a.weight_for_height_z, a.height_for_age_z,
        a.diet_summary, c.guardian_name, c.location, a.assessed_at
      FROM assessments a
      LEFT JOIN children c ON a.child_id = c.id
    `;
    const params: (string | number)[] = [];
    
    if (status && ['Normal', 'MAM', 'SAM'].includes(status)) {
      query += ` WHERE a.nutrition_status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY a.assessed_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const countQuery = status
      ? `SELECT COUNT(*) as total FROM assessments WHERE nutrition_status = ?`
      : `SELECT COUNT(*) as total FROM assessments`;

    const [records, countResult] = await Promise.all([
      c.env.DB.prepare(query).bind(...params).all(),
      status
        ? c.env.DB.prepare(countQuery).bind(status).first<{ total: number }>()
        : c.env.DB.prepare(countQuery).first<{ total: number }>(),
    ]);

    return c.json({
      records: records.results,
      total: countResult?.total || 0,
      page,
      limit,
      pages: Math.ceil((countResult?.total || 0) / limit),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch history', details: message }, 500);
  }
});

// GET /api/assess/:id — Single assessment details
assessmentRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    if (!c.env.DB) {
      return c.json({ error: 'Database not configured' }, 503);
    }

    const assessment = await c.env.DB.prepare(`
      SELECT a.*, c.name, c.age_months, c.gender, c.guardian_name, c.guardian_contact, c.location
      FROM assessments a
      LEFT JOIN children c ON a.child_id = c.id
      WHERE a.id = ?
    `).bind(id).first();

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    const dietPlan = await c.env.DB.prepare(`
      SELECT plan_json FROM diet_plans WHERE assessment_id = ?
    `).bind(id).first<{ plan_json: string }>();

    return c.json({
      assessment,
      diet_plan: dietPlan ? JSON.parse(dietPlan.plan_json) : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch assessment', details: message }, 500);
  }
});

// GET /api/assess/stats/summary — Dashboard statistics
assessmentRoutes.get('/stats/summary', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({
        total: 0,
        normal: 0,
        mam: 0,
        sam: 0,
        avg_confidence: 0,
        recent_7_days: 0,
      });
    }

    const [total, byStatus, avgConf, recent] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM assessments').first<{ count: number }>(),
      c.env.DB.prepare(`
        SELECT nutrition_status, COUNT(*) as count 
        FROM assessments 
        GROUP BY nutrition_status
      `).all<{ nutrition_status: string; count: number }>(),
      c.env.DB.prepare('SELECT AVG(confidence) as avg FROM assessments').first<{ avg: number }>(),
      c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM assessments 
        WHERE assessed_at >= datetime('now', '-7 days')
      `).first<{ count: number }>(),
    ]);

    const statusMap: Record<string, number> = { Normal: 0, MAM: 0, SAM: 0 };
    (byStatus.results || []).forEach((r) => {
      statusMap[r.nutrition_status] = r.count;
    });

    return c.json({
      total: total?.count || 0,
      normal: statusMap['Normal'],
      mam: statusMap['MAM'],
      sam: statusMap['SAM'],
      avg_confidence: parseFloat((avgConf?.avg || 0).toFixed(1)),
      recent_7_days: recent?.count || 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Stats failed', details: message }, 500);
  }
});

export default assessmentRoutes;
