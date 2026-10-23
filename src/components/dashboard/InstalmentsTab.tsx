import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
  IndianRupee,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { InstalmentRecord, InstalmentStatus } from '../../types';

export const InstalmentsTab: React.FC = () => {
  const { instalments, triggerInstalmentProcessing, exportDataAsCsv } = useData();
  const { hasRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('ALL');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const canProcess = hasRole(['ADMIN', 'DISTRICT_OFFICER']);

  const filteredInstalments = instalments.filter((inst) => {
    const matchesSearch =
      inst.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.transactionReference && inst.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || inst.status === selectedStatus;
    const matchesMilestone = selectedMilestone === 'ALL' || inst.stageTrigger === selectedMilestone;

    return matchesSearch && matchesStatus && matchesMilestone;
  });

  const getStatusBadge = (status: InstalmentStatus) => {
    switch (status) {
      case 'PROCESSING_COMPLETED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Disbursed (PFMS Credited)',
        };
      case 'READY_FOR_PROCESSING':
        return {
          bg: 'bg-[#EDE5FF] text-[#7654D6] border-[#D8CEF6]',
          label: 'Ready for DBT Release',
        };
      case 'AWAITING_APPROVAL':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Awaiting Stage Approval',
        };
      case 'AWAITING_INSPECTION':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Awaiting Field Inspection',
        };
      case 'AWAITING_VERIFICATION':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          label: 'Awaiting Duplicate Resolution',
        };
      case 'ON_HOLD':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Disbursement On Hold',
        };
      default:
        return {
          bg: 'bg-gray-100 text-gray-600 border-gray-200',
          label: 'Not Eligible for Processing',
        };
    }
  };

  const handleSimulatePayment = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      triggerInstalmentProcessing(id);
      setProcessingId(null);
    }, 700);
  };

  // Totals
  const totalDisbursed = instalments
    .filter((i) => i.status === 'PROCESSING_COMPLETED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalReady = instalments
    .filter((i) => i.status === 'READY_FOR_PROCESSING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
              Direct Benefit Transfer (DBT) Instalment Gateway
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              PFMS Integrated Simulation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            4-tier milestone disbursement linking physical stage approvals to direct bank transfer
          </p>
        </div>

        <button
          onClick={() => exportDataAsCsv('instalments')}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-[#F8F6FF] transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Total Disbursed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{totalDisbursed.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#77748B] mt-1 block">Credited via DBT gateway simulation</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Ready for Processing</span>
          <p className="text-2xl font-bold text-[#7654D6] mt-1">
            ₹{totalReady.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#77748B] mt-1 block">Stage clearance requirements met</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Total Grant Sanction</span>
          <p className="text-2xl font-bold text-[#24213A] mt-1">
            ₹1,30,000 / unit
          </p>
          <span className="text-[10px] text-[#77748B] mt-1 block">Tiers: 40k + 40k + 30k + 20k</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE5F5] shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
            <input
              type="text"
              placeholder="Search beneficiary or transaction ref..."
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
              <option value="ALL">All Processing Statuses</option>
              <option value="READY_FOR_PROCESSING">Ready for Processing</option>
              <option value="PROCESSING_COMPLETED">Processing Completed (Credited)</option>
              <option value="AWAITING_APPROVAL">Awaiting Stage Approval</option>
              <option value="AWAITING_INSPECTION">Awaiting Field Inspection</option>
              <option value="AWAITING_VERIFICATION">Awaiting Verification</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div>
            <select
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Milestones</option>
              <option value="FOUNDATION">Instalment 1: Foundation (₹40,000)</option>
              <option value="PLINTH">Instalment 2: Plinth (₹40,000)</option>
              <option value="LINTEL">Instalment 3: Lintel (₹30,000)</option>
              <option value="COMPLETION">Instalment 4: Completion (₹20,000)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Instalments Table */}
      <div className="bg-white rounded-3xl border border-[#EAE5F5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EAE5F5] bg-[#F8F6FF]/80 text-[11px] font-bold text-[#77748B] uppercase tracking-wider">
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Milestone</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Clearance Gate</th>
                <th className="py-3 px-4">Processing Status</th>
                <th className="py-3 px-4">PFMS Reference</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5F5]">
              {filteredInstalments.map((inst) => {
                const badge = getStatusBadge(inst.status);
                const isReady = inst.status === 'READY_FOR_PROCESSING';

                return (
                  <tr key={inst.id} className="hover:bg-[#F8F6FF]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#24213A]">{inst.beneficiaryName}</div>
                      <div className="text-[10px] text-[#77748B]">{inst.villageName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#24213A]">
                        Tier {inst.instalmentNumber} ({inst.stageTrigger})
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#7654D6]">
                      ₹{inst.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#77748B]">Stage Sign-off:</span>
                          <span
                            className={`font-semibold ${
                              inst.requiredApprovalStatus === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {inst.requiredApprovalStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#77748B]">Anti-Duplicate:</span>
                          <span
                            className={`font-semibold ${
                              inst.verificationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-purple-600'
                            }`}
                          >
                            {inst.verificationStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-[#77748B] block mt-0.5 line-clamp-1">
                        {inst.remarks}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#77748B]">
                      {inst.transactionReference || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isReady && canProcess ? (
                        <button
                          disabled={processingId === inst.id}
                          onClick={() => handleSimulatePayment(inst.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{processingId === inst.id ? 'Processing...' : 'Disburse DBT'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">
                          {inst.status === 'PROCESSING_COMPLETED' ? 'Completed' : 'Gates pending'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInstalments.length === 0 && (
          <div className="py-12 text-center">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#24213A]">No Instalments Found</p>
            <p className="text-[11px] text-[#77748B] mt-0.5">Try altering the filter parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
