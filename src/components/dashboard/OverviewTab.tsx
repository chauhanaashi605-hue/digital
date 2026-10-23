import React from 'react';
import {
  Home,
  ClipboardCheck,
  Clock,
  ShieldAlert,
  CheckCircle,
  Building2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { useData } from '../../context/DataContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

interface OverviewTabProps {
  onNavigateTab: (tabId: string) => void;
  onOpenBeneficiary: (beneficiaryId: string) => void;
  onOpenAddBeneficiary: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  onNavigateTab,
  onOpenBeneficiary,
  onOpenAddBeneficiary,
}) => {
  const {
    beneficiaries,
    housingProjects,
    inspections,
    panchayatProjects,
    verificationCases,
    villages,
  } = useData();

  // Metrics
  const totalHouses = beneficiaries.length;
  const completedInspections = inspections.filter((i) => i.status === 'APPROVED').length;
  const pendingInspections = inspections.filter((i) => i.status === 'SUBMITTED').length;
  const flaggedCases = verificationCases.filter(
    (v) => v.reviewStatus === 'POTENTIAL_DUPLICATE' || v.reviewStatus === 'PREVIOUS_BENEFIT_REVIEW' || v.reviewStatus === 'INCOMPLETE_INFO'
  ).length;
  const pendingApprovals = inspections.filter((i) => i.status === 'SUBMITTED').length;
  const activePanchayat = panchayatProjects.filter((p) => p.status === 'IN_PROGRESS').length;

  // Stage Distribution Data
  const stageCounts = {
    FOUNDATION: beneficiaries.filter((b) => b.currentStage === 'FOUNDATION').length,
    PLINTH: beneficiaries.filter((b) => b.currentStage === 'PLINTH').length,
    LINTEL: beneficiaries.filter((b) => b.currentStage === 'LINTEL').length,
    COMPLETION: beneficiaries.filter((b) => b.currentStage === 'COMPLETION').length,
  };

  const stageChartData = [
    { stage: 'Foundation', count: stageCounts.FOUNDATION, fill: '#9B7BFF' },
    { stage: 'Plinth', count: stageCounts.PLINTH, fill: '#7654D6' },
    { stage: 'Lintel', count: stageCounts.LINTEL, fill: '#BCA7FF' },
    { stage: 'Completed', count: stageCounts.COMPLETION, fill: '#10B981' },
  ];

  // Panchayat project status pie
  const panchayatStatusData = [
    { name: 'In Progress', value: panchayatProjects.filter((p) => p.status === 'IN_PROGRESS').length, color: '#7654D6' },
    { name: 'Completed', value: panchayatProjects.filter((p) => p.status === 'COMPLETED').length, color: '#10B981' },
    { name: 'Under Inspection', value: panchayatProjects.filter((p) => p.status === 'UNDER_INSPECTION').length, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-gradient-to-r from-[#F4EEFF] via-[#F8F6FF] to-white p-6 rounded-3xl border border-[#EAE5F5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7654D6] px-2 py-0.5 rounded-full bg-white border border-[#D8CEF6]">
              District Sitapur • UP Central
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A] mt-2">
            Panchayat Development & Housing Monitor
          </h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-1 max-w-2xl">
            Real-time tracking of rural pucca housing construction stages, geo-tagged inspections with offline sync, and Panchayat infrastructure works.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddBeneficiary}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] shadow-xs transition-all flex items-center gap-2"
          >
            <span>+ Add Beneficiary</span>
          </button>
          <button
            onClick={() => onNavigateTab('inspections')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D8CEF6] text-[#7654D6] hover:bg-[#F8F6FF] transition-all flex items-center gap-1.5"
          >
            <span>Inspection Desk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Houses"
          value={totalHouses}
          subtitle="Registered beneficiaries"
          icon={Home}
          trend="+12% YoY"
          onClick={() => onNavigateTab('housing')}
        />
        <StatCard
          title="Completed"
          value={completedInspections}
          subtitle="Stage inspections cleared"
          icon={CheckCircle}
          trend="88% rate"
          onClick={() => onNavigateTab('inspections')}
        />
        <StatCard
          title="Pending Queue"
          value={pendingInspections}
          subtitle="Awaiting desk review"
          icon={Clock}
          trend="Action required"
          trendPositive={false}
          onClick={() => onNavigateTab('approvals')}
        />
        <StatCard
          title="Flagged Cases"
          value={flaggedCases}
          subtitle="Duplicate/eligibility review"
          icon={ShieldAlert}
          trend={flaggedCases > 0 ? `${flaggedCases} alerts` : 'Zero flags'}
          trendPositive={flaggedCases === 0}
          onClick={() => onNavigateTab('verification')}
        />
        <StatCard
          title="Approvals"
          value={pendingApprovals}
          subtitle="Awaiting Officer sign-off"
          icon={ClipboardCheck}
          onClick={() => onNavigateTab('approvals')}
        />
        <StatCard
          title="Panchayat Works"
          value={activePanchayat}
          subtitle="Active community projects"
          icon={Building2}
          trend="On track"
          onClick={() => onNavigateTab('panchayat')}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Housing Construction Stage Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#24213A]">
                Housing Stage Distribution
              </h2>
              <p className="text-xs text-[#77748B]">Active houses across 4 construction milestones</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#F4EEFF] text-[#7654D6] border border-[#EAE5F5]">
              Total: {totalHouses} Units
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBF9" />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#77748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#77748B' }} />
                <Tooltip
                  cursor={{ fill: '#F8F6FF' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EAE5F5',
                    boxShadow: '0 8px 24px rgba(118,84,214,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[#EAE5F5] text-center mt-2">
            <div>
              <span className="text-[11px] text-[#77748B]">1. Foundation</span>
              <p className="text-sm font-bold text-[#7654D6]">{stageCounts.FOUNDATION} units</p>
            </div>
            <div>
              <span className="text-[11px] text-[#77748B]">2. Plinth Beam</span>
              <p className="text-sm font-bold text-[#7654D6]">{stageCounts.PLINTH} units</p>
            </div>
            <div>
              <span className="text-[11px] text-[#77748B]">3. Lintel Level</span>
              <p className="text-sm font-bold text-[#7654D6]">{stageCounts.LINTEL} units</p>
            </div>
            <div>
              <span className="text-[11px] text-[#77748B]">4. Completed</span>
              <p className="text-sm font-bold text-emerald-600">{stageCounts.COMPLETION} units</p>
            </div>
          </div>
        </div>

        {/* Panchayat Infrastructure Projects Pie & Overview */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[#24213A]">
                Panchayat Works Status
              </h2>
              <button
                onClick={() => onNavigateTab('panchayat')}
                className="text-xs text-[#7654D6] font-semibold hover:underline"
              >
                View all
              </button>
            </div>
            <p className="text-xs text-[#77748B]">Roads, drainage, solar & community centres</p>

            <div className="h-44 w-full mt-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={panchayatStatusData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {panchayatStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #EAE5F5',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-[#24213A]">{panchayatProjects.length}</span>
                <span className="text-[10px] text-[#77748B]">Works</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#EAE5F5]">
            {panchayatProjects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigateTab('panchayat')}
                className="p-2.5 rounded-xl bg-[#F8F6FF] hover:bg-[#F4EEFF] transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-semibold text-[#24213A] truncate">{p.title}</p>
                  <span className="text-[10px] text-[#77748B]">{p.villageName} • {p.category.replace('_', ' ')}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#7654D6]">{p.progressPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Field Inspections & Village Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspection Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#24213A]">Recent Field Inspection Evidence</h2>
              <p className="text-xs text-[#77748B]">Latest geo-tagged uploads submitted by field inspectors</p>
            </div>
            <button
              onClick={() => onNavigateTab('inspections')}
              className="text-xs font-semibold text-[#7654D6] hover:underline flex items-center gap-1"
            >
              <span>View ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {inspections.slice(0, 4).map((insp) => (
              <div
                key={insp.id}
                className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] hover:border-[#D8CEF6] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={insp.photoUrl}
                    alt={insp.stage}
                    className="w-12 h-12 rounded-xl object-cover border border-[#EAE5F5] shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#24213A]">{insp.beneficiaryName}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#EDE5FF] text-[#7654D6]">
                        {insp.stage}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#77748B] mt-0.5">
                      Village: <span className="font-medium text-[#24213A]">{insp.villageName}</span> • Inspector: {insp.inspectorName}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#7654D6]" />
                        {insp.latitude ? `${insp.latitude.toFixed(4)}, ${insp.longitude?.toFixed(4)}` : 'GPS Tagged'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(insp.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
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
                    className="p-1.5 rounded-lg bg-white border border-[#EAE5F5] text-[#77748B] hover:text-[#7654D6] hover:border-[#D8CEF6] transition-all"
                    title="View housing progress details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Village-Wise Performance */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#24213A]">Village Performance</h2>
            <span className="text-xs text-[#77748B]">Sitapur Block</span>
          </div>

          <div className="space-y-3">
            {villages.map((v) => {
              const villageBeneficiaries = beneficiaries.filter((b) => b.villageName === v.name);
              const completedCount = villageBeneficiaries.filter((b) => b.currentStage === 'COMPLETION').length;
              const percent = villageBeneficiaries.length > 0 ? Math.round((completedCount / villageBeneficiaries.length) * 100) : 0;

              return (
                <div key={v.id} className="p-3 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#24213A]">{v.name}</span>
                    <span className="font-bold text-[#7654D6]">{percent}% completed</span>
                  </div>
                  <div className="w-full bg-[#EAE5F5] h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#9B7BFF] to-[#7654D6] h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#77748B] mt-1.5">
                    <span>{v.panchayat}</span>
                    <span>{completedCount} / {villageBeneficiaries.length} houses completed</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-[#EDE5FF]/60 border border-[#D8CEF6] flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#7654D6] shrink-0" />
            <p className="text-[11px] text-[#7654D6] leading-tight">
              <strong>Maholi Block</strong> achieved a 74% stage clearance turnaround within 48 hours of mobile sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
