# 🔬 NutriScan AI — Early Malnutrition Detection System

> **AI-Powered Early Malnutrition Detection & Intervention System for Children (0–60 months)**  
> Built on WHO Child Growth Standards | Cloudflare Pages + Hono + D1

---

## 🎯 Project Overview

**NutriScan AI** is a production-ready, full-stack web application that automates the detection and classification of child malnutrition using WHO-compliant assessment algorithms. The system generates personalized diet plans, professional PDF health reports, and supports data export for field health workers.

### Key Goals
- **Early Detection**: Identify SAM/MAM before severe complications develop
- **WHO Compliance**: All assessments follow WHO Child Growth Standards (Z-score methodology)
- **Actionable Output**: Personalized diet plans for each nutrition status level
- **Field-Ready**: Works on any device, low-bandwidth friendly

---

## ✅ Completed Features

### 🧠 AI Assessment Engine
- **WHO Z-Score Analysis**: WHZ (wasting), HAZ (stunting), WAZ (underweight)
- **MUAC Classification**: WHO colour-coded MUAC system (red/yellow/green)
- **Risk Factor Extraction**: Multi-variable risk scoring from 7 clinical indicators
- **Confidence Scoring**: Statistical confidence for each assessment
- **Calorie Estimation**: WHO/FAO estimated energy requirements (EER) per age group

### 📊 Nutritional Status Classification
| Status | WHZ Criteria | MUAC Criteria | Action Required |
|--------|-------------|---------------|-----------------|
| **SAM** | < -3 SD | < 11.5 cm | Immediate RUTF therapy + CMAM |
| **MAM** | -3 to -2 SD | 11.5–12.5 cm | TSFP supplementary feeding |
| **Normal** | ≥ -2 SD | ≥ 12.5 cm | Preventive nutrition counselling |

### 🥗 Personalized Diet Plans
- 5-meal daily plan (breakfast, snacks, lunch, dinner)
- Age-appropriate food choices (0-6m, 6-12m, 12-24m, 24-60m)
- Protocol-specific foods:
  - **SAM**: RUTF (Ready-to-Use Therapeutic Food) based
  - **MAM**: CSB+ (Corn-Soy Blend Plus) supplementation
  - **Normal**: Balanced complementary feeding
- Supplement recommendations per WHO guidelines
- Foods-to-avoid list
- Monitoring and follow-up schedule

### 📷 Image Capture
- Webcam capture (live camera)
- File upload (JPG/PNG)
- Image stored with assessment record

### 📄 PDF Report Generation
- Auto-generated HTML-based printable reports
- Includes: child info, Z-scores, clinical notes, full diet plan
- Professional medical formatting
- Report ID and generation timestamp
- Print/Save as PDF from browser

### 📈 Data Export
- **CSV/Excel export** with UTF-8 BOM (Excel-compatible)
- All assessment fields included
- One-click download from UI

### 💾 Database
- **Cloudflare D1** (SQLite) for persistent storage
- Tables: children, assessments, diet_plans
- Indexed for fast queries

### 🖥️ Dashboard
- Real-time statistics (total, SAM, MAM, Normal counts)
- Visual charts (donut + bar chart via Chart.js)
- Recent assessments table
- Quick action cards

---

## 🌐 Application URLs

| Endpoint | Description |
|----------|-------------|
| `GET /` | Main Application (SPA) |
| `GET /api/health` | Service health check |
| `POST /api/assess` | Submit malnutrition assessment |
| `GET /api/assess/history` | Paginated assessment records |
| `GET /api/assess/stats/summary` | Dashboard statistics |
| `GET /api/assess/:id` | Single assessment detail |
| `GET /api/report/:id` | Generate printable HTML report |
| `POST /api/report/preview` | Generate report from fresh data |
| `GET /api/export/csv` | Download all records as CSV |
| `GET /api/export/summary` | Export summary statistics |

---

## 📊 API Usage

