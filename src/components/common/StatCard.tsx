import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white rounded-2xl border border-[#EAE5F5] hover:border-[#D8CEF6] shadow-2xs hover:shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-[#77748B] tracking-wide uppercase">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-[#F4EEFF] text-[#7654D6]">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[#24213A]">{value}</span>
        {trend && (
          <span
            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
              trendPositive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#77748B] mt-1 truncate">{subtitle}</p>
      )}
    </div>
  );
};
