'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  MapPin,
  Building2,
  FileText,
  Barcode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { borrowBookByIdAction } from '@/lib/actions';

interface ExemplarItem {
  id_eksemplar: number;
  kode_barcode: string;
  kondisi: string;
  status: string;
  lokasi_rak: string | null;
}

interface BookDetailData {
  id_bahan: number;
  judul: string;
  pengarang: string | null;
  penerbit: string | null;
  tahun_terbit: number | null;
  isbn: string | null;
  nomor_panggil: string | null;
  jumlah_eksemplar: number;
  deskripsi: string | null;
  foto_sampul?: string | null;
  kategori: {
    id_kategori: number;
    nama_kategori: string;
    no_klasifikasi: string | null;
  };
  eksemplar: ExemplarItem[];
}

interface BookDetailClientProps {
  book: BookDetailData;
}

export default function BookDetailClient({ book }: BookDetailClientProps) {
  const router = useRouter();
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableExemplars = book.eksemplar.filter((e) => e.status === 'tersedia');
  const isAvailable = availableExemplars.length > 0;
  const primaryShelf = book.eksemplar.find((e) => e.lokasi_rak)?.lokasi_rak || 'Rak Koleksi Utama';

  const handleBorrow = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setBorrowLoading(true);

    try {
      const res = await borrowBookByIdAction(book.id_bahan);
      if ('error' in res) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Pengajuan peminjaman berhasil dibuat! Silakan kunjungi meja petugas perpustakaan dan sebutkan nomor identitas Anda untuk konfirmasi fisik dan pemindaian barcode buku.');
        router.refresh();
      }
    } catch {
      setErrorMsg('Terjadi kendala jaringan saat memproses peminjaman buku.');
    } finally {
      setBorrowLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Breadcrumbs & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/anggota/katalog"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </Link>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500">Detail Koleksi</span>
          <span>/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
            {book.judul}
          </span>
        </div>

        <Link
          href="/anggota"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1"
        >
          <span>Lihat Dashboard Saya</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. Alert Notification */}
      {successMsg && (
        <div className="rounded-2xl border p-4 bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-start gap-3 text-sm animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>{successMsg}</span>
            <Link
              href="/anggota"
              className="font-bold underline inline-flex items-center gap-1 hover:text-emerald-900 dark:hover:text-emerald-200 text-xs shrink-0"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border p-4 bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-start gap-3 text-sm animate-in fade-in duration-200 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 3. Main Hero Card: Book Visual, Title & Action */}
      <div className="rounded-3xl border p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: 3D-Style Book Showcase Card */}
          <div className="lg:col-span-4 flex flex-col items-center space-y-4">
            {book.foto_sampul ? (
              <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/25 border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src={book.foto_sampul}
                  alt={book.judul}
                  className="w-full h-full object-cover"
                />
                {/* Real Book Spine Illusion */}
                <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/50 via-black/20 to-transparent border-r border-white/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                {/* Category Pill over image */}
                <div className="absolute top-4 left-5 z-10">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xs">
                    {book.kategori.nama_kategori}
                  </span>
                </div>

                {/* Bottom title & author overlay */}
                <div className="absolute bottom-4 left-5 right-4 z-10 text-white">
                  <p className="text-xs font-bold leading-snug line-clamp-1 drop-shadow-md">{book.judul}</p>
                  <p className="text-[10px] text-white/80 line-clamp-1 drop-shadow-sm">{book.pengarang || 'Penulis Tidak Diketahui'}</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/25 border border-emerald-400/20 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 text-white p-6 flex flex-col justify-between group transition-transform duration-300 hover:scale-[1.02]">
                {/* Decorative shapes */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />

                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/10 border-r border-white/20" />

                <div className="relative z-10 pl-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-emerald-100">
                    {book.kategori.nama_kategori}
                  </span>
                </div>

                <div className="relative z-10 pl-2 my-auto space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3 text-emerald-200">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-black tracking-tight leading-snug line-clamp-3 text-white">
                    {book.judul}
                  </h2>
                  <p className="text-xs text-emerald-100/80 line-clamp-1">
                    {book.pengarang || 'Penulis Tidak Diketahui'}
                  </p>
                </div>

                <div className="relative z-10 pl-2 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-200">
                  <span>{book.tahun_terbit || '-'}</span>
                  <span className="font-mono">{book.isbn ? `ISBN ${book.isbn.slice(0, 7)}...` : 'Pustaka'}</span>
                </div>
              </div>
            )}

            {/* Quick Availability Badge */}
            <div className="w-full max-w-[280px] px-4 py-2.5 rounded-2xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Ketersediaan:</span>
              <span
                className={`font-extrabold ${
                  isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isAvailable ? `${availableExemplars.length} / ${book.eksemplar.length} Tersedia` : 'Semua Dipinjam'}
              </span>
            </div>

            {/* Main Borrow Button */}
            <div className="w-full max-w-[280px] space-y-2">
              <button
                type="button"
                onClick={handleBorrow}
                disabled={!isAvailable || borrowLoading}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-md ${
                  isAvailable
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {borrowLoading ? (
                  <span>Mengajukan Peminjaman...</span>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4" />
                    <span>{isAvailable ? 'Ajukan Peminjaman Buku' : 'Stok Buku Habis Dipinjam'}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                Setelah mengajukan, bawa kartu identitas ke petugas perpustakaan untuk konfirmasi fisik dan pemindaian barcode buku.
              </p>
            </div>
          </div>

          {/* Right Column: Title, Author & Comprehensive Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30">
                  {book.kategori.nama_kategori}
                </span>
                {book.kategori.no_klasifikasi && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Klasifikasi: {book.kategori.no_klasifikasi}
                  </span>
                )}
                {book.tahun_terbit && (
                  <span className="text-xs font-semibold text-slate-400">
                    Tahun {book.tahun_terbit}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {book.judul}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                  <Bookmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Penulis: {book.pengarang || 'Penulis Tidak Diketahui'}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Penerbit: {book.penerbit || '-'}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Lokasi: {primaryShelf}</span>
                </div>
              </div>
            </div>

            {/* 4. Deskripsi & Sinopsis Buku (Highlighted Request!) */}
            <div className="rounded-2xl border p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Deskripsi & Sinopsis Buku</span>
              </h3>

              {book.deskripsi && book.deskripsi.trim() !== '' ? (
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 whitespace-pre-line font-normal">
                  {book.deskripsi}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                  Belum ada ringkasan atau sinopsis resmi yang terdaftar untuk judul ini. Silakan kunjungi rak penyimpanan di perpustakaan untuk membaca cuplikan buku secara langsung.
                </p>
              )}
            </div>

            {/* 5. Detail Informasi Bibliografi */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Informasi Bibliografi & Teknis</span>
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Nomor ISBN
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {book.isbn || 'Tidak tersedia'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Nomor Panggil (Call Number)
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {book.nomor_panggil || '-'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Kategori Pustaka
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {book.kategori.nama_kategori}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Eksemplar Fisik
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {book.eksemplar.length} Salinan Terdaftar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Daftar Eksemplar Fisik & Status Ketersediaan */}
      <div className="space-y-4">
        <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Barcode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Daftar Eksemplar Fisik Buku</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {book.eksemplar.length} Eksemplar
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rincian kode barcode, lokasi rak fisik, kondisi buku, dan status ketersediaan masing-masing eksemplar
            </p>
          </div>
        </div>

        {book.eksemplar.length === 0 ? (
          <div className="rounded-2xl border p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            Belum ada eksemplar fisik yang terdaftar untuk judul buku ini.
          </div>
        ) : (
          <div className="rounded-3xl border bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">No. Eksemplar</th>
                    <th className="px-6 py-3.5 font-bold">Kode Barcode</th>
                    <th className="px-6 py-3.5 font-bold">Lokasi Rak</th>
                    <th className="px-6 py-3.5 font-bold">Kondisi Fisik</th>
                    <th className="px-6 py-3.5 font-bold text-right">Status Ketersediaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {book.eksemplar.map((eksemplar, idx) => (
                    <tr key={eksemplar.id_eksemplar} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                        #{idx + 1}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {eksemplar.kode_barcode}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span>{eksemplar.lokasi_rak || 'Rak Utama'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            eksemplar.kondisi === 'baik'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {eksemplar.kondisi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            eksemplar.status === 'tersedia'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {eksemplar.status === 'tersedia' ? 'Siap Dipinjam' : eksemplar.status}
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

      {/* 7. Panduan Pengambilan Buku */}
      <div className="rounded-3xl border p-6 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 border-emerald-200/80 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-slate-900 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ketentuan Pengambilan & Peminjaman Buku Fisik</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Setelah menekan tombol pinjam, Anda dapat langsung menuju ke rak penyimpanan perpustakaan sesuai lokasi rak di atas atau tunjukkan ID transaksi kepada petugas sirkulasi di Lantai 1.
          </p>
        </div>

        <Link
          href="/anggota"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300/80 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80 transition shrink-0"
        >
          <span>Cek Sisa Waktu di Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
