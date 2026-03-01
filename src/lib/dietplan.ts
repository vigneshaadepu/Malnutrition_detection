// ============================================================
// NutriScan AI — WHO-Compliant Diet Plan Generator
// Based on WHO/UNICEF guidelines for child nutrition
// ============================================================

import type { ChildProfile, DietPlan, DietMeal, FoodItem, NutritionStatus } from '../types/index.js';
import { estimateCalorieNeeds } from './assessment.js';

// -------------------------------------------------------
// Food Database (WHO-approved, child-safe foods)
// -------------------------------------------------------
const FOOD_DB = {
  // Cereals & Grains
  oatmeal: { name: 'Oatmeal Porridge', cal_per_100g: 68, protein_per_100g: 2.4, nutrients: ['Iron', 'Zinc', 'Fiber'] },
  rice_porridge: { name: 'Rice Porridge (Khichdi)', cal_per_100g: 98, protein_per_100g: 2.8, nutrients: ['Carbohydrates', 'B-vitamins'] },
  whole_wheat_bread: { name: 'Whole Wheat Bread', cal_per_100g: 247, protein_per_100g: 8.0, nutrients: ['Fiber', 'B-vitamins', 'Iron'] },
  millet_porridge: { name: 'Millet Porridge', cal_per_100g: 378, protein_per_100g: 11, nutrients: ['Iron', 'Calcium', 'Magnesium'] },
  
  // Proteins
  egg: { name: 'Boiled Egg', cal_per_100g: 155, protein_per_100g: 13, nutrients: ['Vitamin D', 'Choline', 'Zinc'] },
  lentil_soup: { name: 'Lentil Soup (Dal)', cal_per_100g: 116, protein_per_100g: 9, nutrients: ['Iron', 'Folate', 'Zinc'] },
  chicken_mashed: { name: 'Mashed Chicken', cal_per_100g: 165, protein_per_100g: 31, nutrients: ['Iron', 'Zinc', 'B12'] },
  fish: { name: 'Boiled Fish (Soft)', cal_per_100g: 136, protein_per_100g: 28, nutrients: ['Omega-3', 'Vitamin D', 'Iodine'] },
  groundnut_paste: { name: 'Groundnut Paste', cal_per_100g: 588, protein_per_100g: 25, nutrients: ['Healthy Fats', 'Protein', 'Niacin'] },
  
  // Dairy
  breast_milk: { name: 'Breast Milk / Formula', cal_per_100g: 70, protein_per_100g: 1.0, nutrients: ['All Nutrients', 'Immunity'] },
  yogurt: { name: 'Full-Fat Yogurt', cal_per_100g: 61, protein_per_100g: 3.5, nutrients: ['Calcium', 'Probiotics', 'B12'] },
  milk: { name: 'Full-Cream Milk', cal_per_100g: 61, protein_per_100g: 3.2, nutrients: ['Calcium', 'Vitamin D', 'B12'] },
  
  // Vegetables
  spinach_puree: { name: 'Spinach Puree', cal_per_100g: 23, protein_per_100g: 2.9, nutrients: ['Iron', 'Folate', 'Vitamin A'] },
  carrot_puree: { name: 'Carrot Puree', cal_per_100g: 35, protein_per_100g: 0.8, nutrients: ['Vitamin A', 'Beta-Carotene'] },
  pumpkin_mash: { name: 'Pumpkin Mash', cal_per_100g: 26, protein_per_100g: 1.0, nutrients: ['Vitamin A', 'Potassium'] },
  sweet_potato: { name: 'Sweet Potato Mash', cal_per_100g: 86, protein_per_100g: 1.6, nutrients: ['Vitamin A', 'C', 'Potassium'] },
  
  // Fruits
  banana: { name: 'Ripe Banana (Mashed)', cal_per_100g: 89, protein_per_100g: 1.1, nutrients: ['Potassium', 'B6', 'Vitamin C'] },
  mango_puree: { name: 'Mango Puree', cal_per_100g: 60, protein_per_100g: 0.8, nutrients: ['Vitamin A', 'Vitamin C', 'Folate'] },
  papaya: { name: 'Papaya (Mashed)', cal_per_100g: 43, protein_per_100g: 0.5, nutrients: ['Vitamin C', 'Folate', 'Vitamin A'] },
  avocado: { name: 'Avocado Mash', cal_per_100g: 160, protein_per_100g: 2.0, nutrients: ['Healthy Fats', 'Folate', 'K'] },
  
  // Therapeutic / Fortified Foods
  rutf: { name: 'RUTF (Ready-to-Use Therapeutic Food)', cal_per_100g: 540, protein_per_100g: 13.6, nutrients: ['All Micronutrients', 'Energy', 'Protein'] },
  csb_plus: { name: 'Corn-Soy Blend Plus (CSB+)', cal_per_100g: 390, protein_per_100g: 17, nutrients: ['Fortified Vitamins', 'Minerals', 'Protein'] },
  plumpy_sup: { name: 'Plumpy\'Sup (RUSF)', cal_per_100g: 545, protein_per_100g: 15, nutrients: ['All Micronutrients', 'Lipids'] },
  
  // Fats / Oils
  vegetable_oil: { name: 'Vegetable Oil (added to food)', cal_per_100g: 884, protein_per_100g: 0, nutrients: ['Energy', 'Vitamin E'] },
  coconut_oil: { name: 'Coconut Oil (added)', cal_per_100g: 862, protein_per_100g: 0, nutrients: ['Energy', 'MCT'] },
};

