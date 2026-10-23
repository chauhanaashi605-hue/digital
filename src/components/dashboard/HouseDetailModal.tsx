import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  User,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileText,
  CreditCard,
  Building,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { HousingProject, Beneficiary, ConstructionStage, InspectionStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface HouseDetailModalProps {
  housingProject: HousingProject;
  beneficiary?: Beneficiary;
  onClose: () => void;
  onApproveStage?: (stage: ConstructionStage) => void;
  onOpenInspectionModal?: () => void;
}

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({
  housingProject,
  beneficiary,
  onClose,
}) => {
  const { handleInspectionApproval, inspections, instalments } = useData();
  const { hasRole, currentUser } = useAuth();

  const [selectedStage, setSelectedStage] = useState<ConstructionStage>(housingProject.currentStage);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<'APPROVED' | 'REJECTED' | 'REINSPECTION_REQUESTED'>('APPROVED');
  const [decisionRemarks, setDecisionRemarks] = useState('');

  const stagesOrder: ConstructionStage[] = ['FOUNDATION', 'PLINTH', 'LINTEL', 'COMPLETION'];
  const stageLabels: Record<ConstructionStage, string> = {
    FOUNDATION: '1. Foundation',
    PLINTH: '2. Plinth Beam',
    LINTEL: '3. Lintel Level',
    COMPLETION: '4. Full Completion',
  };

  const currentStageEvidence = housingProject.stages[selectedStage];

  // Find related inspection record if available
  const stageInspection = inspections.find(
    (i) => i.beneficiaryId === housingProject.beneficiaryId && i.stage === selectedStage
  );

  // Beneficiary instalments
  const houseInstalments = instalments.filter((i) => i.beneficiaryId === housingProject.beneficiaryId);

  const getStatusVisuals = (status: InspectionStatus) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          icon: CheckCircle2,
          label: 'Completed & Approved',
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          icon: Clock,
          label: 'Submitted for Review',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          icon: AlertOctagon,
          label: 'Inspection Rejected',
        };
      case 'REINSPECTION_REQUESTED':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: ShieldAlert,
          label: 'Reinspection Required',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-500',
          border: 'border-gray-200',
          icon: Clock,
          label: 'Stage Pending',
        };
    }
  };

  const handleDecisionSubmit = () => {
    if (!stageInspection) return;
    handleInspectionApproval(stageInspection.id, decisionType, decisionRemarks);
    setShowDecisionModal(false);
    setDecisionRemarks('');
  };

  const canApprove = hasRole(['ADMIN', 'DISTRICT_OFFICER']);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#24213A]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#EAE5F5] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#F8F6FF] to-white border-b border-[#EAE5F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE5FF] text-[#7654D6] flex items-center justify-center font-bold text-lg">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#24213A]">{housingProject.beneficiaryName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-[#EDE5FF] text-[#7654D6] border border-[#D8CEF6]">
                  {beneficiary?.beneficiaryId || housingProject.beneficiaryId}
                </span>
              </div>
              <p className="text-xs text-[#77748B] mt-0.5">
                Village: <span className="text-[#24213A] font-medium">{housingProject.villageName}</span> • District: {housingProject.district} • Target: {housingProject.targetCompletionDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-[#F8F6FF] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 4-Stage Horizontal Stepper */}
          <div className="bg-[#F8F6FF] p-4 sm:p-5 rounded-2xl border border-[#EAE5F5]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#77748B] mb-3">
              Construction Progress Stages
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {stagesOrder.map((stageKey, idx) => {
                const stageData = housingProject.stages[stageKey];
                const isSelected = selectedStage === stageKey;
                const visual = getStatusVisuals(stageData?.status || 'PENDING');
                const IconComponent = visual.icon;

                return (
                  <button
                    key={stageKey}
                    onClick={() => setSelectedStage(stageKey)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-white border-[#7654D6] shadow-sm ring-2 ring-[#9B7BFF]/20'
                        : 'bg-white/60 border-[#EAE5F5] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-[#77748B]">
                        Step {idx + 1}
                      </span>
                      <IconComponent className={`w-4 h-4 ${visual.text}`} />
                    </div>
                    <p className="text-xs font-bold text-[#24213A] truncate">
                      {stageLabels[stageKey].split('. ')[1]}
                    </p>
                    <span className={`text-[10px] font-semibold block mt-1 ${visual.text}`}>
                      {stageData?.status ? stageData.status.replace('_', ' ') : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Detail Card */}
          <div className="bg-white rounded-2xl border border-[#EAE5F5] p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE5F5]">
              <div>
                <span className="text-xs font-semibold text-[#7654D6]">Stage Detail View</span>
                <h3 className="text-base font-bold text-[#24213A]">
                  {stageLabels[selectedStage]}
                </h3>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {(() => {
                  const visual = getStatusVisuals(currentStageEvidence?.status || 'PENDING');
                  const Icon = visual.icon;
                  return (
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${visual.bg} ${visual.text} ${visual.border}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{visual.label}</span>
                    </span>
                  );
                })()}

                {/* Review button for officials if submitted */}
                {canApprove && (currentStageEvidence?.status === 'SUBMITTED' || stageInspection?.status === 'SUBMITTED') && (
                  <button
                    onClick={() => {
                      setDecisionType('APPROVED');
                      setShowDecisionModal(true);
                    }}
                    className="px-3.5 py-1 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] transition-all shadow-xs"
                  >
                    Review Stage
                  </button>
                )}
              </div>
            </div>

            {/* Evidence details: Photo & Metadata */}
            {currentStageEvidence?.photoUrl ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                {/* Photo with Geo Watermark */}
                <div className="relative rounded-2xl overflow-hidden border border-[#EAE5F5] bg-gray-100 group">
                  <img
                    src={currentStageEvidence.photoUrl}
                    alt={`${selectedStage} proof`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-[11px]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#BCA7FF]" />
                      <span>
                        Lat: {currentStageEvidence.latitude?.toFixed(5) || '27.5742'}, Long: {currentStageEvidence.longitude?.toFixed(5) || '80.6821'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1">
                      <span>Accuracy: ±{currentStageEvidence.gpsAccuracy || 4.2}m</span>
                      <span>{new Date(currentStageEvidence.timestamp || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Metadata & Remarks */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-[#F8F6FF] border border-[#EAE5F5]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#77748B]">
                        Assigned Field Inspector
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4 text-[#7654D6]" />
                        <span className="text-xs font-bold text-[#24213A]">
                          {currentStageEvidence.inspectorName || 'Amit Kumar (JE Rural)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#77748B] block mt-0.5">
                        Inspection Date: {currentStageEvidence.inspectionDate || 'Recorded'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F6FF] border border-[#EAE5F5]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#77748B]">
                        Field Inspection Remarks
                      </span>
                      <p className="text-xs text-[#24213A] mt-1 leading-relaxed">
                        {currentStageEvidence.remarks || 'Construction adherence meets structural norms.'}
                      </p>
                    </div>

                    {currentStageEvidence.reviewRemarks && (
                      <div className="p-3 rounded-xl bg-purple-50/60 border border-[#D8CEF6]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7654D6]">
                          Reviewing Officer Evaluation
                        </span>
                        <p className="text-xs text-[#24213A] mt-1">
                          {currentStageEvidence.reviewRemarks}
                        </p>
                        <span className="text-[10px] text-[#77748B] block mt-1">
                          Reviewed By: {currentStageEvidence.reviewedBy} on {new Date(currentStageEvidence.reviewedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#24213A]">
                  Stage Inspection Evidence Pending
                </p>
                <p className="text-[11px] text-[#77748B] mt-1 max-w-sm mx-auto">
                  Field inspector has not yet uploaded photographs or GPS coordinates for this construction stage.
                </p>
              </div>
            )}
          </div>

          {/* Beneficiary Profile & Instalment Ledger Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Beneficiary Details Card */}
            <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#77748B]">
                Beneficiary Registry Details
              </span>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#EAE5F5]">
                  <span className="text-[#77748B]">Guardian / Father:</span>
                  <span className="font-semibold text-[#24213A]">{beneficiary?.guardianName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE5F5]">
                  <span className="text-[#77748B]">Household SECC ID:</span>
                  <span className="font-mono font-medium text-[#24213A]">{beneficiary?.householdReference || 'HH-REF-01'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE5F5]">
                  <span className="text-[#77748B]">Scheme Reference:</span>
                  <span className="font-mono font-medium text-[#7654D6]">{beneficiary?.schemeReference || 'PMAY-G/2025-26'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE5F5]">
                  <span className="text-[#77748B]">Bank & IFSC:</span>
                  <span className="font-mono text-[#24213A]">{beneficiary?.bankAccountMasked} ({beneficiary?.ifscCode})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#77748B]">Total Sanctioned:</span>
                  <span className="font-bold text-emerald-700">₹{beneficiary?.sanctionAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Instalment Disbursement Status */}
            <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#77748B]">
                Instalment Processing Ledger
              </span>
              <div className="mt-2.5 space-y-2">
                {houseInstalments.map((inst) => (
                  <div
                    key={inst.id}
                    className="p-2 bg-white rounded-xl border border-[#EAE5F5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#24213A]">
                        #{inst.instalmentNumber} • ₹{inst.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#77748B] block">
                        Milestone: {inst.stageTrigger}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        inst.status === 'PROCESSING_COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inst.status === 'READY_FOR_PROCESSING'
                          ? 'bg-[#EDE5FF] text-[#7654D6]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {inst.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F6FF] border-t border-[#EAE5F5] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Review Decision Sub-Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EAE5F5] shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#24213A]">
              Stage Evaluation Decision: {stageLabels[selectedStage]}
            </h3>
            <p className="text-xs text-[#77748B]">
              Submit your official decision as an authorized reviewer. An audit record will be registered.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#24213A]">Decision Action</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionType('APPROVED')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    decisionType === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType('REINSPECTION_REQUESTED')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    decisionType === 'REINSPECTION_REQUESTED'
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Reinspect
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType('REJECTED')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    decisionType === 'REJECTED'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#24213A]">Review Remarks (Mandatory)</label>
              <textarea
                rows={3}
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder="Enter structural assessment, adherence to dimensions, and recommendation..."
                className="w-full p-3 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDecisionModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!decisionRemarks.trim()}
                onClick={handleDecisionSubmit}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all ${
                  decisionRemarks.trim() ? 'bg-[#7654D6] hover:bg-[#6846C5]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
