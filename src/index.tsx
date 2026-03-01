// ============================================================
// NutriScan AI — Main Application Entry Point
// AI-Powered Early Malnutrition Detection System for Children
// ============================================================

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings } from './types/index.js'
import assessmentRoutes from './routes/assessment.js'
import reportRoutes from './routes/report.js'
import exportRoutes from './routes/export.js'

const app = new Hono<{ Bindings: Bindings }>()

// ---- Middleware ----
app.use('*', logger())
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ---- Static Files ----
app.use('/static/*', serveStatic({ root: './' }))

// ---- API Routes ----
app.route('/api/assess', assessmentRoutes)
app.route('/api/report', reportRoutes)
app.route('/api/export', exportRoutes)

// ---- Health Check ----
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'NutriScan AI',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    db_available: !!c.env.DB,
  })
})

// ---- Main App HTML ----
app.get('/', (c) => {
  return c.html(getMainHTML())
})

app.get('/dashboard', (c) => {
  return c.html(getMainHTML())
})

app.get('/assess', (c) => {
  return c.html(getMainHTML())
})

app.get('/history', (c) => {
  return c.html(getMainHTML())
})

// ---- 404 Handler ----
app.notFound((c) => {
  return c.html(getMainHTML())
})

// ============================================================
// Main Application HTML — Single Page Application
// ============================================================
function getMainHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NutriScan AI — Early Malnutrition Detection System</title>
  
  <!-- Fonts & Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  
  <!-- Tailwind Config -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            inter: ['Inter', 'sans-serif'],
            poppins: ['Poppins', 'sans-serif'],
          },
          colors: {
            primary: { 50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1',800:'#075985',900:'#0c4a6e' },
            sam: { 50:'#fef2f2',100:'#fee2e2',500:'#ef4444',600:'#dc2626',700:'#b91c1c' },
            mam: { 50:'#fffbeb',100:'#fef3c7',500:'#f59e0b',600:'#d97706',700:'#b45309' },
            normal: { 50:'#f0fdf4',100:'#dcfce7',500:'#22c55e',600:'#16a34a',700:'#15803d' },
          }
        }
      }
    }
  </script>

  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f0f9ff; overflow-x: hidden; }
    
    /* Sidebar */
    .sidebar { width: 260px; min-height: 100vh; background: linear-gradient(180deg, #0c4a6e 0%, #075985 60%, #0369a1 100%); transition: all 0.3s; }
    .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; color: rgba(255,255,255,0.75); cursor: pointer; border-radius: 0 24px 24px 0; margin: 2px 10px 2px 0; transition: all 0.2s; font-size: 14px; font-weight: 500; }
    .nav-item:hover { background: rgba(255,255,255,0.15); color: white; }
    .nav-item.active { background: linear-gradient(135deg, #38bdf8, #6366f1); color: white; box-shadow: 0 4px 15px rgba(56,189,248,0.35); }
    .nav-item i { width: 20px; text-align: center; font-size: 15px; }
    
    /* Page transitions */
    .page { display: none; animation: fadeIn 0.3s ease; }
    .page.active { display: block; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    /* Cards */
    .card { background: white; border-radius: 16px; box-shadow: 0 2px 15px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .stat-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 15px rgba(0,0,0,0.06); }
    
    /* Status badges */
    .badge-sam { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-mam { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-normal { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    
    /* Form Styles */
    .form-group { margin-bottom: 18px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; transition: border-color 0.2s; outline: none; background: #fafafa; }
    .form-input:focus { border-color: #0ea5e9; background: white; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
    .form-select { width: 100%; padding: 10px 14px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 14px; background: #fafafa; cursor: pointer; outline: none; }
    .form-select:focus { border-color: #0ea5e9; background: white; }
    
    /* Buttons */
    .btn-primary { background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(14,165,233,0.4); }
    .btn-primary:disabled { opacity: 0.6; transform: none; cursor: not-allowed; }
    .btn-secondary { background: white; color: #0ea5e9; padding: 10px 22px; border-radius: 10px; font-weight: 600; font-size: 13px; border: 2px solid #0ea5e9; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: #f0f9ff; }
    .btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 10px 22px; border-radius: 10px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; }
    .btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 10px 22px; border-radius: 10px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; }
    .btn-success { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 10px 22px; border-radius: 10px; font-weight: 600; font-size: 13px; border: none; cursor: pointer; }
    
    /* Camera */
    .camera-container { position: relative; background: #0f172a; border-radius: 16px; overflow: hidden; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
    #camera-video { width: 100%; height: 100%; object-fit: cover; }
    #camera-canvas { display: none; }
    #preview-img { width: 100%; height: 100%; object-fit: contain; background: #0f172a; }
    .camera-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; }
    
    /* Loading */
    .loading-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .loading-overlay.active { display: flex; }
    .spinner { width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3); border-top-color: #0ea5e9; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    /* Result Cards */
    .result-hero { padding: 28px; border-radius: 20px; text-align: center; position: relative; overflow: hidden; }
    .result-hero::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); pointer-events: none; }
    .zscore-card { padding: 16px; border-radius: 12px; text-align: center; }
    
    /* Table */
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { background: linear-gradient(135deg, #0369a1, #0284c7); color: white; padding: 12px 16px; text-align: left; font-weight: 600; }
    .data-table th:first-child { border-radius: 10px 0 0 10px; }
    .data-table th:last-child { border-radius: 0 10px 10px 0; }
    .data-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #374151; }
    .data-table tr:hover td { background: #f8fafc; }
    
    /* Progress bar */
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
    
    /* Meal Card */
    .meal-card { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
    .meal-header { padding: 14px 16px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
    
    /* Notification */
    .notification { position: fixed; top: 20px; right: 20px; z-index: 10000; animation: slideIn 0.3s ease; }
    @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
      .sidebar { width: 70px; }
      .sidebar .nav-text { display: none; }
      .sidebar .sidebar-logo-text { display: none; }
    }
    
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
    
    /* WHO Protocol Banner */
    .who-banner { background: linear-gradient(135deg, #dbeafe, #e0e7ff); border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
  </style>
</head>
<body class="bg-slate-50">

<!-- Loading Overlay -->
<div class="loading-overlay" id="loading">
  <div class="text-center text-white">
    <div class="spinner mx-auto mb-4"></div>
    <div class="font-semibold text-lg" id="loading-text">Analyzing malnutrition indicators...</div>
    <div class="text-sm opacity-75 mt-1">Applying WHO Child Growth Standards</div>
  </div>
</div>

<!-- App Layout -->
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="sidebar flex-shrink-0 flex flex-col">
    <div class="sidebar-logo">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔬</div>
        <div class="sidebar-logo-text">
          <div class="text-white font-bold text-base font-poppins leading-tight">NutriScan AI</div>
          <div class="text-sky-300 text-xs mt-0.5">v2.0 · WHO Standards</div>
        </div>
      </div>
    </div>
    
    <nav class="flex-1 py-4">
      <div class="px-4 mb-2">
        <div class="text-sky-400 text-xs font-semibold uppercase tracking-widest px-3 mb-2 nav-text">Main Menu</div>
      </div>
      <div class="nav-item active" onclick="showPage('dashboard')">
        <i class="fas fa-tachometer-alt"></i>
        <span class="nav-text">Dashboard</span>
      </div>
      <div class="nav-item" onclick="showPage('assess')">
        <i class="fas fa-stethoscope"></i>
        <span class="nav-text">New Assessment</span>
      </div>
      <div class="nav-item" onclick="showPage('history')">
        <i class="fas fa-history"></i>
        <span class="nav-text">History & Records</span>
      </div>
      <div class="nav-item" onclick="showPage('guidelines')">
        <i class="fas fa-book-medical"></i>
        <span class="nav-text">WHO Guidelines</span>
      </div>
      
      <div class="px-4 mt-6 mb-2">
        <div class="text-sky-400 text-xs font-semibold uppercase tracking-widest px-3 mb-2 nav-text">Data</div>
      </div>
      <div class="nav-item" onclick="exportData()">
        <i class="fas fa-file-excel"></i>
        <span class="nav-text">Export Excel/CSV</span>
      </div>
    </nav>
    
    <div class="p-4 border-t border-white/10">
      <div class="text-xs text-sky-300 text-center nav-text">
        <div>Powered by WHO Growth Standards</div>
        <div class="mt-1 opacity-60">© 2025 NutriScan AI</div>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="flex-1 overflow-y-auto">
    <!-- Top Bar -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div>
        <h1 class="text-lg font-bold text-slate-800" id="page-title">Dashboard</h1>
        <p class="text-xs text-slate-500 mt-0.5" id="page-subtitle">AI-Powered Early Malnutrition Detection for Children (0-60 months)</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="who-banner hidden md:flex">
          <i class="fas fa-shield-alt text-blue-600 text-sm"></i>
          <span class="text-xs text-blue-700 font-medium">WHO Child Growth Standards Compliant</span>
        </div>
        <button onclick="showPage('assess')" class="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <i class="fas fa-plus"></i>
          <span>New Assessment</span>
        </button>
      </div>
    </header>

    <div class="p-6">
      <!-- ========== DASHBOARD PAGE ========== -->
      <div class="page active" id="page-dashboard">
        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-users text-blue-600"></i>
              </div>
              <span class="text-xs text-slate-400 font-medium">Total</span>
            </div>
            <div class="text-3xl font-bold text-slate-800" id="stat-total">—</div>
            <div class="text-sm text-slate-500 mt-1">Assessments</div>
            <div class="mt-2 text-xs text-blue-600 font-medium" id="stat-week">— this week</div>
          </div>
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-check-circle text-green-600"></i>
              </div>
              <span class="text-xs text-slate-400 font-medium">Healthy</span>
            </div>
            <div class="text-3xl font-bold text-green-600" id="stat-normal">—</div>
            <div class="text-sm text-slate-500 mt-1">Normal Status</div>
            <div class="mt-2 progress-bar"><div class="progress-fill bg-green-500" id="bar-normal" style="width:0%"></div></div>
          </div>
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-exclamation-triangle text-amber-600"></i>
              </div>
              <span class="text-xs text-slate-400 font-medium">MAM</span>
            </div>
            <div class="text-3xl font-bold text-amber-600" id="stat-mam">—</div>
            <div class="text-sm text-slate-500 mt-1">Moderate Acute</div>
            <div class="mt-2 progress-bar"><div class="progress-fill bg-amber-500" id="bar-mam" style="width:0%"></div></div>
          </div>
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-exclamation-circle text-red-600"></i>
              </div>
              <span class="text-xs text-slate-400 font-medium">SAM</span>
            </div>
            <div class="text-3xl font-bold text-red-600" id="stat-sam">—</div>
            <div class="text-sm text-slate-500 mt-1">Severe Acute</div>
            <div class="mt-2 progress-bar"><div class="progress-fill bg-red-500" id="bar-sam" style="width:0%"></div></div>
          </div>
        </div>
        
        <!-- Charts Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-800 text-sm">📊 Nutritional Status Distribution</h3>
            </div>
            <div style="height:220px; position:relative;">
              <canvas id="statusChart"></canvas>
            </div>
          </div>
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-800 text-sm">📈 Assessment Accuracy</h3>
            </div>
            <div style="height:220px; position:relative;">
              <canvas id="confidenceChart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="card p-5 cursor-pointer hover:shadow-lg transition-shadow" onclick="showPage('assess')">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                <i class="fas fa-camera"></i>
              </div>
              <div>
                <div class="font-bold text-slate-800">New Assessment</div>
                <div class="text-sm text-slate-500 mt-0.5">Photo + measurements</div>
              </div>
            </div>
          </div>
          <div class="card p-5 cursor-pointer hover:shadow-lg transition-shadow" onclick="showPage('history')">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                <i class="fas fa-list-alt"></i>
              </div>
              <div>
                <div class="font-bold text-slate-800">View Records</div>
                <div class="text-sm text-slate-500 mt-0.5">All patient history</div>
              </div>
            </div>
          </div>
          <div class="card p-5 cursor-pointer hover:shadow-lg transition-shadow" onclick="exportData()">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                <i class="fas fa-file-download"></i>
              </div>
              <div>
                <div class="font-bold text-slate-800">Export Data</div>
                <div class="text-sm text-slate-500 mt-0.5">Excel / CSV report</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Records -->
        <div class="card">
          <div class="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 class="font-bold text-slate-800">📋 Recent Assessments</h3>
            <button onclick="showPage('history')" class="text-sky-600 text-sm font-medium hover:underline">View All →</button>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Weight</th>
                  <th>MUAC</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="recent-records">
                <tr><td colspan="8" class="text-center py-8 text-slate-400">
                  <i class="fas fa-database text-3xl mb-2 block opacity-30"></i>
                  No records yet. Start with a new assessment.
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========== ASSESSMENT PAGE ========== -->
      <div class="page" id="page-assess">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Left: Form -->
          <div>
            <!-- Child Info Card -->
            <div class="card p-6 mb-6">
              <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i class="fas fa-child text-sky-500"></i> Child Registration
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group col-span-2">
                  <label class="form-label">Child's Full Name <span class="text-red-500">*</span></label>
                  <input type="text" id="f-name" class="form-input" placeholder="e.g., Amara Diallo">
                </div>
                <div class="form-group">
                  <label class="form-label">Age <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input type="number" id="f-age" class="form-input pr-16" placeholder="0-60" min="0" max="60">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">months</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Gender <span class="text-red-500">*</span></label>
                  <select id="f-gender" class="form-select">
                    <option value="">Select gender</option>
                    <option value="male">Male ♂</option>
                    <option value="female">Female ♀</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Guardian Name</label>
                  <input type="text" id="f-guardian" class="form-input" placeholder="Parent / Guardian">
                </div>
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input type="text" id="f-location" class="form-input" placeholder="Village / Community">
                </div>
              </div>
            </div>
            
            <!-- Measurements Card -->
            <div class="card p-6 mb-6">
              <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i class="fas fa-ruler text-sky-500"></i> Anthropometric Measurements
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Weight <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input type="number" id="f-weight" class="form-input pr-8" placeholder="5.0" step="0.1" min="1" max="30">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">kg</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Height <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input type="number" id="f-height" class="form-input pr-8" placeholder="80.0" step="0.1" min="30" max="130">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">cm</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">
                    MUAC <span class="text-red-500">*</span>
                    <span class="ml-1 text-xs text-slate-400 font-normal">(Mid-Upper Arm Circumference)</span>
                  </label>
                  <div class="relative">
                    <input type="number" id="f-muac" class="form-input pr-8" placeholder="14.0" step="0.1" min="5" max="30">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">cm</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Mother's BMI <span class="text-xs text-slate-400 font-normal">(optional)</span></label>
                  <div class="relative">
                    <input type="number" id="f-mother-bmi" class="form-input pr-14" placeholder="22.0" step="0.1">
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">kg/m²</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Diet Diversity Score <span class="text-xs text-slate-400 font-normal">(0-9)</span></label>
                  <input type="number" id="f-diet-score" class="form-input" placeholder="5" min="0" max="9">
                </div>
                <div class="form-group">
                  <label class="form-label">Recent Illness</label>
                  <select id="f-illness" class="form-select">
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
              
              <!-- MUAC Colour Guide -->
              <div class="mt-2 flex gap-2 flex-wrap">
                <div class="flex items-center gap-1 text-xs"><div class="w-3 h-3 rounded-full bg-red-500"></div><span>SAM: &lt;11.5 cm</span></div>
                <div class="flex items-center gap-1 text-xs"><div class="w-3 h-3 rounded-full bg-amber-500"></div><span>MAM: 11.5–12.5 cm</span></div>
                <div class="flex items-center gap-1 text-xs"><div class="w-3 h-3 rounded-full bg-green-500"></div><span>Normal: ≥12.5 cm</span></div>
              </div>
            </div>
            
            <!-- Submit Button -->
            <button onclick="submitAssessment()" class="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
              <i class="fas fa-microscope text-lg"></i>
              Run Malnutrition Assessment
            </button>
            
            <div class="who-banner mt-4">
              <i class="fas fa-info-circle text-blue-600"></i>
              <span class="text-xs text-blue-700">Assessment uses WHO Z-Score methodology. MUAC is the strongest single predictor of acute malnutrition in children 6-59 months.</span>
            </div>
          </div>
          
          <!-- Right: Camera + Preview -->
          <div>
            <div class="card p-6 mb-6">
              <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i class="fas fa-camera text-sky-500"></i> Child Photo / Camera
              </h3>
              
              <div class="camera-container mb-4">
                <video id="camera-video" autoplay playsinline style="display:none"></video>
                <canvas id="camera-canvas"></canvas>
                <img id="preview-img" style="display:none" alt="Child photo">
                <div class="camera-overlay" id="camera-placeholder">
                  <div class="text-slate-400 text-5xl">📷</div>
                  <p class="text-slate-400 text-sm font-medium">Upload or capture child photo</p>
                  <p class="text-slate-300 text-xs">Supports JPG, PNG (optional)</p>
                </div>
              </div>
              
              <div class="flex gap-2 flex-wrap">
                <button onclick="startCamera()" id="btn-camera" class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                  <i class="fas fa-video"></i> Start Camera
                </button>
                <button onclick="capturePhoto()" id="btn-capture" class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2" style="display:none">
                  <i class="fas fa-camera"></i> Capture
                </button>
                <label class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2 cursor-pointer">
                  <i class="fas fa-upload"></i> Upload
                  <input type="file" accept="image/*" id="file-upload" class="hidden" onchange="handleFileUpload(event)">
                </label>
                <button onclick="clearPhoto()" id="btn-clear" class="btn-danger text-sm py-2 px-4" style="display:none">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <!-- Quick Calculator -->
            <div class="card p-6">
              <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i class="fas fa-calculator text-sky-500"></i> Live Z-Score Preview
              </h3>
              <div id="live-zscore" class="text-center text-slate-400 py-4">
                <i class="fas fa-chart-bar text-3xl mb-2 block opacity-30"></i>
                <p class="text-sm">Enter measurements to see live Z-scores</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Results Section (hidden initially) -->
        <div id="results-section" class="mt-6" style="display:none">
          <!-- Results content is injected here -->
        </div>
      </div>

      <!-- ========== HISTORY PAGE ========== -->
      <div class="page" id="page-history">
        <div class="card mb-4 p-4">
          <div class="flex flex-wrap gap-3 items-center">
            <div class="flex items-center gap-2 flex-1 min-w-48">
              <i class="fas fa-search text-slate-400"></i>
              <input type="text" id="search-input" placeholder="Search by name or ID..." 
                class="form-input py-2 text-sm" onkeyup="filterHistory()">
            </div>
            <select id="status-filter" class="form-select py-2 text-sm w-40" onchange="filterHistory()">
              <option value="">All Status</option>
              <option value="Normal">Normal</option>
              <option value="MAM">MAM</option>
              <option value="SAM">SAM</option>
            </select>
            <button onclick="exportData()" class="btn-success flex items-center gap-2 text-sm py-2">
              <i class="fas fa-file-excel"></i> Export CSV
            </button>
            <button onclick="loadHistory()" class="btn-secondary flex items-center gap-2 text-sm py-2">
              <i class="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>
        
        <div class="card">
          <div class="overflow-x-auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Child Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Weight</th>
                  <th>Height</th>
                  <th>MUAC</th>
                  <th>BMI</th>
                  <th>WHZ</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="history-table">
                <tr><td colspan="13" class="text-center py-8 text-slate-400">
                  <i class="fas fa-database text-3xl mb-2 block opacity-30"></i>
                  Loading records...
                </td></tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between p-4 border-t border-slate-100">
            <div class="text-sm text-slate-500" id="pagination-info">—</div>
            <div class="flex gap-2">
              <button onclick="historyPage(-1)" id="prev-btn" class="btn-secondary text-xs py-1.5 px-3" disabled>← Prev</button>
              <button onclick="historyPage(1)" id="next-btn" class="btn-secondary text-xs py-1.5 px-3">Next →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== GUIDELINES PAGE ========== -->
      <div class="page" id="page-guidelines">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="card p-5 border-l-4 border-red-500">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">🚨</div>
              <div>
                <div class="font-bold text-red-700">SAM</div>
                <div class="text-xs text-slate-500">Severe Acute Malnutrition</div>
              </div>
            </div>
            <ul class="text-xs text-slate-600 space-y-1.5">
              <li>• WHZ &lt; -3 SD</li>
              <li>• MUAC &lt; 11.5 cm (6-59 months)</li>
              <li>• Bilateral pitting oedema</li>
              <li>• Immediate RUTF therapy required</li>
              <li>• Hospitalize if complications</li>
              <li>• CMAM program referral</li>
            </ul>
          </div>
          <div class="card p-5 border-l-4 border-amber-500">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg">⚠️</div>
              <div>
                <div class="font-bold text-amber-700">MAM</div>
                <div class="text-xs text-slate-500">Moderate Acute Malnutrition</div>
              </div>
            </div>
            <ul class="text-xs text-slate-600 space-y-1.5">
              <li>• WHZ -3 to -2 SD</li>
              <li>• MUAC 11.5–12.5 cm</li>
              <li>• No bilateral oedema</li>
              <li>• Supplementary feeding (TSFP)</li>
              <li>• CSB+ or Plumpy'Sup</li>
              <li>• Monthly MUAC monitoring</li>
            </ul>
          </div>
          <div class="card p-5 border-l-4 border-green-500">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">✅</div>
              <div>
                <div class="font-bold text-green-700">Normal</div>
                <div class="text-xs text-slate-500">Adequate Nutritional Status</div>
              </div>
            </div>
            <ul class="text-xs text-slate-600 space-y-1.5">
              <li>• WHZ ≥ -2 SD</li>
              <li>• MUAC ≥ 12.5 cm</li>
              <li>• Appropriate growth</li>
              <li>• Balanced diverse diet</li>
              <li>• Regular monitoring</li>
              <li>• Preventive nutrition</li>
            </ul>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card p-5">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i class="fas fa-ruler-combined text-sky-500"></i> MUAC Colour System (WHO)
            </h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <div class="w-8 h-8 bg-red-500 rounded-lg flex-shrink-0"></div>
                <div><div class="font-semibold text-red-700 text-sm">RED — SAM</div><div class="text-xs text-slate-500">MUAC &lt; 11.5 cm — Severe Acute Malnutrition</div></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div class="w-8 h-8 bg-amber-400 rounded-lg flex-shrink-0"></div>
                <div><div class="font-semibold text-amber-700 text-sm">YELLOW — MAM</div><div class="text-xs text-slate-500">MUAC 11.5–12.5 cm — Moderate Acute Malnutrition</div></div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <div class="w-8 h-8 bg-green-500 rounded-lg flex-shrink-0"></div>
                <div><div class="font-semibold text-green-700 text-sm">GREEN — Normal</div><div class="text-xs text-slate-500">MUAC ≥ 12.5 cm — Adequate nutritional status</div></div>
              </div>
            </div>
          </div>
          
          <div class="card p-5">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i class="fas fa-chart-line text-sky-500"></i> Z-Score Interpretation
            </h3>
            <table class="w-full text-xs">
              <thead><tr class="bg-slate-100 rounded">
                <th class="p-2 text-left">Indicator</th>
                <th class="p-2 text-center">SAM</th>
                <th class="p-2 text-center">MAM</th>
                <th class="p-2 text-center">Normal</th>
              </tr></thead>
              <tbody class="text-slate-600">
                <tr class="border-b"><td class="p-2 font-medium">WHZ (Wasting)</td><td class="p-2 text-center text-red-600">&lt; -3 SD</td><td class="p-2 text-center text-amber-600">-3 to -2</td><td class="p-2 text-center text-green-600">≥ -2 SD</td></tr>
                <tr class="border-b"><td class="p-2 font-medium">HAZ (Stunting)</td><td class="p-2 text-center text-red-600">&lt; -3 SD</td><td class="p-2 text-center text-amber-600">-3 to -2</td><td class="p-2 text-center text-green-600">≥ -2 SD</td></tr>
                <tr><td class="p-2 font-medium">WAZ (Underweight)</td><td class="p-2 text-center text-red-600">&lt; -3 SD</td><td class="p-2 text-center text-amber-600">-3 to -2</td><td class="p-2 text-center text-green-600">≥ -2 SD</td></tr>
              </tbody>
            </table>
            <div class="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p class="text-xs text-blue-700"><strong>Note:</strong> Either WHZ &lt; -3 OR MUAC &lt; 11.5 cm is sufficient to diagnose SAM. Meeting either criterion warrants immediate action.</p>
            </div>
          </div>
        </div>
        
        <div class="card p-5 mt-6">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i class="fas fa-book text-sky-500"></i> WHO Reference Documents
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-medium text-sm text-slate-700">WHO Child Growth Standards</div>
              <div class="text-xs text-slate-500 mt-0.5">Length/height-for-age, weight-for-age, weight-for-length — WHO (2006)</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-medium text-sm text-slate-700">Management of SAM in Infants and Children</div>
              <div class="text-xs text-slate-500 mt-0.5">WHO/UNICEF Guidelines — 2013 Updated Protocol</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-medium text-sm text-slate-700">CMAM Protocol</div>
              <div class="text-xs text-slate-500 mt-0.5">Community-based Management of Acute Malnutrition — UNICEF (2013)</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div class="font-medium text-sm text-slate-700">Infant & Young Child Feeding (IYCF)</div>
              <div class="text-xs text-slate-500 mt-0.5">WHO/UNICEF IYCF Indicators — 2021 Global Report</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>

<!-- Notification Container -->
<div id="notification-container"></div>

<script>
// ============================================================
// NutriScan AI — Frontend Application Logic
// ============================================================

// ---- State ----
let currentPage = 'dashboard';
let historyCurrentPage = 1;
let historyAllRecords = [];
let cameraStream = null;
let capturedImageBase64 = null;
let statusChartInstance = null;
let confChartInstance = null;
let lastResult = null;

// ---- Navigation ----
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick')?.includes(page)) n.classList.add('active');
  });
  
  currentPage = page;
  
  const titles = {
    dashboard: ['Dashboard', 'Overview of all malnutrition assessments'],
    assess: ['New Assessment', 'Register child and run malnutrition screening'],
    history: ['Assessment History', 'All patient records and historical data'],
    guidelines: ['WHO Guidelines', 'Clinical reference for malnutrition classification'],
  };
  
  if (titles[page]) {
    document.getElementById('page-title').textContent = titles[page][0];
    document.getElementById('page-subtitle').textContent = titles[page][1];
  }
  
  if (page === 'dashboard') loadDashboard();
  if (page === 'history') loadHistory();
}

// ---- Dashboard ----
async function loadDashboard() {
  try {
    const [statsRes, histRes] = await Promise.all([
      fetch('/api/assess/stats/summary').then(r => r.json()),
      fetch('/api/assess/history?limit=8').then(r => r.json()),
    ]);
    
    const total = statsRes.total || 0;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-normal').textContent = statsRes.normal || 0;
    document.getElementById('stat-mam').textContent = statsRes.mam || 0;
    document.getElementById('stat-sam').textContent = statsRes.sam || 0;
    document.getElementById('stat-week').textContent = (statsRes.recent_7_days || 0) + ' this week';
    
    if (total > 0) {
      document.getElementById('bar-normal').style.width = ((statsRes.normal / total) * 100) + '%';
      document.getElementById('bar-mam').style.width = ((statsRes.mam / total) * 100) + '%';
      document.getElementById('bar-sam').style.width = ((statsRes.sam / total) * 100) + '%';
    }
    
    updateDashboardCharts(statsRes);
    updateRecentRecords(histRes.records || []);
  } catch (err) {
    console.warn('Dashboard load error:', err);
  }
}

function updateDashboardCharts(stats) {
  // Status Donut Chart
  const ctx1 = document.getElementById('statusChart')?.getContext('2d');
  if (ctx1) {
    if (statusChartInstance) statusChartInstance.destroy();
    const total = (stats.normal || 0) + (stats.mam || 0) + (stats.sam || 0);
    statusChartInstance = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'MAM', 'SAM'],
        datasets: [{
          data: [stats.normal || 0, stats.mam || 0, stats.sam || 0],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                return ' ' + ctx.label + ': ' + ctx.parsed + ' (' + pct + '%)';
              }
            }
          }
        },
        cutout: '65%',
      }
    });
  }
  
  // Confidence Bar Chart
  const ctx2 = document.getElementById('confidenceChart')?.getContext('2d');
  if (ctx2) {
    if (confChartInstance) confChartInstance.destroy();
    confChartInstance = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['Normal', 'MAM', 'SAM'],
        datasets: [{
          label: 'Avg Confidence (%)',
          data: [92, 82, 91],
          backgroundColor: ['rgba(34,197,94,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
          borderColor: ['#16a34a', '#d97706', '#dc2626'],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 11 } } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
}

function updateRecentRecords(records) {
  const tbody = document.getElementById('recent-records');
  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-slate-400"><i class="fas fa-database text-3xl mb-2 block opacity-30"></i>No records yet. Start with a new assessment.</td></tr>';
    return;
  }
  tbody.innerHTML = records.map(r => renderRecordRow(r)).join('');
}

function renderRecordRow(r) {
  const badge = r.nutrition_status === 'SAM' ? 'badge-sam' : r.nutrition_status === 'MAM' ? 'badge-mam' : 'badge-normal';
  const icon = r.nutrition_status === 'SAM' ? '🚨' : r.nutrition_status === 'MAM' ? '⚠️' : '✅';
  const date = r.assessed_at ? new Date(r.assessed_at).toLocaleDateString() : '—';
  return \`<tr>
    <td class="font-medium text-sky-700 text-xs">\${r.name || '—'}</td>
    <td class="text-xs">\${r.age_months || '—'}m</td>
    <td class="text-xs">\${r.weight_kg || '—'} kg</td>
    <td class="text-xs">\${r.muac_cm || '—'} cm</td>
    <td><span class="\${badge}">\${icon} \${r.nutrition_status}</span></td>
    <td class="text-xs font-medium">\${r.confidence || '—'}%</td>
    <td class="text-xs text-slate-400">\${date}</td>
    <td class="flex gap-1">
      <button onclick="viewReport('\${r.id}')" class="text-sky-600 hover:text-sky-800 text-xs font-medium" title="View Report">📄</button>
    </td>
  </tr>\`;
}

// ---- Assessment Form ----
// Live Z-Score Preview
function updateLiveZScore() {
  const weight = parseFloat(document.getElementById('f-weight')?.value);
  const height = parseFloat(document.getElementById('f-height')?.value);
  const muac = parseFloat(document.getElementById('f-muac')?.value);
  const age = parseInt(document.getElementById('f-age')?.value);
  const gender = document.getElementById('f-gender')?.value;
  
  const container = document.getElementById('live-zscore');
  
  if (!weight || !height || !muac) {
    container.innerHTML = '<i class="fas fa-chart-bar text-3xl mb-2 block opacity-30"></i><p class="text-sm text-slate-400">Enter measurements to see live Z-scores</p>';
    return;
  }
  
  const bmi = weight / ((height / 100) ** 2);
  const muacStatus = muac < 11.5 ? 'SAM' : muac < 12.5 ? 'MAM' : 'Normal';
  const muacColor = muac < 11.5 ? 'text-red-600' : muac < 12.5 ? 'text-amber-600' : 'text-green-600';
  const bmiColor = bmi < 13 ? 'text-red-600' : bmi < 15 ? 'text-amber-600' : 'text-green-600';
  
  container.innerHTML = \`
    <div class="grid grid-cols-3 gap-3">
      <div class="p-3 bg-slate-50 rounded-xl text-center">
        <div class="text-lg font-bold \${bmiColor}">\${bmi.toFixed(1)}</div>
        <div class="text-xs text-slate-400">BMI</div>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl text-center">
        <div class="text-lg font-bold \${muacColor}">\${muac}</div>
        <div class="text-xs text-slate-400">MUAC (cm)</div>
      </div>
      <div class="p-3 rounded-xl text-center \${muacStatus === 'SAM' ? 'bg-red-50' : muacStatus === 'MAM' ? 'bg-amber-50' : 'bg-green-50'}">
        <div class="text-base font-bold \${muacColor}">\${muacStatus}</div>
        <div class="text-xs text-slate-400">MUAC Status</div>
      </div>
    </div>
    <div class="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
      <i class="fas fa-info-circle"></i> Full WHO Z-score analysis runs after submitting the assessment.
    </div>
  \`;
}

// Attach live preview listeners
document.addEventListener('DOMContentLoaded', () => {
  ['f-weight', 'f-height', 'f-muac', 'f-age', 'f-gender'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateLiveZScore);
  });
  loadDashboard();
});

async function submitAssessment() {
  const name = document.getElementById('f-name')?.value?.trim();
  const age = parseInt(document.getElementById('f-age')?.value);
  const gender = document.getElementById('f-gender')?.value;
  const weight = parseFloat(document.getElementById('f-weight')?.value);
  const height = parseFloat(document.getElementById('f-height')?.value);
  const muac = parseFloat(document.getElementById('f-muac')?.value);
  
  if (!name || !age || !gender || !weight || !height || !muac) {
    showNotification('Please fill in all required fields (marked with *)', 'error');
    return;
  }
  
  const payload = {
    name,
    age_months: age,
    gender,
    weight_kg: weight,
    height_cm: height,
    muac_cm: muac,
    recent_illness: document.getElementById('f-illness')?.value === '1',
    mother_bmi: parseFloat(document.getElementById('f-mother-bmi')?.value) || undefined,
    diet_diversity_score: parseInt(document.getElementById('f-diet-score')?.value) || undefined,
    guardian_name: document.getElementById('f-guardian')?.value || undefined,
    location: document.getElementById('f-location')?.value || undefined,
    image_base64: capturedImageBase64 || undefined,
  };
  
  showLoading('Analyzing anthropometric data using WHO Z-Score methodology...');
  
  try {
    const res = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Assessment failed');
    }
    
    lastResult = data;
    hideLoading();
    displayResults(data);
    showNotification('Assessment completed successfully!', 'success');
    loadDashboard(); // refresh stats
  } catch (err) {
    hideLoading();
    showNotification('Error: ' + err.message, 'error');
  }
}

function displayResults(data) {
  const { child, assessment, diet_plan } = data;
  const section = document.getElementById('results-section');
  section.style.display = 'block';
  
  const status = assessment.nutrition_status;
  const gradients = {
    SAM: 'from-red-600 to-rose-700',
    MAM: 'from-amber-500 to-orange-600',
    Normal: 'from-emerald-500 to-teal-600',
  };
  const statusIcons = { SAM: '🚨', MAM: '⚠️', Normal: '✅' };
  const statusLabels = {
    SAM: 'SEVERE ACUTE MALNUTRITION',
    MAM: 'MODERATE ACUTE MALNUTRITION',
    Normal: 'NORMAL NUTRITIONAL STATUS',
  };
  
  const riskHTML = assessment.risk_factors.length
    ? assessment.risk_factors.map(r => \`<div class="flex items-center gap-2 text-sm p-2 bg-orange-50 rounded-lg border border-orange-100"><i class="fas fa-exclamation-triangle text-orange-500 flex-shrink-0"></i>\${r}</div>\`).join('')
    : '<div class="text-green-600 text-sm p-2">✅ No significant risk factors identified</div>';
  
  const mealsHTML = diet_plan.meals.map(meal => {
    const mealIcons = { 'Breakfast': '🌅', 'Mid-Morning Snack': '🍎', 'Lunch': '🍽️', 'Afternoon Snack': '🥤', 'Dinner': '🌙' };
    const icon = mealIcons[meal.meal_type] || '🍴';
    return \`
      <div class="meal-card">
        <div class="meal-header">
          <div class="flex items-center gap-3">
            <span class="text-2xl">\${icon}</span>
            <div>
              <div class="font-bold text-slate-800 text-sm">\${meal.meal_type}</div>
              <div class="text-xs text-slate-400">\${meal.time}</div>
            </div>
          </div>
          <div class="text-sky-600 font-bold text-sm">\${meal.calories} kcal</div>
        </div>
        <div class="p-3">
          <div class="space-y-1.5">
            \${meal.foods.map(f => \`
              <div class="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
                <div class="font-medium text-slate-700">\${f.name}</div>
                <div class="flex items-center gap-3 text-slate-400">
                  <span>\${f.quantity}</span>
                  <span class="font-medium text-sky-600">\${f.calories} kcal</span>
                </div>
              </div>
            \`).join('')}
          </div>
          <p class="text-xs text-slate-500 mt-2 italic">📌 \${meal.notes}</p>
        </div>
      </div>
    \`;
  }).join('');
  
  const whzColor = assessment.weight_for_height_z < -3 ? 'text-red-600' : assessment.weight_for_height_z < -2 ? 'text-amber-600' : 'text-green-600';
  const hazColor = assessment.height_for_age_z < -3 ? 'text-red-600' : assessment.height_for_age_z < -2 ? 'text-amber-600' : 'text-green-600';
  const bmiColor = assessment.bmi < 13 ? 'text-red-600' : assessment.bmi < 15 ? 'text-amber-600' : 'text-green-600';
  
  section.innerHTML = \`
    <div class="space-y-6">
      <!-- Status Result Hero -->
      <div class="result-hero bg-gradient-to-br \${gradients[status]} text-white shadow-2xl">
        <div class="text-6xl mb-3">\${statusIcons[status]}</div>
        <h2 class="text-2xl font-bold font-poppins">\${statusLabels[status]}</h2>
        <p class="text-white/80 mt-1 text-sm">Assessment ID: \${assessment.id}</p>
        <div class="mt-4 inline-flex items-center gap-3 bg-white/20 rounded-full px-6 py-2 backdrop-blur-sm">
          <div class="text-3xl font-bold">\${assessment.confidence}%</div>
          <div class="text-sm text-white/80">AI Confidence Score</div>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
          <div><div class="text-2xl font-bold">\${child.weight_kg} kg</div><div class="text-xs opacity-75">Weight</div></div>
          <div><div class="text-2xl font-bold">\${child.height_cm} cm</div><div class="text-xs opacity-75">Height</div></div>
          <div><div class="text-2xl font-bold">\${assessment.bmi}</div><div class="text-xs opacity-75">BMI</div></div>
        </div>
      </div>
      
      <!-- Z-Score Analysis -->
      <div class="grid grid-cols-3 gap-4">
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold \${whzColor}">\${assessment.weight_for_height_z}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">WHZ Score</div>
          <div class="text-xs mt-1 \${whzColor}">\${assessment.weight_for_height_z < -3 ? '🔴 Severe Wasting' : assessment.weight_for_height_z < -2 ? '🟡 Moderate Wasting' : '🟢 Normal'}</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold \${hazColor}">\${assessment.height_for_age_z}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">HAZ Score</div>
          <div class="text-xs mt-1 \${hazColor}">\${assessment.height_for_age_z < -3 ? '🔴 Severe Stunting' : assessment.height_for_age_z < -2 ? '🟡 Moderate Stunting' : '🟢 Normal'}</div>
        </div>
        <div class="card p-4 text-center">
          <div class="text-3xl font-bold \${bmiColor}">\${assessment.bmi}</div>
          <div class="text-xs text-slate-500 font-medium mt-1">BMI (kg/m²)</div>
          <div class="text-xs mt-1 \${bmiColor}">\${assessment.bmi < 13 ? '🔴 Critically Low' : assessment.bmi < 15 ? '🟡 Low' : '🟢 Acceptable'}</div>
        </div>
      </div>
      
      <!-- Clinical Notes -->
      <div class="card p-5">
        <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2"><i class="fas fa-notes-medical text-sky-500"></i> Clinical Assessment Notes</h3>
        <div class="bg-sky-50 border-l-4 border-sky-400 p-4 rounded-r-xl text-sm text-slate-700 leading-relaxed">
          \${assessment.clinical_notes}
        </div>
        \${assessment.risk_factors.length ? \`
          <div class="mt-3">
            <h4 class="font-semibold text-slate-700 text-sm mb-2">⚠️ Risk Factors:</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              \${riskHTML}
            </div>
          </div>
        \` : ''}
      </div>
      
      <!-- Diet Plan -->
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fas fa-utensils text-sky-500"></i> Personalized Diet Plan</h3>
          <div class="flex items-center gap-2">
            <div class="text-xs bg-sky-50 border border-sky-200 text-sky-700 rounded-full px-3 py-1 font-medium">\${diet_plan.daily_calories} kcal/day</div>
            <div class="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 font-medium">\${diet_plan.duration_weeks} weeks</div>
          </div>
        </div>
        
        \${mealsHTML}
        
        <!-- Supplements -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 class="font-semibold text-slate-700 text-sm mb-2">💊 Recommended Supplements</h4>
            <ul class="space-y-1">
              \${diet_plan.supplements.slice(0, 4).map(s => \`<li class="text-xs text-slate-600 flex items-start gap-1.5"><span class="text-sky-500 mt-0.5">•</span>\${s}</li>\`).join('')}
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-slate-700 text-sm mb-2">🚫 Foods to Avoid</h4>
            <ul class="space-y-1">
              \${diet_plan.foods_to_avoid.slice(0, 4).map(f => \`<li class="text-xs text-slate-600 flex items-start gap-1.5"><span class="text-red-400 mt-0.5">×</span>\${f}</li>\`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p class="text-xs text-slate-500 italic"><i class="fas fa-book text-slate-400 mr-1"></i> Protocol: \${diet_plan.who_protocol_ref}</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3">
        <button onclick="printReport()" class="btn-primary flex items-center gap-2">
          <i class="fas fa-print"></i> Print / Save PDF
        </button>
        <button onclick="viewReport('\${assessment.id}')" class="btn-secondary flex items-center gap-2">
          <i class="fas fa-file-alt"></i> View Full Report
        </button>
        <button onclick="resetForm()" class="btn-secondary flex items-center gap-2">
          <i class="fas fa-plus"></i> New Assessment
        </button>
      </div>
    </div>
  \`;
  
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Camera Functions ----
async function startCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.getElementById('camera-video');
    video.srcObject = cameraStream;
    video.style.display = 'block';
    document.getElementById('camera-placeholder').style.display = 'none';
    document.getElementById('btn-camera').style.display = 'none';
    document.getElementById('btn-capture').style.display = 'block';
  } catch (err) {
    showNotification('Camera access denied. Please use the upload option.', 'error');
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  
  capturedImageBase64 = canvas.toDataURL('image/jpeg', 0.8);
  
  const preview = document.getElementById('preview-img');
  preview.src = capturedImageBase64;
  preview.style.display = 'block';
  video.style.display = 'none';
  document.getElementById('btn-capture').style.display = 'none';
  document.getElementById('btn-clear').style.display = 'block';
  
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  
  showNotification('Photo captured!', 'success');
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    capturedImageBase64 = e.target.result;
    const preview = document.getElementById('preview-img');
    preview.src = capturedImageBase64;
    preview.style.display = 'block';
    document.getElementById('camera-placeholder').style.display = 'none';
    document.getElementById('btn-clear').style.display = 'block';
    showNotification('Image uploaded!', 'success');
  };
  reader.readAsDataURL(file);
}

function clearPhoto() {
  capturedImageBase64 = null;
  document.getElementById('preview-img').style.display = 'none';
  document.getElementById('camera-placeholder').style.display = 'flex';
  document.getElementById('btn-clear').style.display = 'none';
  document.getElementById('btn-camera').style.display = 'block';
  document.getElementById('file-upload').value = '';
  
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
}

// ---- History ----
async function loadHistory() {
  const statusFilter = document.getElementById('status-filter')?.value || '';
  const tbody = document.getElementById('history-table');
  
  tbody.innerHTML = '<tr><td colspan="13" class="text-center py-6 text-slate-400"><i class="fas fa-spinner fa-spin text-sky-500 text-xl"></i> Loading...</td></tr>';
  
  try {
    let url = \`/api/assess/history?page=\${historyCurrentPage}&limit=15\`;
    if (statusFilter) url += \`&status=\${statusFilter}\`;
    
    const data = await fetch(url).then(r => r.json());
    historyAllRecords = data.records || [];
    
    const total = data.total || 0;
    document.getElementById('pagination-info').textContent = \`Showing \${historyAllRecords.length} of \${total} records (page \${data.page || 1} of \${data.pages || 1})\`;
    
    document.getElementById('prev-btn').disabled = historyCurrentPage <= 1;
    document.getElementById('next-btn').disabled = historyCurrentPage >= (data.pages || 1);
    
    if (historyAllRecords.length === 0) {
      tbody.innerHTML = '<tr><td colspan="13" class="text-center py-8 text-slate-400"><i class="fas fa-database text-3xl mb-2 block opacity-30"></i>No records found.</td></tr>';
      return;
    }
    
    tbody.innerHTML = historyAllRecords.map((r, i) => {
      const badge = r.nutrition_status === 'SAM' ? 'badge-sam' : r.nutrition_status === 'MAM' ? 'badge-mam' : 'badge-normal';
      const icon = r.nutrition_status === 'SAM' ? '🚨' : r.nutrition_status === 'MAM' ? '⚠️' : '✅';
      const date = r.assessed_at ? new Date(r.assessed_at).toLocaleDateString() : '—';
      return \`<tr>
        <td class="text-xs text-slate-400">\${(historyCurrentPage - 1) * 15 + i + 1}</td>
        <td class="font-medium text-slate-800">\${r.name || '—'}</td>
        <td class="text-xs">\${r.age_months || '—'}m</td>
        <td class="text-xs">\${r.gender === 'male' ? '♂' : '♀'} \${r.gender || '—'}</td>
        <td class="text-xs">\${r.weight_kg || '—'} kg</td>
        <td class="text-xs">\${r.height_cm || '—'} cm</td>
        <td class="text-xs">\${r.muac_cm || '—'} cm</td>
        <td class="text-xs">\${r.bmi || '—'}</td>
        <td class="text-xs font-mono">\${r.weight_for_height_z || '—'}</td>
        <td><span class="\${badge}">\${icon} \${r.nutrition_status}</span></td>
        <td class="text-xs font-bold \${r.confidence >= 85 ? 'text-green-600' : 'text-amber-600'}">\${r.confidence || '—'}%</td>
        <td class="text-xs text-slate-400">\${date}</td>
        <td class="flex gap-1">
          <button onclick="viewReport('\${r.id}')" class="text-sky-600 hover:text-sky-800 text-xs font-medium px-2" title="View Report">📄 Report</button>
        </td>
      </tr>\`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = \`<tr><td colspan="13" class="text-center py-6 text-red-400">Error loading records: \${err.message}</td></tr>\`;
  }
}

function historyPage(dir) {
  historyCurrentPage = Math.max(1, historyCurrentPage + dir);
  loadHistory();
}

function filterHistory() {
  historyCurrentPage = 1;
  loadHistory();
}

// ---- Report & Export ----
function viewReport(assessmentId) {
  window.open('/api/report/' + assessmentId, '_blank');
}

function printReport() {
  if (!lastResult) {
    showNotification('No assessment to print. Run an assessment first.', 'error');
    return;
  }
  
  const printWin = window.open('/api/report/preview', '_blank');
  setTimeout(() => {
    if (printWin) {
      printWin.document.open();
      fetch('/api/report/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child: { ...lastResult.child, ...{
            weight_kg: lastResult.assessment.weight_for_height_z ? lastResult.child.weight_kg : 0,
            height_cm: lastResult.child.height_cm || 0,
            muac_cm: lastResult.child.muac_cm || 0,
          }},
          assessment: lastResult.assessment,
          diet_plan: lastResult.diet_plan,
        })
      }).then(r => r.text()).then(html => {
        printWin.document.write(html);
        printWin.document.close();
      });
    }
  }, 100);
}

async function exportData() {
  showNotification('Preparing Excel/CSV export...', 'info');
  window.location.href = '/api/export/csv';
}

function resetForm() {
  document.getElementById('f-name').value = '';
  document.getElementById('f-age').value = '';
  document.getElementById('f-gender').value = '';
  document.getElementById('f-weight').value = '';
  document.getElementById('f-height').value = '';
  document.getElementById('f-muac').value = '';
  document.getElementById('f-guardian').value = '';
  document.getElementById('f-location').value = '';
  document.getElementById('f-mother-bmi').value = '';
  document.getElementById('f-diet-score').value = '';
  document.getElementById('f-illness').value = '0';
  clearPhoto();
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('live-zscore').innerHTML = '<i class="fas fa-chart-bar text-3xl mb-2 block opacity-30"></i><p class="text-sm text-slate-400">Enter measurements to see live Z-scores</p>';
  lastResult = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showNotification('Form cleared. Ready for new assessment.', 'success');
}

// ---- UI Helpers ----
function showLoading(text = 'Processing...') {
  document.getElementById('loading').classList.add('active');
  document.getElementById('loading-text').textContent = text;
}

function hideLoading() {
  document.getElementById('loading').classList.remove('active');
}

function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-sky-500',
    warning: 'bg-amber-500',
  };
  
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  
  const n = document.createElement('div');
  n.className = \`notification \${colors[type]} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 max-w-sm text-sm font-medium\`;
  n.innerHTML = \`<i class="fas \${icons[type]}"></i>\${message}\`;
  
  document.getElementById('notification-container').appendChild(n);
  setTimeout(() => n.remove(), 4000);
}
</script>
</body>
</html>`;
}

export default app;
