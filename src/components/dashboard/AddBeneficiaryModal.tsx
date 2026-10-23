import React, { useState } from 'react';
import { X, UserPlus, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { VerificationCase } from '../../types';

interface AddBeneficiaryModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddBeneficiaryModal: React.FC<AddBeneficiaryModalProps> = ({ onClose, onSuccess }) => {
  const { villages, addBeneficiary } = useData();

  const [name, setName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [villageName, setVillageName] = useState(villages[0]?.name || 'Rampur');
  const [category, setCategory] = useState<'SC' | 'ST' | 'OBC' | 'GENERAL' | 'MINORITY'>('OBC');
  const [householdReference, setHouseholdReference] = useState('');
  const [nationalIdMasked, setNationalIdMasked] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccountMasked, setBankAccountMasked] = useState('');
  const [ifscCode, setIfscCode] = useState('SBIN0001244');
  const [sanctionAmount, setSanctionAmount] = useState(130000);

  const [flagsResult, setFlagsResult] = useState<VerificationCase[] | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !guardianName || !householdReference) return;

    const selectedVillage = villages.find((v) => v.name === villageName) || villages[0];

    const result = addBeneficiary({
      name,
      guardianName,
      gender,
      villageId: selectedVillage.id,
      villageName: selectedVillage.name,
      district: selectedVillage.district,
      householdReference,
      nationalIdMasked: nationalIdMasked || 'XXXX-XXXX-1234',
      schemeReference: `PMAY-G/2026/UP-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      phone: phone || '+91 98000 11223',
      bankAccountMasked: bankAccountMasked || 'SBIN-XXXX-4491',
      ifscCode: ifscCode || 'SBIN0001244',
      sanctionAmount,
    });

    if (result.flags.length > 0) {
      setFlagsResult(result.flags);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#EAE5F5] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#F8F6FF] to-white border-b border-[#EAE5F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE5FF] text-[#7654D6] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#24213A]">Register Rural Housing Beneficiary</h2>
              <p className="text-xs text-[#77748B]">Add candidate for sanction & automatic duplicate check</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {flagsResult && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Verification System Alert ({flagsResult.length} Flag Detected)
                </span>
              </div>
              <p className="text-xs">
                Beneficiary was registered, but flagged for review:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {flagsResult.map((f) => (
                  <li key={f.id} className="font-medium">
                    {f.flagReason} — <span className="underline">{f.matchType}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess?.();
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#7654D6] text-white text-xs font-semibold"
                >
                  Proceed to Verification Centre
                </button>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Registration Successful!</p>
                <p className="text-[11px] text-emerald-700">No duplicate matches found. Foundation stage pending inspection.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">
                Beneficiary Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rameshwar Yadav"
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">
                Father / Guardian Name *
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Late Brijlal Yadav"
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">Gram Panchayat / Village *</label>
              <select
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.panchayat})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              >
                <option value="FEMALE">Female (Head of Family)</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">Social Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              >
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="GENERAL">General</option>
                <option value="MINORITY">Minority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">
                Household SECC / Ration ID *
              </label>
              <input
                type="text"
                required
                value={householdReference}
                onChange={(e) => setHouseholdReference(e.target.value)}
                placeholder="e.g. HH-98324-UP (Try HH-98324-UP to test duplicate alert)"
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] font-mono focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">
                Tip: Enter HH-98324-UP to trigger the duplicate check engine!
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">
                Masked National ID (Aadhaar)
              </label>
              <input
                type="text"
                value={nationalIdMasked}
                onChange={(e) => setNationalIdMasked(e.target.value)}
                placeholder="XXXX-XXXX-4921"
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] font-mono focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98710 44102"
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">Bank Account</label>
              <input
                type="text"
                value={bankAccountMasked}
                onChange={(e) => setBankAccountMasked(e.target.value)}
                placeholder="SBIN-XXXX-9014"
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] font-mono focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#24213A] block mb-1">Sanction Amount (₹)</label>
              <input
                type="number"
                value={sanctionAmount}
                onChange={(e) => setSanctionAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] font-bold text-[#7654D6] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE5F5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#7654D6] text-white hover:bg-[#6846C5] shadow-xs"
            >
              Run Eligibility Check & Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
