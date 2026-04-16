# 🧬 NutriScan AI: Clinical Malnutrition Surveillance Suite

![NutriScan AI Hero](https://unsplash.com/photos/female-nutritionist-with-graph-gives-consultation-to-patient-indoors-in-the-office-mezaOkGO2hY)
NutriScan AI is a state-of-the-art clinical decision support system designed for early detection and longitudinal management of childhood malnutrition. Leveraging high-fidelity computer vision and WHO-standard anthropometric analysis, it provides healthcare professionals with precise diagnostic insights and personalized nutritional blueprints.

## 🚀 Vision & Purpose
In many regions, malnutrition remains a "silent crisis" often missed during routine clinical visits. NutriScan AI bridges this gap by transforming a simple smartphone/webcam capture into a comprehensive biometric diagnostic tool, ensuring no child is left behind.

---

## ✨ Key Executive Features

### 🔍 1. AI Visual Diagnostic Engine
*   **Biometric Morphological Analysis**: Deep learning models scan for visual markers of wasting (thin limbs, visible ribs, sunken eyes, loose skin folds).
*   **Digital Anthropometry**: Automated body proportion detection to validate physical measurements against WHO standards.
*   **Privacy-First Processing**: On-device biometric extraction ensuring sensitive data never leaves the clinical terminal.

### 📐 2. Precision Clinical Analytics
*   **WHO Z-Score Calculator**: Real-time calculation of **WHZ** (Weight-for-Height), **HAZ** (Height-for-Age), and **WAZ** (Weight-for-Age) scores.
*   **Executive Status Badging**: Instant classification into **SAM** (Severe Acute Malnutrition), **MAM** (Moderate Acute Malnutrition), or **Normal** status using premium diagnostic indicators.
*   **Confidence Scoring**: Every AI assessment is backed by a statistical confidence percentage and clinical logic breakdown.

### 🍱 3. Personalized Nutritional Blueprints
*   **Clinical Meal Cycles**: Automatically generated dietary plans based on the child's specific biometric and caloric needs.
*   **Supplement Guidelines**: Integrated WHO-protocol-based supplement recommendations (RUTF, F75, F100, etc.).
*   **Cycle Tracking**: Comprehensive duration and restriction guidelines tailored to the diagnosis.

### 📊 4. Longitudinal Records Management
*   **Clinical History Hub**: A centralized repository for all patient assessments with search and multi-parameter filtering.
*   **Predictive Trends**: (Beta) Tracking growth curves over time to monitor recovery effectiveness.

---

## 🛠️ Technology Stack

*   **Logic & Runtime**: [Hono](https://hono.dev/) (Vite-Powered)
*   **UI Architecture**: Glassmorphism Executive Design System (Vanilla CSS + Tailwind)
*   **AI Infrastructure**: TensorFlow.js (MoveNet/MobileNet Pose Detection)
*   **Backend & DB**: Cloudflare Workers / D1 (SQLite) / Kysely
*   **Diagnostics**: WHO Child Growth Standards Methodology

---

## 💻 Local Execution Guide

To launch the NutriScan Clinical Suite in your development environment:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/nutriscan-ai.git
    cd nutriscan-ai
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Initialize Local Database (Optional/Mock)**:
    ```bash
    npm run db:migrate:local
    ```

4.  **Start Development Server**:
    ```bash
    npm run dev
    ```

5.  **Access the Suite**:
    Open [http://localhost:5173/](http://localhost:5173/) in your clinical terminal.

---

## 📄 Licensing & Clinical Use
*NutriScan AI is a clinical decision support tool. It is intended to augment, not replace, professional medical diagnosis. All nutritional interventions should be verified by a licensed clinical nutritionist or physician.*

---

**Developed with ❤️ for Global Child Health.**