### Submit Assessment
```json
POST /api/assess
{
  "name": "Amara Diallo",
  "age_months": 24,
  "gender": "female",
  "weight_kg": 8.5,
  "height_cm": 78.2,
  "muac_cm": 11.8,
  "recent_illness": true,
  "mother_bmi": 17.5,
  "diet_diversity_score": 2,
  "guardian_name": "Mariama Diallo",
  "location": "Community Health Center",
  "image_base64": "data:image/jpeg;base64,..."
}
```

**Response includes:**
- `assessment.nutrition_status`: "Normal" | "MAM" | "SAM"
- `assessment.confidence`: 0–100%
- `assessment.weight_for_height_z`: WHZ score
- `assessment.height_for_age_z`: HAZ score
- `assessment.risk_factors`: Array of identified risks
- `assessment.clinical_notes`: Clinician-ready notes
- `diet_plan`: Full 5-meal personalized plan

---

## 🏗️ Architecture

```
Frontend (SPA) → Hono Backend (Cloudflare Worker)
                      ↓
            API Routes (/api/*)
            ├── /api/assess     → Assessment Engine
            ├── /api/report     → PDF Generator
            └── /api/export     → CSV/Excel Export
                      ↓
            Cloudflare D1 (SQLite Database)
            ├── children
            ├── assessments
            └── diet_plans
```

### ML Assessment Pipeline
```
Input Measurements → WHO Z-Score Calculation
                    → Multi-variable Risk Scoring (7 indicators)
                    → Clinical Classification (SAM/MAM/Normal)
                    → Confidence Score Generation
                    → Risk Factor Extraction
                    → Clinical Notes Generation
                    → Diet Plan Selection
```

---

## 🧬 Data Models

### Child Profile
| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique child ID (CHD-xxxxx) |
| name | TEXT | Child's full name |
| age_months | INTEGER | Age in months (0–60) |
| gender | TEXT | male/female |
| guardian_name | TEXT | Parent/guardian name |
| location | TEXT | Community/village |

### Assessment
| Field | Type | Description |
|-------|------|-------------|
| weight_kg | REAL | Body weight in kg |
| height_cm | REAL | Height/length in cm |
| muac_cm | REAL | Mid-upper arm circumference |
| nutrition_status | TEXT | Normal/MAM/SAM |
| confidence | REAL | Model confidence % |
| weight_for_height_z | REAL | WHZ score |
| height_for_age_z | REAL | HAZ score |
| bmi | REAL | Body mass index |
| calorie_estimate | INTEGER | Daily calorie needs |

---

## 🚀 Deployment

### Local Development
```bash
npm install
npm run build
npm run db:migrate:local
npm run dev:sandbox
```

### Cloudflare Pages Production
```bash
# 1. Create D1 database
npx wrangler d1 create nutriscan-production

# 2. Apply migrations to production
npm run db:migrate:prod

# 3. Deploy
npm run deploy
```

---

## 🛡️ WHO Protocol References

- WHO Child Growth Standards (2006)
- WHO/UNICEF: Management of SAM in Infants and Children (2013)
- CMAM Protocol — Community-Based Management of Acute Malnutrition
- WHO IYCF (Infant & Young Child Feeding) Indicators (2021)
- WHO/FAO Estimated Energy Requirements for Children

---

## ⚕️ Health Disclaimer

> This system is designed as a **clinical decision support tool** for trained health workers. It should not replace professional medical judgment. All assessments must be reviewed by qualified healthcare personnel before clinical action is taken.

---

## 🏆 Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, TailwindCSS, Chart.js, Vanilla JS |
| Backend | Hono v4 (TypeScript) |
| Runtime | Cloudflare Workers / Pages |
| Database | Cloudflare D1 (SQLite) |
| Build | Vite + @hono/vite-build |
| Dev Server | Wrangler + PM2 |

---

**© 2025 NutriScan AI** — Built for early child malnutrition detection & intervention
