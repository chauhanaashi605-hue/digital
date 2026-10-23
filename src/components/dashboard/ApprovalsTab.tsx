import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MapPin,
  Calendar,
  X,
  Eye,
  ShieldCheck,
  Search,
  User,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { InspectionRecord } from '../../types';

interface ApprovalsTabProps {
  onOpenBeneficiary: (beneficiaryId: string) => void;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ onOpenBeneficiary }) => {
  const { inspections, handleInspectionApproval, auditLogs } = useData();
  const { hasRole, currentUser } = useAuth();

  const [filterType, setFilterType] = useState<'PENDING' | 'RESOLVED'>('PENDING');
  const [selectedInspection, setSelectedInspection] = useState<InspectionRecord | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REINSPECTION_REQUESTED'>('APPROVED');
  const [remarks, setRemarks] = useState('');

  const canApprove = hasRole(['ADMIN', 'DISTRICT_OFFICER']);

  const pendingInspections = inspections.filter((i) => i.status === 'SUBMITTED');
  const resolvedInspections = inspections.filter((i) => i.status !== 'SUBMITTED');

  const displayedList = filterType === 'PENDING' ? pendingInspections : resolvedInspections;

  const handleCommitReview = () => {
    if (!selectedInspection || !remarks.trim()) return;
    handleInspectionApproval(selectedInspection.id, decision, remarks);
    setSelectedInspection(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
            Stage Inspection Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            District Officer desk evaluation for physical milestone clearances & DBT release gating
          </p>
        </div>

        {/* Tab switch: Pending vs Resolved */}
        <div className="flex items-center p-1 bg-[#F4EEFF] rounded-2xl border border-[#EAE5F5]">
          <button
            onClick={() => setFilterType('PENDING')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filterType === 'PENDING'
                ? 'bg-[#7654D6] text-white shadow-xs'
                : 'text-[#77748B] hover:text-[#24213A]'
            }`}
          >
            Pending Review ({pendingInspections.length})
          </button>
          <button
            onClick={() => setFilterType('RESOLVED')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filterType === 'RESOLVED'
                ? 'bg-white text-[#7654D6] shadow-xs'
                : 'text-[#77748B] hover:text-[#24213A]'
            }`}
          >
            Processed Ledger ({resolvedInspections.length})
          </button>
        </div>
      </div>

      {!canApprove && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            You are logged in as a <strong>Field Inspector</strong>. Final stage approval requires <strong>District Officer</strong> or <strong>Administrator</strong> privileges. Switch role via top menu to simulate approval.
          </span>
        </div>
      )}

      {/* Review Queue Cards */}
      <div className="space-y-4">
        {displayedList.map((insp) => (
          <div
            key={insp.id}
            className="bg-white p-5 rounded-3xl border border-[#EAE5F5] hover:border-[#D8CEF6] shadow-2xs transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={insp.photoUrl}
                  alt={insp.stage}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#EAE5F5] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#24213A]">{insp.beneficiaryName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EDE5FF] text-[#7654D6]">
                      {insp.stage} Stage
                    </span>
                  </div>
                  <p className="text-xs text-[#77748B] mt-0.5">
                    Village: <strong className="text-[#24213A]">{insp.villageName}</strong> • Inspector: {insp.inspectorName}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-[#7654D6]" />
                      {insp.latitude ? `${insp.latitude.toFixed(4)}, ${insp.longitude?.toFixed(4)}` : 'GPS Verified'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(insp.timestamp).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl border ${
                    insp.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : insp.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {insp.status.replace('_', ' ')}
                </span>

                <button
                  onClick={() => onOpenBeneficiary(insp.beneficiaryId)}
                  className="p-2 rounded-xl border border-[#EAE5F5] hover:bg-[#F8F6FF] text-[#77748B] hover:text-[#7654D6] transition-all"
                  title="View complete housing dossier"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {canApprove && (
                  <button
                    onClick={() => {
                      setSelectedInspection(insp);
                      setDecision(insp.status === 'APPROVED' ? 'APPROVED' : 'APPROVED');
                      setRemarks(insp.reviewRemarks || '');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] shadow-xs transition-all"
                  >
                    Take Action
                  </button>
                )}
              </div>
            </div>

            {/* Inspector remarks box */}
            <div className="p-3 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] text-xs leading-relaxed text-[#24213A]">
              <span className="text-[10px] font-bold text-[#77748B] block uppercase tracking-wider mb-0.5">
                Inspector Ground Observation:
              </span>
              "{insp.remarks || 'Construction adherence meets structural norms.'}"
            </div>

            {/* Reviewer Note if already reviewed */}
            {insp.reviewRemarks && (
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900">
                <span className="text-[10px] font-bold text-[#7654D6] block uppercase tracking-wider mb-0.5">
                  Official Decision Remarks:
                </span>
                "{insp.reviewRemarks}"
                <span className="text-[10px] text-gray-500 block mt-1">
                  Signed by: {insp.reviewedBy} on {new Date(insp.reviewedAt || Date.now()).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {displayedList.length === 0 && (
        <div className="py-12 bg-white rounded-3xl border border-[#EAE5F5] text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#24213A]">Approval Queue Clear</p>
          <p className="text-[11px] text-[#77748B] mt-0.5">No pending stage submissions requiring officer attention.</p>
        </div>
      )}

      {/* Decision Sub-Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EAE5F5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
              <h3 className="text-base font-bold text-[#24213A]">
                Sign-off: {selectedInspection.beneficiaryName}
              </h3>
              <button onClick={() => setSelectedInspection(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#77748B]">
              Stage: <strong className="text-[#7654D6]">{selectedInspection.stage}</strong> • Village: {selectedInspection.villageName}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#24213A]">Official Action Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    decision === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Approve Stage
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REINSPECTION_REQUESTED')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    decision === 'REINSPECTION_REQUESTED'
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Reinspection
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    decision === 'REJECTED'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Reject Proof
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#24213A]">Reviewer Reason / Order Notes (Mandatory)</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specify structural assessment, alignment with sanctioned plan, and DBT authorization..."
                className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!remarks.trim()}
                onClick={handleCommitReview}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white ${
                  remarks.trim() ? 'bg-[#7654D6] hover:bg-[#6846C5]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Commit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
