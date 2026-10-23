import JSZip from 'jszip';

export async function generateProjectZip(onProgress?: (percent: number, status: string) => void): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.(10, 'Gathering project manifests and documentation...');

  // README.md
  zip.file(
    'README.md',
    `# GramTrack — Digital Rural Housing & Panchayat Development Monitoring System

GramTrack is an enterprise-grade digital monitoring platform for rural housing schemes (such as PMAY-Gramin) and Gram Panchayat infrastructure development projects.

## Key Features
- **4-Stage Construction Monitoring**: Foundation, Plinth, Lintel, and Completion tracking with geo-tagged photographic evidence.
- **Offline-First Architecture**: Powered by IndexedDB. Field inspectors can capture evidence without internet, which automatically synchronizes upon reconnection.
- **Beneficiary Verification & Duplicate Detection**: Algorithmic cross-matching of SECC household references, Aadhaar hashes, and prior scheme records to prevent dual-allotments.
- **Panchayat Works Management**: Monitoring roads, drainage, community halls, solar grids, and Amrit Sarovars with expenditure tracking.
- **Instalment & DBT Gateway Simulation**: Automated 4-tier milestone disbursement linking physical stage approvals to PFMS/DBT release.
- **District Review & Audit Trail**: Role-based access control (Admin, District Officer, Field Inspector) with immutable audit logging.
- **Capacitor Android Packaging**: Field inspector mobile experience ready for Android APK compilation.

## Tech Stack
- Frontend: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion
- Offline Storage: IndexedDB (Native Web API)
- Backend: Express, Node.js, PostgreSQL relational schema
- Mobile: Capacitor Android

## Quick Start (Windows 11 PowerShell)
\`\`\`powershell
# 1. Install dependencies
npm install

# 2. Run in Development Mode
npm run dev
# The system launches on http://localhost:3000
\`\`\`

## Demo Credentials
- **Administrator**: admin@gramtrack.gov.in / demo123
- **District Officer**: district@gramtrack.gov.in / demo123
- **Field Inspector**: inspector@gramtrack.gov.in / demo123
`
  );

  onProgress?.(30, 'Bundling Android build configs and Capacitor manifest...');

  // ANDROID_BUILD.md
  zip.file(
    'ANDROID_BUILD.md',
    `# Building the GramTrack Android APK with Capacitor

## Prerequisites
1. Node.js LTS (v18 or v20+)
2. Android Studio Flamingo or newer
3. Android SDK (API Level 33+) with build-tools
4. Java Development Kit (JDK 17)

## Build Instructions (PowerShell)
\`\`\`powershell
# 1. Build the production web bundle
npm run build

# 2. Add Android platform (if not already added)
npx cap add android

# 3. Synchronize web assets to native Android project
npx cap sync android

# 4. Open project in Android Studio
npx cap open android

# 5. Build Debug/Release APK
# In Android Studio: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
\`\`\`
`
  );

  // capacitor.config.ts
  zip.file(
    'capacitor.config.ts',
    `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.in.gramtrack.inspector',
  appName: 'GramTrack Field Inspector',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      permissions: ['location']
    },
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
`
  );

  onProgress?.(50, 'Adding PostgreSQL database schemas and seed data...');

  // database/schema.sql
  zip.file(
    'database/schema.sql',
    `-- GramTrack Relational Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    panchayat VARCHAR(100) NOT NULL,
    block VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    status VARCHAR(30) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'APPROVED', 'REJECTED'
    review_remarks TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
`
  );

  // database/seed.sql
  zip.file(
    'database/seed.sql',
    `-- GramTrack Demonstration Seed Data
INSERT INTO villages (id, name, panchayat, block, district, state, pincode) VALUES
('vil-01', 'Rampur', 'Rampur Gram Panchayat', 'Maholi', 'Sitapur', 'Uttar Pradesh', '261141'),
('vil-02', 'Shivpuri', 'Shivpuri Gram Panchayat', 'Maholi', 'Sitapur', 'Uttar Pradesh', '261142'),
('vil-03', 'Haridaspur', 'Haridaspur Gram Panchayat', 'Pisawan', 'Sitapur', 'Uttar Pradesh', '261151'),
('vil-04', 'Chandanpur', 'Chandanpur Gram Panchayat', 'Pisawan', 'Sitapur', 'Uttar Pradesh', '261152');

INSERT INTO users (id, name, email, password_hash, role, phone, assigned_district) VALUES
('usr-01', 'Rajesh Verma (IAS)', 'admin@gramtrack.gov.in', '$2b$10$hashed_demo_secret', 'ADMIN', '+91 98100 23451', 'Sitapur District'),
('usr-02', 'Priya Sharma (PCS)', 'district@gramtrack.gov.in', '$2b$10$hashed_demo_secret', 'DISTRICT_OFFICER', '+91 94500 87123', 'Sitapur District'),
('usr-03', 'Amit Kumar', 'inspector@gramtrack.gov.in', '$2b$10$hashed_demo_secret', 'FIELD_INSPECTOR', '+91 87654 11290', 'Sitapur District');
`
  );

  onProgress?.(80, 'Archiving client code and server endpoints...');

  // server.ts
  zip.file(
    'server.ts',
    `import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'GramTrack Rural Housing & Panchayat Monitoring API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export default app;
`
  );

  onProgress?.(95, 'Generating compressed ZIP archive...');
  const content = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'ZIP bundle created successfully!');
  return content;
}

export function downloadBlob(blob: Blob, filename = 'GramTrack-Project-Bundle.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
