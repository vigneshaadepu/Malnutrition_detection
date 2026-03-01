// ============================================================
// NutriScan AI — PDF Report Generator (Server-side)
// Uses pure JavaScript/HTML to generate printable PDF reports
// ============================================================

import { Hono } from 'hono';
import type { Bindings } from '../types/index.js';
import type { ChildProfile, AssessmentResult, DietPlan } from '../types/index.js';
import { assessMalnutrition } from '../lib/assessment.js';
import { generateDietPlan } from '../lib/dietplan.js';

const reportRoutes = new Hono<{ Bindings: Bindings }>();

function getStatusColor(status: string): string {
  if (status === 'SAM') return '#dc2626';
  if (status === 'MAM') return '#d97706';
  return '#16a34a';
}

function getStatusBg(status: string): string {
  if (status === 'SAM') return '#fef2f2';
  if (status === 'MAM') return '#fffbeb';
  return '#f0fdf4';
}

function buildReportHTML(
  child: ChildProfile,
  assessment: AssessmentResult,
  dietPlan: DietPlan,
  generatedAt: string
): string {
  const statusColor = getStatusColor(assessment.nutrition_status);
  const statusBg = getStatusBg(assessment.nutrition_status);
  const reportId = `NSA-${Date.now().toString(36).toUpperCase()}`;

  const mealsHTML = dietPlan.meals
    .map(
      (meal) => `
    <div class="meal-card">
      <div class="meal-header">
        <span class="meal-icon">${getMealIcon(meal.meal_type)}</span>
        <div>
          <strong>${meal.meal_type}</strong>
          <span class="meal-time">${meal.time}</span>
        </div>
        <span class="meal-cal">${meal.calories} kcal</span>
      </div>
      <table class="food-table">
        <thead>
          <tr><th>Food Item</th><th>Quantity</th><th>Calories</th><th>Protein</th><th>Key Nutrients</th></tr>
        </thead>
        <tbody>
          ${meal.foods.map(f => `
            <tr>
              <td>${f.name}</td>
              <td>${f.quantity}</td>
              <td>${f.calories} kcal</td>
              <td>${f.protein_g}g</td>
              <td>${f.key_nutrients.join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="meal-note">📌 ${meal.notes}</p>
    </div>
  `
    )
    .join('');

  const riskFactorsHTML = assessment.risk_factors.length
    ? assessment.risk_factors.map(r => `<li>⚠️ ${r}</li>`).join('')
    : '<li>✅ No significant risk factors identified</li>';

  const supplementsHTML = dietPlan.supplements.map(s => `<li>💊 ${s}</li>`).join('');
  const avoidHTML = dietPlan.foods_to_avoid.slice(0, 6).map(f => `<li>🚫 ${f}</li>`).join('');
  const monitoringHTML = dietPlan.monitoring.map(m => `<li>📋 ${m}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NutriScan AI — Health Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 12px; }
    .page { max-width: 800px; margin: 0 auto; padding: 24px; }
    
    /* Header */
    .report-header { display: flex; justify-content: space-between; align-items: flex-start; 
      border-bottom: 3px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 50px; height: 50px; background: linear-gradient(135deg, #0ea5e9, #6366f1);
      border-radius: 12px; display: flex; align-items: center; justify-content: center; 
      color: white; font-size: 22px; }
    .brand-name { font-size: 22px; font-weight: 700; color: #0ea5e9; }
    .brand-sub { font-size: 10px; color: #64748b; }
    .report-meta { text-align: right; }
    .report-id { font-size: 11px; font-weight: 700; color: #0ea5e9; }
    .report-date { font-size: 10px; color: #64748b; margin-top: 2px; }
    .disclaimer { font-size: 9px; color: #ef4444; margin-top: 4px; font-style: italic; }
    
    /* Status Badge */
    .status-banner { background: ${statusBg}; border: 2px solid ${statusColor}; 
      border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px; }
    .status-icon { font-size: 36px; }
    .status-text h2 { font-size: 20px; color: ${statusColor}; font-weight: 700; }
    .status-text p { font-size: 11px; color: #64748b; margin-top: 4px; }
    .confidence-bar { margin-left: auto; text-align: center; }
    .conf-value { font-size: 24px; font-weight: 700; color: ${statusColor}; }
    .conf-label { font-size: 9px; color: #64748b; }
    
    /* Child Info */
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #1e293b; 
      border-left: 4px solid #0ea5e9; padding-left: 8px; margin-bottom: 12px; 
      text-transform: uppercase; letter-spacing: 0.5px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
    .info-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 2px; }
    .info-unit { font-size: 10px; color: #64748b; }
    
    /* Z-Scores */
    .zscore-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .zscore-card { border-radius: 8px; padding: 10px; text-align: center; }
    .zscore-normal { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .zscore-warning { background: #fffbeb; border: 1px solid #fde68a; }
    .zscore-danger { background: #fef2f2; border: 1px solid #fecaca; }
    .zscore-value { font-size: 20px; font-weight: 700; }
    .zscore-label { font-size: 9px; color: #64748b; }
    
    /* Risk Factors */
    .risk-list { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .risk-list li { font-size: 11px; background: #fff7ed; border: 1px solid #fed7aa; 
      border-radius: 6px; padding: 6px 8px; }
    
    /* Clinical Notes */
    .clinical-box { background: #f0f9ff; border-left: 4px solid #0ea5e9; 
      padding: 12px; border-radius: 0 8px 8px 0; font-size: 11px; line-height: 1.6; }
    
    /* Diet Plan */
    .meal-card { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
    .meal-header { display: flex; align-items: center; gap: 10px; padding: 10px 12px; 
      background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
    .meal-icon { font-size: 18px; }
    .meal-time { font-size: 10px; color: #64748b; margin-left: 6px; }
    .meal-cal { margin-left: auto; font-weight: 700; color: #0ea5e9; font-size: 12px; }
    .food-table { width: 100%; border-collapse: collapse; font-size: 10px; }
    .food-table th { background: #0ea5e9; color: white; padding: 5px 8px; text-align: left; }
    .food-table td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
    .food-table tr:nth-child(even) td { background: #f8fafc; }
    .meal-note { font-size: 10px; color: #64748b; padding: 8px 12px; font-style: italic; }
    
    /* Diet Summary */
    .diet-summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .diet-stat { text-align: center; background: linear-gradient(135deg, #0ea5e9, #6366f1); 
      border-radius: 8px; padding: 12px; color: white; }
    .diet-stat-value { font-size: 20px; font-weight: 700; }
    .diet-stat-label { font-size: 9px; opacity: 0.9; }
    
    /* Supplement & Avoid Lists */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .list-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .list-box ul { list-style: none; }
    .list-box li { font-size: 10px; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    
    /* Footer */
    .report-footer { margin-top: 24px; padding-top: 16px; border-top: 2px solid #e2e8f0; 
      display: flex; justify-content: space-between; align-items: center; }
    .footer-text { font-size: 9px; color: #64748b; }
    .who-ref { font-size: 9px; color: #0ea5e9; font-style: italic; }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="report-header">
      <div class="brand">
        <div class="brand-logo">🔬</div>
        <div>
          <div class="brand-name">NutriScan AI</div>
          <div class="brand-sub">AI-Powered Early Malnutrition Detection System</div>
          <div class="brand-sub">Powered by WHO Child Growth Standards</div>
        </div>
      </div>
      <div class="report-meta">
        <div class="report-id">Report ID: ${reportId}</div>
        <div class="report-date">Generated: ${new Date(generatedAt).toLocaleString()}</div>
        <div class="disclaimer">⚕️ For clinical reference only. Consult a qualified healthcare provider.</div>
      </div>
    </div>
    
    <!-- Status Banner -->
    <div class="status-banner">
      <div class="status-icon">${assessment.nutrition_status === 'SAM' ? '🚨' : assessment.nutrition_status === 'MAM' ? '⚠️' : '✅'}</div>
      <div class="status-text">
        <h2>${assessment.nutrition_status === 'SAM' ? 'SEVERE ACUTE MALNUTRITION (SAM)' : assessment.nutrition_status === 'MAM' ? 'MODERATE ACUTE MALNUTRITION (MAM)' : 'NORMAL NUTRITIONAL STATUS'}</h2>
        <p>${assessment.nutrition_status === 'SAM' ? 'Immediate therapeutic intervention required. Refer to CMAM program.' : assessment.nutrition_status === 'MAM' ? 'Supplementary feeding programme recommended. Monthly follow-up required.' : 'Maintain balanced diet. Regular monitoring advised every 3 months.'}</p>
      </div>
      <div class="confidence-bar">
        <div class="conf-value">${assessment.confidence}%</div>
        <div class="conf-label">Confidence Score</div>
      </div>
    </div>
    
    <!-- Child Information -->
    <div class="section">
      <div class="section-title">👶 Child Information</div>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Child Name</div>
          <div class="info-value" style="font-size:14px">${child.name}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Age</div>
          <div class="info-value">${child.age_months}<span class="info-unit"> months</span></div>
        </div>
        <div class="info-card">
          <div class="info-label">Gender</div>
          <div class="info-value">${child.gender === 'male' ? '♂ Male' : '♀ Female'}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Guardian</div>
          <div class="info-value" style="font-size:13px">${child.guardian_name || 'N/A'}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Location</div>
          <div class="info-value" style="font-size:13px">${child.location || 'N/A'}</div>
        </div>
        <div class="info-card">
          <div class="info-label">Assessment Date</div>
          <div class="info-value" style="font-size:12px">${new Date(assessment.timestamp).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
    
    <!-- Anthropometric Measurements -->
    <div class="section">
      <div class="section-title">📏 Anthropometric Measurements</div>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-label">Weight</div>
          <div class="info-value">${child.weight_kg}<span class="info-unit"> kg</span></div>
        </div>
        <div class="info-card">
          <div class="info-label">Height</div>
          <div class="info-value">${child.height_cm}<span class="info-unit"> cm</span></div>
        </div>
        <div class="info-card">
          <div class="info-label">MUAC</div>
          <div class="info-value">${child.muac_cm}<span class="info-unit"> cm</span></div>
        </div>
        <div class="info-card">
          <div class="info-label">BMI</div>
          <div class="info-value">${assessment.bmi}<span class="info-unit"> kg/m²</span></div>
        </div>
        <div class="info-card">
          <div class="info-label">Calorie Need</div>
          <div class="info-value">${assessment.calorie_estimate}<span class="info-unit"> kcal/day</span></div>
        </div>
        <div class="info-card">
          <div class="info-label">Recent Illness</div>
          <div class="info-value">${child.recent_illness ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
    
    <!-- Z-Scores -->
    <div class="section">
      <div class="section-title">📊 WHO Z-Score Analysis</div>
      <div class="zscore-grid">
        <div class="zscore-card ${assessment.weight_for_height_z < -3 ? 'zscore-danger' : assessment.weight_for_height_z < -2 ? 'zscore-warning' : 'zscore-normal'}">
          <div class="zscore-value" style="color: ${assessment.weight_for_height_z < -2 ? statusColor : '#16a34a'}">${assessment.weight_for_height_z}</div>
          <div class="zscore-label">Weight-for-Height Z (WHZ)</div>
          <div style="font-size:9px; color:#64748b">${assessment.weight_for_height_z < -3 ? '🔴 Severe Wasting' : assessment.weight_for_height_z < -2 ? '🟡 Moderate Wasting' : '🟢 Normal'}</div>
        </div>
        <div class="zscore-card ${assessment.height_for_age_z < -3 ? 'zscore-danger' : assessment.height_for_age_z < -2 ? 'zscore-warning' : 'zscore-normal'}">
          <div class="zscore-value" style="color: ${assessment.height_for_age_z < -2 ? '#d97706' : '#16a34a'}">${assessment.height_for_age_z}</div>
          <div class="zscore-label">Height-for-Age Z (HAZ)</div>
          <div style="font-size:9px; color:#64748b">${assessment.height_for_age_z < -3 ? '🔴 Severe Stunting' : assessment.height_for_age_z < -2 ? '🟡 Moderate Stunting' : '🟢 Normal'}</div>
        </div>
        <div class="zscore-card ${assessment.bmi < 13 ? 'zscore-danger' : assessment.bmi < 15 ? 'zscore-warning' : 'zscore-normal'}">
          <div class="zscore-value" style="color: ${assessment.bmi < 15 ? statusColor : '#16a34a'}">${assessment.bmi}</div>
          <div class="zscore-label">BMI (kg/m²)</div>
          <div style="font-size:9px; color:#64748b">${assessment.bmi < 13 ? '🔴 Critically Low' : assessment.bmi < 15 ? '🟡 Low' : '🟢 Acceptable'}</div>
        </div>
      </div>
    </div>
    
    <!-- Risk Factors -->
    ${assessment.risk_factors.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Risk Factors Identified</div>
      <ul class="risk-list">${riskFactorsHTML}</ul>
    </div>
    ` : ''}
    
    <!-- Clinical Notes -->
    <div class="section">
      <div class="section-title">🏥 Clinical Assessment Notes</div>
      <div class="clinical-box">${assessment.clinical_notes}</div>
    </div>
    
    <!-- Diet Plan -->
    <div class="section">
      <div class="section-title">🥗 Personalized Diet Plan</div>
      <div class="diet-summary">
        <div class="diet-stat">
          <div class="diet-stat-value">${dietPlan.daily_calories}</div>
          <div class="diet-stat-label">Total Daily Calories (kcal)</div>
        </div>
        <div class="diet-stat">
          <div class="diet-stat-value">${dietPlan.duration_weeks}</div>
          <div class="diet-stat-label">Plan Duration (Weeks)</div>
        </div>
        <div class="diet-stat">
          <div class="diet-stat-value">${dietPlan.meals.length}</div>
          <div class="diet-stat-label">Meals Per Day</div>
        </div>
      </div>
      ${mealsHTML}
    </div>
    
    <!-- Supplements & Avoid -->
    <div class="section">
      <div class="two-col">
        <div class="list-box">
          <div class="section-title" style="font-size:11px">💊 Recommended Supplements</div>
          <ul>${supplementsHTML}</ul>
        </div>
        <div class="list-box">
          <div class="section-title" style="font-size:11px">🚫 Foods to Avoid</div>
          <ul>${avoidHTML}</ul>
        </div>
      </div>
    </div>
    
    <!-- Monitoring Plan -->
    <div class="section">
      <div class="section-title">📋 Monitoring & Follow-Up Plan</div>
      <div class="list-box">
        <ul>${monitoringHTML}</ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="report-footer">
      <div>
        <div class="footer-text">🔬 NutriScan AI — Early Malnutrition Detection System</div>
        <div class="footer-text">Report ID: ${reportId} | Generated by Automated Assessment Engine v2.0</div>
      </div>
      <div>
        <div class="who-ref">Reference: ${dietPlan.who_protocol_ref.substring(0, 80)}...</div>
        <div class="footer-text">⚕️ This report is for clinical reference only. Always consult a qualified healthcare provider.</div>
      </div>
    </div>
  </div>
  
  <script>
    // Auto-print when opened as PDF
    if (window.location.search.includes('autoprint=1')) {
      window.addEventListener('load', () => { setTimeout(() => window.print(), 500); });
    }
  </script>
</body>
</html>`;
}

function getMealIcon(mealType: string): string {
  const icons: Record<string, string> = {
    'Breakfast': '🌅',
    'Mid-Morning Snack': '🍎',
    'Lunch': '🍽️',
    'Afternoon Snack': '🥤',
    'Dinner': '🌙',
  };
  return icons[mealType] || '🍴';
}

// GET /api/report/:assessmentId — Generate HTML report
reportRoutes.get('/:assessmentId', async (c) => {
  try {
    const assessmentId = c.req.param('assessmentId');

    if (!c.env.DB) {
      return c.json({ error: 'Database not configured' }, 503);
    }

    const assessment = await c.env.DB.prepare(`
      SELECT a.*, c.name, c.age_months, c.gender, c.guardian_name, c.guardian_contact, c.location
      FROM assessments a LEFT JOIN children c ON a.child_id = c.id
      WHERE a.id = ?
    `).bind(assessmentId).first() as Record<string, unknown>;

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    const dietPlanRow = await c.env.DB.prepare(
      'SELECT plan_json FROM diet_plans WHERE assessment_id = ?'
    ).bind(assessmentId).first<{ plan_json: string }>();

    const childProfile: ChildProfile = {
      id: assessment.child_id as string,
      name: assessment.name as string,
      age_months: assessment.age_months as number,
      gender: assessment.gender as 'male' | 'female',
      weight_kg: assessment.weight_kg as number,
      height_cm: assessment.height_cm as number,
      muac_cm: assessment.muac_cm as number,
      recent_illness: !!(assessment.recent_illness as number),
      mother_bmi: assessment.mother_bmi as number | undefined,
      guardian_name: assessment.guardian_name as string | undefined,
      location: assessment.location as string | undefined,
    };

    const assessmentResult: AssessmentResult = {
      id: assessment.id as string,
      child_id: assessment.child_id as string,
      timestamp: assessment.assessed_at as string,
      nutrition_status: assessment.nutrition_status as 'Normal' | 'MAM' | 'SAM',
      confidence: assessment.confidence as number,
      weight_for_height_z: assessment.weight_for_height_z as number,
      height_for_age_z: assessment.height_for_age_z as number,
      bmi: assessment.bmi as number,
      calorie_estimate: assessment.calorie_estimate as number,
      risk_factors: JSON.parse((assessment.risk_factors as string) || '[]'),
      clinical_notes: assessment.clinical_notes as string,
    };

    const dietPlan: DietPlan = dietPlanRow
      ? JSON.parse(dietPlanRow.plan_json)
      : generateDietPlan(childProfile, assessmentResult.nutrition_status);

    const html = buildReportHTML(childProfile, assessmentResult, dietPlan, new Date().toISOString());
    return c.html(html);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Report generation failed', details: message }, 500);
  }
});

// POST /api/report/preview — Generate report from fresh data (no DB needed)
reportRoutes.post('/preview', async (c) => {
  try {
    const { child, assessment, diet_plan } = await c.req.json();
    const html = buildReportHTML(child, assessment, diet_plan, new Date().toISOString());
    return c.html(html);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Report generation failed', details: message }, 500);
  }
});

export default reportRoutes;
