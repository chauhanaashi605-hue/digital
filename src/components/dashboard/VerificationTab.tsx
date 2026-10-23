import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  UserCheck,
  RotateCcw,
  Eye,
  FileText,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { VerificationCase, VerificationStatus } from '../../types';
import { getStatusBadgeConfig } from '../../services/duplicateEngine';

export const VerificationTab: React.FC = () => {
  const { verificationCases, updateVerificationCase, beneficiaries } = useData();
  const { hasRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<VerificationCase | null>(null);
  const [reviewStatus, setReviewStatus] = useState<VerificationStatus>('VERIFIED');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const canReview = hasRole(['ADMIN', 'DISTRICT_OFFICER']);

  const filteredCases = verificationCases.filter((vc) => {
    const matchesSearch =
      vc.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vc.flagReason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || vc.reviewStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleResolve = () => {
    if (!selectedCase || !reviewRemarks.trim()) return;
    updateVerificationCase(selectedCase.id, reviewStatus, reviewRemarks);
    setSelectedCase(null);
    setReviewRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
              Beneficiary Verification Centre
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Anti-Duplication Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            Algorithmic cross-verification of SECC household references, Aadhaar hashes, and prior scheme disbursements
          </p>
        </div>
      </div>

      {/* Info Notice on Responsible Algorithmic Governance */}
      <div className="p-4 rounded-3xl bg-[#F8F6FF] border border-[#EAE5F5] flex items-start gap-3 text-xs leading-relaxed">
        <Sparkles className="w-5 h-5 text-[#7654D6] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#24213A]">Fair Governance Principle:</strong>{' '}
          <span className="text-[#77748B]">
            Flagged cases represent potential discrepancies requiring human scrutiny by authorized officers. 
            Beneficiaries are never rejected automatically based on heuristic scores alone.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE5F5] shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
            <input
              type="text"
              placeholder="Search case ID, beneficiary, or match reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="POTENTIAL_DUPLICATE">Potential Duplicate Flag</option>
              <option value="PREVIOUS_BENEFIT_REVIEW">Previous Benefit Review</option>
              <option value="INCOMPLETE_INFO">Incomplete Information</option>
              <option value="VERIFIED">Verified & Cleared</option>
              <option value="FLAG_RESOLVED">Flag Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Verification Cases List */}
      <div className="space-y-4">
        {filteredCases.map((vc) => {
          const badgeConfig = getStatusBadgeConfig(vc.reviewStatus);
          const matchedBen = vc.matchedBeneficiaryId
            ? beneficiaries.find((b) => b.id === vc.matchedBeneficiaryId)
            : null;

          return (
            <div
              key={vc.id}
              className="bg-white p-5 rounded-3xl border border-[#EAE5F5] hover:border-[#D8CEF6] shadow-2xs transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#EAE5F5]">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#EDE5FF] text-[#7654D6]">
                    {vc.caseId}
                  </span>
                  <h3 className="text-sm font-bold text-[#24213A]">
                    {vc.beneficiaryName}
                  </h3>
                  <span className="text-xs text-[#77748B]">({vc.villageName})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeConfig.badgeClass}`}
                  >
                    {badgeConfig.label}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                    Confidence: {vc.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Flag Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="md:col-span-2 space-y-1.5">
                  <p className="font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{vc.flagReason}</span>
                  </p>
                  <p className="text-xs text-[#24213A] leading-relaxed bg-[#F8F6FF] p-3 rounded-2xl border border-[#EAE5F5]">
                    {vc.details}
                  </p>
                </div>

                {/* Matched Record Preview if duplicate */}
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Cross-Matched Registry Record
                  </span>
                  {matchedBen ? (
                    <div className="text-xs text-[#24213A]">
                      <p className="font-bold">{matchedBen.name}</p>
                      <p className="text-[11px] text-[#77748B]">ID: {matchedBen.beneficiaryId}</p>
                      <p className="text-[11px] text-[#77748B]">Village: {matchedBen.villageName}</p>
                      <p className="text-[10px] font-mono text-[#7654D6] mt-0.5">
                        SECC: {matchedBen.householdReference}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800">
                      External database cross-match: {vc.matchedName || 'Prior Grant Ledger'}
                    </p>
                  )}
                </div>
              </div>

              {/* Review History */}
              {vc.reviewedBy && (
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[10px] uppercase text-emerald-800 block">
                      Audit Decision Note:
                    </span>
                    <span>"{vc.reviewRemarks}"</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 shrink-0 font-medium ml-2">
                    Reviewed by {vc.reviewedBy} on {new Date(vc.resolvedDate || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-2 flex items-center justify-between border-t border-[#EAE5F5]">
                <span className="text-[10px] text-[#77748B]">
                  Flagged: {new Date(vc.flaggedDate).toLocaleDateString()}
                </span>

                {canReview && (
                  <button
                    onClick={() => {
                      setSelectedCase(vc);
                      setReviewStatus(vc.reviewStatus === 'VERIFIED' ? 'FLAG_RESOLVED' : 'VERIFIED');
                      setReviewRemarks(vc.reviewRemarks || '');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] shadow-xs transition-all"
                  >
                    Resolve Discrepancy
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCases.length === 0 && (
        <div className="py-12 bg-white rounded-3xl border border-[#EAE5F5] text-center">
          <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#24213A]">No Flagged Verification Cases Found</p>
          <p className="text-[11px] text-[#77748B] mt-0.5">All applications cleared or filter criteria empty.</p>
        </div>
      )}

      {/* Resolution Dialog */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EAE5F5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
              <h3 className="text-base font-bold text-[#24213A]">
                Resolve Verification Case: {selectedCase.caseId}
              </h3>
              <button onClick={() => setSelectedCase(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#77748B]">
                Beneficiary: <strong className="text-[#24213A]">{selectedCase.beneficiaryName}</strong> ({selectedCase.villageName})
              </p>
              <p className="text-xs text-rose-700 font-medium mt-1">
                Flag: {selectedCase.flagReason}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#24213A]">Verification Determination</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as VerificationStatus)}
                className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              >
                <option value="VERIFIED">Verified & Cleared (Eligible for Sanction)</option>
                <option value="FLAG_RESOLVED">Flag Resolved (Discrepancy Explained / Affidavit on File)</option>
                <option value="INCOMPLETE_INFO">Requires Additional Documents</option>
                <option value="MANUAL_REVIEW_REQUIRED">Referred for Field Gram Sabha Inquest</option>
                <option value="POTENTIAL_DUPLICATE">Confirm Duplicate (Hold Disbursals)</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#24213A]">Reviewer Audit Remarks (Mandatory)</label>
              <textarea
                rows={3}
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="State basis for decision, documents reviewed, Gram Sabha report..."
                className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reviewRemarks.trim()}
                onClick={handleResolve}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white ${
                  reviewRemarks.trim() ? 'bg-[#7654D6] hover:bg-[#6846C5]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Commit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
