CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age_months INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
  guardian_name TEXT,
  guardian_contact TEXT,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  weight_kg REAL NOT NULL,
  height_cm REAL NOT NULL,
  muac_cm REAL NOT NULL,
  recent_illness INTEGER DEFAULT 0,
  mother_bmi REAL,
  diet_diversity_score INTEGER,
  nutrition_status TEXT NOT NULL CHECK(nutrition_status IN ('Normal', 'MAM', 'SAM')),
  confidence REAL NOT NULL,
  weight_for_height_z REAL,
  height_for_age_z REAL,
  bmi REAL,
  calorie_estimate INTEGER,
  risk_factors TEXT,
  clinical_notes TEXT,
  diet_summary TEXT,
  image_data TEXT,
  assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(child_id) REFERENCES children(id)
);

CREATE TABLE IF NOT EXISTS diet_plans (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  daily_calories INTEGER,
  duration_weeks INTEGER,
  plan_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(assessment_id) REFERENCES assessments(id)
);

CREATE INDEX IF NOT EXISTS idx_assessments_child_id ON assessments(child_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(nutrition_status);
CREATE INDEX IF NOT EXISTS idx_assessments_date ON assessments(assessed_at);
CREATE INDEX IF NOT EXISTS idx_diet_plans_assessment ON diet_plans(assessment_id);