// -------------------------------------------------------
// Diet Plan Templates per Status and Age Group
// -------------------------------------------------------

function getDietPlanNormal(age_months: number, calories: number): DietMeal[] {
  if (age_months < 6) {
    return [
      {
        meal_type: 'Breakfast',
        time: '7:00 AM',
        foods: [
          { name: 'Breast Milk / Formula', quantity: '150-200 ml', calories: 105, protein_g: 1.5, key_nutrients: ['All Nutrients', 'Immunity'] }
        ],
        calories: 105,
        notes: 'Exclusive breastfeeding recommended for infants < 6 months (WHO)'
      },
      {
        meal_type: 'Mid-Morning Snack',
        time: '10:00 AM',
        foods: [
          { name: 'Breast Milk / Formula', quantity: '120-150 ml', calories: 84, protein_g: 1.0, key_nutrients: ['Immunity', 'Growth Factors'] }
        ],
        calories: 84,
        notes: 'Feed on demand, at least 8-12 times per day'
      },
      {
        meal_type: 'Lunch',
        time: '1:00 PM',
        foods: [
          { name: 'Breast Milk / Formula', quantity: '150-200 ml', calories: 105, protein_g: 1.5, key_nutrients: ['All Nutrients'] }
        ],
        calories: 105,
        notes: 'Ensure proper latch and feeding position'
      },
      {
        meal_type: 'Afternoon Snack',
        time: '4:00 PM',
        foods: [
          { name: 'Breast Milk / Formula', quantity: '120-150 ml', calories: 84, protein_g: 1.0, key_nutrients: ['All Nutrients'] }
        ],
        calories: 84,
        notes: 'Night feeds are important for infants'
      },
      {
        meal_type: 'Dinner',
        time: '7:00 PM',
        foods: [
          { name: 'Breast Milk / Formula', quantity: '150-200 ml', calories: 105, protein_g: 1.5, key_nutrients: ['All Nutrients'] }
        ],
        calories: 105,
        notes: 'Ensure infant sleeps in a safe position after feeding'
      }
    ];
  } else if (age_months < 12) {
    return [
      {
        meal_type: 'Breakfast',
        time: '7:00 AM',
        foods: [
          { name: 'Oatmeal Porridge (fortified)', quantity: '100g', calories: 68, protein_g: 2.4, key_nutrients: ['Iron', 'Zinc', 'Fiber'] },
          { name: 'Mango Puree', quantity: '50g', calories: 30, protein_g: 0.4, key_nutrients: ['Vitamin A', 'Vitamin C'] }
        ],
        calories: 98,
        notes: 'Start complementary foods gradually. Continue breastfeeding.'
      },
      {
        meal_type: 'Mid-Morning Snack',
        time: '10:00 AM',
        foods: [
          { name: 'Breast Milk / Formula', quantity: '120 ml', calories: 84, protein_g: 1.0, key_nutrients: ['Immunity'] },
          { name: 'Ripe Banana (Mashed)', quantity: '50g', calories: 45, protein_g: 0.6, key_nutrients: ['Potassium', 'B6'] }
        ],
        calories: 129,
        notes: 'Finger foods encouraged from 8+ months'
      },
      {
        meal_type: 'Lunch',
        time: '12:30 PM',
        foods: [
          { name: 'Rice Porridge (Khichdi)', quantity: '120g', calories: 118, protein_g: 3.4, key_nutrients: ['Carbohydrates', 'B-vitamins'] },
          { name: 'Lentil Soup (Dal)', quantity: '80g', calories: 93, protein_g: 7.2, key_nutrients: ['Iron', 'Folate'] },
          { name: 'Carrot Puree', quantity: '60g', calories: 21, protein_g: 0.5, key_nutrients: ['Vitamin A'] }
        ],
        calories: 232,
        notes: 'Ensure soft, easy-to-swallow consistency'
      },
      {
        meal_type: 'Afternoon Snack',
        time: '4:00 PM',
        foods: [
          { name: 'Full-Fat Yogurt', quantity: '100g', calories: 61, protein_g: 3.5, key_nutrients: ['Calcium', 'Probiotics'] },
          { name: 'Papaya (Mashed)', quantity: '60g', calories: 26, protein_g: 0.3, key_nutrients: ['Vitamin C', 'Folate'] }
        ],
        calories: 87,
        notes: 'No added sugar or salt for infants'
      },
      {
        meal_type: 'Dinner',
        time: '6:30 PM',
        foods: [
          { name: 'Sweet Potato Mash', quantity: '100g', calories: 86, protein_g: 1.6, key_nutrients: ['Vitamin A', 'Potassium'] },
          { name: 'Boiled Egg (mashed)', quantity: '50g', calories: 78, protein_g: 6.5, key_nutrients: ['Vitamin D', 'Choline'] },
          { name: 'Breast Milk / Formula', quantity: '120 ml', calories: 84, protein_g: 1.0, key_nutrients: ['Immunity'] }
        ],
        calories: 248,
        notes: 'Breast milk remains the primary drink'
      }
    ];
  } else if (age_months < 24) {
    return [
      {
        meal_type: 'Breakfast',
        time: '7:00 AM',
        foods: [
          { name: 'Millet Porridge', quantity: '120g', calories: 205, protein_g: 5.2, key_nutrients: ['Iron', 'Calcium'] },
          { name: 'Full-Fat Yogurt', quantity: '80g', calories: 49, protein_g: 2.8, key_nutrients: ['Calcium', 'Probiotics'] },
          { name: 'Ripe Banana (Mashed)', quantity: '60g', calories: 53, protein_g: 0.7, key_nutrients: ['Potassium'] }
        ],
        calories: 307,
        notes: 'Transition to family foods with soft texture'
      },
      {
        meal_type: 'Mid-Morning Snack',
        time: '10:00 AM',
        foods: [
          { name: 'Whole Wheat Bread (small slice)', quantity: '30g', calories: 74, protein_g: 2.4, key_nutrients: ['Fiber', 'B-vitamins'] },
          { name: 'Avocado Mash', quantity: '50g', calories: 80, protein_g: 1.0, key_nutrients: ['Healthy Fats', 'Folate'] }
        ],
        calories: 154,
        notes: 'Monitor for choking hazards with new textures'
      },
      {
        meal_type: 'Lunch',
        time: '12:30 PM',
        foods: [
          { name: 'Rice Porridge (Khichdi)', quantity: '150g', calories: 147, protein_g: 4.2, key_nutrients: ['Energy'] },
          { name: 'Mashed Chicken', quantity: '80g', calories: 132, protein_g: 24.8, key_nutrients: ['Iron', 'Zinc', 'B12'] },
          { name: 'Spinach Puree', quantity: '60g', calories: 14, protein_g: 1.7, key_nutrients: ['Iron', 'Folate'] }
        ],
        calories: 293,
        notes: 'Serve with Vitamin C source to enhance iron absorption'
      },
      {
        meal_type: 'Afternoon Snack',
        time: '4:00 PM',
        foods: [
          { name: 'Full-Cream Milk', quantity: '150 ml', calories: 92, protein_g: 4.8, key_nutrients: ['Calcium', 'Vitamin D'] },
          { name: 'Papaya (Mashed)', quantity: '80g', calories: 34, protein_g: 0.4, key_nutrients: ['Vitamin C', 'Vitamin A'] }
        ],
        calories: 126,
        notes: 'Fruit provides natural vitamins and fiber'
      },
      {
        meal_type: 'Dinner',
        time: '6:30 PM',
        foods: [
          { name: 'Lentil Soup (Dal)', quantity: '150g', calories: 174, protein_g: 13.5, key_nutrients: ['Iron', 'Folate', 'Protein'] },
          { name: 'Sweet Potato Mash', quantity: '100g', calories: 86, protein_g: 1.6, key_nutrients: ['Vitamin A'] },
          { name: 'Vegetable Oil (added to food)', quantity: '5 ml', calories: 44, protein_g: 0, key_nutrients: ['Energy', 'Vitamin E'] }
        ],
        calories: 304,
        notes: 'Adequate oil/fat crucial for brain development'
      }
    ];
  } else {
    // 24-60 months
    return [
      {
        meal_type: 'Breakfast',
        time: '7:00 AM',
        foods: [
          { name: 'Oatmeal Porridge (fortified)', quantity: '150g', calories: 102, protein_g: 3.6, key_nutrients: ['Iron', 'Zinc'] },
          { name: 'Boiled Egg', quantity: '1 whole (50g)', calories: 78, protein_g: 6.5, key_nutrients: ['Vitamin D', 'Choline'] },
          { name: 'Full-Cream Milk', quantity: '150 ml', calories: 92, protein_g: 4.8, key_nutrients: ['Calcium'] }
        ],
        calories: 272,
        notes: 'Good breakfast sets the tone for the day'
      },
      {
        meal_type: 'Mid-Morning Snack',
        time: '10:00 AM',
        foods: [
          { name: 'Ripe Banana', quantity: '1 medium (100g)', calories: 89, protein_g: 1.1, key_nutrients: ['Potassium', 'B6'] },
          { name: 'Groundnut Paste', quantity: '20g', calories: 118, protein_g: 5.0, key_nutrients: ['Protein', 'Healthy Fats'] }
        ],
        calories: 207,
        notes: 'Peanut paste is excellent energy-dense snack'
      },
      {
        meal_type: 'Lunch',
        time: '12:30 PM',
        foods: [
          { name: 'Whole Wheat Bread', quantity: '60g', calories: 148, protein_g: 4.8, key_nutrients: ['Fiber', 'B-vitamins'] },
          { name: 'Boiled Fish (Soft)', quantity: '80g', calories: 109, protein_g: 22.4, key_nutrients: ['Omega-3', 'Iodine'] },
          { name: 'Pumpkin Mash', quantity: '100g', calories: 26, protein_g: 1.0, key_nutrients: ['Vitamin A', 'Potassium'] },
          { name: 'Mango Puree', quantity: '80g', calories: 48, protein_g: 0.6, key_nutrients: ['Vitamin A', 'C'] }
        ],
        calories: 331,
        notes: 'Diverse lunch provides micronutrient breadth'
      },
      {
        meal_type: 'Afternoon Snack',
        time: '4:00 PM',
        foods: [
          { name: 'Full-Fat Yogurt', quantity: '150g', calories: 92, protein_g: 5.3, key_nutrients: ['Calcium', 'Probiotics'] },
          { name: 'Papaya (chunks)', quantity: '100g', calories: 43, protein_g: 0.5, key_nutrients: ['Vitamin C'] }
        ],
        calories: 135,
        notes: 'Yogurt supports gut health and immunity'
      },
      {
        meal_type: 'Dinner',
        time: '6:30 PM',
        foods: [
          { name: 'Rice Porridge (Khichdi)', quantity: '150g', calories: 147, protein_g: 4.2, key_nutrients: ['Energy'] },
          { name: 'Lentil Soup (Dal)', quantity: '120g', calories: 139, protein_g: 10.8, key_nutrients: ['Iron', 'Protein'] },
          { name: 'Carrot Puree / Cooked Carrots', quantity: '80g', calories: 28, protein_g: 0.6, key_nutrients: ['Vitamin A'] },
          { name: 'Vegetable Oil (added)', quantity: '5 ml', calories: 44, protein_g: 0, key_nutrients: ['Energy'] }
        ],
        calories: 358,
        notes: 'Evening meal should be easily digestible'
      }
    ];
  }
}

