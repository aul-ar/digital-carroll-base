import React from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Eye } from "lucide-react";
import { Demo } from "@/data/demos";
import { WhatsAppButton } from "./WhatsAppButton";

interface DemoCardProps {
  demo: Demo;
}

export const DemoCard: React.FC<DemoCardProps> = ({ demo }) => {
  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Mock Thumbnail */}
      <div className={`h-48 w-full bg-gradient-to-tr ${demo.thumbnailColor} relative flex items-center justify-center p-6 text-white overflow-hidden`}>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Mock browser navbar */}
        <div className="absolute top-3 left-4 right-4 h-6 bg-black/20 rounded-full flex items-center px-3 gap-1.5 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <div className="text-[9px] text-white/60 ml-2 font-mono truncate">demo.digitalcarrollbase.com/{demo.slug}</div>
        </div>

        {/* Demo App Info inside preview */}
        <div className="text-center mt-4">
          <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {demo.category}
          </span>
          <h4 className="font-bold text-lg mt-2 drop-shadow-sm line-clamp-1">{demo.title.split(" - ")[0]}</h4>
        </div>

        {/* Hover action overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
          <Link
            href={demo.previewUrl}
            className="flex items-center gap-1.5 bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-slate-100 transition-colors shadow-md hover:scale-105 active:scale-95 duration-200"
          >
            <Eye className="w-4 h-4" />
            Lihat Live Demo
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Tag & Category */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
              {demo.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
            {demo.title}
          </h3>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 text-xs mb-5 line-clamp-2 leading-relaxed">
            {demo.description}
          </p>

          {/* Features check list */}
          <div className="space-y-2 mb-6">
            {demo.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={demo.previewUrl}
            className="flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-all duration-200"
          >
            <span>Lihat Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <WhatsAppButton
            size="sm"
            variant="primary"
            text="Pesan Ini"
            className="w-full text-xs py-2.5!"
            message={`Halo Digital Carroll Base, saya melihat contoh demo "${demo.title}" dan tertarik untuk membuat website seperti itu.`}
          />
        </div>
      </div>
    </div>
  );
};
