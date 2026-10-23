export type UserRole = 'ADMIN' | 'DISTRICT_OFFICER' | 'FIELD_INSPECTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  assignedDistrict: string;
  assignedVillages: string[];
  avatarUrl?: string;
}

export type ConstructionStage = 'FOUNDATION' | 'PLINTH' | 'LINTEL' | 'COMPLETION';

export type InspectionStatus = 
  | 'PENDING'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REINSPECTION_REQUESTED';

export type SyncStatus = 
  | 'SAVED_LOCALLY'
  | 'WAITING_TO_SYNC'
  | 'UPLOADING'
  | 'SYNCED'
  | 'SYNC_FAILED';

export type VerificationStatus = 
  | 'VERIFIED'
  | 'POTENTIAL_DUPLICATE'
  | 'PREVIOUS_BENEFIT_REVIEW'
  | 'INCOMPLETE_INFO'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'FLAG_RESOLVED';

export type InstalmentStatus = 
  | 'NOT_ELIGIBLE'
  | 'AWAITING_INSPECTION'
  | 'AWAITING_APPROVAL'
  | 'AWAITING_VERIFICATION'
  | 'READY_FOR_PROCESSING'
  | 'PROCESSING_INITIATED'
  | 'PROCESSING_COMPLETED'
  | 'ON_HOLD';

export interface Village {
  id: string;
  name: string;
  panchayat: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
  totalBeneficiaries: number;
  completedHouses: number;
}

export interface Beneficiary {
  id: string;
  beneficiaryId: string; // e.g. "GT-2026-RAM-0104"
  name: string;
  guardianName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  villageId: string;
  villageName: string;
  district: string;
  householdReference: string; // Fictional SECC/Ration ID e.g. "HH-98324-UP"
  nationalIdMasked: string; // e.g. "XXXX-XXXX-4921"
  schemeReference: string; // e.g. "PMAY-G/2025-26/B-902"
  category: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'MINORITY';
  registrationDate: string;
  currentStage: ConstructionStage;
  verificationStatus: VerificationStatus;
  currentInstalmentStage: number; // 1 to 4
  phone: string;
  bankAccountMasked: string;
  ifscCode: string;
  sanctionAmount: number; // e.g. 130000
  disbursedAmount: number;
  latitude?: number;
  longitude?: number;
}

export interface StageEvidence {
  stage: ConstructionStage;
  status: InspectionStatus;
  inspectionDate?: string;
  inspectorId?: string;
  inspectorName?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracy?: number;
  timestamp?: string;
  remarks?: string;
  reviewRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface HousingProject {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  villageName: string;
  district: string;
  sanctionDate: string;
  targetCompletionDate: string;
  currentStage: ConstructionStage;
  stages: Record<ConstructionStage, StageEvidence>;
  overallStatus: 'ON_TRACK' | 'DELAYED' | 'COMPLETED' | 'NEEDS_INSPECTION';
  progressPercentage: number;
  lastUpdated: string;
}

export interface InspectionRecord {
  id: string;
  localId?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  villageName: string;
  stage: ConstructionStage;
  photoUrl: string;
  latitude: number | null;
  longitude: number | null;
  gpsAccuracy: number | null;
  timestamp: string;
  inspectorId: string;
  inspectorName: string;
  remarks: string;
  status: InspectionStatus;
  syncStatus: SyncStatus;
  reviewRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  syncRetryCount?: number;
  isPanchayatProject?: boolean;
  projectId?: string;
  projectTitle?: string;
}

export type PanchayatCategory = 
  | 'ROAD_CONNECTIVITY'
  | 'DRAINAGE_SANITATION'
  | 'COMMUNITY_HALL'
  | 'DRINKING_WATER'
  | 'SOLAR_LIGHTING'
  | 'POND_REJUVENATION';

export interface PanchayatProject {
  id: string;
  projectId: string; // e.g. "GPW-2026-RD-04"
  title: string;
  category: PanchayatCategory;
  villageId: string;
  villageName: string;
  department: string;
  assignedOfficer: string;
  status: 'PROPOSED' | 'IN_PROGRESS' | 'UNDER_INSPECTION' | 'COMPLETED' | 'HALTED';
  startDate: string;
  expectedCompletionDate: string;
  progressPercentage: number;
  allocatedBudget: number; // e.g. 450000
  spentBudget: number;
  photoUrl: string;
  latitude: number;
  longitude: number;
  inspectionHistory: {
    id: string;
    date: string;
    inspectorName: string;
    remarks: string;
    photoUrl: string;
    progressPercentage: number;
  }[];
  remarks: string;
}

export interface VerificationCase {
  id: string;
  caseId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  villageName: string;
  matchedBeneficiaryId?: string;
  matchedName?: string;
  flagReason: string;
  matchType: 
    | 'DUPLICATE_HOUSEHOLD'
    | 'DUPLICATE_ID'
    | 'PRIOR_SCHEME_BENEFIT'
    | 'LOCATION_OUTLIER'
    | 'INCOMPLETE_DOCS';
  confidenceScore: number; // 0-100
  reviewStatus: VerificationStatus;
  details: string;
  flaggedDate: string;
  reviewedBy?: string;
  reviewRemarks?: string;
  resolvedDate?: string;
}

export interface InstalmentRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  villageName: string;
  instalmentNumber: 1 | 2 | 3 | 4;
  amount: number;
  stageTrigger: ConstructionStage;
  status: InstalmentStatus;
  requiredApprovalStatus: InspectionStatus;
  verificationStatus: VerificationStatus;
  lastUpdated: string;
  transactionReference?: string;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'BENEFICIARY' | 'INSPECTION' | 'APPROVAL' | 'INSTALMENT' | 'PANCHAYAT_PROJECT' | 'VERIFICATION';
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INSPECTION' | 'APPROVAL' | 'VERIFICATION' | 'SYNC' | 'ALERT';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}
