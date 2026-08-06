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
      <div className="bg-gradient-to-r from-indigo-900/60 to-violet-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-100">Selamat Datang Kembali, {user.nama}!</h1>
        <p className="text-sm text-slate-300 mt-1">
          Operasional Perpustakaan hari ini berjalan normal. Silakan periksa checklist pembukaan dan status layanan di bawah ini.
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Anggota */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Total Anggota</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">{totalMembers}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Siswa, Guru & Dosen, Umum</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Judul Buku */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Koleksi Buku</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">{totalBooks}</h3>
            <p className="text-[10px] text-slate-400 mt-1">{totalEksemplar} total eksemplar fisik</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Peminjaman Aktif */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Peminjaman Aktif</p>
            <h3 className="text-3xl font-bold text-slate-100 mt-1">{activeLoans}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Sedang dipinjam oleh anggota</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        {/* Total Denda Belum Bayar */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-md">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Tunggakan Denda</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">
              Rp {totalFines.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Harus dilunasi oleh peminjam</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Operations Status & Category Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Notifications & Checklists */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span>Status Operasional Harian</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Checklist Buka Status */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                checklistToday.some((c: any) => c.jenis === 'buka') 
                  ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div>
                  <h4 className="font-semibold text-sm">Checklist Pembukaan</h4>
                  <p className="text-xs mt-0.5">
                    {checklistToday.some((c: any) => c.jenis === 'buka') ? 'Selesai diisi hari ini' : 'Belum diisi hari ini'}
                  </p>
                </div>
                {checklistToday.some((c: any) => c.jenis === 'buka') ? (
                  <span className="text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">OK</span>
                ) : (
                  <Link href="/petugas/operasional" className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full transition-colors">Isi</Link>
                )}
              </div>

              {/* Checklist Tutup Status */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                checklistToday.some((c: any) => c.jenis === 'tutup') 
                  ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div>
                  <h4 className="font-semibold text-sm">Checklist Penutupan</h4>
                  <p className="text-xs mt-0.5">
                    {checklistToday.some((c: any) => c.jenis === 'tutup') ? 'Selesai diisi hari ini' : 'Belum diisi hari ini'}
                  </p>
                </div>
                {checklistToday.some((c: any) => c.jenis === 'tutup') ? (
                  <span className="text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">OK</span>
                ) : (
                  <Link href="/petugas/operasional" className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full transition-colors">Isi</Link>
                )}
              </div>
            </div>

            {/* Active Stock Opname Warning */}
            {activeOpname && (
              <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl flex items-center justify-between text-amber-400">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Stock Opname Berjalan</h4>
                    <p className="text-xs mt-0.5">
                      Dimulai sejak {new Date(activeOpname.tanggal_mulai).toLocaleDateString('id-ID')} oleh {activeOpname.pengguna.nama}.
                    </p>
                  </div>
                </div>
                <Link href="/petugas/opname" className="text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full hover:bg-amber-500/20 transition-all">
                  Lanjutkan
                </Link>
              </div>
            )}
          </div>

          {/* Book Categories Distribution (Visual Chart representation using CSS flex bars) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-md font-bold text-slate-100 mb-4">Distribusi Koleksi Berdasarkan Kategori</h2>
            <div className="space-y-4">
              {categories.map((cat: any) => {
                const totalInCat = cat.bahan_pustaka.length;
                const percentage = totalBooks > 0 ? (totalInCat / totalBooks) * 100 : 0;
                return (
                  <div key={cat.id_kategori} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-300">({cat.no_klasifikasi}) {cat.nama_kategori}</span>
                      <span className="text-slate-400 font-semibold">{totalInCat} Judul ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-md font-bold text-slate-100 mb-4">Aktivitas Sirkulasi Terakhir</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/20">
                  <tr>
                    <th scope="col" className="px-4 py-3">Nama Anggota</th>
                    <th scope="col" className="px-4 py-3">Judul Buku</th>
                    <th scope="col" className="px-4 py-3">Tgl Pinjam</th>
                    <th scope="col" className="px-4 py-3">Jatuh Tempo</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLoans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-600 font-medium">Tidak ada transaksi sirkulasi baru.</td>
                    </tr>
                  ) : (
                    recentLoans.map((loan: any) => (
                      <tr key={loan.id_transaksi} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-slate-200">{loan.anggota.nama}</td>
                        <td className="px-4 py-3.5 max-w-xs truncate text-slate-300" title={loan.eksemplar.bahan_pustaka.judul}>
                          {loan.eksemplar.bahan_pustaka.judul}
                        </td>
                        <td className="px-4 py-3.5 text-xs">{new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3.5 text-xs">{new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            loan.status === 'dipinjam' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-emerald-500/10 text-emerald-400'
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-md font-bold text-slate-100">Aksi Pintas Layanan</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/petugas/sirkulasi?tab=pinjam" className="p-3 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 rounded-xl text-center flex flex-col items-center gap-2 transition-all">
                <span className="text-indigo-400 font-semibold text-xs">Peminjaman Buku</span>
              </Link>
              <Link href="/petugas/sirkulasi?tab=kembali" className="p-3 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 rounded-xl text-center flex flex-col items-center gap-2 transition-all">
                <span className="text-emerald-400 font-semibold text-xs">Pengembalian Buku</span>
              </Link>
              <Link href="/petugas/members" className="p-3 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 rounded-xl text-center flex flex-col items-center gap-2 transition-all">
                <span className="text-slate-300 font-semibold text-xs">Daftar Anggota</span>
              </Link>
              <Link href="/petugas/books" className="p-3 bg-slate-800 border border-slate-700/60 hover:bg-slate-700 rounded-xl text-center flex flex-col items-center gap-2 transition-all">
                <span className="text-slate-300 font-semibold text-xs">Kelola Buku</span>
              </Link>
            </div>
          </div>

          {/* Audit Trail / Recent Log Activities */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>Log Aktivitas Sistem</span>
            </h2>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-center py-4 text-slate-600 text-xs">Belum ada log aktivitas.</p>
              ) : (
                recentLogs.map((log: any) => (
                  <div key={log.id_log.toString()} className="text-xs flex gap-3 border-l border-slate-800 pl-3 relative pb-2 last:pb-0">
                    <span className="absolute -left-[4.5px] top-1 w-2 h-2 bg-indigo-500 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <p className="text-slate-300">{log.aktivitas}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                        <span>{log.pengguna.nama} ({log.pengguna.peran})</span>
                        <span>{new Date(log.waktu).toLocaleTimeString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <Link href="/settings" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Lihat Semua Log Audit &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
