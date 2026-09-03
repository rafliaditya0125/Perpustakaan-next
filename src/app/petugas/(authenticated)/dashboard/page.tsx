import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import { 
  Users, 
  BookOpen, 
  RefreshCw, 
  Coins, 
  Activity, 
  CheckSquare, 
  AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getSessionUser();

  // Fetch counts from db
  const totalMembers = await prisma.anggota.count();
  const totalBooks = await prisma.bahan_pustaka.count();
  const totalEksemplar = await prisma.eksemplar.count();
  
  const activeLoans = await prisma.transaksi_peminjaman.count({
    where: { status: 'dipinjam' },
  });

  const unpaidFines = await prisma.denda.aggregate({
    where: { status_pembayaran: 'belum_bayar' },
    _sum: { nominal: true },
  });
  const totalFines = unpaidFines._sum.nominal ? Number(unpaidFines._sum.nominal) : 0;

  // Recent 5 log activities
  const recentLogs = await prisma.log_aktivitas.findMany({
    take: 5,
    orderBy: { waktu: 'desc' },
    include: { pengguna: true },
  });

  // Recent 5 loans
  const recentLoans = await prisma.transaksi_peminjaman.findMany({
    take: 5,
    orderBy: { id_transaksi: 'desc' },
    include: {
      anggota: true,
      eksemplar: { include: { bahan_pustaka: true } },
    },
  });

  // Active stock opname check
  const activeOpname = await prisma.stock_opname.findFirst({
    where: { status: 'berjalan' },
    include: { pengguna: true },
  });

  // Checklist status for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checklistToday = await prisma.checklist_operasional.findMany({
    where: { tanggal: today },
  });

  // Categories with book counts for chart representation
  const categories = await prisma.kategori.findMany({
    include: { bahan_pustaka: true },
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl p-6 sm:p-7 border transition-all duration-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-100/40 border-indigo-200/80 shadow-xs dark:from-indigo-950/60 dark:via-violet-950/60 dark:to-indigo-900/40 dark:border-indigo-500/20 dark:shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-950 dark:text-white">Selamat Datang Kembali, {user?.nama}!</h1>
        <p className="text-sm mt-1.5 leading-relaxed text-indigo-900/80 dark:text-slate-300">
          Operasional Perpustakaan hari ini berjalan normal. Silakan periksa checklist pembukaan dan status layanan di bawah ini.
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Anggota */}
        <div className="rounded-2xl p-6 border transition-all flex items-center justify-between shadow-xs bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Total Anggota</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">{totalMembers}</h3>
            <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">Siswa, Guru, Dosen, Umum</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Judul Buku */}
        <div className="rounded-2xl p-6 border transition-all flex items-center justify-between shadow-xs bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Koleksi Buku</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">{totalBooks}</h3>
            <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">{totalEksemplar} total eksemplar fisik</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Peminjaman Aktif */}
        <div className="rounded-2xl p-6 border transition-all flex items-center justify-between shadow-xs bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Peminjaman Aktif</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-amber-600 dark:text-amber-400">{activeLoans}</h3>
            <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">Sedang dipinjam oleh anggota</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        {/* Total Denda Belum Bayar */}
        <div className="rounded-2xl p-6 border transition-all flex items-center justify-between shadow-xs bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
          <div>
            <p className="text-xs uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400">Tunggakan Denda</p>
            <h3 className="text-2xl font-extrabold tracking-tight mt-1 text-rose-600 dark:text-rose-400">
              Rp {totalFines.toLocaleString('id-ID')}
            </h3>
            <p className="text-[11px] mt-1 text-slate-500 dark:text-slate-400">Harus dilunasi oleh peminjam</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Operations Status & Category Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Notifications & Checklists */}
          <div className="rounded-2xl p-6 space-y-4 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Status Operasional Harian</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Checklist Buka Status */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                checklistToday.some((c: any) => c.jenis === 'buka') 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-400'
              }`}>
                <div>
                  <h4 className="font-bold text-sm">Checklist Pembukaan</h4>
                  <p className="text-xs mt-0.5 opacity-80">
                    {checklistToday.some((c: any) => c.jenis === 'buka') ? 'Selesai diisi hari ini' : 'Belum diisi hari ini'}
                  </p>
                </div>
                {checklistToday.some((c: any) => c.jenis === 'buka') ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">OK</span>
                ) : (
                  <Link href="/petugas/operasional" className="text-xs font-bold px-2.5 py-1 rounded-full transition-colors bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">Isi</Link>
                )}
              </div>

              {/* Checklist Tutup Status */}
              <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                checklistToday.some((c: any) => c.jenis === 'tutup') 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-400'
              }`}>
                <div>
                  <h4 className="font-bold text-sm">Checklist Penutupan</h4>
                  <p className="text-xs mt-0.5 opacity-80">
                    {checklistToday.some((c: any) => c.jenis === 'tutup') ? 'Selesai diisi hari ini' : 'Belum diisi hari ini'}
                  </p>
                </div>
                {checklistToday.some((c: any) => c.jenis === 'tutup') ? (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">OK</span>
                ) : (
                  <Link href="/petugas/operasional" className="text-xs font-bold px-2.5 py-1 rounded-full transition-colors bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">Isi</Link>
                )}
              </div>
            </div>

            {/* Active Stock Opname Warning */}
            {activeOpname && (
              <div className="p-4 rounded-xl border flex items-center justify-between transition-colors bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h4 className="font-bold text-sm">Stock Opname Berjalan</h4>
                    <p className="text-xs mt-0.5 opacity-80">
                      Dimulai sejak {new Date(activeOpname.tanggal_mulai).toLocaleDateString('id-ID')} oleh {activeOpname.pengguna?.nama}.
                    </p>
                  </div>
                </div>
                <Link href="/petugas/opname" className="text-xs font-bold px-3 py-1 rounded-full transition-all bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-500/10 dark:border dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20">
                  Lanjutkan
                </Link>
              </div>
            )}
          </div>

          {/* Book Categories Distribution */}
          <div className="rounded-2xl p-6 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Distribusi Koleksi Berdasarkan Kategori</h2>
            <div className="space-y-4">
              {categories.map((cat: any) => {
                const totalInCat = cat.bahan_pustaka.length;
                const percentage = totalBooks > 0 ? (totalInCat / totalBooks) * 100 : 0;
                return (
                  <div key={cat.id_kategori} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">({cat.no_klasifikasi}) {cat.nama_kategori}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">{totalInCat} Judul ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full rounded-full h-2 overflow-hidden border transition-colors bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800/80">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Circulation Activities Table */}
          <div className="rounded-2xl p-6 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Aktivitas Sirkulasi Terakhir</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950/20 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Nama Anggota</th>
                    <th scope="col" className="px-4 py-3">Judul Buku</th>
                    <th scope="col" className="px-4 py-3">Tgl Pinjam</th>
                    <th scope="col" className="px-4 py-3">Jatuh Tempo</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {recentLoans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500 dark:text-slate-600 font-medium">Tidak ada transaksi sirkulasi baru.</td>
                    </tr>
                  ) : (
                    recentLoans.map((loan: any) => (
                      <tr key={loan.id_transaksi} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/25 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-200">{loan.anggota?.nama}</td>
                        <td className="px-4 py-3.5 max-w-xs truncate text-slate-700 dark:text-slate-300" title={loan.eksemplar?.bahan_pustaka?.judul}>
                          {loan.eksemplar?.bahan_pustaka?.judul}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">{loan.tanggal_jatuh_tempo ? new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID') : '-'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            loan.status === 'dipinjam' 
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' 
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Log Aktivitas & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-2xl p-6 space-y-4 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Aksi Pintas Layanan</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/petugas/sirkulasi?tab=pinjam" className="p-3.5 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all border bg-indigo-50 border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-600/20">
                <span className="font-bold text-xs">Peminjaman Buku</span>
              </Link>
              <Link href="/petugas/sirkulasi?tab=kembali" className="p-3.5 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all border bg-emerald-50 border-emerald-200/80 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-600/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-600/20">
                <span className="font-bold text-xs">Pengembalian Buku</span>
              </Link>
              <Link href="/petugas/members" className="p-3.5 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700">
                <span className="font-bold text-xs">Daftar Anggota</span>
              </Link>
              <Link href="/petugas/books" className="p-3.5 rounded-xl text-center flex flex-col items-center gap-1.5 transition-all border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-700">
                <span className="font-bold text-xs">Kelola Buku</span>
              </Link>
            </div>
          </div>

          {/* Audit Trail / Recent Log Activities */}
          <div className="rounded-2xl p-6 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-md">
            <h2 className="text-base font-extrabold tracking-tight mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Log Aktivitas Sistem</span>
            </h2>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-center py-4 text-slate-500 dark:text-slate-600 text-xs">Belum ada log aktivitas.</p>
              ) : (
                recentLogs.map((log: any) => (
                  <div key={log.id_log.toString()} className="text-xs flex gap-3 border-l border-slate-200 dark:border-slate-800 pl-3 relative pb-2 last:pb-0">
                    <span className="absolute -left-[4.5px] top-1 w-2 h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{log.aktivitas}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span>{log.pengguna?.nama} ({log.pengguna?.peran})</span>
                        <span>{new Date(log.waktu).toLocaleTimeString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <Link href="/petugas/settings" className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">
                Lihat Semua Log Audit &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