function getDietPlanMAM(age_months: number, calories: number): DietMeal[] {
  const base = getDietPlanNormal(age_months, calories);
  // Boost energy density for MAM
  return base.map(meal => ({
    ...meal,
    calories: Math.round(meal.calories * 1.15),
    foods: [
      ...meal.foods,
      ...(meal.meal_type === 'Lunch' || meal.meal_type === 'Dinner'
        ? [{ name: 'Corn-Soy Blend Plus (CSB+)', quantity: '50g', calories: 195, protein_g: 8.5, key_nutrients: ['Fortified Vitamins', 'Minerals', 'Protein'] }]
        : [])
    ],
    notes: meal.notes + ' [MAM Protocol: CSB+ supplement added]'
  }));
}

function getDietPlanSAM(age_months: number, calories: number): DietMeal[] {
  // SAM requires RUTF-based therapeutic feeding
  return [
    {
      meal_type: 'Breakfast',
      time: '7:00 AM',
      foods: [
        { name: 'RUTF (Ready-to-Use Therapeutic Food)', quantity: '92g sachet', calories: 497, protein_g: 12.5, key_nutrients: ['All Micronutrients', 'Energy', 'Protein'] },
        { name: 'Full-Cream Milk', quantity: '100 ml', calories: 61, protein_g: 3.2, key_nutrients: ['Calcium', 'Vitamin D'] }
      ],
      calories: 558,
      notes: '⚠️ SAM PROTOCOL: RUTF is primary food. DO NOT replace with other foods. Continue breastfeeding if applicable.'
    },
    {
      meal_type: 'Mid-Morning Snack',
      time: '10:00 AM',
      foods: [
        { name: 'Breast Milk / Formula', quantity: '150 ml (if applicable)', calories: 105, protein_g: 1.5, key_nutrients: ['Immunity', 'All Nutrients'] },
        { name: 'Oral Rehydration Solution (ORS)', quantity: '100 ml if diarrhea', calories: 0, protein_g: 0, key_nutrients: ['Electrolytes'] }
      ],
      calories: 105,
      notes: 'Monitor for complications: edema, dehydration, hypoglycemia'
    },
    {
      meal_type: 'Lunch',
      time: '12:30 PM',
      foods: [
        { name: 'RUTF (Ready-to-Use Therapeutic Food)', quantity: '92g sachet', calories: 497, protein_g: 12.5, key_nutrients: ['All Micronutrients'] },
        { name: 'Mango Puree', quantity: '60g', calories: 36, protein_g: 0.5, key_nutrients: ['Vitamin A', 'C'] }
      ],
      calories: 533,
      notes: 'Give RUTF in small, frequent amounts if appetite is poor'
    },
    {
      meal_type: 'Afternoon Snack',
      time: '4:00 PM',
      foods: [
        { name: 'Full-Fat Yogurt', quantity: '100g', calories: 61, protein_g: 3.5, key_nutrients: ['Calcium', 'Probiotics'] },
        { name: 'Ripe Banana (Mashed)', quantity: '60g', calories: 53, protein_g: 0.7, key_nutrients: ['Potassium', 'Energy'] }
      ],
      calories: 114,
      notes: 'Therapeutic foods take priority; supplementary fruits support micronutrients'
    },
    {
      meal_type: 'Dinner',
      time: '6:30 PM',
      foods: [
        { name: 'RUTF (Ready-to-Use Therapeutic Food)', quantity: '92g sachet', calories: 497, protein_g: 12.5, key_nutrients: ['All Micronutrients'] },
        { name: 'Boiled Fish (Soft)', quantity: '50g', calories: 68, protein_g: 14.0, key_nutrients: ['Omega-3', 'Protein'] }
      ],
      calories: 565,
      notes: 'Ensure adequate hydration. Refer to CMAM program.'
    }
  ];
}

