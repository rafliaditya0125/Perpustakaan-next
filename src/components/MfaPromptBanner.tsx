'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Clock } from 'lucide-react';

interface MfaPromptBannerProps {
  mfaEnabled: boolean;
  profileUrl: string;
  userType: 'anggota' | 'petugas';
}

const STORAGE_PREFIX = 'perpustakaan_mfa_banner_snooze_until_';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const emptySubscribe = (callback: () => void) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }
  return () => {};
};

function useSnoozedStatus(storageKey: string): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return false;
        const until = parseInt(stored, 10);
        if (isNaN(until)) return false;
        return Date.now() < until;
      } catch {
        return false;
      }
    },
    () => false
  );
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function MfaPromptBanner({
  mfaEnabled,
  profileUrl,
  userType,
}: MfaPromptBannerProps) {
  const storageKey = `${STORAGE_PREFIX}${userType}`;
  const isSnoozedFromStorage = useSnoozedStatus(storageKey);
  const [localSnoozed, setLocalSnoozed] = React.useState<boolean | null>(null);
  const isClient = useIsClient();

  const isSnoozed = localSnoozed !== null ? localSnoozed : isSnoozedFromStorage;

  // Jika 2FA sudah aktif, belum client-rendered, atau sedang di-snooze (1 hari) -> tidak ditampilkan sama sekali
  if (mfaEnabled || !isClient || isSnoozed) {
    return null;
  }

  const handleSnooze = () => {
    setLocalSnoozed(true);
    try {
      const snoozeUntil = Date.now() + ONE_DAY_MS;
      localStorage.setItem(storageKey, snoozeUntil.toString());
    } catch {
      // ignore
    }
  };

  const profileLabel =
    userType === 'anggota' ? 'Ke Profil / Aktifkan 2FA' : 'Ke Pengaturan / Aktifkan 2FA';

  return (
    <div className="rounded-3xl border p-5 sm:p-6 mb-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border-amber-300/80 dark:border-amber-500/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-900 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-400/30">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                Penting
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tingkatkan Keamanan Akun Anda (2FA Belum Aktif)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Lindungi akun Anda dari akses tidak sah dengan mengaktifkan Autentikasi 2 Langkah (Google Authenticator / aplikasi TOTP).
            </p>
          </div>
        </div>

        {/* Right: 2 Options */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          {/* Option 1: Ke Profil / Aktifkan 2FA */}
          <Link
            href={profileUrl}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition active:scale-[0.98]"
          >
            <span>{profileLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Option 2: Ingatkan Nanti (Disembunyikan dan muncul 1 hari kemudian) */}
          <button
            type="button"
            onClick={handleSnooze}
            title="Sembunyikan peringatan dan ingatkan kembali dalam 1 hari"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:border-slate-700/80 dark:text-slate-300 dark:hover:text-white transition cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Ingatkan Nanti</span>
          </button>
        </div>
      </div>
    </div>
  );
}
