import React, { useState } from 'react';
import {
  Landmark,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../services/mockData';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    const success = await login(email, password);
    setIsLoading(false);

    if (!success) {
      setError('Invalid demonstration credentials. Select a quick-login role below.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] via-white to-[#F4EEFF] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#EAE5F5] shadow-xl overflow-hidden">
        {/* Top Branding Banner */}
        <div className="p-8 pb-6 text-center bg-gradient-to-b from-[#F4EEFF]/60 to-white">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#9B7BFF] to-[#7654D6] flex items-center justify-center text-white mx-auto shadow-md shadow-[#9B7BFF]/30">
            <Landmark className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#24213A] mt-4 tracking-tight">
            Gram<span className="text-[#7654D6]">Track</span>
          </h1>
          <p className="text-xs text-[#77748B] mt-1 max-w-xs mx-auto">
            Digital Rural Housing & Gram Panchayat Development Monitoring System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#24213A] block mb-1.5">
              Official Email / Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gramtrack.gov.in"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#24213A] block mb-1.5">
              Access Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77748B]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F8F6FF] border border-[#EAE5F5] rounded-xl text-[#24213A] focus:outline-none focus:ring-2 focus:ring-[#9B7BFF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#77748B]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#D8CEF6] text-[#7654D6] focus:ring-[#9B7BFF]"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[#7654D6] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#7654D6] text-white text-xs font-bold shadow-md hover:bg-[#6846C5] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-[#EAE5F5]">
            <p className="text-[11px] font-semibold text-[#77748B] text-center mb-2.5">
              Instant Demonstration Sign-In:
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => quickLogin('ADMIN')}
                className="w-full p-2.5 rounded-xl border border-[#EAE5F5] bg-[#F8F6FF] hover:bg-[#F4EEFF] text-left text-xs transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#24213A]">Administrator</span>
                  <span className="text-[10px] text-[#77748B] block">Rajesh Verma (IAS) • All permissions</span>
                </div>
                <span className="text-[10px] font-bold text-[#7654D6]">admin@gramtrack</span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('DISTRICT_OFFICER')}
                className="w-full p-2.5 rounded-xl border border-[#EAE5F5] bg-[#F8F6FF] hover:bg-[#F4EEFF] text-left text-xs transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#24213A]">District Officer</span>
                  <span className="text-[10px] text-[#77748B] block">Priya Sharma (PCS) • Stage approvals & DBT</span>
                </div>
                <span className="text-[10px] font-bold text-[#7654D6]">district@gramtrack</span>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('FIELD_INSPECTOR')}
                className="w-full p-2.5 rounded-xl border border-[#EAE5F5] bg-[#F8F6FF] hover:bg-[#F4EEFF] text-left text-xs transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-[#24213A]">Field Inspector</span>
                  <span className="text-[10px] text-[#77748B] block">Amit Kumar (JE) • Camera, GPS & Offline</span>
                </div>
                <span className="text-[10px] font-bold text-[#7654D6]">inspector@gramtrack</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
