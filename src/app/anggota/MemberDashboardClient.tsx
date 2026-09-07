'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  BadgeAlert,
} from 'lucide-react';

interface ActiveLoanItem {
  id_transaksi: number;
  tanggal_pinjam: string | Date;
  tanggal_jatuh_tempo: string | Date;
  status: string;
  jumlah_perpanjangan: number;
  eksemplar: {
    id_eksemplar: number;
    kode_barcode?: string;
    lokasi_rak?: string | null;
    bahan_pustaka: {
      id_bahan: number;
      judul: string;
      pengarang: string | null;
      penerbit?: string | null;
      kategori?: { nama_kategori: string } | null;
    };
  };
  denda?: Array<{
    nominal: unknown;
    status_pembayaran: string;
  }>;
}

interface LoanHistoryItem {
  id_transaksi: number;
  tanggal_pinjam: string | Date;
  tanggal_jatuh_tempo: string | Date;
  tanggal_kembali_aktual?: string | Date | null;
  status: string;
  eksemplar: {
    bahan_pustaka: {
      judul: string;
      pengarang: string | null;
      kategori?: { nama_kategori: string } | null;
    };
  };
}

interface MemberDashboardClientProps {
  memberName: string;
  memberId: number;
  memberIdentity: string;
  activeLoans: ActiveLoanItem[];
  loanHistory: LoanHistoryItem[];
  unpaidFinesTotal: number;
}

