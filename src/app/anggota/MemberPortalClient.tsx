'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock3, History, Search, CheckCircle2, AlertCircle, ArrowRight, UserCheck2 } from 'lucide-react';
import { borrowBookByIdAction } from '@/lib/actions';

interface MemberPortalClientProps {
  memberName: string;
  books: any[];
  activeLoans: any[];
  loanHistory: any[];
}

export default function MemberPortalClient({ memberName, books, activeLoans, loanHistory }: MemberPortalClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingBookId, setLoadingBookId] = useState<number | null>(null);

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return books;

    return books.filter((book) => {
      return [
        book.judul,
        book.pengarang,
        book.penerbit,
        book.isbn,
        book.nomor_panggil,
        book.kategori?.nama_kategori,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [books, searchTerm]);

  const reminders = useMemo(() => {
    return activeLoans
      .map((loan) => {
        const dueDate = new Date(loan.tanggal_jatuh_tempo);
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return {
          ...loan,
          diffDays,
          statusReminder: diffDays < 0 ? 'Terlambat' : diffDays <= 2 ? 'Segera jatuh tempo' : 'Aman',
        };
      })
      .filter((loan) => loan.diffDays <= 2);
  }, [activeLoans]);

  const handleBorrow = async (bookId: number) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoadingBookId(bookId);

    try {
      const res = await borrowBookByIdAction(bookId);
      if (res && 'error' in res) {
        setErrorMsg(res.error ?? 'Terjadi kesalahan saat meminjam buku.');
      } else {
        setSuccessMsg('Pinjaman berhasil diproses. Silakan periksa riwayat peminjaman Anda.');
        router.refresh();
      }
    } catch (err) {
      setErrorMsg('Gagal memproses pinjaman.');
    } finally {
      setLoadingBookId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border p-8 transition-all duration-200 bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-emerald-600 dark:text-emerald-400">Selamat datang</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Halo, {memberName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Selamat datang di portal anggota perpustakaan. Anda dapat mencari katalog buku, memilih buku untuk dipinjam, dan melihat status pengembalian serta riwayat peminjaman.
            </p>
          </div>
          <div className="rounded-2xl border p-6 text-center shrink-0 bg-emerald-50 border-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <UserCheck2 className="h-7 w-7" />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Pemberitahuan</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{activeLoans.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Peminjaman aktif</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border p-4 text-sm flex items-center gap-3 bg-emerald-50 border-emerald-200 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl border p-4 text-sm flex items-center gap-3 bg-rose-50 border-rose-200 text-rose-800 dark:border-rose-700/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <section className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          {/* Book Catalog Section */}
          <div className="rounded-3xl border p-6 sm:p-7 transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-emerald-600 dark:text-emerald-400">Katalog Buku</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cari dan pilih buku</h2>
              </div>
              <div className="relative max-w-md w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul, pengarang, kategori..."
                  className="w-full rounded-full py-2.5 pl-11 pr-4 text-sm transition outline-none border shadow-xs bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredBooks.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Tidak ada buku yang sesuai pencarian.
                </div>
              ) : (
                filteredBooks.map((book) => {
                  const availableCount = book.eksemplar.filter((eks: any) => eks.status === 'tersedia').length;
                  return (
                    <div
                      key={book.id_bahan}
                      className="rounded-2xl border p-5 transition sm:flex sm:items-center sm:justify-between sm:gap-6 bg-slate-50/70 border-slate-200 hover:bg-slate-50 dark:bg-slate-950/80 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                          <span className="rounded-full px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500/30">
                            {book.kategori?.nama_kategori || 'Umum'}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 dark:text-slate-400">{book.tahun_terbit || '-'}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                          {book.judul}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          {book.pengarang || 'Pengarang -'} · {book.penerbit || 'Penerbit -'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">ISBN: {book.isbn || '-'}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 sm:mt-0 sm:w-auto sm:flex-col sm:items-end shrink-0">
                        <div className="rounded-xl px-3.5 py-2 text-right border bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Tersedia</p>
                          <p className="text-xl font-extrabold text-indigo-600 dark:text-white">{availableCount}</p>
                        </div>
                        <button
                          onClick={() => handleBorrow(book.id_bahan)}
                          disabled={availableCount === 0 || loadingBookId === book.id_bahan}
                          className="rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                        >
                          {loadingBookId === book.id_bahan ? 'Memproses...' : availableCount === 0 ? 'Habis' : 'Pinjam'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Loan History Section */}
          <div className="rounded-3xl border p-6 sm:p-7 transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-emerald-600 dark:text-emerald-400">Riwayat Peminjaman</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Semua Transaksi</h2>
              </div>
              <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            {loanHistory.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Belum ada riwayat peminjaman.</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
                    <thead className="text-xs uppercase tracking-[0.15em] font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900/90 dark:border-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Judul Buku</th>
                        <th className="px-4 py-3">Pinjam</th>
                        <th className="px-4 py-3">Jatuh Tempo</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {loanHistory.map((loan) => (
                        <tr key={loan.id_transaksi} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                          <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">{loan.eksemplar.bahan_pustaka.judul}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{loan.tanggal_jatuh_tempo ? new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                              {loan.status.replace('_', ' ')}
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
        </div>

        {/* Right Sidebar: Reminders & Member Info */}
        <div className="space-y-6">
          <div className="rounded-3xl border p-6 sm:p-7 transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-xl">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
              <Clock3 className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Pengingat Pengembalian</h2>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">Buku yang mendekati jatuh tempo atau sudah terlambat dikembalikan.</p>
            <div className="mt-5 space-y-3">
              {reminders.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-4 text-xs sm:text-sm border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Tidak ada pengingat. Semua peminjaman masih dalam batas waktu aman.
                </div>
              ) : (
                reminders.map((loan) => (
                  <div key={loan.id_transaksi} className="rounded-2xl border p-4 bg-slate-50/70 border-slate-200 dark:bg-slate-950/80 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">{loan.eksemplar.bahan_pustaka.judul}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Jatuh tempo: {new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${loan.statusReminder === 'Terlambat' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
                        {loan.statusReminder}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border p-6 sm:p-7 transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-xl">
            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Informasi Anggota</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Batas pinjaman: sisa <span className="font-bold text-slate-900 dark:text-white">{activeLoans.length < 3 ? 3 - activeLoans.length : 0} buku</span>.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl p-4 border bg-slate-50 border-slate-200 dark:bg-slate-950/70 dark:border-slate-800">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Peminjaman aktif</p>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-white">{activeLoans.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Riwayat total</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{loanHistory.length}</p>
              </div>
            </div>
            <a href="#catalog" className="mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              <span>Jelajahi katalog buku</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
