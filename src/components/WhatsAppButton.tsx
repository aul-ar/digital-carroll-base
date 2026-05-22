"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/utils/whatsapp";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  text?: string;
  size?: "sm" | "md" | "lg";
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  message = "Halo Digital Carroll Base, saya tertarik untuk berkonsultasi mengenai pembuatan website.",
  className = "",
  variant = "primary",
  text = "Hubungi via WhatsApp",
  size = "md"
}) => {
  const url = getWhatsAppLink(message);

  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-sm";
  
  const variantStyles = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 hover:shadow-emerald-500/20",
    secondary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-indigo-600/10 hover:shadow-indigo-500/20",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-emerald-700 hover:border-emerald-500"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5"
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <span>{text}</span>
    </a>
  );
};

export const FloatingWhatsAppButton: React.FC = () => {
  const defaultMessage = "Halo Digital Carroll Base, saya ingin berkonsultasi tentang pembuatan website.";
  const url = getWhatsAppLink(defaultMessage);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-500 hover:shadow-emerald-600/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
      aria-label="Hubungi WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-md">
        Konsultasi Gratis
      </span>
      <span className="absolute flex h-3 w-3 top-0 right-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
    </a>
  );
};
