// ============================================================
// NutriScan AI — Export Routes (CSV/Excel Data Export)
// ============================================================

import { Hono } from 'hono';
import type { Bindings } from '../types/index.js';

const exportRoutes = new Hono<{ Bindings: Bindings }>();

// Generate CSV content
function generateCSV(records: Record<string, unknown>[]): string {
  if (!records.length) return 'No data available';
  
  const headers = [
    'Child ID', 'Child Name', 'Age (Months)', 'Gender',
    'Weight (kg)', 'Height (cm)', 'MUAC (cm)', 'BMI',
    'WHZ Score', 'HAZ Score', 'Nutrition Status', 'Confidence (%)',
    'Calorie Estimate (kcal)', 'Diet Summary', 'Guardian Name',
    'Location', 'Assessment Date', 'Recent Illness'
  ];
  
  const rows = records.map(r => [
    `"${r.child_id || ''}"`,
    `"${r.name || ''}"`,
    r.age_months || '',
    `"${r.gender || ''}"`,
    r.weight_kg || '',
    r.height_cm || '',
    r.muac_cm || '',
    r.bmi || '',
    r.weight_for_height_z || '',
    r.height_for_age_z || '',
    `"${r.nutrition_status || ''}"`,
    r.confidence || '',
    r.calorie_estimate || '',
    `"${(r.diet_summary as string || '').replace(/"/g, "'")}"`,
    `"${r.guardian_name || ''}"`,
    `"${r.location || ''}"`,
    `"${r.assessed_at || ''}"`,
    r.recent_illness ? 'Yes' : 'No'
  ].join(','));
  
  return [headers.join(','), ...rows].join('\n');
}

// Generate TSV for Excel compatibility (with BOM for proper encoding)
function generateExcelCSV(records: Record<string, unknown>[]): string {
  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  
  const headers = [
    'Child ID', 'Child Name', 'Age (Months)', 'Gender',
    'Weight (kg)', 'Height (cm)', 'MUAC (cm)', 'BMI',
    'WHZ Score', 'HAZ Score', 'Nutrition Status', 'Confidence (%)',
    'Calorie Estimate (kcal/day)', 'Diet Plan Summary', 'Guardian Name',
    'Contact', 'Location', 'Assessment Date', 'Recent Illness',
    'Clinical Notes'
  ];

  const escapeCSV = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  const rows = records.map(r => [
    r.child_id,
    r.name,
    r.age_months,
    r.gender,
    r.weight_kg,
    r.height_cm,
    r.muac_cm,
    r.bmi,
    r.weight_for_height_z,
    r.height_for_age_z,
    r.nutrition_status,
    r.confidence,
    r.calorie_estimate,
    r.diet_summary,
    r.guardian_name,
    r.guardian_contact,
    r.location,
    r.assessed_at,
    (r.recent_illness as number) ? 'Yes' : 'No',
    r.clinical_notes
  ].map(escapeCSV).join(','));
  
  return BOM + [headers.join(','), ...rows].join('\r\n');
}