// -------------------------------------------------------
// Supplement Recommendations
// -------------------------------------------------------
function getSupplements(status: NutritionStatus, age_months: number): string[] {
  const base = ['Vitamin A (100,000 IU every 6 months for children 6-12 months; 200,000 IU for 12-59 months)'];
  
  if (status === 'SAM') {
    return [
      ...base,
      'Folic acid (5 mg/day for first day, then 1 mg/day)',
      'Potassium (4 mmol/kg/day)',
      'Magnesium (0.6 mmol/kg/day)',
      'Zinc (2 mg/kg/day)',
      'Multivitamin supplement (without vitamin A)',
      'Amoxicillin antibiotic (if on inpatient CMAM)',
      'Iron (start ONLY in stabilization phase, NOT in initial treatment)'
    ];
  } else if (status === 'MAM') {
    return [
      ...base,
      'Zinc (10 mg/day for 10-14 days)',
      'Iron supplement (as prescribed by health worker)',
      'Multiple micronutrient powder (Sprinkles) — 1 sachet/day',
      'Vitamin D (400-600 IU/day)',
      'Deworming (Albendazole 200 mg if ≥ 12 months)'
    ];
  } else {
    return [
      ...base,
      'Zinc (as preventive 5 mg/day for 3 months)',
      'Multiple micronutrient powder if diversified diet not achievable',
      'Vitamin D (400 IU/day)',
      'Iron-rich foods preferred over supplements'
    ];
  }
}

