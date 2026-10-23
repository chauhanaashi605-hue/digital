import React, { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Download,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { InspectionRecord, ConstructionStage } from '../../types';

interface InspectionsTabProps {
  onOpenBeneficiary: (beneficiaryId: string) => void;
}

export const InspectionsTab: React.FC<InspectionsTabProps> = ({ onOpenBeneficiary }) => {
  const { inspections, handleInspectionApproval, exportDataAsCsv } = useData();
  const { hasRole, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activePhotoModal, setActivePhotoModal] = useState<InspectionRecord | null>(null);

  // Review modal state
  const [reviewInspection, setReviewInspection] = useState<InspectionRecord | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | 'REINSPECTION_REQUESTED'>('APPROVED');
  const [remarks, setRemarks] = useState('');

  const canReview = hasRole(['ADMIN', 'DISTRICT_OFFICER']);

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch =
      i.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStage === 'ALL' || i.stage === selectedStage;
    const matchesStatus = selectedStatus === 'ALL' || i.status === selectedStatus;

    return matchesSearch && matchesStage && matchesStatus;
  });

  const handleDecisionSubmit = () => {
    if (!reviewInspection || !remarks.trim()) return;
    handleInspectionApproval(reviewInspection.id, decision, remarks);
    setReviewInspection(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">Field Inspection Ledger</h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            Geo-tagged photographic evidence submitted by field inspectors • {inspections.length} recorded
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportDataAsCsv('inspections')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-[#F8F6FF] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE5F5] shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
            <input
              type="text"
              placeholder="Search beneficiary, village, or inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            />
          </div>

          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Inspection Stages</option>
              <option value="FOUNDATION">Foundation Stage</option>
              <option value="PLINTH">Plinth Beam Stage</option>
              <option value="LINTEL">Lintel Band Stage</option>
              <option value="COMPLETION">Final Completion Stage</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Review Statuses</option>
              <option value="SUBMITTED">Submitted (Pending Review)</option>
              <option value="APPROVED">Approved & Verified</option>
              <option value="REJECTED">Rejected</option>
              <option value="REINSPECTION_REQUESTED">Reinspection Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspections Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            className="bg-white rounded-3xl border border-[#EAE5F5] hover:border-[#D8CEF6] shadow-2xs overflow-hidden flex flex-col transition-all hover:shadow-xs"
          >
            {/* Photo with Overlay */}
            <div className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => setActivePhotoModal(insp)}>
              <img
                src={insp.photoUrl}
                alt={insp.stage}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#7654D6] shadow-xs">
                  {insp.stage}
                </span>
                {insp.syncStatus === 'SAVED_LOCALLY' && (
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                    Queued Offline
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#BCA7FF]" />
                    <span>
                      {insp.latitude ? `${insp.latitude.toFixed(4)}, ${insp.longitude?.toFixed(4)}` : 'Location Tagged'}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300">
                    ±{insp.gpsAccuracy || 4.2}m
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#24213A]">{insp.beneficiaryName}</h3>
                    <p className="text-[11px] text-[#77748B]">
                      {insp.villageName} • ID: {insp.beneficiaryId}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      insp.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : insp.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {insp.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-2.5 p-2.5 rounded-xl bg-[#F8F6FF] border border-[#EAE5F5]">
                  <p className="text-[11px] text-[#24213A] italic leading-relaxed line-clamp-2">
                    "{insp.remarks || 'Standard field inspection remarks.'}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#77748B] mt-1.5 pt-1.5 border-t border-[#EAE5F5]">
                    <span>Inspector: {insp.inspectorName}</span>
                    <span>{new Date(insp.timestamp).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {insp.reviewRemarks && (
                  <div className="mt-2 text-[11px] text-purple-900 bg-purple-50 p-2 rounded-xl border border-purple-200">
                    <span className="font-semibold text-[10px] text-purple-700 block uppercase">Reviewer Note:</span>
                    {insp.reviewRemarks}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#EAE5F5] flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenBeneficiary(insp.beneficiaryId)}
                  className="text-xs font-semibold text-[#7654D6] hover:underline"
                >
                  View Timeline
                </button>

                {canReview && (
                  <button
                    onClick={() => {
                      setReviewInspection(insp);
                      setDecision(insp.status === 'APPROVED' ? 'APPROVED' : 'APPROVED');
                      setRemarks(insp.reviewRemarks || '');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#F4EEFF] text-[#7654D6] hover:bg-[#7654D6] hover:text-white transition-all text-xs font-semibold"
                  >
                    Official Review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInspections.length === 0 && (
        <div className="py-12 bg-white rounded-3xl border border-[#EAE5F5] text-center">
          <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#24213A]">No Inspections Found</p>
          <p className="text-[11px] text-[#77748B] mt-0.5">Change your search terms or filters.</p>
        </div>
      )}

      {/* Review Modal */}
      {reviewInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EAE5F5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
              <h3 className="text-base font-bold text-[#24213A]">
                Review {reviewInspection.stage} Stage
              </h3>
              <button onClick={() => setReviewInspection(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#77748B]">
                Beneficiary: <strong className="text-[#24213A]">{reviewInspection.beneficiaryName}</strong> ({reviewInspection.villageName})
              </p>
              <p className="text-xs text-[#77748B] mt-0.5">
                Inspector: {reviewInspection.inspectorName} on {new Date(reviewInspection.timestamp).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#24213A]">Official Action Decision</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    decision === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REINSPECTION_REQUESTED')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    decision === 'REINSPECTION_REQUESTED'
                      ? 'bg-orange-50 border-orange-500 text-orange-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Reinspect
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    decision === 'REJECTED'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-[#EAE5F5] text-gray-600'
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#24213A]">Reviewer Remarks (Mandatory)</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="State basis for decision, verification of photographs against stage standards..."
                className="w-full p-3 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewInspection(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!remarks.trim()}
                onClick={handleDecisionSubmit}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all ${
                  remarks.trim() ? 'bg-[#7654D6] hover:bg-[#6846C5]' : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-[#EAE5F5] shadow-2xl">
            <div className="relative">
              <img
                src={activePhotoModal.photoUrl}
                alt={activePhotoModal.stage}
                className="w-full h-80 sm:h-96 object-cover"
              />
              <button
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#24213A]">
                  {activePhotoModal.beneficiaryName} — {activePhotoModal.stage} Stage
                </h3>
                <span className="text-xs font-mono text-[#7654D6]">
                  Lat: {activePhotoModal.latitude?.toFixed(4)}, Long: {activePhotoModal.longitude?.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-[#77748B]">{activePhotoModal.remarks}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
