-- NutriScan AI Sample Patients & Assessments
-- Use: npm run db:seed

-- 1. Create Sample Children
INSERT OR REPLACE INTO children (id, name, age_months, gender, guardian_name, guardian_contact, location, created_at)
VALUES 
('CHD-001', 'Amara Diallo', 24, 'female', 'Mariama Diallo', '+224 600 000 001', 'Kindia Region', '2025-01-01 10:00:00'),
('CHD-002', 'Kofi Mensah', 36, 'male', 'Kwame Mensah', '+233 20 000 0002', 'Central District', '2025-01-05 14:00:00'),
('CHD-003', 'Fatima Ndiaye', 18, 'female', 'Samba Ndiaye', '+221 77 000 0003', 'Dakar Outskirts', '2025-01-10 09:30:00'),
('CHD-004', 'Ibrahim Toure', 48, 'male', 'Musa Toure', '+223 60 000 0004', 'Segou Community', '2025-01-15 11:20:00'),
('CHD-005', 'Aisha Kamara', 30, 'female', 'Fatu Kamara', '+232 76 000 0005', 'Freetown West', '2025-01-20 15:45:00');

-- 2. Create Assessment History for CHD-001 (Progress Tracking)
INSERT OR REPLACE INTO assessments (id, child_id, weight_kg, height_cm, muac_cm, recent_illness, nutrition_status, confidence, weight_for_height_z, height_for_age_z, calorie_estimate, assessed_at)
VALUES 
('ASMT-001A', 'CHD-001', 7.8, 77.5, 11.2, 1, 'SAM', 92.5, -3.2, -1.8, 850, '2025-02-01 10:00:00'),
('ASMT-001B', 'CHD-001', 8.2, 77.8, 11.8, 0, 'MAM', 88.0, -2.4, -1.7, 920, '2025-03-01 09:00:00'),
('ASMT-001C', 'CHD-001', 8.7, 78.2, 12.6, 0, 'Normal', 95.2, -1.5, -1.6, 980, '2025-04-01 11:30:00');

-- 3. Create Assessment History for CHD-003 (MAM Case)
INSERT OR REPLACE INTO assessments (id, child_id, weight_kg, height_cm, muac_cm, recent_illness, nutrition_status, confidence, weight_for_height_z, height_for_age_z, calorie_estimate, assessed_at)
VALUES 
('ASMT-003A', 'CHD-003', 6.5, 71.0, 11.6, 0, 'MAM', 85.4, -2.6, -2.1, 780, '2025-03-15 10:00:00'),
('ASMT-003B', 'CHD-003', 6.8, 71.5, 11.9, 1, 'MAM', 82.1, -2.2, -2.0, 810, '2025-04-10 14:20:00');

-- 4. Create Current Assessments for others
INSERT OR REPLACE INTO assessments (id, child_id, weight_kg, height_cm, muac_cm, recent_illness, nutrition_status, confidence, weight_for_height_z, height_for_age_z, calorie_estimate, assessed_at)
VALUES 
('ASMT-002', 'CHD-002', 12.1, 88.9, 14.2, 0, 'Normal', 96.5, -0.5, -0.8, 1080, '2025-04-12 11:00:00'),
('ASMT-004', 'CHD-004', 14.5, 98.3, 15.1, 0, 'Normal', 98.1, 0.3, -0.5, 1180, '2025-04-14 13:00:00'),
('ASMT-005', 'CHD-005', 9.8, 82.4, 11.8, 0, 'MAM', 89.2, -1.8, -1.7, 950, '2025-04-15 10:45:00');

-- 5. Add some Diet Plans
INSERT OR REPLACE INTO diet_plans (id, assessment_id, child_id, daily_calories, duration_weeks, plan_json, created_at)
VALUES 
('PLAN-001', 'ASMT-001C', 'CHD-001', 980, 4, '{"daily_calories":980,"duration_weeks":4,"status":"Normal"}', CURRENT_TIMESTAMP),
('PLAN-003', 'ASMT-003B', 'CHD-003', 810, 12, '{"daily_calories":810,"duration_weeks":12,"status":"MAM"}', CURRENT_TIMESTAMP),
('PLAN-005', 'ASMT-005', 'CHD-005', 950, 12, '{"daily_calories":950,"duration_weeks":12,"status":"MAM"}', CURRENT_TIMESTAMP);
