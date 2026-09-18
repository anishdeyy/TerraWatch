-- ============================================================
--  DARUKAA.EARTH — DATABASE SCHEMA & SEED (PostgreSQL + PostGIS)
--  Geospatial Carbon & Biodiversity Intelligence Platform
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- ── 1. USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'ANALYST', 'VIEWER')),
    subscription_tier VARCHAR(30) DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'PROFESSIONAL', 'ENTERPRISE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── 2. PROJECTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    project_type VARCHAR(50) NOT NULL CHECK (project_type IN ('REFORESTATION', 'AGROFORESTRY', 'BIODIVERSITY', 'CARBON', 'CONSERVATION', 'RESTORATION')),
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MONITORING', 'COMPLETED', 'ARCHIVED')),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_area_hectares DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);

-- ── 3. SITES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    geometry GEOMETRY(POLYGON, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    area_hectares DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MONITORING', 'AT_RISK', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS sites_geometry_idx ON sites USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_sites_project_id ON sites(project_id);

-- ── 4. ENVIRONMENTAL METRICS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS environmental_metrics (
    id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    soil_organic_carbon DOUBLE PRECISION,
    soil_ph DOUBLE PRECISION,
    soil_moisture DOUBLE PRECISION,
    temperature DOUBLE PRECISION,
    rainfall DOUBLE PRECISION,
    ndvi DOUBLE PRECISION,
    biodiversity_score DOUBLE PRECISION,
    species_richness INTEGER,
    carbon_stock DOUBLE PRECISION,
    carbon_sequestration DOUBLE PRECISION,
    deforestation_risk DOUBLE PRECISION,
    water_stress DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_metrics_site_date ON environmental_metrics(site_id, recorded_at);

-- ── 5. REPORTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL,
    report_type VARCHAR(60) NOT NULL,
    title VARCHAR(255) NOT NULL,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    content JSONB NOT NULL,
    status VARCHAR(30) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. ORDERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100),
    amount INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'created',
    package_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_rzp ON orders(razorpay_order_id);

-- ── 7. PAYMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(100) UNIQUE NOT NULL,
    signature VARCHAR(255),
    status VARCHAR(30) DEFAULT 'captured',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ── 8. KNOWLEDGE SOURCES (Scientific source layer) ───────────
CREATE TABLE IF NOT EXISTS knowledge_sources (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(150),
    url VARCHAR(500),
    document_type VARCHAR(50),
    publication_date DATE,
    content TEXT
);

-- ── 9. SEED ADMIN USER ────────────────────────────────────────
-- Password is 'DarukaaAdmin2026!' hashed with bcrypt
INSERT INTO users (name, email, password_hash, role, subscription_tier)
VALUES (
    'Darukaa Admin',
    'admin@demo.darukaa.earth',
    '$2b$12$6t3kY3p7v37cO28tBvG0t.K9p1BfO7V065tHw0fIqPkyY9bH2jWmu',
    'ADMIN',
    'ENTERPRISE'
) ON CONFLICT (email) DO NOTHING;

-- Seed Analyst User
INSERT INTO users (name, email, password_hash, role, subscription_tier)
VALUES (
    'Anish Analyst',
    'analyst@darukaa.earth',
    '$2b$12$6t3kY3p7v37cO28tBvG0t.K9p1BfO7V065tHw0fIqPkyY9bH2jWmu',
    'ANALYST',
    'PROFESSIONAL'
) ON CONFLICT (email) DO NOTHING;