// -------------------------------------------------------
// Foods to Avoid
// -------------------------------------------------------
function getFoodsToAvoid(age_months: number, status: NutritionStatus): string[] {
  const always = [
    'High-sugar beverages (soda, sweetened juices)',
    'Highly salted/processed foods (chips, packaged snacks)',
    'Honey (for children under 12 months — botulism risk)',
    'Whole nuts (choking hazard under 5 years)',
    'Unpasteurized dairy products'
  ];
  
  const sam_specific = [
    'High-fiber foods (can interfere with nutrient absorption in SAM)',
    'Iron supplements during initial treatment phase',
    'Any foods that compete with or replace RUTF',
    'High-bulk low-calorie foods'
  ];
  
  const infant_specific = [
    'Cow\'s milk as main drink (under 12 months)',
    'Added salt or sugar',
    'Spicy foods',
    'Raw/undercooked eggs'
  ];
  
  let list = [...always];
  if (age_months < 12) list = [...list, ...infant_specific];
  if (status === 'SAM') list = [...list, ...sam_specific];
  
  return list;
}

// -------------------------------------------------------
// Monitoring Guidelines
// -------------------------------------------------------
function getMonitoring(status: NutritionStatus): string[] {
  if (status === 'SAM') {
    return [
      'Weekly weight monitoring',
      'MUAC measurement every 2 weeks',
      'Check for bilateral pitting edema daily',
      'Monitor for hypoglycemia and hypothermia',
      'Follow CMAM (Community-based Management of Acute Malnutrition) protocol',
      'Caregiver counselling every visit',
      'Exit criteria: MUAC ≥ 12.5 cm for 2 consecutive weeks + no edema'
    ];
  } else if (status === 'MAM') {
    return [
      'Bi-weekly weight and MUAC monitoring',
      'Monthly height measurement',
      'Dietary diversity assessment monthly',
      'Enroll in TSFP (Targeted Supplementary Feeding Programme)',
      'Caregiver nutrition education sessions',
      'Exit criteria: MUAC ≥ 12.5 cm + weight gain maintained'
    ];
  } else {
    return [
      'Quarterly growth monitoring',
      'Annual nutritional screening',
      'Maintain dietary diversity (minimum 5 food groups per day)',
      'Continued breastfeeding if applicable',
      'Regular vaccination schedule',
      'Report weight loss or signs of illness promptly'
    ];
  }
}