export default function MemberDashboardClient({
  memberName,
  memberIdentity,
  activeLoans,
  loanHistory,
  unpaidFinesTotal,
}: MemberDashboardClientProps) {
  const MAX_LOAN_QUOTA = 3;

  // Process active loans with countdown calculations
  const analyzedActiveLoans = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activeLoans.map((loan) => {
      const pinjamDate = new Date(loan.tanggal_pinjam);
      pinjamDate.setHours(0, 0, 0, 0);

      const dueDate = new Date(loan.tanggal_jatuh_tempo);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate borrowing progress
      const totalSpan = Math.max(1, dueDate.getTime() - pinjamDate.getTime());
      const elapsed = Math.max(0, today.getTime() - pinjamDate.getTime());
      const progressPercent = Math.min(100, Math.round((elapsed / totalSpan) * 100));

      let urgencyLevel: 'safe' | 'warning' | 'urgent' | 'overdue' = 'safe';
      let urgencyText = '';
      let estimatedFine = 0;

      if (diffDays < 0) {
        urgencyLevel = 'overdue';
        const overdueDays = Math.abs(diffDays);
        urgencyText = `Terlambat ${overdueDays} Hari`;
        estimatedFine = overdueDays * 1000;
      } else if (diffDays === 0) {
        urgencyLevel = 'urgent';
        urgencyText = 'Jatuh Tempo HARI INI!';
      } else if (diffDays <= 2) {
        urgencyLevel = 'warning';
        urgencyText = `${diffDays} Hari Lagi (Segera Kembalikan)`;
      } else {
        urgencyLevel = 'safe';
        urgencyText = `${diffDays} Hari Lagi`;
      }

      return {
        ...loan,
        diffDays,
        progressPercent,
        urgencyLevel,
        urgencyText,
        estimatedFine,
      };
    });
  }, [activeLoans]);

  // Nearest due date
  const nearestLoan = useMemo(() => {
    if (analyzedActiveLoans.length === 0) return null;
    return [...analyzedActiveLoans].sort((a, b) => a.diffDays - b.diffDays)[0];
  }, [analyzedActiveLoans]);

  // Format date helper
  const formatDate = (val: string | Date | null | undefined) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(val);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome & Analytics Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-indigo-50/50 border border-emerald-200/80 shadow-sm text-slate-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 dark:border-indigo-500/30 dark:shadow-xl dark:shadow-slate-950/20 dark:text-white">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-teal-400/20 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100/90 border border-emerald-300 text-emerald-800 dark:bg-white/10 dark:border-white/15 dark:text-emerald-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ringkasan Dashboard Anggota</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Halo, {memberName} 👋
              </h1>
              <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-300 shadow-xs dark:bg-white/10 dark:text-emerald-200 dark:border-white/15">
                ID: {memberIdentity}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Pantau status peminjaman buku Anda, pantau sisa hari batas waktu pengembalian, dan temukan koleksi pustaka baru kapan saja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/anggota/katalog"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Jelajahi Katalog Buku</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/anggota/profil"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/15 dark:text-slate-200 backdrop-blur-md transition active:scale-[0.98]"
            >
              <span>Kartu & Profil</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Buku Sedang Dipinjam */}
        <div className="rounded-3xl border p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Buku Dipinjam</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {activeLoans.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                / {MAX_LOAN_QUOTA} maks buku
              </span>
            </div>
            {/* Quota bar */}
            <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(activeLoans.length / MAX_LOAN_QUOTA) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {MAX_LOAN_QUOTA - activeLoans.length > 0
                ? `Masih dapat meminjam ${MAX_LOAN_QUOTA - activeLoans.length} buku lagi.`
                : 'Kuota peminjaman buku sudah penuh.'}
            </p>
          </div>
        </div>

        {/* Card 2: Batas Waktu Terdekat (Countdown) */}
        <div className="rounded-3xl border p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Jatuh Tempo Terdekat</span>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {nearestLoan ? (
              <>
                <p
                  className={`text-xl font-extrabold ${
                    nearestLoan.urgencyLevel === 'overdue'
                      ? 'text-rose-600 dark:text-rose-400'
                      : nearestLoan.urgencyLevel === 'urgent'
                      ? 'text-orange-600 dark:text-orange-400'
                      : nearestLoan.urgencyLevel === 'warning'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {nearestLoan.urgencyText}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
                  {nearestLoan.eksemplar.bahan_pustaka.judul}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Batas: {formatDate(nearestLoan.tanggal_jatuh_tempo)}
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Aman</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Tidak ada pinjaman yang harus dikembalikan.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Status Bebas Denda */}
        <div className="rounded-3xl border p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status Kepatuhan</span>
            <div
              className={`p-2.5 rounded-2xl ${
                unpaidFinesTotal > 0
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
              }`}
            >
              {unpaidFinesTotal > 0 ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-4">
            {unpaidFinesTotal > 0 ? (
              <>
                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  Rp {unpaidFinesTotal.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Denda belum dilunasi. Harap bayar di loket.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">Bebas Denda</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  100% disiplin pengembalian buku.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Card 4: Total Riwayat Pinjam */}
        <div className="rounded-3xl border p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Riwayat</span>
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {loanHistory.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">transaksi selesai</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Total buku yang pernah dipinjam seumur hidup.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Section: Buku yang Sedang Dipinjam & Sisa Waktu Pengembalian */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Buku yang Sedang Dipinjam</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {activeLoans.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rincian buku aktif, sisa waktu tenggat pengembalian, dan informasi lokasi rak
            </p>
          </div>

          <Link
            href="/anggota/katalog"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Tambah Pinjaman di Katalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analyzedActiveLoans.length === 0 ? (
          /* Empty state */
          <div className="rounded-3xl border border-dashed p-10 text-center bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Tidak Ada Buku yang Sedang Dipinjam
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Saat ini Anda tidak memiliki buku yang sedang dipinjam. Temukan ribuan buku berkualitas yang siap dipinjam di Katalog Pustaka.
              </p>
            </div>
            <Link
              href="/anggota/katalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Katalog Buku Sekarang</span>
            </Link>
          </div>
        ) : (
          /* Active Loans Cards List */
          <div className="grid gap-4 md:grid-cols-2">
            {analyzedActiveLoans.map((loan) => {
              const book = loan.eksemplar.bahan_pustaka;

              return (
                <div
                  key={loan.id_transaksi}
                  className={`rounded-3xl border p-6 transition-all duration-200 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs ${
                    loan.urgencyLevel === 'overdue'
                      ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
                      : loan.urgencyLevel === 'urgent'
                      ? 'border-orange-300 dark:border-orange-900/80 bg-orange-50/20 dark:bg-orange-950/10'
                      : loan.urgencyLevel === 'warning'
                      ? 'border-amber-300 dark:border-amber-900/80'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Card: Category & Urgency Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500/30">
                        {book.kategori?.nama_kategori || 'Pustaka'}
                      </span>

                      {/* Countdown badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          loan.urgencyLevel === 'overdue'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : loan.urgencyLevel === 'urgent'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300'
                            : loan.urgencyLevel === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{loan.urgencyText}</span>
                      </div>
                    </div>

                    {/* Book Title & Pengarang */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {book.judul}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {book.pengarang || 'Penulis -'} {book.penerbit ? `· ${book.penerbit}` : ''}
                      </p>
                    </div>

                    {/* Timeline & Duration Progress */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Tanggal Pinjam
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatDate(loan.tanggal_pinjam)}
                          </span>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Jatuh Tempo
                          </span>
                          <span
                            className={`font-bold ${
                              loan.urgencyLevel === 'overdue'
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {formatDate(loan.tanggal_jatuh_tempo)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar of Time Elapsed */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            loan.urgencyLevel === 'overdue'
                              ? 'bg-rose-500'
                              : loan.urgencyLevel === 'urgent'
                              ? 'bg-orange-500'
                              : loan.urgencyLevel === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${loan.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Overdue Warning Alert if any */}
                    {loan.urgencyLevel === 'overdue' && (
                      <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                        <BadgeAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Keterlambatan Pengembalian:</strong>
                          <p className="mt-0.5">
                            Estimasi denda berjalan: Rp {loan.estimatedFine.toLocaleString('id-ID')} (Rp 1.000 / hari). Harap segera kembalikan ke loket sirkulasi perpustakaan.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Shelf & Eksemplar info */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-[11px]">
                      Barcode: {loan.eksemplar.kode_barcode || `#${loan.eksemplar.id_eksemplar}`}
                    </span>
                    <span className="text-[11px] font-medium">
                      Lokasi: {loan.eksemplar.lokasi_rak || 'Loket Utama'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Secondary Section: Riwayat Aktivitas Pengembalian */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Riwayat Aktivitas Peminjaman</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Catatan transaksi buku yang telah Anda pinjam dan kembalikan sebelumnya
          </p>
        </div>

        {loanHistory.length === 0 ? (
          <div className="rounded-2xl border p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
            Belum ada riwayat peminjaman yang tercatat.
          </div>
        ) : (
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Judul Buku</th>
                    <th className="px-6 py-3.5 font-bold">Tgl Pinjam</th>
                    <th className="px-6 py-3.5 font-bold">Tgl Tempo</th>
                    <th className="px-6 py-3.5 font-bold">Tgl Kembali</th>
                    <th className="px-6 py-3.5 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {loanHistory.map((item) => (
                    <tr key={item.id_transaksi} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                        {item.eksemplar.bahan_pustaka.judul}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {formatDate(item.tanggal_pinjam)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {formatDate(item.tanggal_jatuh_tempo)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {item.tanggal_kembali_aktual ? formatDate(item.tanggal_kembali_aktual) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'kembali'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : item.status === 'dipinjam'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Useful SOP / Rule Box */}
      <div className="rounded-3xl border p-6 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-slate-500/5 border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Informasi Ketentuan Peminjaman Perpustakaan</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="space-y-1">
            <strong className="text-slate-800 dark:text-slate-200 block">Durasi Pinjam:</strong>
            <p>Maksimal 7 hari kalender per transaksi buku.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 dark:text-slate-200 block">Denda Keterlambatan:</strong>
            <p>Rp 1.000 / buku untuk setiap 1 hari keterlambatan.</p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-800 dark:text-slate-200 block">Loket Sirkulasi:</strong>
            <p>Buka Senin s.d. Jumat pukul 08.00 - 16.00 WIB di Lantai 1.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
