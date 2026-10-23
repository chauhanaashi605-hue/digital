import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  Building,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsTab: React.FC = () => {
  const { beneficiaries, inspections, panchayatProjects, verificationCases, villages, exportDataAsCsv } = useData();

  const [dateRange, setDateRange] = useState('ALL');

  // Village-wise distribution data
  const villageData = villages.map((v) => {
    const list = beneficiaries.filter((b) => b.villageName === v.name);
    const completed = list.filter((b) => b.currentStage === 'COMPLETION').length;
    const inProgress = list.length - completed;
    return {
      village: v.name,
      completed,
      inProgress,
      total: list.length,
    };
  });

  // Stage distribution
  const stageData = [
    { name: 'Foundation', count: beneficiaries.filter((b) => b.currentStage === 'FOUNDATION').length },
    { name: 'Plinth Beam', count: beneficiaries.filter((b) => b.currentStage === 'PLINTH').length },
    { name: 'Lintel Band', count: beneficiaries.filter((b) => b.currentStage === 'LINTEL').length },
    { name: 'Completed', count: beneficiaries.filter((b) => b.currentStage === 'COMPLETION').length },
  ];

  // Verification breakdown pie
  const vrfData = [
    { name: 'Verified', value: verificationCases.filter((c) => c.reviewStatus === 'VERIFIED' || c.reviewStatus === 'FLAG_RESOLVED').length, color: '#10B981' },
    { name: 'Duplicates', value: verificationCases.filter((c) => c.reviewStatus === 'POTENTIAL_DUPLICATE').length, color: '#EF4444' },
    { name: 'Prior Scheme', value: verificationCases.filter((c) => c.reviewStatus === 'PREVIOUS_BENEFIT_REVIEW').length, color: '#F59E0B' },
    { name: 'Incomplete', value: verificationCases.filter((c) => c.reviewStatus === 'INCOMPLETE_INFO').length, color: '#7654D6' },
  ];

  // Turnaround metrics
  const avgTurnaroundHours = 38; // 38 hours average between inspector sync and officer approval
  const totalDisbursedLakhs = (
    beneficiaries.reduce((acc, b) => acc + (b.disbursedAmount || 0), 0) / 100000
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
            Executive Reports & Field Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            Statistical governance metrics, village comparative performance, and audit export tools
          </p>
        </div>

        {/* Quick CSV Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDataAsCsv('beneficiaries')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-[#F8F6FF] flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Beneficiaries CSV</span>
          </button>
          <button
            onClick={() => exportDataAsCsv('inspections')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-[#F8F6FF] flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Inspections CSV</span>
          </button>
          <button
            onClick={() => exportDataAsCsv('instalments')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DBT Ledger CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Approval Turnaround</span>
          <p className="text-2xl font-bold text-[#7654D6] mt-1">{avgTurnaroundHours} hrs</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">14% faster than target</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Total Disbursed</span>
          <p className="text-2xl font-bold text-[#24213A] mt-1">₹{totalDisbursedLakhs} Lakhs</p>
          <span className="text-[10px] text-[#77748B] block mt-1">Across 4 rural blocks</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Inspections Cleared</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {inspections.filter((i) => i.status === 'APPROVED').length} / {inspections.length}
          </p>
          <span className="text-[10px] text-[#77748B] block mt-1">Geo-tagged photo verified</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EAE5F5] shadow-2xs">
          <span className="text-[11px] font-semibold uppercase text-[#77748B]">Resolution Rate</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">82%</p>
          <span className="text-[10px] text-[#77748B] block mt-1">Flagged cases adjudicated</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Village Progress Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs">
          <h2 className="text-base font-bold text-[#24213A]">Village-wise Housing Completion</h2>
          <p className="text-xs text-[#77748B] mb-4">Completed pucca houses vs in-progress stages</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBF9" />
                <XAxis dataKey="village" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#77748B' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#77748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EAE5F5',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="completed" name="Completed Units" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#7654D6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Engine Outcomes Pie */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE5F5] shadow-2xs">
          <h2 className="text-base font-bold text-[#24213A]">Verification Centre Casework Breakdown</h2>
          <p className="text-xs text-[#77748B] mb-4">Categorization of flagged integrity checks</p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vrfData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vrfData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #EAE5F5',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
