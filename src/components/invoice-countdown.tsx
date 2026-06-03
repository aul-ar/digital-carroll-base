"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface InvoiceCountdownProps {
  expiresAt: string;
  onExpire?: () => void;
}

function getRemainingMs(expiresAt: string) {
  const expiresAtTime = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiresAtTime)) {
    return 0;
  }

  return Math.max(0, expiresAtTime - Date.now());
}

function formatTwoDigits(value: number) {
  return String(value).padStart(2, "0");
}

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${formatTwoDigits(hours)}:${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;
  }

  return `${formatTwoDigits(minutes)}:${formatTwoDigits(seconds)}`;
}

function formatIndonesianDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InvoiceCountdown({ expiresAt, onExpire }: InvoiceCountdownProps) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const hasNotifiedExpiry = useRef(false);
  const expiresAtLabel = useMemo(() => formatIndonesianDateTime(expiresAt), [expiresAt]);

  useEffect(() => {
    hasNotifiedExpiry.current = false;

    function updateRemainingTime() {
      const nextRemainingMs = getRemainingMs(expiresAt);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0 && !hasNotifiedExpiry.current) {
        hasNotifiedExpiry.current = true;
        onExpire?.();
      }
    }

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt, onExpire]);

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-100">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Batas pembayaran
          </p>
          <p className="mt-1 font-semibold">{expiresAtLabel}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Sisa waktu pembayaran
          </p>
          <p className="mt-1 font-mono text-lg font-extrabold tracking-normal">
            {remainingMs === null ? "--:--" : formatRemainingTime(remainingMs)}
          </p>
        </div>
      </div>
    </div>
  );
}
