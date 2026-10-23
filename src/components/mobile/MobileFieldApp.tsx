import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Camera,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Upload,
  User,
  Home,
  Building2,
  FileText,
  Search,
  Check,
  RotateCcw,
  Layers,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import { useData } from '../../context/DataContext';
import { ConstructionStage, Beneficiary, PanchayatProject } from '../../types';
import { STAGE_PHOTOS } from '../../services/mockData';

interface MobileFieldAppProps {
  onExitMobileMode: () => void;
}

export const MobileFieldApp: React.FC<MobileFieldAppProps> = ({ onExitMobileMode }) => {
  const { currentUser, quickLogin } = useAuth();
  const {
    effectiveOnline,
    isSimulatedOffline,
    toggleSimulateOffline,
    queuedInspections,
    queuedCount,
    isSyncing,
    syncNow,
    queueInspectionOffline,
    syncLogs,
  } = useSync();
  const { beneficiaries, panchayatProjects, submitInspection, villages } = useData();

  // Active Mobile View: 'DASHBOARD' | 'NEW_INSPECTION' | 'QUEUE' | 'PROJECTS' | 'PROFILE'
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'NEW_INSPECTION' | 'QUEUE' | 'PROJECTS' | 'PROFILE'>('DASHBOARD');

  // Inspection Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [inspectType, setInspectType] = useState<'HOUSING' | 'PANCHAYAT'>('HOUSING');
  const [selectedVillage, setSelectedVillage] = useState<string>('Rampur');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>('');
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<ConstructionStage>('FOUNDATION');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>('');
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // File input ref for camera capture
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real geolocation using Web Geolocation API
  const captureCurrentLocation = () => {
    setIsGettingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser/device.');
      setIsGettingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setIsGettingGps(false);
      },
      (err) => {
        // Fallback for desktop demo without GPS hardware: realistic Sitapur village coordinates
        console.warn('Geolocation error / permission denied:', err.message);
        setGpsError('Location permission denied or unavailable. Using village geo-fence tag.');
        setLatitude(27.5742 + (Math.random() - 0.5) * 0.005);
        setLongitude(80.6821 + (Math.random() - 0.5) * 0.005);
        setGpsAccuracy(5.0);
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Handle camera photo selection or preset sample
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const setPresetPhoto = (stage: ConstructionStage) => {
    setPhotoDataUrl(STAGE_PHOTOS[stage]);
  };

  // Step 8: Save inspection
  const handleSaveInspection = async () => {
    let benName = 'Rameshwar Yadav';
    let village = selectedVillage;

    if (inspectType === 'HOUSING') {
      const ben = beneficiaries.find((b) => b.id === selectedBeneficiaryId) || beneficiaries[0];
      benName = ben.name;
      village = ben.villageName;
    } else {
      const proj = panchayatProjects.find((p) => p.id === selectedPanchayatId) || panchayatProjects[0];
      benName = proj.title;
      village = proj.villageName;
    }

    const payload = {
      beneficiaryId: inspectType === 'HOUSING' ? (selectedBeneficiaryId || beneficiaries[0].id) : (selectedPanchayatId || panchayatProjects[0].id),
      beneficiaryName: benName,
      villageName: village,
      stage: selectedStage,
      photoUrl: photoDataUrl || STAGE_PHOTOS[selectedStage],
      latitude,
      longitude,
      gpsAccuracy,
      timestamp: new Date().toISOString(),
      inspectorId: currentUser?.id || 'usr-03',
      inspectorName: currentUser?.name || 'Amit Kumar (JE)',
      remarks: remarks || `Physical inspection completed for ${selectedStage} stage with compliant dimensions.`,
      isPanchayatProject: inspectType === 'PANCHAYAT',
      projectId: inspectType === 'PANCHAYAT' ? selectedPanchayatId : undefined,
    };

    if (effectiveOnline) {
      // Online: Direct submit
      submitInspection(payload, true);
      setSubmissionFeedback('Inspection uploaded directly and synced with server!');
    } else {
      // Offline: Store persistently in IndexedDB
      await queueInspectionOffline({
        ...payload,
        id: `insp-offline-${Date.now()}`,
        status: 'SUBMITTED',
        syncStatus: 'SAVED_LOCALLY',
      });
      setSubmissionFeedback('Offline Mode: Inspection saved locally in IndexedDB. Will sync when back online!');
    }

    setTimeout(() => {
      setSubmissionFeedback(null);
      resetWizard();
      setActiveTab('QUEUE');
    }, 2000);
  };

  const resetWizard = () => {
    setWizardStep(1);
    setPhotoDataUrl('');
    setLatitude(null);
    setLongitude(null);
    setRemarks('');
  };

  const assignedBeneficiaries = beneficiaries.filter(
    (b) => b.villageName === selectedVillage
  );

  return (
    <div className="min-h-screen bg-[#F8F6FF] flex flex-col items-center justify-start p-2 sm:p-6">
      {/* Phone Mockup Frame */}
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border-4 border-[#24213A] overflow-hidden flex flex-col h-[850px] relative">
        {/* Android Notch / Speaker / Camera bar */}
        <div className="bg-[#24213A] h-6 flex items-center justify-between px-6 text-white text-[10px] select-none">
          <span>9:41</span>
          <div className="w-20 h-3.5 bg-black rounded-full" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[9px]">5G</span>
            {effectiveOnline ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-400" />
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="bg-white px-4 py-3 border-b border-[#EAE5F5] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#9B7BFF] to-[#7654D6] flex items-center justify-center text-white text-xs font-bold">
              GT
            </div>
            <div>
              <span className="font-extrabold text-xs text-[#24213A]">GramTrack Field</span>
              <p className="text-[9px] text-[#77748B] -mt-0.5">Mobile Field Inspector</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Offline toggle for testing */}
            <button
              onClick={toggleSimulateOffline}
              className={`p-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                effectiveOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title="Toggle Offline Simulation"
            >
              {effectiveOnline ? 'Online' : 'Offline'}
            </button>

            {/* Exit mobile mode to dashboard */}
            <button
              onClick={onExitMobileMode}
              className="text-[10px] font-semibold text-[#7654D6] px-2 py-1 bg-[#F4EEFF] rounded-lg"
            >
              Desktop
            </button>
          </div>
        </div>

        {/* Dynamic Screen View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {submissionFeedback && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{submissionFeedback}</span>
            </div>
          )}

          {/* SCREEN 1: FIELD DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-4">
              {/* Inspector Welcome Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#7654D6] to-[#9B7BFF] text-white space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                    Inspector Duty Station
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                    Sitapur District
                  </span>
                </div>
                <h2 className="text-base font-bold">{currentUser?.name || 'Amit Kumar'}</h2>
                <p className="text-[11px] opacity-90">
                  Assigned Gram Panchayats: Rampur, Shivpuri
                </p>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-white/20">
                  <span>Queued for Sync:</span>
                  <span className="font-extrabold text-sm">{queuedCount} inspections</span>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => {
                  resetWizard();
                  setActiveTab('NEW_INSPECTION');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#7654D6] text-white font-bold text-xs shadow-md hover:bg-[#6846C5] flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Start New Field Inspection</span>
              </button>

              {/* Status & Sync Snapshot */}
              <div className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {effectiveOnline ? (
                    <Wifi className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-amber-600" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-[#24213A]">
                      {effectiveOnline ? 'Network Connected' : 'Offline Field Mode'}
                    </span>
                    <p className="text-[10px] text-[#77748B]">
                      {effectiveOnline
                        ? 'Inspections upload immediately'
                        : 'Saved to IndexedDB offline queue'}
                    </p>
                  </div>
                </div>

                {queuedCount > 0 && effectiveOnline && (
                  <button
                    onClick={() => syncNow()}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-xl bg-[#EDE5FF] text-[#7654D6] text-xs font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                )}
              </div>

              {/* Assigned Beneficiaries Quick Access */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#24213A]">Assigned Housing Beneficiaries</span>
                  <span className="text-[#7654D6] font-semibold text-[11px]">
                    {beneficiaries.length} total
                  </span>
                </div>

                <div className="space-y-2">
                  {beneficiaries.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedVillage(b.villageName);
                        setSelectedBeneficiaryId(b.id);
                        setSelectedStage(b.currentStage);
                        setActiveTab('NEW_INSPECTION');
                        setWizardStep(3); // Jump straight to stage selection!
                      }}
                      className="p-3 bg-white rounded-2xl border border-[#EAE5F5] hover:border-[#D8CEF6] transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#24213A]">{b.name}</div>
                        <span className="text-[10px] text-[#77748B]">
                          {b.villageName} • Current Stage: <strong className="text-[#7654D6]">{b.currentStage}</strong>
                        </span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-[#F4EEFF] text-[#7654D6]">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: 10-STEP NEW INSPECTION WIZARD */}
          {activeTab === 'NEW_INSPECTION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (wizardStep > 1) setWizardStep((s) => s - 1);
                      else setActiveTab('DASHBOARD');
                    }}
                    className="p-1 rounded-lg text-gray-500 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-xs font-bold text-[#24213A]">
                    Step {wizardStep} of 4: {wizardStep === 1 ? 'Target' : wizardStep === 2 ? 'Beneficiary' : wizardStep === 3 ? 'Stage & Camera' : 'GPS & Remarks'}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDE5FF] text-[#7654D6]">
                  Field Audit
                </span>
              </div>

              {/* Wizard Step 1: Village & Work Type */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#24213A] block">
                    1. Select Work Type & Village
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectType('HOUSING')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                        inspectType === 'HOUSING'
                          ? 'bg-[#EDE5FF] border-[#7654D6] text-[#7654D6]'
                          : 'bg-white border-[#EAE5F5] text-gray-600'
                      }`}
                    >
                      Rural Housing
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectType('PANCHAYAT')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                        inspectType === 'PANCHAYAT'
                          ? 'bg-[#EDE5FF] border-[#7654D6] text-[#7654D6]'
                          : 'bg-white border-[#EAE5F5] text-gray-600'
                      }`}
                    >
                      Panchayat Work
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#24213A] block mb-1">
                      Assigned Village
                    </label>
                    <select
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A]"
                    >
                      {villages.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setWizardStep(2)}
                    className="w-full py-2.5 rounded-xl bg-[#7654D6] text-white text-xs font-bold mt-4"
                  >
                    Continue to Target Selection &rarr;
                  </button>
                </div>
              )}

              {/* Wizard Step 2: Pick Beneficiary or Project */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#24213A] block">
                    2. Select {inspectType === 'HOUSING' ? 'Beneficiary' : 'Panchayat Project'}
                  </span>

                  {inspectType === 'HOUSING' ? (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {assignedBeneficiaries.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBeneficiaryId(b.id);
                            setSelectedStage(b.currentStage);
                            setWizardStep(3);
                          }}
                          className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                            selectedBeneficiaryId === b.id
                              ? 'bg-[#EDE5FF] border-[#7654D6] text-[#7654D6]'
                              : 'bg-white border-[#EAE5F5] hover:bg-[#F8F6FF]'
                          }`}
                        >
                          <div className="font-bold text-[#24213A]">{b.name}</div>
                          <span className="text-[10px] text-[#77748B]">
                            {b.beneficiaryId} • Current: {b.currentStage}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {panchayatProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPanchayatId(p.id);
                            setWizardStep(3);
                          }}
                          className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                            selectedPanchayatId === p.id
                              ? 'bg-[#EDE5FF] border-[#7654D6] text-[#7654D6]'
                              : 'bg-white border-[#EAE5F5] hover:bg-[#F8F6FF]'
                          }`}
                        >
                          <div className="font-bold text-[#24213A]">{p.title}</div>
                          <span className="text-[10px] text-[#77748B]">
                            {p.villageName} • {p.category.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wizard Step 3: Construction Stage & Camera Photograph */}
              {wizardStep === 3 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#24213A] block">
                    3. Stage & Photograph Evidence
                  </span>

                  <div>
                    <label className="text-xs font-semibold text-[#24213A] block mb-1">
                      Inspection Stage
                    </label>
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value as ConstructionStage)}
                      className="w-full p-2.5 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A]"
                    >
                      <option value="FOUNDATION">1. Foundation Stage</option>
                      <option value="PLINTH">2. Plinth Beam Stage</option>
                      <option value="LINTEL">3. Lintel Level Stage</option>
                      <option value="COMPLETION">4. Completion Stage</option>
                    </select>
                  </div>

                  {/* Photo Capture Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#24213A] block">
                      Camera Photo Capture *
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={fileInputRef}
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />

                    {photoDataUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-[#EAE5F5] h-44 bg-gray-100">
                        <img
                          src={photoDataUrl}
                          alt="Captured evidence"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoDataUrl('')}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px]"
                        >
                          Retake
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#D8CEF6] rounded-2xl p-4 text-center space-y-2 bg-[#F8F6FF]">
                        <Camera className="w-8 h-8 text-[#7654D6] mx-auto" />
                        <p className="text-xs font-semibold text-[#24213A]">
                          Capture On-Site Photo
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#7654D6] text-white"
                          >
                            Use Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => setPresetPhoto(selectedStage)}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-[#D8CEF6] text-[#7654D6]"
                          >
                            Sample Photo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!photoDataUrl) setPresetPhoto(selectedStage);
                      setWizardStep(4);
                      captureCurrentLocation();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#7654D6] text-white text-xs font-bold mt-2"
                  >
                    Next: GPS & Remarks &rarr;
                  </button>
                </div>
              )}

              {/* Wizard Step 4: GPS Coordinates & Remarks */}
              {wizardStep === 4 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#24213A] block">
                    4. GPS Tag & Remarks
                  </span>

                  {/* Location Card */}
                  <div className="p-3 rounded-2xl bg-[#F8F6FF] border border-[#EAE5F5] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#24213A] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#7654D6]" />
                        <span>Geo-Coordinates</span>
                      </span>
                      <button
                        type="button"
                        onClick={captureCurrentLocation}
                        className="text-[10px] text-[#7654D6] font-semibold hover:underline"
                      >
                        {isGettingGps ? 'Reading...' : 'Refresh GPS'}
                      </button>
                    </div>

                    {latitude && longitude ? (
                      <div className="font-mono text-[11px] text-[#24213A]">
                        Lat: {latitude.toFixed(5)}, Long: {longitude.toFixed(5)}
                        <span className="text-[10px] text-gray-500 block">
                          Accuracy: ±{gpsAccuracy || 4.2}m
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-700">
                        {gpsError || 'Capturing device GPS coordinates...'}
                      </p>
                    )}
                  </div>

                  {/* Remarks Input */}
                  <div>
                    <label className="text-xs font-semibold text-[#24213A] block mb-1">
                      Inspector Remarks *
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Verify wall thickness, foundation depth, curing status, or damp proof course..."
                      className="w-full p-2.5 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSaveInspection}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9B7BFF] to-[#7654D6] text-white text-xs font-extrabold shadow-md hover:opacity-95"
                  >
                    {effectiveOnline ? 'Upload & Sync Now' : 'Save to Offline Queue (IndexedDB)'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: OFFLINE QUEUE & SYNC STATUS */}
          {activeTab === 'QUEUE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5F5]">
                <div>
                  <h3 className="text-xs font-bold text-[#24213A]">Offline Sync Queue</h3>
                  <p className="text-[10px] text-[#77748B]">
                    Stored locally in IndexedDB until online
                  </p>
                </div>

                <button
                  disabled={queuedCount === 0 || !effectiveOnline || isSyncing}
                  onClick={() => syncNow()}
                  className="px-3 py-1.5 rounded-xl bg-[#7654D6] text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync All</span>
                </button>
              </div>

              {queuedInspections.length > 0 ? (
                <div className="space-y-2">
                  {queuedInspections.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-2xl border border-[#EAE5F5] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#24213A]">{item.beneficiaryName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {item.syncStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#77748B]">
                        Stage: <strong className="text-[#7654D6]">{item.stage}</strong> • {item.villageName}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        GPS: {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-[#F8F6FF] rounded-3xl border border-[#EAE5F5]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#24213A]">All Records Synchronized</p>
                  <p className="text-[10px] text-[#77748B] mt-0.5">
                    No pending offline inspections in device storage.
                  </p>
                </div>
              )}

              {/* Sync History Logs */}
              <div className="pt-2">
                <span className="text-xs font-bold text-[#24213A] block mb-2">
                  Sync Audit Trail
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {syncLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-xl bg-white border border-[#EAE5F5] text-[11px] flex items-center justify-between"
                    >
                      <span className="text-[#24213A] font-medium">{log.beneficiaryName} ({log.stage})</span>
                      <span className="text-[10px] font-bold text-emerald-600">Synced</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: PROJECTS BROWSER */}
          {activeTab === 'PROJECTS' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#24213A] block">
                Panchayat Infrastructure Works
              </span>

              <div className="space-y-2">
                {panchayatProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedVillage(p.villageName);
                      setSelectedPanchayatId(p.id);
                      setInspectType('PANCHAYAT');
                      setActiveTab('NEW_INSPECTION');
                      setWizardStep(3);
                    }}
                    className="p-3 bg-white rounded-2xl border border-[#EAE5F5] hover:border-[#D8CEF6] cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#24213A] truncate">{p.title}</span>
                      <span className="text-[10px] font-bold text-[#7654D6] shrink-0">
                        {p.progressPercentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-[#77748B]">
                      {p.villageName} • {p.department}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 5: INSPECTOR PROFILE */}
          {activeTab === 'PROFILE' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-3xl border border-[#EAE5F5] text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9B7BFF] to-[#7654D6] text-white flex items-center justify-center font-bold text-lg mx-auto shadow-sm">
                  {currentUser?.name.charAt(0) || 'A'}
                </div>
                <h3 className="text-sm font-bold text-[#24213A]">{currentUser?.name || 'Amit Kumar'}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE5FF] text-[#7654D6]">
                  Junior Engineer (RED)
                </span>
                <p className="text-[11px] text-[#77748B] pt-1 font-mono">ID: EMP-UP-SITAPUR-0419</p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-[#EAE5F5] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#77748B]">Jurisdiction:</span>
                  <span className="font-semibold text-[#24213A]">Maholi & Pisawan Blocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77748B]">Local Cache:</span>
                  <span className="text-emerald-600 font-semibold">IndexedDB Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#77748B]">Android Runtime:</span>
                  <span className="font-mono text-[#7654D6]">Capacitor 6.x</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="bg-white border-t border-[#EAE5F5] px-3 py-2 flex items-center justify-around select-none">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'DASHBOARD' ? 'text-[#7654D6] font-bold' : 'text-[#77748B]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => {
              resetWizard();
              setActiveTab('NEW_INSPECTION');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'NEW_INSPECTION' ? 'text-[#7654D6] font-bold' : 'text-[#77748B]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-[10px]">Inspect</span>
          </button>

          <button
            onClick={() => setActiveTab('QUEUE')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
              activeTab === 'QUEUE' ? 'text-[#7654D6] font-bold' : 'text-[#77748B]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[10px]">Queue</span>
            {queuedCount > 0 && (
              <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#7654D6] text-white text-[9px] flex items-center justify-center font-bold">
                {queuedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'PROJECTS' ? 'text-[#7654D6] font-bold' : 'text-[#77748B]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="text-[10px]">Works</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              activeTab === 'PROFILE' ? 'text-[#7654D6] font-bold' : 'text-[#77748B]'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