// GET /api/export/csv — Export all records as CSV
exportRoutes.get('/csv', async (c) => {
  try {
    if (!c.env.DB) {
      const demoData = generateDemoCSV();
      return new Response(demoData, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="nutriscan_demo_${Date.now()}.csv"`,
        },
      });
    }

    const result = await c.env.DB.prepare(`
      SELECT 
        a.id, a.child_id, c.name, c.age_months, c.gender,
        a.weight_kg, a.height_cm, a.muac_cm, a.bmi,
        a.weight_for_height_z, a.height_for_age_z,
        a.nutrition_status, a.confidence, a.calorie_estimate,
        a.diet_summary, c.guardian_name, c.guardian_contact, c.location,
        a.assessed_at, a.recent_illness, a.clinical_notes
      FROM assessments a
      LEFT JOIN children c ON a.child_id = c.id
      ORDER BY a.assessed_at DESC
      LIMIT 5000
    `).all();

    const csv = generateExcelCSV(result.results as Record<string, unknown>[]);
    const filename = `nutriscan_records_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Export failed', details: message }, 500);
  }
});

// GET /api/export/summary — Export summary statistics as JSON
exportRoutes.get('/summary', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({
        export_date: new Date().toISOString(),
        total_assessments: 0,
        by_status: { Normal: 0, MAM: 0, SAM: 0 },
        message: 'Database not configured'
      });
    }

    const [total, byStatus, byGender, byAge] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as count FROM assessments').first<{ count: number }>(),
      c.env.DB.prepare(`SELECT nutrition_status, COUNT(*) as count FROM assessments GROUP BY nutrition_status`).all<{ nutrition_status: string; count: number }>(),
      c.env.DB.prepare(`SELECT c.gender, COUNT(*) as count FROM assessments a LEFT JOIN children c ON a.child_id = c.id GROUP BY c.gender`).all<{ gender: string; count: number }>(),
      c.env.DB.prepare(`
        SELECT 
          CASE 
            WHEN c.age_months < 6 THEN '0-5 months'
            WHEN c.age_months < 12 THEN '6-11 months'
            WHEN c.age_months < 24 THEN '12-23 months'
            WHEN c.age_months < 36 THEN '24-35 months'
            WHEN c.age_months < 48 THEN '36-47 months'
            ELSE '48-60 months'
          END as age_group,
          COUNT(*) as count
        FROM assessments a LEFT JOIN children c ON a.child_id = c.id
        GROUP BY age_group ORDER BY age_group
      `).all<{ age_group: string; count: number }>(),
    ]);

    const statusMap: Record<string, number> = { Normal: 0, MAM: 0, SAM: 0 };
    (byStatus.results || []).forEach(r => { statusMap[r.nutrition_status] = r.count; });
    
    const genderMap: Record<string, number> = { male: 0, female: 0 };
    (byGender.results || []).forEach(r => { if (r.gender) genderMap[r.gender] = r.count; });

    return c.json({
      export_date: new Date().toISOString(),
      total_assessments: total?.count || 0,
      by_status: statusMap,
      by_gender: genderMap,
      by_age_group: byAge.results || [],
      malnutrition_rate: total?.count
        ? parseFloat(((((statusMap.MAM || 0) + (statusMap.SAM || 0)) / total.count) * 100).toFixed(1))
        : 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: 'Summary failed', details: message }, 500);
  }
});

function generateDemoCSV(): string {
  const BOM = '\uFEFF';
  const headers = 'Child ID,Child Name,Age (Months),Gender,Weight (kg),Height (cm),MUAC (cm),BMI,WHZ Score,HAZ Score,Nutrition Status,Confidence (%),Calorie Estimate,Diet Summary,Assessment Date\r\n';
  const rows = [
    'CHD-DEMO-001,"Amara Diallo",24,female,8.5,78.2,12.8,13.95,-1.84,-1.23,MAM,78.4,980,"MAM — 980 kcal/day — 12 weeks",2025-01-15',
    'CHD-DEMO-002,"Kofi Mensah",36,male,12.1,88.9,14.2,15.30,-0.52,-0.78,Normal,89.2,1080,"Normal — 1080 kcal/day — 4 weeks",2025-01-16',
    'CHD-DEMO-003,"Fatima Ndiaye",18,female,6.2,71.5,10.9,12.12,-3.21,-2.14,SAM,91.5,840,"SAM — 840 kcal/day — 8 weeks",2025-01-17',
    'CHD-DEMO-004,"Ibrahim Toure",48,male,14.5,98.3,15.1,15.00,0.31,-0.45,Normal,93.1,1180,"Normal — 1180 kcal/day — 4 weeks",2025-01-18',
    'CHD-DEMO-005,"Aisha Kamara",30,female,9.8,82.4,11.8,14.44,-1.12,-1.67,MAM,75.8,950,"MAM — 950 kcal/day — 12 weeks",2025-01-19',
  ];
  return BOM + headers + rows.join('\r\n');
}

export default exportRoutes;
