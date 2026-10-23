# GramTrack — Digital Rural Housing & Panchayat Development Monitoring System

GramTrack is an enterprise-grade digital monitoring and governance platform designed for rural housing schemes (e.g., PMAY-Gramin) and Gram Panchayat civil development works. It bridges ground-level field inspections with district administrative oversight through geo-tagged photographic evidence, offline synchronization, automated duplicate detection, and milestone-gated Direct Benefit Transfer (DBT) instalments.

---

## 🌟 Highlights & Capabilities

- **4-Stage Construction Monitoring**: Foundation, Plinth Beam, Lintel Level, and Completion milestones with high-resolution photo evidence, GPS coordinates, and inspection timestamps.
- **Offline-First IndexedDB Architecture**: Field inspectors in rural low-connectivity areas can capture photos, notes, and coordinates entirely offline. Inspections persist in IndexedDB and synchronize automatically when connectivity is restored.
- **Beneficiary Verification & Duplicate Detection**: Heuristic engine cross-examines SECC household references, Aadhaar hashes, and historical scheme grants to identify duplicate allocations before funds are released.
- **Panchayat Works Management**: Lifecycle tracking for village concrete roads, storm drainage, community halls, solar grids, and Amrit Sarovar ponds with expenditure analytics.
- **Milestone-Gated DBT Simulation**: 4-tier milestone disbursement simulator with automated clearance checks and simulated PFMS transaction reference generation.
- **Multi-Role Access Control**: Tailored workflows and security permissions for Administrators, District Officers, and Field Inspectors.
- **Capacitor Mobile Ready**: Mobile-first field inspector interface ready to build as a native Android APK.
- **One-Click Project ZIP Export**: Download the entire source tree, documentation, and database schemas directly from the web interface.

---

## 💻 Tech Stack

- **Frontend**: React 19, Vite 8, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Motion
- **Offline Storage**: IndexedDB (Native Web API with transaction queue)
- **Packaging**: Capacitor 6.x (Android runtime)
- **Backend**: Node.js, Express REST API
- **Database**: PostgreSQL (Relational schema provided in `/database/schema.sql`)

---

## 🚀 Quick Start (Windows 11 PowerShell)

### 1. Prerequisites
- **Node.js**: v18.x or v20.x LTS installed (`node -v`)
- **Git** or extract the project ZIP folder.

### 2. Install Dependencies
Open PowerShell in the project directory:
```powershell
npm install
```

### 3. Run Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demonstration Accounts

The platform comes pre-seeded with realistic demonstration accounts. You can sign in using the credentials below or click any of the instant demo login buttons on the login screen:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gramtrack.gov.in` | `demo123` | Complete administrative authority, user management, and audit logs |
| **District Officer** | `district@gramtrack.gov.in` | `demo123` | Stage approval/rejection, duplicate case resolution, DBT release |
| **Field Inspector** | `inspector@gramtrack.gov.in` | `demo123` | Camera capture, GPS tagging, offline inspections queue |

---

## 📱 Mobile Field App (Capacitor Android)

To experience the field inspector interface directly in your browser:
1. Click the **"Field App"** toggle in the top navigation bar.
2. Simulate offline field conditions using the **"Online / Offline"** toggle.
3. Test taking an inspection photograph, capturing GPS coordinates, and queueing locally.

### To build the native Android APK:
Refer to [ANDROID_BUILD.md](./ANDROID_BUILD.md) for step-by-step PowerShell commands.

---

## 🗄️ Database Architecture

The schema definitions and seed data are located in the `/database` directory:
- `database/schema.sql`: Full DDL for relational entities (`villages`, `users`, `beneficiaries`, `inspections`, `panchayat_projects`, `verification_cases`, `instalment_records`, `audit_logs`).
- `database/seed.sql`: Realistic mock dataset for testing in PostgreSQL.

---

## 🔒 Security & Privacy Notice
This prototype uses fictional demonstration data for rural panchayats and beneficiaries in Sitapur District, Uttar Pradesh. It does not connect to real government production servers or initiate actual financial bank transactions.
