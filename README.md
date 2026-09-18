# TerraWatch
### Geospatial Carbon & Environmental Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.3-336791.svg?logo=postgresql&logoColor=white)](https://postgis.net)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI%20Intelligence-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Razorpay](https://img.shields.io/badge/Razorpay-Verified%20Payments-02042B.svg?logo=razorpay&logoColor=white)](https://razorpay.com)

---

## 1. Project Overview & Architecture

**TerraWatch** is a full-stack, enterprise-grade environmental intelligence SaaS platform built for environmental project developers, carbon registry auditors, and conservation analysts. It delivers real-time monitoring of live biomass carbon stocks, biodiversity indices, normalized difference vegetation index (NDVI), topsoil organic carbon, and watershed stress across geographical restoration corridors.

### Architectural Transformation Rationale
The original Starbucks India prototype featured authentication tokens, order creation, and payment verification, but functioned as a consumer beverage e-commerce site. The codebase was architecturally re-engineered into a startup-grade geospatial intelligence platform:

| Original Starbucks Clone Concept | Transformed Darukaa.Earth Architecture |
| :--- | :--- |
| Coffee Menu & Beverages | Environmental Projects & Geospatial Sites |
| Beverage Categories | Project Classifications (Carbon, Reforestation, Agroforestry) |
| Beverage Ordering Cart | Subscription & Analytics Package Checkout |
| Coffee Shop Store Locations | Geographical Polygons with PostGIS Spatial Coordinates |
| Coffee Recommendations | Gemini AI Evidence-Grounded Ecological Synthesis |
| Food Order History | Purchase Invoices & Subscription Tier Audit Trails |
| Express / Node.js Backend | Python 3.12+ / FastAPI / Pydantic v2 / SQLAlchemy 2.0 |
| MySQL Database | PostgreSQL + PostGIS with GIST Spatial Indexing (Dual SQLite/Shapely fallback) |

---

## 2. System Architecture Diagram

```text
                                 ┌────────────────────────────────────────┐
                                 │          React 18 + Vite + TS          │
                                 │   Mapbox GL JS + Draw + Chart.js       │
                                 └───────────────────┬────────────────────┘
                                                     │ HTTP / REST / JWT
                                                     ▼
                                 ┌────────────────────────────────────────┐
                                 │           FastAPI Gateway              │
                                 │   Pydantic v2 + OAuth2 Bearer Auth     │
                                 └───────────┬──────────────┬─────────────┘
                                             │              │
                   ┌─────────────────────────┘              └──────────────────────────┐
                   ▼                                                                   ▼
┌────────────────────────────────────────┐                          ┌────────────────────────────────────┐
│         PostgreSQL 15 + PostGIS        │                          │      Google Gemini AI Engine       │
│  • Sites (GEOMETRY(POLYGON, 4326))     │                          │  • Site Ecological Summaries       │
│  • Spatial GIST Indexing               │                          │  • Cross-Variable Recommendations  │
│  • 12-Month Telemetry Time-Series      │                          │  • Anomaly Explanation Hypotheses  │
│  • Orders, Invoices, Knowledge Sources │                          │  • Natural Language 'Ask Darukaa'  │
└────────────────────────────────────────┘                          └────────────────────────────────────┘
                   │                                                                   │
                   ▼                                                                   ▼
┌────────────────────────────────────────┐                          ┌────────────────────────────────────┐
│      Razorpay Payments Integration     │                          │       ReportLab PDF Engine         │
│  • Fixed Server-Side Price Verification│                          │  • Verifiable Ecological Dossiers  │
│  • HMAC-SHA256 Signature Verification  │                          │  • Distinguishes Observed vs AI    │
│  • Idempotent Webhook Processing       │                          │  • Instant Downloadable Reports    │
└────────────────────────────────────────┘                          └────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with Vite and TypeScript
- **Styling**: Tailwind CSS with custom earthy green palette (`#1b4332`, `#2d6a4f`, `#52b788`)
- **Mapping & GIS**: Mapbox GL JS (`v3.2.0`), `@mapbox/mapbox-gl-draw`, plus high-fidelity SVG/Canvas interactive fallback
- **Data Visualization**: Chart.js (`v4.4.2`) & `react-chartjs-2` with 7D, 30D, 3M, 6M, 1Y, ALL temporal toggles
- **Networking & State**: Axios with JWT authorization interceptors and React Context
- **Icons**: Lucide React

### Backend
- **Runtime & Framework**: Python 3.12+ with FastAPI
- **Data Validation**: Pydantic v2 & Pydantic-Settings
- **ORM & Database**: SQLAlchemy 2.0 with PostgreSQL/PostGIS support & transparent SQLite/Shapely development fallback
- **Spatial Geometry**: `shapely` & `pyproj` for WGS84 geodesic ellipsoid area and centroid calculations
- **Authentication**: JWT tokens (`python-jose`) with `bcrypt` password hashing
- **Payments**: Razorpay Python SDK with HMAC-SHA256 signature verification
- **AI Intelligence**: Server-side Google Gemini REST API (`gemini-1.5-flash` / `gemini-2.0-flash`)
- **Document Generation**: `reportlab` for verifiable environmental PDF exports
- **Code Quality & Testing**: Pytest test suite & Ruff linter

