import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  IndianRupee,
  Activity,
  Layers,
  X,
  Camera,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PanchayatProject, PanchayatCategory } from '../../types';
import { STAGE_PHOTOS } from '../../services/mockData';

export const PanchayatTab: React.FC = () => {
  const { panchayatProjects, addPanchayatProject, updatePanchayatProgress, villages, exportDataAsCsv } = useData();
  const { hasRole } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PanchayatProject | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // New project form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PanchayatCategory>('ROAD_CONNECTIVITY');
  const [newVillage, setNewVillage] = useState(villages[0]?.name || 'Rampur');
  const [newDepartment, setNewDepartment] = useState('Rural Engineering Department (RED)');
  const [newOfficer, setNewOfficer] = useState('Er. Sandeep Patel (AE)');
  const [newBudget, setNewBudget] = useState(450000);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCompletionDate, setNewCompletionDate] = useState('2026-06-30');
  const [newRemarks, setNewRemarks] = useState('');

  // Update progress form state
  const [updatePercent, setUpdatePercent] = useState(50);
  const [updateRemarks, setUpdateRemarks] = useState('');

  const canManage = hasRole(['ADMIN', 'DISTRICT_OFFICER']);

  const filteredProjects = panchayatProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignedOfficer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesVil = selectedVillage === 'ALL' || p.villageName === selectedVillage;

    return matchesSearch && matchesCat && matchesVil;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const villageObj = villages.find((v) => v.name === newVillage) || villages[0];

    // Pick photo based on category
    let defaultPhoto = STAGE_PHOTOS.PANCHAYAT_ROAD;
    if (newCategory === 'DRAINAGE_SANITATION') defaultPhoto = STAGE_PHOTOS.PANCHAYAT_DRAIN;
    else if (newCategory === 'COMMUNITY_HALL') defaultPhoto = STAGE_PHOTOS.PANCHAYAT_HALL;
    else if (newCategory === 'SOLAR_LIGHTING') defaultPhoto = STAGE_PHOTOS.PANCHAYAT_SOLAR;

    addPanchayatProject({
      title: newTitle,
      category: newCategory,
      villageId: villageObj.id,
      villageName: villageObj.name,
      department: newDepartment,
      assignedOfficer: newOfficer,
      status: 'IN_PROGRESS',
      startDate: newStartDate,
      expectedCompletionDate: newCompletionDate,
      progressPercentage: 10,
      allocatedBudget: newBudget,
      photoUrl: defaultPhoto,
      latitude: 27.5745,
      longitude: 80.6825,
      remarks: newRemarks || 'Sanctioned under 15th Finance Commission Grant.',
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewRemarks('');
  };

  const handleSaveProgress = () => {
    if (!selectedProject) return;
    updatePanchayatProgress(selectedProject.id, updatePercent, updateRemarks);
    setShowProgressModal(false);
    setUpdateRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#24213A]">
            Gram Panchayat Infrastructure Works
          </h1>
          <p className="text-xs sm:text-sm text-[#77748B] mt-0.5">
            Monitoring rural roads, drainage, solar street lighting, community halls & drinking water
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportDataAsCsv('panchayat')}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#EAE5F5] text-[#24213A] hover:bg-[#F8F6FF] transition-all shadow-2xs"
          >
            Export CSV
          </button>
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Panchayat Work</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE5F5] shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
            <input
              type="text"
              placeholder="Search project title or officer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Categories</option>
              <option value="ROAD_CONNECTIVITY">Road Connectivity</option>
              <option value="DRAINAGE_SANITATION">Drainage & Sanitation</option>
              <option value="COMMUNITY_HALL">Community Hall / Kiosk</option>
              <option value="SOLAR_LIGHTING">Solar Lighting</option>
              <option value="DRINKING_WATER">Drinking Water Infrastructure</option>
            </select>
          </div>

          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
            >
              <option value="ALL">All Villages</option>
              {villages.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((p) => {
          const budgetFormatted = (p.allocatedBudget / 100000).toFixed(2);
          const spentFormatted = (p.spentBudget / 100000).toFixed(2);

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-[#EAE5F5] hover:border-[#D8CEF6] shadow-2xs overflow-hidden flex flex-col justify-between transition-all"
            >
              <div>
                {/* Photo banner */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    src={p.photoUrl}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/90 backdrop-blur-xs text-[#7654D6] shadow-xs">
                      {p.category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-black/60 text-white">
                      {p.projectId}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-xs ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-indigo-600/90 text-white'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#24213A]">{p.title}</h3>
                    <p className="text-xs text-[#77748B] mt-0.5">
                      Village: <span className="font-semibold text-[#24213A]">{p.villageName}</span> • Dept: {p.department}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#77748B]">Physical Progress</span>
                      <span className="font-bold text-[#7654D6]">{p.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-[#EAE5F5] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#9B7BFF] to-[#7654D6] h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget & Timeline cards */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#F8F6FF] border border-[#EAE5F5]">
                      <span className="text-[10px] text-[#77748B] block">Expenditure / Sanction</span>
                      <span className="font-bold text-[#24213A]">
                        ₹{spentFormatted}L / ₹{budgetFormatted}L
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F8F6FF] border border-[#EAE5F5]">
                      <span className="text-[10px] text-[#77748B] block">Assigned Officer</span>
                      <span className="font-medium text-[#24213A] truncate block">
                        {p.assignedOfficer}
                      </span>
                    </div>
                  </div>

                  {/* Latest Inspection Note */}
                  {p.inspectionHistory.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#EDE5FF]/40 border border-[#D8CEF6] text-[11px] text-[#24213A]">
                      <span className="font-bold text-[#7654D6] block text-[10px] uppercase">
                        Latest Ground Verification:
                      </span>
                      "{p.inspectionHistory[0].remarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-[#F8F6FF]/60 border-t border-[#EAE5F5] flex items-center justify-between">
                <span className="text-[11px] text-[#77748B]">
                  Target: {p.expectedCompletionDate}
                </span>

                {canManage && (
                  <button
                    onClick={() => {
                      setSelectedProject(p);
                      setUpdatePercent(p.progressPercentage);
                      setShowProgressModal(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#F4EEFF] text-[#7654D6] hover:bg-[#7654D6] hover:text-white transition-all shadow-2xs"
                  >
                    Update Progress
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#EAE5F5] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
              <h3 className="text-base font-bold text-[#24213A]">Sanction New Panchayat Work</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#24213A] block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Rampur Primary Health Sub-Centre Boundary Wall"
                  className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#24213A] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                  >
                    <option value="ROAD_CONNECTIVITY">Road Connectivity</option>
                    <option value="DRAINAGE_SANITATION">Drainage & Sanitation</option>
                    <option value="COMMUNITY_HALL">Community Hall</option>
                    <option value="SOLAR_LIGHTING">Solar Lighting</option>
                    <option value="DRINKING_WATER">Drinking Water</option>
                    <option value="POND_REJUVENATION">Pond Rejuvenation</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#24213A] block mb-1">Village *</label>
                  <select
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#24213A] block mb-1">Allocated Budget (₹)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] font-bold text-[#7654D6] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#24213A] block mb-1">Assigned Official</label>
                  <input
                    type="text"
                    value={newOfficer}
                    onChange={(e) => setNewOfficer(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#24213A] block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#24213A] block mb-1">Target Completion</label>
                  <input
                    type="date"
                    value={newCompletionDate}
                    onChange={(e) => setNewCompletionDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#24213A] block mb-1">Technical Remarks</label>
                <textarea
                  rows={2}
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  placeholder="Sanction order reference, engineering specifications..."
                  className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7654D6] text-white font-semibold hover:bg-[#6846C5]"
                >
                  Sanction Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#EAE5F5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
              <h3 className="text-base font-bold text-[#24213A]">Update Work Progress</h3>
              <button onClick={() => setShowProgressModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#77748B]">
              Project: <strong className="text-[#24213A]">{selectedProject.title}</strong>
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Progress Percentage:</span>
                <span className="text-[#7654D6] font-bold text-sm">{updatePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={updatePercent}
                onChange={(e) => setUpdatePercent(Number(e.target.value))}
                className="w-full accent-[#7654D6]"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#24213A]">Site Inspection Remarks</label>
              <textarea
                rows={3}
                value={updateRemarks}
                onChange={(e) => setUpdateRemarks(e.target.value)}
                placeholder="Enter field assessment, milestone reached, or contractor quality observation..."
                className="w-full p-2.5 bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProgressModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5]"
              >
                Record Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