// -------------------------------------------------------
// Main Diet Plan Generator
// -------------------------------------------------------
export function generateDietPlan(profile: ChildProfile, status: NutritionStatus): DietPlan {
  const calories = estimateCalorieNeeds(profile.age_months, profile.weight_kg, status);
  
  let meals: DietMeal[];
  if (status === 'SAM') {
    meals = getDietPlanSAM(profile.age_months, calories);
  } else if (status === 'MAM') {
    meals = getDietPlanMAM(profile.age_months, calories);
  } else {
    meals = getDietPlanNormal(profile.age_months, calories);
  }
  
  const totalMealCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  
  return {
    status,
    age_months: profile.age_months,
    gender: profile.gender,
    daily_calories: totalMealCalories,
    meals,
    supplements: getSupplements(status, profile.age_months),
    foods_to_avoid: getFoodsToAvoid(profile.age_months, status),
    monitoring: getMonitoring(status),
    duration_weeks: status === 'SAM' ? 8 : status === 'MAM' ? 12 : 4,
    who_protocol_ref:
      status === 'SAM'
        ? 'WHO/UNICEF: Management of Severe Acute Malnutrition in Infants and Children (2013)'
        : status === 'MAM'
        ? 'WHO: Guideline: Updates on the Management of Severe Acute Malnutrition in Infants and Children (2013)'
        : 'WHO: Complementary Feeding of Young Children in Developing Countries (1998/2023 update)',
  };
}