---

## 4. Database Schema & PostGIS Design

### PostGIS Table Specifications

1. **`users`**:
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR), `email` (VARCHAR UNIQUE), `password_hash` (VARCHAR)
   - `role` (VARCHAR: `ADMIN`, `ANALYST`, `VIEWER`)
   - `subscription_tier` (VARCHAR: `FREE`, `PROFESSIONAL`, `ENTERPRISE`)

2. **`projects`**:
   - `id` (SERIAL PRIMARY KEY)
   - `name` (VARCHAR), `description` (TEXT)
   - `project_type` (VARCHAR: `REFORESTATION`, `AGROFORESTRY`, `BIODIVERSITY`, `CARBON`, `CONSERVATION`, `RESTORATION`)
   - `status` (VARCHAR: `ACTIVE`, `MONITORING`, `COMPLETED`, `ARCHIVED`)
   - `owner_id` (INTEGER REFERENCES users(id))
   - `total_area_hectares` (FLOAT)

3. **`sites`**:
   - `id` (SERIAL PRIMARY KEY)
   - `project_id` (INTEGER REFERENCES projects(id) ON DELETE CASCADE)
   - `name` (VARCHAR), `description` (TEXT)
   - `geometry` (GEOMETRY(POLYGON, 4326)) with **GIST Index** (`sites_geometry_idx`)
   - `latitude` (FLOAT), `longitude` (FLOAT), `area_hectares` (FLOAT)
   - `status` (VARCHAR: `ACTIVE`, `MONITORING`, `AT_RISK`, `ARCHIVED`)

4. **`environmental_metrics`**:
   - `id` (SERIAL PRIMARY KEY), `site_id` (INTEGER REFERENCES sites(id))
   - `recorded_at` (TIMESTAMP WITH TIME ZONE)
   - `soil_organic_carbon` (FLOAT %), `soil_ph` (FLOAT), `soil_moisture` (FLOAT %)
   - `temperature` (FLOAT °C), `rainfall` (FLOAT mm)
   - `ndvi` (FLOAT: -1.0 to +1.0), `biodiversity_score` (FLOAT: 0 to 100), `species_richness` (INTEGER)
   - `carbon_stock` (FLOAT tC/ha), `carbon_sequestration` (FLOAT tCO2e/ha/yr)
   - `deforestation_risk` (FLOAT %), `water_stress` (FLOAT %)

5. **`orders`** & **`payments`**:
   - Tracks Razorpay order IDs, payment IDs, amount in paise, currency, package types, and HMAC signatures.

6. **`reports`**:
   - Stores compiled environmental dossiers with observed data, calculated indices, and AI syntheses.

### Spatial Capabilities Implemented
- **Geodesic Area Calculation**: Uses WGS84 ellipsoid projection via `pyproj.Geod` and `shapely.ops` to calculate true geodesic area in hectares.
- **GeoJSON Feature Collection**: `/api/sites/geojson` outputs standard RFC 7946 GeoJSON consumed directly by Mapbox layers.
- **Proximity Search**: `/api/sites/nearby?lat=...&lon=...&radius_km=...` queries sites within specified spherical distance.

---

## 5. Composite Environmental Health Score

Calculated transparently as a weighted composite demo index:
- **30% Biodiversity Index** (Normalized relative to 100 benchmark)
- **20% Vegetation Index** (NDVI scaled from 0..1 to 0..100)
- **20% Standing Live Biomass Carbon** (Benchmark 200 tC/ha = 100 pts)
- **15% Topsoil Health** (Organic carbon percentage + balanced pH near 6.5)
- **15% Water Balance** (Inverse of Evapotranspiration Water Stress)

Clearly labeled in UI and PDF: *"Composite demo index — configurable weighting."*

---

## 6. Google Gemini AI Integration & Evidence Grounding

All AI features operate **server-side** via FastAPI; API keys are never leaked to client browsers.

### Five Core Gemini AI Features
1. **Site AI Diagnostic Summary** (`POST /api/ai/site-summary`): Structured JSON summary including key findings, risk factors, recommended actions, and limitations.
2. **Cross-Variable Recommendation Engine** (`POST /api/ai/recommendations`): Synthesizes coupled dynamics between soil moisture, canopy cover, and biodiversity with short/medium/long-term intervention horizons.
3. **Anomaly Explanation Engine** (`POST /api/ai/anomaly-explanation`): Hypothesizes potential causes (e.g. drought stress, fungal pathogens, sensor haze) when acute drops occur, phrased strictly as scientific hypotheses.
4. **Project Executive Dossier** (`POST /api/ai/project-summary`): Portfolio-wide executive briefing highlighting highest-risk sites and positive trajectories.
5. **Natural-Language Analytics** (`POST /api/ai/ask`): "Ask Darukaa AI" conversational query interface grounded in database telemetry.

