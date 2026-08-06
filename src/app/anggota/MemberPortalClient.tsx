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
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-8 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Selamat datang</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Halo, {memberName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Selamat datang di portal anggota perpustakaan. Anda dapat mencari katalog buku, memilih buku untuk dipinjam, dan melihat status pengembalian serta riwayat peminjaman.
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
              <UserCheck2 className="h-8 w-8" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Pemberitahuan</p>
            <p className="mt-2 text-2xl font-semibold text-white">{activeLoans.length}</p>
            <p className="text-sm text-slate-400">Peminjaman aktif</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-3xl border border-emerald-700/50 bg-emerald-950/30 p-4 text-sm text-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-3xl border border-rose-700/50 bg-rose-950/30 p-4 text-sm text-rose-200 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {errorMsg}
        </div>
      )}

      <section className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Katalog Buku</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Cari dan pilih buku</h2>
              </div>
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul, pengarang, kategori..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 py-3 pl-12 pr-4 text-sm text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredBooks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/80 p-6 text-center text-slate-500">Tidak ada buku yang sesuai pencarian.</div>
              ) : (
                filteredBooks.map((book) => {
                  const availableCount = book.eksemplar.filter((eks: any) => eks.status === 'tersedia').length;
                  return (
                    <div key={book.id_bahan} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">{book.kategori?.nama_kategori || 'Kategori'} • {book.tahun_terbit || 'Tahun tidak tersedia'}</div>
                        <h3 className="text-lg font-semibold text-white">{book.judul}</h3>
                        <p className="text-sm leading-6 text-slate-400">{book.pengarang || 'Pengarang tidak tersedia'} · {book.penerbit || 'Penerbit tidak tersedia'}</p>
                        <p className="text-xs text-slate-500">ISBN: {book.isbn || '-'}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 sm:mt-0 sm:w-auto sm:flex-col sm:items-end">
                        <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-right">
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tersedia</p>
                          <p className="text-2xl font-semibold text-white">{availableCount}</p>
                        </div>
                        <button
                          onClick={() => handleBorrow(book.id_bahan)}
                          disabled={availableCount === 0 || loadingBookId === book.id_bahan}
                          className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Riwayat Peminjaman</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Semua Transaksi</h2>
              </div>
              <History className="w-6 h-6 text-emerald-400" />
            </div>
            {loanHistory.length === 0 ? (
              <p className="mt-6 text-slate-400">Belum ada riwayat peminjaman.</p>
            ) : (
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/90 text-xs uppercase tracking-[0.25em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Judul Buku</th>
                      <th className="px-4 py-3">Pinjam</th>
                      <th className="px-4 py-3">Jatuh Tempo</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loanHistory.map((loan) => (
                      <tr key={loan.id_transaksi} className="border-t border-slate-800 hover:bg-slate-950/80">
                        <td className="px-4 py-3 text-slate-100 max-w-xs truncate">{loan.eksemplar.bahan_pustaka.judul}</td>
                        <td className="px-4 py-3">{new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3">{loan.tanggal_jatuh_tempo ? new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="px-4 py-3 uppercase text-xs font-semibold text-slate-300">
                          {loan.status.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3 text-emerald-300">
              <Clock3 className="w-5 h-5" />
              <h2 className="text-lg font-semibold text-white">Pengingat Pengembalian</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">Lihat buku yang hampir jatuh tempo atau sudah terlambat dikembalikan.</p>
            <div className="mt-5 space-y-3">
              {reminders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-500">Tidak ada pengingat. Semua peminjaman masih dalam jadwal.</div>
              ) : (
                reminders.map((loan) => (
                  <div key={loan.id_transaksi} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{loan.eksemplar.bahan_pustaka.judul}</p>
                        <p className="text-xs text-slate-500">Jatuh tempo: {new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</p>
                      </div>
                      <span className={`rounded-2xl px-3 py-1 text-[11px] font-semibold uppercase ${loan.statusReminder === 'Terlambat' ? 'bg-rose-500/10 text-rose-300' : 'bg-amber-500/10 text-amber-300'}`}>
                        {loan.statusReminder}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3 text-slate-300">
              <BookOpen className="w-5 h-5" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Informasi Anggota</p>
                <p className="text-sm text-slate-400">Anda dapat meminjam sampai {activeLoans.length < 3 ? 3 - activeLoans.length : 0} buku lagi sesuai batas pinjaman.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-3xl bg-slate-950/70 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Peminjaman aktif</p>
                <p className="text-3xl font-semibold text-white">{activeLoans.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Riwayat total</p>
                <p className="text-3xl font-semibold text-white">{loanHistory.length}</p>
              </div>
            </div>
            <a href="#catalog" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-white">
              Lihat katalog lengkap
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
