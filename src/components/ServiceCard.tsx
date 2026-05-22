import React from "react";
import Link from "next/link";
import { FileText, Building2, ShoppingBag, ArrowRight, Check, UserCircle, ShoppingCart, RefreshCcw, Layers } from "lucide-react";
import { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText: FileText,
  Building2: Building2,
  ShoppingBag: ShoppingBag,
  UserCircle: UserCircle,
  ShoppingCart: ShoppingCart,
  RefreshCcw: RefreshCcw,
  Layers: Layers,
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const IconComponent = iconMap[service.iconName] || FileText;

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Background glow decoration */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/0 via-purple-500/0 to-purple-500/[0.02] group-hover:to-purple-500/[0.05] pointer-events-none transition-colors duration-300" />

      <div>
        {/* Icon & Heading */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <IconComponent className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {service.title}
            </h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
              Mulai {service.priceStartingFrom}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          {service.shortDescription}
        </p>

        {/* Features list (Preview 3) */}
        <div className="space-y-2.5 mb-8">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
            Fitur Utama Termasuk:
          </span>
          {service.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-4 h-4 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Button Action */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Waktu: {service.deliveryTime}
        </span>
        <Link
          href={`/layanan/${service.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors group/btn"
        >
          <span>Detail Selengkapnya</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
