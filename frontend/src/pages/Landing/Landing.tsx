import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  ArrowRight,
  Sparkles,
  Layers,
  BarChart3,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Droplets,
  Activity,
  FileText,
  Compass,
  CheckCircle2,
  FolderKanban,
  Database,
  Cpu,
  Server,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';

export const Landing: React.FC = () => {
  const [activePreviewLayer, setActivePreviewLayer] = useState<'standard' | 'satellite'>('standard');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Commercial SaaS Navbar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-slate-950">
                  Terra<span className="text-emerald-700">Watch</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 hidden sm:inline-block">
                  Geospatial Environmental Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <a href="#product-preview" className="hover:text-emerald-800 transition-colors">Product</a>
              <a href="#capabilities" className="hover:text-emerald-800 transition-colors">Capabilities</a>
              <Link to="/map" className="hover:text-emerald-800 transition-colors flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Map</span>
              </Link>
              <Link to="/analytics" className="hover:text-emerald-800 transition-colors flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Analytics</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl shadow-md shadow-emerald-900/10 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-xs font-bold text-emerald-900 mb-6 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Geospatial intelligence for environmental projects.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-tight mb-6">
              Map. Monitor.<br />
              <span className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent">
                Understand.
              </span>
            </h1>

            {/* Secondary Description */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 mb-10 leading-relaxed font-medium">
              Track site boundaries, biodiversity, carbon, vegetation, soil, and water indicators from one workspace.
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/map"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-sm sm:text-base shadow-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>View Live Map</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Product Preview Under Hero */}
        <section id="product-preview" className="py-12 bg-white border-y border-slate-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
                Real-Time Spatial Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Environmental intelligence at a glance
              </h2>
            </div>

            {/* High-Fidelity Dashboard Mockup Container */}
            <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-slate-800 text-white">
              {/* Top Metric Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pb-6 mb-6 border-b border-slate-800">
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Active Projects</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">4</span>
                    <span className="text-xs text-emerald-400 font-bold">+25%</span>
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Environmental Sites</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">15</span>
                    <span className="text-xs text-blue-400 font-bold">Polygons</span>
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total Area</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">7,600</span>
                    <span className="text-xs text-slate-400">ha</span>
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Avg. Biodiversity</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-400">78.4</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">Average NDVI</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-300">0.68</span>
                    <span className="text-xs text-emerald-400 font-bold">Canopy</span>
                  </div>
                </div>
              </div>

              {/* Two-Column Preview Underneath */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Mapbox-style Miniature Environmental Map */}
                <div className="lg:col-span-7 bg-[#0b1912] rounded-2xl p-4 border border-emerald-950/80 relative overflow-hidden min-h-[340px] flex flex-col justify-between">
                  {/* Map Header Controls */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Map Layer:</span>
                      <button
                        onClick={() => setActivePreviewLayer('standard')}
                        className={`px-2 py-0.5 rounded ${activePreviewLayer === 'standard' ? 'bg-emerald-800 text-white' : 'text-slate-400'}`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => setActivePreviewLayer('satellite')}
                        className={`px-2 py-0.5 rounded ${activePreviewLayer === 'satellite' ? 'bg-emerald-800 text-white' : 'text-slate-400'}`}
                      >
                        Satellite
                      </button>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                      EPSG:4326 PostGIS
                    </span>
                  </div>

                  {/* India Geographic Schematic & Polygons */}
                  <div className="relative my-4 flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 600 360" className="w-full h-full max-h-[260px] opacity-90">
                      {/* India Subcontinent Outline */}
                      <path
                        d="M 120 120 Q 200 60, 320 60 Q 420 80, 480 140 Q 520 220, 460 280 Q 380 340, 280 330 Q 180 280, 120 200 Z"
                        fill="#122a1f"
                        stroke="#2d6a4f"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      {/* Western Ghats Polygon (Active - Green) */}
                      <polygon
                        points="190,210 210,205 215,240 195,245"
                        fill="#10b981"
                        fillOpacity="0.6"
                        stroke="#34d399"
                        strokeWidth="1.5"
                      />
                      <circle cx="202" cy="225" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="218" y="228" fill="#e2e8f0" fontSize="11" fontWeight="bold">Western Ghats (Active)</text>

                      {/* Cauvery Basin (Active - Green) */}
                      <polygon
                        points="230,270 255,265 260,295 235,300"
                        fill="#10b981"
                        fillOpacity="0.6"
                        stroke="#34d399"
                        strokeWidth="1.5"
                      />
                      <circle cx="245" cy="282" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="260" y="285" fill="#e2e8f0" fontSize="11" fontWeight="bold">Cauvery Basin</text>

                      {/* Satpura-Maikal (Monitoring - Blue) */}
                      <polygon
                        points="290,165 330,160 335,185 295,190"
                        fill="#3b82f6"
                        fillOpacity="0.6"
                        stroke="#60a5fa"
                        strokeWidth="1.5"
                      />
                      <circle cx="312" cy="175" r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
                      <text x="325" y="178" fill="#e2e8f0" fontSize="11" fontWeight="bold">Satpura-Maikal (Monitoring)</text>

                      {/* Thar Region (At-Risk - Red) */}
                      <polygon
                        points="150,110 185,105 190,135 155,140"
                        fill="#ef4444"
                        fillOpacity="0.6"
                        stroke="#f87171"
                        strokeWidth="1.5"
                      />
                      <circle cx="170" cy="122" r="4" fill="#ef4444" stroke="#fff" strokeWidth="1" />
                      <text x="188" y="125" fill="#e2e8f0" fontSize="11" fontWeight="bold">Thar Region (At-Risk)</text>

                      {/* Sundarbans (Active - Green) */}
                      <polygon
                        points="410,180 445,175 450,205 415,210"
                        fill="#10b981"
                        fillOpacity="0.6"
                        stroke="#34d399"
                        strokeWidth="1.5"
                      />
                      <circle cx="430" cy="192" r="4" fill="#10b981" stroke="#fff" strokeWidth="1" />
                      <text x="445" y="195" fill="#e2e8f0" fontSize="11" fontWeight="bold">Sundarbans</text>
                    </svg>
                  </div>

                  {/* Bottom Map Legend */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 z-10">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                      <span>Active Sites (9)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                      <span>Monitoring (4)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                      <span>At-Risk Stress (2)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Environmental Trends */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Environmental Trends</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-mono">12-Month Telemetry</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">NDVI</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">+4.2%</span>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">0.68</div>
                        <span className="text-[10px] text-slate-400">Canopy Density</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Carbon Stock</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">+3.8%</span>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white">1,840</div>
                        <span className="text-[10px] text-slate-400">tC / ha Avg</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Water Stress</span>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-1.5 py-0.5 rounded">Moderate</span>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-300">34.2%</div>
                        <span className="text-[10px] text-slate-400">-5.1% vs cycle</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Biodiversity</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">+4.2%</span>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-emerald-300">78.4</div>
                        <span className="text-[10px] text-slate-400">Health Index / 100</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    <span>Inspect Interactive Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Product Value Proposition (ONE WORKSPACE) */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-2">
                ONE WORKSPACE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
                From project boundaries to environmental insights.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-medium">
                TerraWatch connects spatial data, environmental metrics, analytics, and AI-assisted interpretation in one workflow.
              </p>
            </div>

            {/* 4 Core Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-950 mb-2">
                  Map Your Sites
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Draw and manage real site boundaries with Mapbox and PostGIS.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-5">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-950 mb-2">
                  Track Environmental Change
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Monitor biodiversity, NDVI, carbon, soil, rainfall, and water stress over time.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-950 mb-2">
                  Understand Trends
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Turn historical metrics into clear trends, alerts, and project-level analytics.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-slate-950 mb-2">
                  Ask TerraWatch AI
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore environmental data using natural language and grounded AI analysis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. How TerraWatch Works (3 Steps) */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-2">
                WORKFLOW
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                How TerraWatch works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200/70 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mb-6">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-3">Create a project</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Set up a conservation, restoration, carbon, or biodiversity initiative with defined goals and target regions.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200/70 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mb-6">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-3">Map your sites</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Draw site boundaries directly on the map and store them as spatial PostGIS data with automated area calculation.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200/70 relative">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mb-6">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-3">Monitor and understand</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Explore environmental metrics, trends, alerts, and AI-assisted insights to protect and restore ecological corridors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Map Feature Preview */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block">
                  INTERACTIVE GIS
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  See every site in context.
                </h2>
                <p className="text-base text-slate-600 leading-relaxed font-medium">
                  Explore project boundaries and environmental indicators on an interactive map with satellite overlays, polygon drawing, and real-time telemetry.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>15 environmental sites</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                    <Activity className="w-3.5 h-3.5 text-blue-700" />
                    <span>Live project view</span>
                  </span>
                </div>
                <div className="pt-4">
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    <span>Open Map Explorer</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Map Preview Graphic */}
              <div className="w-full lg:max-w-xl bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl relative">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Mapbox GL Native GIS Engine</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                    Polygon Drawing + PostGIS
                  </span>
                </div>
                <div className="h-64 rounded-2xl bg-[#09150f] border border-emerald-950 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center space-y-2 z-10">
                    <Compass className="w-8 h-8 text-emerald-400 mx-auto animate-spin-slow" />
                    <div className="text-sm font-bold text-white">Interactive Environmental Map</div>
                    <div className="text-xs text-slate-400 max-w-xs">
                      PostGIS-backed spatial geometry with Mapbox Draw polygon editing and dynamic layer styling.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Analytics Preview */}
        <section className="py-20 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-2">
                LONGITUDINAL ANALYSIS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-3">
                See how environments change over time.
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Synthetic demonstration data</span>
              </div>
            </div>

            {/* 4 Professional Trend Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">NDVI Trend</span>
                <div className="text-2xl font-black text-slate-950 mb-1">0.52 → 0.68</div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded inline-block">
                  +30.7% Canopy Growth
                </span>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Carbon Trend</span>
                <div className="text-2xl font-black text-slate-950 mb-1">1,720 → 1,840 tC/ha</div>
                <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded inline-block">
                  +7.0% Sequestration
                </span>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Biodiversity</span>
                <div className="text-2xl font-black text-slate-950 mb-1">72 → 78 / 100</div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded inline-block">
                  +8.3% Species Richness
                </span>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Water Stress</span>
                <div className="text-2xl font-black text-slate-950 mb-1">42% → 34%</div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded inline-block">
                  -19.0% Moisture Relief
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. TerraWatch AI Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-2">
                GROUNDED REASONING
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Ask questions about your environmental data.
              </h2>
            </div>

            {/* AI Query & Response Mockup Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
              {/* User Question */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  You
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block mb-1">Natural Language Query</span>
                  <p className="text-sm font-semibold text-slate-900">
                    "Which sites show declining vegetation and rising water stress?"
                  </p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-3 bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-950">TerraWatch AI</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Based on available project data
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    Three sites show both signals over the selected period. The strongest overlap appears in the Thar region site and two monitored sites in the western corridor where monsoon onset delays coincided with heightened evapotranspiration.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <Link
                  to="/ai"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors text-center"
                >
                  Ask TerraWatch AI
                </Link>
                <Link
                  to="/analytics"
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  Explore Analytics
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Technology / Trust Section */}
        <section className="py-14 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
              Built on modern geospatial infrastructure
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-600">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>React 18</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Mapbox GL JS</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>PostgreSQL</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>PostGIS</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Server className="w-4 h-4 text-emerald-700" />
                <span>FastAPI</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <span>Google Gemini</span>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Product Capabilities */}
        <section id="capabilities" className="py-20 bg-slate-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 block mb-2">
                PLATFORM MODULES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Everything you need to manage environmental projects.
              </h2>
            </div>

            {/* 6 Capabilities Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <FolderKanban className="w-6 h-6 text-emerald-800 mb-3" />
                <h3 className="font-bold text-base text-slate-900 mb-1">Project Management</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Organize multi-site conservation and restoration initiatives under unified administrative controls.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <MapPin className="w-6 h-6 text-emerald-800 mb-3" />
                <h3 className="font-bold text-base text-slate-900 mb-1">Geospatial Mapping</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Draw and inspect accurate site boundaries with sub-meter geodesic area calculations.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <BarChart3 className="w-6 h-6 text-emerald-800 mb-3" />
                <h3 className="font-bold text-base text-slate-900 mb-1">Environmental Analytics</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Track 12-month longitudinal trends for carbon stock, NDVI, soil moisture, and rainfall.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <Activity className="w-6 h-6 text-emerald-800 mb-3" />
                <h3 className="font-bold text-base text-slate-900 mb-1">Site Monitoring</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Receive automated alerts whenever moisture stress or canopy declines exceed thresholds.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <Sparkles className="w-6 h-6 text-emerald-800 mb-3" />
                <h3 className="font-bold text-base text-slate-900 mb-1">AI Insights</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Query environmental telemetry in natural language with Gemini-assisted interpretations.
                </p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <FileText className="w-6 h-6 text-emerald-800 mb-3" />
                <h3 className="font-bold text-base text-slate-900 mb-1">Reports & Exports</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Generate professional PDF dossiers and export historical tabular CSV data instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Final Call To Action */}
        <section className="py-20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Start mapping your environmental projects.
            </h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-emerald-100/90 font-medium">
              Create projects, map sites, and explore environmental trends from one workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-emerald-950 hover:bg-slate-100 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105"
              >
                Launch TerraWatch
              </Link>
              <Link
                to="/map"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-600/60 rounded-xl font-bold text-sm transition-colors"
              >
                Explore the Map
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Commercial SaaS Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-900">
            {/* Brand Column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2 text-white font-black text-lg">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>TerraWatch</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Geospatial Environmental Intelligence platform for monitoring carbon sequestration, biodiversity restoration, and ecological site boundaries.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Product</span>
              <ul className="space-y-1.5">
                <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                <li><Link to="/projects" className="hover:text-emerald-400 transition-colors">Projects</Link></li>
                <li><Link to="/map" className="hover:text-emerald-400 transition-colors">Map</Link></li>
                <li><Link to="/analytics" className="hover:text-emerald-400 transition-colors">Analytics</Link></li>
                <li><Link to="/ai" className="hover:text-emerald-400 transition-colors">AI Insights</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Resources</span>
              <ul className="space-y-1.5">
                <li><Link to="/reports" className="hover:text-emerald-400 transition-colors">Reports</Link></li>
                <li><a href="#documentation" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">API</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-2">
              <span className="font-bold text-white block uppercase tracking-wider text-[11px]">Legal</span>
              <ul className="space-y-1.5">
                <li><a href="#privacy" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                <li><a href="#terms" className="hover:text-emerald-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 TerraWatch. Environmental intelligence platform.</p>
            <div className="flex items-center gap-4">
              <span>WGS84 EPSG:4326</span>
              <span>•</span>
              <span>PostGIS Spatial Standards</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
