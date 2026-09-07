'use client';

import { useState } from 'react';
import { ShieldCheck, KeyRound, Smartphone, AlertTriangle, ArrowLeft, LifeBuoy } from 'lucide-react';
import { verifyMfaLoginAction, cancelPendingMfaAction } from '@/lib/actions';

interface MfaChallengeClientProps {
  errorMsg?: string;
  isStaff?: boolean;
}

export default function MfaChallengeClient({
  errorMsg,
  isStaff = true,
}: MfaChallengeClientProps) {
  const [mode, setMode] = useState<'totp' | 'recovery'>('totp');
  const [code, setCode] = useState('');

  const primaryColor = isStaff ? 'emerald' : 'indigo';

  return (
    <div className="w-full max-w-md backdrop-blur-xl rounded-3xl p-8 border transition-all duration-200 relative z-10 bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-2xl dark:shadow-black/40">
      
      {/* Cancel / Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <form action={cancelPendingMfaAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-xs font-semibold transition text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batalkan & Kembali ke Login</span>
          </button>
        </form>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          2FA Terlindungi
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="p-3.5 rounded-2xl mb-4 transition bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-400/20 dark:text-emerald-300">
          {mode === 'totp' ? (
            <Smartphone className="w-8 h-8" />
          ) : (
            <LifeBuoy className="w-8 h-8" />
          )}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {mode === 'totp' ? 'Verifikasi Dua Langkah' : 'Gunakan Kode Pemulihan'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          {mode === 'totp'
            ? 'Buka aplikasi authenticator (Google Authenticator / 2FAS) di ponsel Anda dan masukkan kode 6-digit.'
            : 'Masukkan salah satu dari 8 kode pemulihan sekali pakai (format XXXX-XXXX) yang pernah Anda simpan.'}
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => {
            setMode('totp');
            setCode('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'totp'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Aplikasi Authenticator</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('recovery');
            setCode('');
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'recovery'
              ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Recovery Code</span>
        </button>
      </div>

      {/* MFA Form */}
      <form action={verifyMfaLoginAction} method="POST" className="space-y-5">
        <input type="hidden" name="auth_type" value={mode} />

        {mode === 'totp' ? (
          <div className="space-y-2">
            <label
              htmlFor="mfa-code"
              className="text-xs font-semibold uppercase tracking-wider block text-slate-700 dark:text-slate-300 text-center"
            >
              Kode Keamanan (6 Digit)
            </label>
            <div className="relative max-w-xs mx-auto">
              <input
                id="mfa-code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                required
                className="w-full tracking-[0.4em] font-mono text-center text-2xl py-3.5 rounded-2xl transition outline-none border font-bold bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-700 dark:focus:bg-slate-900 dark:focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
              Kode berubah setiap 30 detik
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="recovery-code"
              className="text-xs font-semibold uppercase tracking-wider block text-slate-700 dark:text-slate-300 text-center"
            >
              Kode Pemulihan (Recovery Code)
            </label>
            <div className="relative max-w-xs mx-auto">
              <input
                id="recovery-code"
                name="code"
                type="text"
                autoCapitalize="characters"
                value={code}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                  if (val.length === 4 && !val.includes('-') && !e.target.value.endsWith('-')) {
                    val = val + '-';
                  }
                  setCode(val);
                }}
                maxLength={9}
                autoFocus
                placeholder="XXXX-XXXX"
                required
                className="w-full tracking-[0.2em] font-mono text-center text-xl py-3.5 rounded-2xl transition outline-none border font-bold bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-700 dark:focus:bg-slate-900 dark:focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-center text-amber-600 dark:text-amber-400">
              Perhatian: Setiap recovery code hanya dapat digunakan 1 kali saja.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl flex items-center gap-3 text-xs border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 text-sm font-semibold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verifikasi & Masuk</span>
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-6 pt-5 border-t text-center text-[11px] border-slate-200 text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
        Kehilangan ponsel dan tidak memiliki recovery code? Hubungi administrator untuk reset akun Anda.
      </div>
    </div>
  );
}
