import React from "react";
import Link from "next/link";
import { Check, X, Clock } from "lucide-react";
import { PricingPlan } from "@/data/pricing";
import { WhatsAppButton } from "./WhatsAppButton";

interface PricingCardProps {
  plan: PricingPlan;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan }) => {
  return (
    <div
      className={`relative bg-white dark:bg-slate-900 border rounded-3xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full ${
        plan.popular
          ? "border-blue-600 dark:border-blue-400 shadow-md ring-2 ring-blue-600/10 dark:ring-blue-400/10 scale-102 z-10"
          : "border-slate-200/60 dark:border-slate-800/60 hover:-translate-y-1"
      }`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wider uppercase">
          Paling Populer
        </span>
      )}

      <div>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed min-h-12">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="mb-6 flex flex-col justify-end">
          {plan.originalPrice && (
            <span className="text-slate-400 dark:text-slate-500 text-sm line-through decoration-red-400/50 mb-1">
              {plan.originalPrice}
            </span>
          )}
          <div className="flex items-baseline">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-850 dark:from-white dark:to-slate-100 bg-clip-text text-transparent">
              {plan.price}
            </span>
          </div>
        </div>

        {/* Time duration */}
        <div className="mb-6 py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Waktu pengerjaan: {plan.deliveryTime}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 my-6" />

        {/* Features Checklist */}
        <div className="space-y-4 mb-8">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 text-red-500/70" />
                </div>
              )}
              <span
                className={
                  feature.included
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-800"
                }
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Button Action */}
      <div className="space-y-3">
        <Link
          href={`/checkout?plan=${plan.id}`}
          className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold shadow-md transition-all duration-300 ${
            plan.popular
              ? "bg-white text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50 dark:bg-slate-50 dark:text-blue-700"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-indigo-500/20 hover:from-blue-500 hover:to-purple-500"
          }`}
        >
          Checkout Paket Ini
        </Link>
        <WhatsAppButton
          variant="outline"
          className="w-full"
          text="Tanya Dulu via WhatsApp"
          message={`Halo Digital Carroll Base, saya tertarik dengan layanan "${plan.name}" (${plan.price}). Bagaimana kelanjutannya?`}
        />
      </div>
    </div>
  );
};
