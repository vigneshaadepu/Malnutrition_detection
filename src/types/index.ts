// ============================================================
// NutriScan AI — Type Definitions
// ============================================================

export type NutritionStatus = 'Normal' | 'MAM' | 'SAM';
export type Gender = 'male' | 'female';

export interface ChildProfile {
  id?: string;
  name: string;
  age_months: number;
  gender: Gender;
  weight_kg: number;
  height_cm: number;
  muac_cm: number;
  recent_illness: boolean;
  mother_bmi?: number;
  diet_diversity_score?: number;
  guardian_name?: string;
  guardian_contact?: string;
  location?: string;
  image_base64?: string;
}

export interface AssessmentResult {
  id: string;
  child_id: string;
  timestamp: string;
  nutrition_status: NutritionStatus;
  confidence: number;
  weight_for_height_z: number;
  height_for_age_z: number;
  bmi: number;
  calorie_estimate: number;
  risk_factors: string[];
  clinical_notes: string;
  image_base64?: string;
}

export interface DietPlan {
  status: NutritionStatus;
  age_months: number;
  gender: Gender;
  daily_calories: number;
  meals: DietMeal[];
  supplements: string[];
  foods_to_avoid: string[];
  monitoring: string[];
  duration_weeks: number;
  who_protocol_ref: string;
}

export interface DietMeal {
  meal_type: 'Breakfast' | 'Mid-Morning Snack' | 'Lunch' | 'Afternoon Snack' | 'Dinner';
  time: string;
  foods: FoodItem[];
  calories: number;
  notes: string;
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g: number;
  key_nutrients: string[];
}

export interface FullReport {
  child: ChildProfile;
  assessment: AssessmentResult;
  diet_plan: DietPlan;
  generated_at: string;
  report_version: string;
}

export interface StoredRecord {
  id: string;
  child_id: string;
  name: string;
  age_months: number;
  gender: Gender;
  weight_kg: number;
  height_cm: number;
  muac_cm: number;
  nutrition_status: NutritionStatus;
  confidence: number;
  bmi: number;
  weight_for_height_z: number;
  height_for_age_z: number;
  diet_summary: string;
  guardian_name: string;
  location: string;
  timestamp: string;
}

export type Bindings = {
  DB: D1Database;
};
