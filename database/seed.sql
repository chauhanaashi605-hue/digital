-- ==========================================================
-- GramTrack Demonstration Seed Records (PostgreSQL DML)
-- ==========================================================

-- Villages
INSERT INTO villages (id, name, panchayat, block, district, state, pincode, total_beneficiaries, completed_houses) VALUES
('vil-01', 'Rampur', 'Rampur Gram Panchayat', 'Maholi', 'Sitapur', 'Uttar Pradesh', '261141', 42, 28),
('vil-02', 'Shivpuri', 'Shivpuri Gram Panchayat', 'Maholi', 'Sitapur', 'Uttar Pradesh', '261142', 36, 19),
('vil-03', 'Haridaspur', 'Haridaspur Gram Panchayat', 'Pisawan', 'Sitapur', 'Uttar Pradesh', '261151', 29, 14),
('vil-04', 'Chandanpur', 'Chandanpur Gram Panchayat', 'Pisawan', 'Sitapur', 'Uttar Pradesh', '261152', 31, 24)
ON CONFLICT (id) DO NOTHING;

-- Demo Users
INSERT INTO users (id, name, email, password_hash, role, phone, assigned_district) VALUES
('usr-01', 'Rajesh Verma (IAS)', 'admin@gramtrack.gov.in', '$2b$10$hashed_secret_salt_admin', 'ADMIN', '+91 98100 23451', 'Sitapur District'),
('usr-02', 'Priya Sharma (PCS)', 'district@gramtrack.gov.in', '$2b$10$hashed_secret_salt_district', 'DISTRICT_OFFICER', '+91 94500 87123', 'Sitapur District'),
('usr-03', 'Amit Kumar', 'inspector@gramtrack.gov.in', '$2b$10$hashed_secret_salt_inspector', 'FIELD_INSPECTOR', '+91 87654 11290', 'Sitapur District')
ON CONFLICT (id) DO NOTHING;

-- Sample Beneficiaries
INSERT INTO beneficiaries (id, beneficiary_id, name, guardian_name, gender, village_id, household_reference, national_id_masked, scheme_reference, category, registration_date, current_stage, verification_status, phone, bank_account_masked, ifsc_code, sanction_amount, disbursed_amount, latitude, longitude) VALUES
('ben-01', 'GT-2026-RAM-0101', 'Rameshwar Yadav', 'Late Brijlal Yadav', 'MALE', 'vil-01', 'HH-98324-UP', 'XXXX-XXXX-4921', 'PMAY-G/2025-26/UP-0419', 'OBC', '2025-08-14', 'LINTEL', 'POTENTIAL_DUPLICATE', '+91 98710 44102', 'SBIN-XXXX-9014', 'SBIN0001244', 130000.00, 80000.00, 27.5742, 80.6821),
('ben-02', 'GT-2026-RAM-0102', 'Rajesh Yadav', 'Late Brijlal Yadav', 'MALE', 'vil-01', 'HH-98324-UP', 'XXXX-XXXX-8820', 'PMAY-G/2025-26/UP-0420', 'OBC', '2025-09-02', 'FOUNDATION', 'POTENTIAL_DUPLICATE', '+91 98710 44103', 'SBIN-XXXX-9088', 'SBIN0001244', 130000.00, 40000.00, 27.5744, 80.6823),
('ben-03', 'GT-2026-SHV-0201', 'Sunita Devi', 'Ram Avatar', 'FEMALE', 'vil-02', 'HH-44910-UP', 'XXXX-XXXX-1932', 'PMAY-G/2025-26/UP-0881', 'SC', '2025-06-10', 'COMPLETION', 'VERIFIED', '+91 91234 56780', 'PUNB-XXXX-4421', 'PUNB0241000', 130000.00, 130000.00, 27.5891, 80.7104),
('ben-04', 'GT-2026-SHV-0202', 'Kamlesh Meena', 'Deen Dayal Meena', 'MALE', 'vil-02', 'HH-55129-UP', 'XXXX-XXXX-7341', 'PMAY-G/2025-26/UP-0914', 'ST', '2025-10-05', 'PLINTH', 'PREVIOUS_BENEFIT_REVIEW', '+91 98821 00921', 'BARB-XXXX-1209', 'BARB0MAHOLI', 130000.00, 40000.00, 27.5912, 80.7088)
ON CONFLICT (id) DO NOTHING;
