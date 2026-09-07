'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Sparkles,
  BookMarked,
  X,
} from 'lucide-react';
import { borrowBookByIdAction } from '@/lib/actions';

interface BookItem {
  id_bahan: number;
  judul: string;
  pengarang: string | null;
  penerbit?: string | null;
  isbn?: string | null;
  tahun_terbit?: string | number | null;
  nomor_panggil?: string | null;
  kategori?: { id_kategori: number; nama_kategori: string } | null;
  eksemplar: Array<{
    id_eksemplar: number;
    status: string;
    kode_barcode?: string;
    lokasi_rak?: string | null;
  }>;
}

interface CategoryItem {
  id_kategori: number;
  nama_kategori: string;
}

interface BookCatalogClientProps {
  books: BookItem[];
  categories: CategoryItem[];
}

export default function BookCatalogClient({ books, categories }: BookCatalogClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [loadingBookId, setLoadingBookId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // 1. Search filter
      const query = searchTerm.trim().toLowerCase();
      if (query) {
        const matchesQuery = [
          book.judul,
          book.pengarang,
          book.penerbit,
          book.isbn,
          book.nomor_panggil,
          book.kategori?.nama_kategori,
        ]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (book.kategori?.nama_kategori !== selectedCategory) {
          return false;
        }
      }

      // 3. Availability filter
      if (onlyAvailable) {
        const availableCount = book.eksemplar.filter((e) => e.status === 'tersedia').length;
        if (availableCount === 0) return false;
      }

      return true;
    });
  }, [books, searchTerm, selectedCategory, onlyAvailable]);

  // Borrow action
  const handleBorrow = async (bookId: number) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoadingBookId(bookId);

    try {
      const res = await borrowBookByIdAction(bookId);
      if ('error' in res) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg('Buku berhasil dipinjam! Silakan periksa di Dashboard Anda.');
        router.refresh();
      }
    } catch {
      setErrorMsg('Terjadi kendala jaringan saat memproses peminjaman.');
    } finally {
      setLoadingBookId(null);
    }
  };

  const totalAvailableBooks = useMemo(() => {
    return books.reduce((acc, book) => {
      return acc + book.eksemplar.filter((e) => e.status === 'tersedia').length;
    }, 0);
  }, [books]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner & Search Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-slate-50 border border-emerald-200/80 text-slate-900 shadow-sm dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-slate-950 dark:border-emerald-500/20 dark:text-white dark:shadow-xl dark:shadow-emerald-950/20">
        {/* Decorative background glows */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-400/20 dark:bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-teal-300/20 dark:bg-teal-300/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100/90 border border-emerald-300 text-emerald-800 dark:bg-white/15 dark:border-white/20 dark:text-emerald-200 mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pusat Koleksi Pustaka</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Katalog Buku Perpustakaan
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-100/80 mt-1 max-w-2xl leading-relaxed font-normal">
                Jelajahi berbagai judul buku, modul pembelajaran, karya ilmiah, dan referensi umum yang tersedia untuk dipinjam secara langsung.
              </p>
            </div>

            {/* Quick stats pill */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <div className="px-4 py-2.5 rounded-2xl bg-white text-slate-800 border border-emerald-200/80 shadow-xs dark:bg-white/10 dark:backdrop-blur-md dark:border-white/15 dark:text-white text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-emerald-200/80 tracking-wider">Total Judul</p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">{books.length}</p>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white text-slate-800 border border-emerald-200/80 shadow-xs dark:bg-white/10 dark:backdrop-blur-md dark:border-white/15 dark:text-white text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-emerald-200/80 tracking-wider">Total Eksemplar</p>
                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-300">{totalAvailableBooks}</p>
              </div>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan judul buku, nama pengarang, penerbit, atau nomor ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300/80 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-900/90 dark:text-white dark:border-slate-700/80"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="rounded-2xl border p-4 bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-start gap-3 text-sm animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>{successMsg}</span>
            <Link
              href="/anggota"
              className="font-bold underline inline-flex items-center gap-1 hover:text-emerald-900 dark:hover:text-emerald-200 text-xs shrink-0"
            >
              <span>Lihat di Dashboard</span>
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

      {/* Filter Toolbar: Categories & Availability */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        {/* Category Pills (scrollable horizontally) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            Semua Kategori ({books.length})
          </button>
          {categories.map((cat) => {
            const count = books.filter((b) => b.kategori?.nama_kategori === cat.nama_kategori).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id_kategori}
                type="button"
                onClick={() => setSelectedCategory(cat.nama_kategori)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                  selectedCategory === cat.nama_kategori
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
                }`}
              >
                {cat.nama_kategori} ({count})
              </button>
            );
          })}
        </div>

        {/* Toggle Only Available */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span>Hanya Tersedia</span>
          </label>

          <span className="text-xs text-slate-400">
            Ditemukan: <strong className="text-slate-700 dark:text-slate-200">{filteredBooks.length}</strong> buku
          </span>
        </div>
      </div>

      {/* Book Cards Grid */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center bg-white/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
            <BookMarked className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Tidak Ada Buku yang Sesuai
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Tidak ditemukan buku dengan kata kunci &quot;{searchTerm}&quot; atau filter yang dipilih. Coba gunakan kata kunci lain atau reset filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setOnlyAvailable(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => {
            const availableCount = book.eksemplar.filter((e) => e.status === 'tersedia').length;
            const isAvailable = availableCount > 0;
            const shelfLocation = book.eksemplar.find((e) => e.lokasi_rak)?.lokasi_rak || 'Rak Utama';

            return (
              <div
                key={book.id_bahan}
                className="group rounded-3xl border transition-all duration-200 flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/40 overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/30">
                      {book.kategori?.nama_kategori || 'Umum'}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {book.tahun_terbit || '-'}
                    </span>
                  </div>

                  {/* Title & Author - Clickable to Detail Page */}
                  <Link href={`/anggota/katalog/${book.id_bahan}`} className="block space-y-1.5 group/link">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white line-clamp-2 group-hover/link:text-emerald-600 dark:group-hover/link:text-emerald-400 transition-colors">
                      {book.judul}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {book.pengarang || 'Penulis Tidak Diketahui'}
                    </p>
                  </Link>

                  {/* Metadata pills */}
                  <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span>Penerbit:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                        {book.penerbit || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span>ISBN:</span>
                      <span className="text-slate-700 dark:text-slate-300">{book.isbn || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        <span>Lokasi Rak:</span>
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{shelfLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Ketersediaan
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {isAvailable ? `${availableCount} Eksemplar` : 'Semua Dipinjam'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/anggota/katalog/${book.id_bahan}`}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-emerald-300 dark:hover:bg-slate-800 transition"
                    >
                      Detail
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleBorrow(book.id_bahan)}
                      disabled={!isAvailable || loadingBookId === book.id_bahan}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-[0.98] cursor-pointer ${
                        isAvailable
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30'
                          : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {loadingBookId === book.id_bahan ? (
                        <span>Memproses...</span>
                      ) : (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Pinjam</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
