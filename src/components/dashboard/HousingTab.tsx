import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Building,
  MapPin,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ConstructionStage, VerificationStatus } from '../../types';
import { getStatusBadgeConfig } from '../../services/duplicateEngine';

interface HousingTabProps {
  onOpenBeneficiary: (beneficiaryId: string) => void;
  onOpenAddBeneficiary: () => void;
}

export const HousingTab: React.FC<HousingTabProps> = ({
  onOpenBeneficiary,
  onOpenAddBeneficiary,
}) => {
  const { beneficiaries, housingProjects, villages, exportDataAsCsv } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedVerification, setSelectedVerification] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'stage' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered and sorted data
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries
      .filter((b) => {
        const matchesSearch =
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.beneficiaryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.householdReference.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVillage = selectedVillage === 'ALL' || b.villageName === selectedVillage;
        const matchesStage = selectedStage === 'ALL' || b.currentStage === selectedStage;
        const matchesVerification =
          selectedVerification === 'ALL' || b.verificationStatus === selectedVerification;

        return matchesSearch && matchesVillage && matchesStage && matchesVerification;
      })
      .sort((a, b) => {
        let valA: string | number = a.registrationDate;
        let valB: string | number = b.registrationDate;

        if (sortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortBy === 'stage') {
          valA = a.currentStage;
          valB = b.currentStage;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    beneficiaries,
    searchTerm,
    selectedVillage,
    selectedStage,
    selectedVerification,
    sortBy,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredBeneficiaries.length / pageSize) || 1;
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStageBadge = (stage: ConstructionStage) => {
    switch (stage) {
      case 'FOUNDATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PLINTH':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'LINTEL':
        return 'bg-[#EDE5FF] text-[#7654D6] border-[#D8CEF6]';
      case 'COMPLETION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">Rural Housing Registry</h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            Registered beneficiaries under Rural Pucca Housing Mission • {beneficiaries.length} total units
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportDataAsCsv('beneficiaries')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-[#F8F6FF] transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddBeneficiary}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] shadow-xs transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Beneficiary</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE5F5] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
            <input
              type="text"
              placeholder="Search beneficiary or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Villages (Sitapur)</option>
              {villages.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Construction Stage Filter */}
          <div>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Stages</option>
              <option value="FOUNDATION">1. Foundation</option>
              <option value="PLINTH">2. Plinth Beam</option>
              <option value="LINTEL">3. Lintel Level</option>
              <option value="COMPLETION">4. Completion</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified & Cleared</option>
              <option value="POTENTIAL_DUPLICATE">Potential Duplicate</option>
              <option value="PREVIOUS_BENEFIT_REVIEW">Previous Benefit Review</option>
              <option value="INCOMPLETE_INFO">Incomplete Information</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-3xl border border-[#EAE5F5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAE5F5] bg-[#F8F6FF]/80 text-[11px] font-bold text-[#77748B] uppercase tracking-wider">
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Village / District</th>
                <th className="py-3 px-4">Household SECC</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Disbursed / Sanction</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5F5] text-xs">
              {paginatedBeneficiaries.map((b) => {
                const companionHp = housingProjects.find((hp) => hp.beneficiaryId === b.id);
                const stagePercent = companionHp?.progressPercentage || 25;
                const badgeConfig = getStatusBadgeConfig(b.verificationStatus);

                return (
                  <tr
                    key={b.id}
                    className="hover:bg-[#F8F6FF]/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-[#24213A]">{b.name}</div>
                        <div className="text-[10px] text-[#77748B]">
                          C/O {b.guardianName} • <span className="font-mono text-[#7654D6]">{b.beneficiaryId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[#24213A] font-medium">{b.villageName}</div>
                      <div className="text-[10px] text-[#77748B]">{b.district}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#77748B]">
                      {b.householdReference}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStageBadge(
                            b.currentStage
                          )}`}
                        >
                          {b.currentStage}
                        </span>
                        <span className="text-[10px] font-bold text-[#77748B]">
                          {stagePercent}%
                        </span>
                      </div>
                      <div className="w-20 bg-[#EAE5F5] h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-[#7654D6] h-full rounded-full"
                          style={{ width: `${stagePercent}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeConfig.badgeClass}`}
                      >
                        {badgeConfig.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#24213A]">
                        ₹{b.disbursedAmount?.toLocaleString('en-IN') || 0}
                      </div>
                      <div className="text-[10px] text-[#77748B]">
                        of ₹{b.sanctionAmount.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onOpenBeneficiary(b.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#F4EEFF] text-[#7654D6] hover:bg-[#7654D6] hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedBeneficiaries.length === 0 && (
          <div className="py-12 text-center">
            <Building className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#24213A]">No Beneficiary Records Found</p>
            <p className="text-[11px] text-[#77748B] mt-0.5">Try clearing filters or search keywords.</p>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-[#F8F6FF]/60 border-t border-[#EAE5F5] flex items-center justify-between text-xs text-[#77748B]">
          <span>
            Showing {filteredBeneficiaries.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredBeneficiaries.length)} of{' '}
            {filteredBeneficiaries.length} records
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-[#EAE5F5] bg-white text-[#24213A] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="px-2 font-bold text-[#7654D6]">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-[#EAE5F5] bg-white text-[#24213A] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
