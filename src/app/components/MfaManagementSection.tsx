'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  KeyRound,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  setupMfaAction,
  confirmEnableMfaAction,
  disableMfaAction,
  regenerateRecoveryCodesAction,
} from '@/lib/actions';

interface MfaManagementSectionProps {
  mfaEnabled: boolean;
  remainingRecoveryCodes: number;
  userType?: 'pengguna' | 'anggota';
}

export default function MfaManagementSection({
  mfaEnabled,
  remainingRecoveryCodes,
  userType = 'pengguna',
}: MfaManagementSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Setup wizard state
  const [setupStep, setSetupStep] = useState<1 | 2 | 3>(1);
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
    recoveryCodes: string[];
  } | null>(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  // Form states
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regenNewCodes, setRegenNewCodes] = useState<string[] | null>(null);

  // Status & copy feedback
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const resetAll = () => {
    setShowSetupModal(false);
    setShowDisableModal(false);
    setShowRegenModal(false);
    setSetupStep(1);
    setSetupData(null);
    setVerifyToken('');
    setHasSavedCodes(false);
    setConfirmPassword('');
    setRegenNewCodes(null);
    setActionError(null);
  };

  const handleStartSetup = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await setupMfaAction();
      if (res.error || !res.secret) {
        setActionError(res.error || 'Gagal memuat konfigurasi MFA');
        return;
      }
      setSetupData({
        secret: res.secret,
        otpauthUrl: res.otpauthUrl!,
        qrCodeDataUrl: res.qrCodeDataUrl!,
        recoveryCodes: res.recoveryCodes!,
      });
      setSetupStep(1);
      setShowSetupModal(true);
    });
  };

  const handleCopyKey = () => {
    if (!setupData?.secret) return;
    navigator.clipboard.writeText(setupData.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCodes = (codes: string[]) => {
    const text = codes.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleDownloadCodes = (codes: string[]) => {
    const text =
      `KODE PEMULIHAN (RECOVERY CODES) 2FA - PERPUSTAKAAN\n` +
      `Tanggal Dibuat: ${new Date().toLocaleString('id-ID')}\n` +
      `Catatan: Setiap kode pemulihan hanya dapat digunakan 1 kali jika Anda kehilangan akses ke aplikasi authenticator.\n\n` +
      codes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nSimpan dokumen ini di tempat yang aman dan rahasia.`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-codes-perpustakaan-${Date.now().toString(36)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmEnable = () => {
    if (!setupData || !verifyToken.trim()) {
      setActionError('Masukkan 6 digit kode dari aplikasi authenticator');
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await confirmEnableMfaAction({
        token: verifyToken.trim(),
        secret: setupData.secret,
        recoveryCodes: setupData.recoveryCodes,
      });

      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess('Autentikasi Dua Langkah (2FA) berhasil diaktifkan!');
        resetAll();
        router.refresh();
      }
    });
  };

  const handleDisableMfa = () => {
    if (!confirmPassword) {
      setActionError('Masukkan password akun Anda untuk konfirmasi.');
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await disableMfaAction(confirmPassword);
      if (res.error) {
        setActionError(res.error);
      } else {
        setActionSuccess('Autentikasi Dua Langkah (2FA) berhasil dinonaktifkan.');
        resetAll();
        router.refresh();
      }
    });
  };

  const handleRegenerateCodes = () => {
    if (!confirmPassword) {
      setActionError('Masukkan password akun Anda untuk konfirmasi.');
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await regenerateRecoveryCodesAction(confirmPassword);
      if (res.error || !res.recoveryCodes) {
        setActionError(res.error || 'Gagal meregenerasi kode pemulihan.');
      } else {
        setRegenNewCodes(res.recoveryCodes);
        setActionSuccess('8 Kode pemulihan baru berhasil dibuat!');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Messages */}
      {actionSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl text-sm border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-700/40 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-3xl border p-6 sm:p-8 bg-white border-slate-200 shadow-xs dark:bg-slate-900/40 dark:border-slate-800 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl shrink-0 ${
                mfaEnabled
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400'
              }`}
            >
              {mfaEnabled ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <ShieldAlert className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Autentikasi Dua Langkah (2FA / TOTP)
                </h2>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    mfaEnabled
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {mfaEnabled ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Tingkatkan keamanan akun dengan mewajibkan verifikasi kode 6-digit dari aplikasi
                authenticator (Google Authenticator, Microsoft Authenticator, 2FAS) setiap kali
                masuk.
              </p>
            </div>
          </div>

          <div>
            {mfaEnabled ? (
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setConfirmPassword('');
                  setShowDisableModal(true);
                }}
                className="px-4 py-2.5 text-xs font-semibold rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer"
              >
                Nonaktifkan 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={isPending}
                className="px-5 py-2.5 text-xs font-semibold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Shield className="w-4 h-4" />
                <span>{isPending ? 'Menyiapkan...' : 'Aktifkan 2FA'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Details */}
        {mfaEnabled ? (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Metode Verifikasi Utama</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aplikasi Authenticator berbasis TOTP (Time-based One-Time Password RFC 6238).
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kode Pemulihan Cadangan</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    remainingRecoveryCodes > 2
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {remainingRecoveryCodes} kode tersisa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Digunakan saat Anda tidak dapat mengakses ponsel Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setConfirmPassword('');
                  setRegenNewCodes(null);
                  setShowRegenModal(true);
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Buat Ulang (Regenerasi) Kode Pemulihan</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Akun Anda saat ini hanya dilindungi oleh satu lapis kata sandi. Sangat disarankan
                untuk mengaktifkan 2FA.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SETUP WIZARD MODAL */}
      {showSetupModal && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Aktivasi Autentikasi 2 Langkah (2FA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Langkah {setupStep} dari 3
                </p>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="flex h-1 bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(setupStep / 3) * 100}%` }}
              />
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {actionError && (
                <div className="flex items-center gap-3 p-3.5 rounded-2xl text-xs border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* STEP 1: Scan QR Code */}
              {setupStep === 1 && (
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      1. Pindai QR Code dengan Aplikasi Authenticator
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Buka aplikasi Google Authenticator, Microsoft Authenticator, atau 2FAS di ponsel Anda, lalu pindai kode di bawah ini:
                    </p>
                  </div>

                  <div className="inline-block p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qrCodeDataUrl}
                      alt="MFA QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Tidak dapat memindai? Masukkan Secret Key ini secara manual:
                    </p>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <code className="text-xs font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200 select-all break-all">
                        {setupData.secret}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyKey}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Save Recovery Codes */}
              {setupStep === 2 && (
                <div className="space-y-5">
                  <div className="space-y-1 text-center">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      2. Simpan Kode Pemulihan (Recovery Codes)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Jika Anda kehilangan ponsel, kode-kode ini adalah satu-satunya cara untuk masuk ke akun Anda. Setiap kode hanya berlaku 1 kali.
                    </p>
                  </div>

                  {/* Codes Grid */}
                  <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    {setupData.recoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs font-bold tracking-widest text-slate-800 dark:text-slate-200 select-all"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  {/* Actions to copy/download */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCodes(setupData.recoveryCodes)}
                      className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedCodes ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCodes ? 'Kode Tersalin!' : 'Salin Semua Kode'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadCodes(setupData.recoveryCodes)}
                      className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File (.txt)</span>
                    </button>
                  </div>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSavedCodes}
                      onChange={(e) => setHasSavedCodes(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs text-amber-900 dark:text-amber-300 leading-snug">
                      Saya telah menyimpan kode pemulihan ini di tempat yang aman dan memahaminya sebagai cadangan darurat.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 3: Verify and Enable */}
              {setupStep === 3 && (
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      3. Konfirmasi Kode dari Authenticator
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Masukkan 6 digit kode yang sedang ditampilkan di aplikasi authenticator untuk memastikan sinkronisasi berhasil.
                    </p>
                  </div>

                  <div className="max-w-xs mx-auto space-y-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verifyToken}
                      onChange={(e) => setVerifyToken(e.target.value.replace(/[^0-9]/g, ''))}
                      autoFocus
                      placeholder="000000"
                      className="w-full tracking-[0.4em] font-mono text-center text-2xl py-3.5 rounded-2xl transition outline-none border font-bold bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-700 dark:focus:bg-slate-900 dark:focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">Pastikan waktu perangkat Anda akurat</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              {setupStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setSetupStep((s) => (s - 1) as any)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Kembali
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
              )}

              {setupStep === 1 && (
                <button
                  type="button"
                  onClick={() => setSetupStep(2)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition cursor-pointer"
                >
                  Lanjut ke Kode Pemulihan
                </button>
              )}

              {setupStep === 2 && (
                <button
                  type="button"
                  disabled={!hasSavedCodes}
                  onClick={() => setSetupStep(3)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition cursor-pointer"
                >
                  Lanjut ke Verifikasi
                </button>
              )}

              {setupStep === 3 && (
                <button
                  type="button"
                  disabled={verifyToken.length !== 6 || isPending}
                  onClick={handleConfirmEnable}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isPending ? 'Memverifikasi...' : 'Aktifkan 2FA'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISABLE 2FA MODAL */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/40 dark:text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Nonaktifkan 2FA?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Keamanan akun Anda akan berkurang.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Konfirmasi Password Akun
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password akun Anda"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetAll}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!confirmPassword || isPending}
                onClick={handleDisableMfa}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition cursor-pointer"
              >
                {isPending ? 'Menonaktifkan...' : 'Ya, Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGENERATE RECOVERY CODES MODAL */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900/40 dark:text-amber-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Regenerasi Kode Pemulihan
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kode pemulihan lama tidak akan berlaku lagi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-xs border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {!regenNewCodes ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Masukkan kata sandi akun Anda untuk membuat 8 kode pemulihan baru.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Password Akun
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password akun Anda"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetAll}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!confirmPassword || isPending}
                    onClick={handleRegenerateCodes}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isPending ? 'Memproses...' : 'Buat Kode Baru'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300">
                  Simpan 8 kode pemulihan baru ini sekarang. Kode lama sudah tidak berlaku lagi.
                </div>

                <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  {regenNewCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs font-bold tracking-widest text-slate-800 dark:text-slate-200 select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyCodes(regenNewCodes)}
                    className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedCodes ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCodes ? 'Kode Tersalin!' : 'Salin Semua'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadCodes(regenNewCodes)}
                    className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh File (.txt)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full py-2.5 text-xs font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
