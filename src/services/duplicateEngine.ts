import { Beneficiary, VerificationCase, VerificationStatus } from '../types';

export interface VerificationCheckResult {
  hasFlags: boolean;
  cases: VerificationCase[];
}

export function runBeneficiaryVerification(
  newOrUpdated: Beneficiary,
  allBeneficiaries: Beneficiary[]
): VerificationCase[] {
  const flags: VerificationCase[] = [];

  const otherBeneficiaries = allBeneficiaries.filter((b) => b.id !== newOrUpdated.id);

  // 1. Check identical household reference (e.g. SECC Ration ID)
  const householdMatch = otherBeneficiaries.find(
    (b) => b.householdReference.trim().toUpperCase() === newOrUpdated.householdReference.trim().toUpperCase()
  );
  if (householdMatch) {
    flags.push({
      id: `vc-${Date.now()}-1`,
      caseId: `VRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      beneficiaryId: newOrUpdated.id,
      beneficiaryName: newOrUpdated.name,
      villageName: newOrUpdated.villageName,
      matchedBeneficiaryId: householdMatch.id,
      matchedName: householdMatch.name,
      flagReason: `Identical SECC Household Reference (${newOrUpdated.householdReference})`,
      matchType: 'DUPLICATE_HOUSEHOLD',
      confidenceScore: 95,
      reviewStatus: 'POTENTIAL_DUPLICATE',
      details: `Matched with existing beneficiary ${householdMatch.name} (${householdMatch.beneficiaryId}) from village ${householdMatch.villageName}. Under rural housing guidelines, only one grant per household unit is permitted.`,
      flaggedDate: new Date().toISOString(),
    });
  }

  // 2. Check similar name + guardian name in same village
  const normalizedNewName = newOrUpdated.name.toLowerCase().trim();
  const normalizedNewGuardian = newOrUpdated.guardianName.toLowerCase().trim();

  const nameMatch = otherBeneficiaries.find((b) => {
    const isSameVillage = b.villageId === newOrUpdated.villageId;
    const sameName = b.name.toLowerCase().trim() === normalizedNewName;
    const sameGuardian = b.guardianName.toLowerCase().trim() === normalizedNewGuardian;
    return isSameVillage && (sameName || sameGuardian);
  });

  if (nameMatch && !householdMatch) {
    flags.push({
      id: `vc-${Date.now()}-2`,
      caseId: `VRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      beneficiaryId: newOrUpdated.id,
      beneficiaryName: newOrUpdated.name,
      villageName: newOrUpdated.villageName,
      matchedBeneficiaryId: nameMatch.id,
      matchedName: nameMatch.name,
      flagReason: `Co-habitant or Identical Guardian Match in same village (${newOrUpdated.guardianName})`,
      matchType: 'DUPLICATE_ID',
      confidenceScore: 84,
      reviewStatus: 'POTENTIAL_DUPLICATE',
      details: `Matches ${nameMatch.name} with guardian ${nameMatch.guardianName}. Verify family tree segregation through Gram Sabha resolution.`,
      flaggedDate: new Date().toISOString(),
    });
  }

  // 3. Check for incomplete mandatory information
  const missingFields: string[] = [];
  if (!newOrUpdated.bankAccountMasked || newOrUpdated.bankAccountMasked.trim() === '') missingFields.push('Bank Account');
  if (!newOrUpdated.ifscCode || newOrUpdated.ifscCode.trim() === '') missingFields.push('IFSC Code');
  if (!newOrUpdated.phone || newOrUpdated.phone.trim() === '') missingFields.push('Phone Number');
  if (!newOrUpdated.nationalIdMasked || newOrUpdated.nationalIdMasked.trim() === '') missingFields.push('National ID / Aadhaar');

  if (missingFields.length > 0) {
    flags.push({
      id: `vc-${Date.now()}-3`,
      caseId: `VRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      beneficiaryId: newOrUpdated.id,
      beneficiaryName: newOrUpdated.name,
      villageName: newOrUpdated.villageName,
      flagReason: `Missing Mandatory Verification Records: ${missingFields.join(', ')}`,
      matchType: 'INCOMPLETE_DOCS',
      confidenceScore: 100,
      reviewStatus: 'INCOMPLETE_INFO',
      details: `The application lacks verified KYC documents required for DBT instalment clearance: ${missingFields.join(', ')}.`,
      flaggedDate: new Date().toISOString(),
    });
  }

  return flags;
}

export function getStatusBadgeConfig(status: VerificationStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Verified & Cleared',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'POTENTIAL_DUPLICATE':
      return {
        label: 'Potential Duplicate',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'PREVIOUS_BENEFIT_REVIEW':
      return {
        label: 'Previous Benefit Requires Review',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'INCOMPLETE_INFO':
      return {
        label: 'Incomplete Information',
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      };
    case 'MANUAL_REVIEW_REQUIRED':
      return {
        label: 'Manual Verification Required',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'FLAG_RESOLVED':
      return {
        label: 'Flag Resolved',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    default:
      return {
        label: 'No Matching Record Found',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
}
