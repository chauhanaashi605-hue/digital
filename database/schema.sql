-- ==========================================================
-- GramTrack Relational Database Schema (PostgreSQL DDL)
-- Project: Digital Rural Housing & Panchayat Monitoring
-- ==========================================================

-- 1. Villages Entity
CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    panchayat VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    total_beneficiaries INTEGER DEFAULT 0,
    completed_houses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users and Role Entities
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'ADMIN', 'DISTRICT_OFFICER', 'FIELD_INSPECTOR'
    phone VARCHAR(20),
    assigned_district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rural Housing Beneficiaries
CREATE TABLE IF NOT EXISTS beneficiaries (
    id VARCHAR(50) PRIMARY KEY,
    beneficiary_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    guardian_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    village_id VARCHAR(50) REFERENCES villages(id),
    household_reference VARCHAR(50) NOT NULL,
    national_id_masked VARCHAR(30) NOT NULL,
    scheme_reference VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    registration_date DATE NOT NULL,
    current_stage VARCHAR(30) DEFAULT 'FOUNDATION',
    verification_status VARCHAR(40) DEFAULT 'VERIFIED',
    phone VARCHAR(20),
    bank_account_masked VARCHAR(30),
    ifsc_code VARCHAR(20),
    sanction_amount NUMERIC(12, 2) DEFAULT 130000.00,
    disbursed_amount NUMERIC(12, 2) DEFAULT 0.00,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Field Inspection Records
CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(50) PRIMARY KEY,
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    stage VARCHAR(30) NOT NULL, -- 'FOUNDATION', 'PLINTH', 'LINTEL', 'COMPLETION'
    photo_url TEXT NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    gps_accuracy NUMERIC(6, 2),
    timestamp TIMESTAMP NOT NULL,
    inspector_id VARCHAR(50) REFERENCES users(id),
    remarks TEXT,
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'APPROVED', 'REJECTED', 'REINSPECTION_REQUESTED'
    review_remarks TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    is_panchayat_project BOOLEAN DEFAULT FALSE,
    project_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Gram Panchayat Infrastructure Projects
CREATE TABLE IF NOT EXISTS panchayat_projects (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    village_id VARCHAR(50) REFERENCES villages(id),
    department VARCHAR(100) NOT NULL,
    assigned_officer VARCHAR(100),
    status VARCHAR(30) DEFAULT 'IN_PROGRESS',
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    allocated_budget NUMERIC(12, 2) NOT NULL,
    spent_budget NUMERIC(12, 2) DEFAULT 0.00,
    photo_url TEXT,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Verification & Anti-Duplication Cases
CREATE TABLE IF NOT EXISTS verification_cases (
    id VARCHAR(50) PRIMARY KEY,
    case_id VARCHAR(50) UNIQUE NOT NULL,
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    matched_beneficiary_id VARCHAR(50),
    flag_reason TEXT NOT NULL,
    match_type VARCHAR(50) NOT NULL,
    confidence_score INTEGER,
    review_status VARCHAR(40) DEFAULT 'POTENTIAL_DUPLICATE',
    details TEXT,
    flagged_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(100),
    review_remarks TEXT,
    resolved_date TIMESTAMP
);

-- 7. Instalment & Direct Benefit Transfer (DBT) Records
CREATE TABLE IF NOT EXISTS instalment_records (
    id VARCHAR(50) PRIMARY KEY,
    beneficiary_id VARCHAR(50) REFERENCES beneficiaries(id),
    instalment_number INTEGER NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    stage_trigger VARCHAR(30) NOT NULL,
    status VARCHAR(40) NOT NULL,
    required_approval_status VARCHAR(30) NOT NULL,
    transaction_reference VARCHAR(100),
    remarks TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Immutable Audit Log Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(30) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    details TEXT
);