### Strict Data-Grounding Guardrails
- **Zero Fabrication**: Prompts instruct Gemini never to invent measurements or extrapolate non-existent field trials.
- **Uncertainty Calibration**: Clearly labels confidence levels (High, Medium, Low) and notes data gaps.
- **Resilient Fallback**: Offline heuristic fallback engine ensures reliable test execution and demo stability.

---

## 7. Razorpay Integration & Subscription Tiers

### Subscription Packages
1. **Explorer Plan** (₹0): Basic dashboard, Mapbox viewer, standard telemetry cards.
2. **Professional Plan** (₹499/mo): AI site summaries, anomaly explanations, 12-month trends, PDF report downloads, alerts.
3. **Enterprise Plan** (₹1,499/mo): Unlimited projects/sites, executive dossiers, "Ask Darukaa AI", comparative analytics, priority PostGIS export.

### Security Architecture
- **Server-Side Pricing**: Package amounts are hardcoded on the backend (paise units); frontend amounts are never trusted.
- **Cryptographic Verification**: Verifies payment signatures via HMAC-SHA256 (`razorpay_order_id + "|" + razorpay_payment_id`).
- **Idempotency**: Webhook events (`payment.captured`, `order.paid`) are processed idempotently with audit logs.
- **Premium Gating**: Reusable `<PremiumGate />` component cleanly locks features for free tier accounts.

---

## 8. Hackathon Judge Quick-Start & Local Run

### Prerequisites
- Python 3.11+ (Python 3.12 recommended)
- Node.js 18+ (Node 20 or 22 recommended)
- Git

### Credentials
- **Admin Account**: `admin@demo.darukaa.earth`
- **Password**: `DarukaaAdmin2026!`
*(Convenient 1-click **Autofill** button is available on the Login page)*

### Step 1: Start Backend (FastAPI)
```bash
# In workspace root
python -m pip install -r backend/requirements.txt
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*The backend automatically initializes tables and seeds 5 Indian projects, 15 polygon sites, and 12-month metrics!*
*API Documentation available at:* `http://localhost:8000/docs`

### Step 2: Start Frontend (React + Vite)
```bash
# In a new terminal window
cd frontend
npm install
npm run dev
```
*Frontend runs at:* `http://localhost:3000`

### Step 3: Run Automated Test Suite
```bash
cd backend
python -m pytest tests -v
```
*(All 14 unit and integration tests pass with 100% success rate)*

---

## 9. Docker Deployment

Run the entire platform (PostGIS, FastAPI, React/Nginx) with a single command:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostGIS: `localhost:5432`

---

## 10. Continuous Integration & Code Quality (CI/CD)

- **GitHub Actions CI** (`.github/workflows/ci.yml`):
  - Automatically runs Ruff linting & formatting checks on backend
  - Executes Pytest test suite with simulated database fixtures
  - Runs ESLint, TypeScript verification, and production Vite build on frontend
  - Verifies multi-stage Docker builds
- **Pre-commit Automation** (`.pre-commit-config.yaml`):
  - Enforces Prettier for frontend (`.ts`, `.tsx`, `.css`)
  - Enforces Ruff for Python backend (`ruff check --fix`, `ruff-format`)
  - Validates JSON, YAML, and prevents accidental commit of large binaries

---

## 11. 10-Step Hackathon Demonstration Script

1. **Step 1 — Login**: Navigate to `http://localhost:3000/login`, click **Autofill**, and sign in as `admin@demo.darukaa.earth`.
2. **Step 2 — Dashboard**: Review the 8 platform metric cards, active alerts, composite environmental health score (74/100), and continental Indian site preview.
3. **Step 3 — Map Explorer**: Go to `/map`, toggle between Topographic and Satellite view, filter sites by status or project, and inspect interactive boundary polygons across Maharashtra, Karnataka, Rajasthan, MP, and West Bengal.
4. **Step 4 — Add Site**: Click **Draw Site Polygon**, select an Indian region preset (e.g. Western Ghats), observe the auto-calculated area in hectares (e.g. 385 ha), and save the polygon.
5. **Step 5 — Site Deep-Dive**: Click on any site (e.g. *"Bhimashankar Wildlife Corridor"*) to open `/sites/1`. Inspect the 10 metric cards and 12-month Chart.js trajectories (Carbon, NDVI, Biodiversity, Soil, Rainfall).
6. **Step 6 — Gemini AI Synthesis**: Scroll to the AI Intelligence Panel and click **✨ Generate AI Site Analysis**. Observe evidence-grounded findings, risk factors, and recommended interventions.
7. **Step 7 — Ask Darukaa AI**: In `/ai-insights`, ask natural language questions (e.g., *"Which site has the highest carbon stock?"*) and inspect the grounded response.
8. **Step 8 — Comparative Analytics**: Go to `/analytics` to benchmark Site A vs Site B on carbon density trends.
9. **Step 9 — Razorpay Checkout**: Go to `/pricing`, select the **Professional Plan** (₹499), trigger the Razorpay modal in test mode, complete payment, and watch features activate instantly.
10. **Step 10 — Report Export**: Open `/reports` and click **Download Verified PDF** to generate an executive dossier distinguishing observed data from AI hypotheses.
