'use client';

import { useState } from 'react';
import { 
  borrowBookAction, 
  returnBookAction, 
  extendLoanAction, 
  payFineAction, 
  createReservasiAction 
} from '@/lib/actions';
import { 
  ArrowRightLeft, 
  CornerDownLeft, 
  Bookmark, 
  Coins, 
  Search,
  ScanLine,
  User,
  Barcode,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CirculationClientProps {
  activeLoans: any[];
  unpaidFines: any[];
  activeReservations: any[];
  members: any[];
  books: any[];
}

export default function CirculationClient({
  activeLoans,
  unpaidFines,
  activeReservations,
  members,
  books,
}: CirculationClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pinjam' | 'kembali' | 'denda' | 'reservasi'>('pinjam');

  // Common messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Borrow states
  const [borrowNoIdentitas, setBorrowNoIdentitas] = useState('');
  const [borrowBarcode, setBorrowBarcode] = useState('');

  // Return states
  const [selectedReturnTrx, setSelectedReturnTrx] = useState<number | null>(null);
  const [returnKondisi, setReturnKondisi] = useState<'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang'>('baik');

  // Reservation states
  const [reservasiAnggotaId, setReservasiAnggotaId] = useState(0);
  const [reservasiBahanId, setReservasiBahanId] = useState(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const triggerNotify = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setErrorMsg(null);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 4500);
  };

  // Actions
  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowNoIdentitas || !borrowBarcode) return;
    setLoading(true);
    try {
      const res: any = await borrowBookAction(borrowNoIdentitas, borrowBarcode);
      if (res && res.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Buku berhasil dipinjamkan!');
        setBorrowBarcode('');
        router.refresh();
      }
    } catch {
      triggerNotify('error', 'Terjadi kesalahan sistem saat memproses peminjaman.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnTrx) return;
    setLoading(true);
    try {
      const res: any = await returnBookAction(selectedReturnTrx, returnKondisi);
      if (res && res.error) {
        triggerNotify('error', res.error);
      } else {
        const dendaValue = res && 'denda' in res ? Number(res.denda) : 0;
        const text = dendaValue > 0 
          ? `Buku berhasil dikembalikan. Denda yang timbul: Rp ${dendaValue.toLocaleString('id-ID')}`
          : 'Buku berhasil dikembalikan tanpa denda.';
        triggerNotify('success', text);
        setSelectedReturnTrx(null);
        router.refresh();
      }
    } catch {
      triggerNotify('error', 'Gagal memproses pengembalian buku.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (id_transaksi: number) => {
    setLoading(true);
    try {
      const res: any = await extendLoanAction(id_transaksi);
      if (res && res.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Masa pinjam buku berhasil diperpanjang!');
        router.refresh();
      }
    } catch {
      triggerNotify('error', 'Gagal memperpanjang masa pinjam.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (id_denda: number) => {
    setLoading(true);
    try {
      const res: any = await payFineAction(id_denda);
      if (res && res.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Denda berhasil dibayarkan dan lunas.');
        router.refresh();
      }
    } catch {
      triggerNotify('error', 'Gagal memproses pembayaran denda.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservasiAnggotaId || !reservasiBahanId) return;
    setLoading(true);
    try {
      const res: any = await createReservasiAction(Number(reservasiAnggotaId), Number(reservasiBahanId));
      if (res && res.error) {
        triggerNotify('error', res.error ?? 'Terjadi kesalahan saat membuat reservasi.');
      } else {
        triggerNotify('success', 'Antrean reservasi buku berhasil dicatat.');
        setReservasiBahanId(0);
        router.refresh();
      }
    } catch {
      triggerNotify('error', 'Gagal membuat reservasi.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = activeLoans.filter(l => 
    l.anggota.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.eksemplar.kode_barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.eksemplar.bahan_pustaka.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Sirkulasi &amp; Layanan Anggota</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Kelola transaksi sirkulasi peminjaman, pengembalian, perpanjangan, denda, dan reservasi buku.
        </p>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl flex items-center gap-3 text-sm border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Card with Tabs */}
      <div className="rounded-2xl overflow-hidden border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/40 dark:border-slate-800">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {[
            { id: 'pinjam', label: 'Peminjaman Buku', icon: ArrowRightLeft },
            { id: 'kembali', label: 'Pengembalian & Perpanjangan', icon: CornerDownLeft, count: activeLoans.length },
            { id: 'denda', label: 'Pembayaran Denda', icon: Coins, count: unpaidFines.length },
            { id: 'reservasi', label: 'Antrean Reservasi', icon: Bookmark, count: activeReservations.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSuccessMsg(null);
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-indigo-700 bg-indigo-50/70 font-bold dark:text-indigo-400 dark:bg-indigo-600/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {'count' in tab && typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    tab.id === 'denda'
                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-7">
          {/* Tab 1: Peminjaman */}
          {activeTab === 'pinjam' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Formulir Peminjaman Baru</span>
                </h3>
                <form onSubmit={handleBorrow} className="space-y-4 max-w-xl">
                  {/* Member ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                      No. Identitas Anggota (NISN / NIP / NIK)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        placeholder="Masukkan Nomor Identitas Anggota..."
                        value={borrowNoIdentitas}
                        onChange={e => setBorrowNoIdentitas(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
                      />
                    </div>
                  </div>

                  {/* Book Barcode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                      Kode Barcode Eksemplar Buku
                    </label>
                    <div className="relative">
                      <Barcode className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        placeholder="Scan atau ketik barcode buku (mis. B000101)..."
                        value={borrowBarcode}
                        onChange={e => setBorrowBarcode(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 text-white font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {loading ? 'Memproses...' : 'Proses Peminjaman'}
                  </button>
                </form>
              </div>
              
              {/* Policy Notes Info card */}
              <div className="rounded-2xl p-5 space-y-4 border transition-all h-fit bg-indigo-50/70 border-indigo-200/80 text-indigo-950 dark:bg-slate-950/55 dark:border-slate-800 dark:text-slate-300">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Aturan SOP Peminjaman</h4>
                <ul className="text-xs text-slate-700 dark:text-slate-400 space-y-2.5 list-disc pl-4 leading-relaxed font-medium">
                  <li>Anggota wajib memiliki status keanggotaan aktif.</li>
                  <li>Maksimal buku yang boleh dipinjam dalam satu waktu adalah <strong>3 buku</strong>.</li>
                  <li>Buku kategori umum dipinjam selama <strong>7 hari</strong>, buku referensi (kode &apos;REF&apos;) hanya <strong>3 hari</strong>.</li>
                  <li>Peminjam tidak boleh memiliki tunggakan denda aktif.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Pengembalian & Perpanjangan */}
          {activeTab === 'kembali' && (
            <div className="space-y-6">
              {/* Selection Form for Return if picked */}
              {selectedReturnTrx !== null && (
                <div className="rounded-2xl p-6 border transition-all bg-slate-50/80 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800 space-y-4 max-w-2xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Form Pengembalian Eksemplar</h3>
                    <button 
                      onClick={() => setSelectedReturnTrx(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-semibold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  
                  {(() => {
                    const selectedTrx = activeLoans.find(l => l.id_transaksi === selectedReturnTrx);
                    if (!selectedTrx) return null;
                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl border text-xs space-y-1.5 bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                          <p><strong>Judul Buku:</strong> {selectedTrx.eksemplar.bahan_pustaka.judul}</p>
                          <p><strong>Kode Barcode:</strong> <span className="font-mono">{selectedTrx.eksemplar.kode_barcode}</span></p>
                          <p><strong>Peminjam:</strong> {selectedTrx.anggota.nama} ({selectedTrx.anggota.no_identitas})</p>
                          <p><strong>Tanggal Pinjam:</strong> {new Date(selectedTrx.tanggal_pinjam).toLocaleDateString('id-ID')}</p>
                          <p><strong>Batas Jatuh Tempo:</strong> {new Date(selectedTrx.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</p>
                        </div>

                        <form onSubmit={handleReturn} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                              Kondisi Buku Saat Dikembalikan
                            </label>
                            <select
                              value={returnKondisi}
                              onChange={e => setReturnKondisi(e.target.value as any)}
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 cursor-pointer"
                            >
                              <option value="baik">Kondisi Baik (Utuh)</option>
                              <option value="rusak_ringan">Rusak Ringan (+ Denda Rp15.000)</option>
                              <option value="rusak_berat">Rusak Berat (+ Denda Rp50.000)</option>
                              <option value="hilang">Buku Hilang (+ Denda Ganti Buku Rp100.000)</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            {loading ? 'Memproses...' : 'Proses Pengembalian'}
                          </button>
                        </form>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* List of Active Loans */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daftar Buku Sedang Dipinjam</h3>
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari anggota, barcode, judul..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                    <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">Peminjam</th>
                        <th scope="col" className="px-4 py-3">Barcode</th>
                        <th scope="col" className="px-4 py-3">Judul Buku</th>
                        <th scope="col" className="px-4 py-3">Tgl Pinjam</th>
                        <th scope="col" className="px-4 py-3">Jatuh Tempo</th>
                        <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {filteredLoans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">Tidak ada data peminjaman aktif.</td>
                        </tr>
                      ) : (
                        filteredLoans.map(loan => {
                          const isOverdue = new Date().getTime() > new Date(loan.tanggal_jatuh_tempo).getTime();
                          return (
                            <tr key={loan.id_transaksi} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                              <td className="px-4 py-3.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{loan.anggota.nama}</span>
                                <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono">{loan.anggota.no_identitas}</span>
                              </td>
                              <td className="px-4 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{loan.eksemplar.kode_barcode}</td>
                              <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate" title={loan.eksemplar.bahan_pustaka.judul}>
                                {loan.eksemplar.bahan_pustaka.judul}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                              <td className="px-4 py-3.5 text-xs">
                                <span className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'}>
                                  {new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}
                                </span>
                                {isOverdue && <span className="block text-[9px] text-rose-600 dark:text-rose-400 uppercase font-bold mt-0.5">Terlambat</span>}
                              </td>
                              <td className="px-4 py-3.5 text-right space-x-2">
                                <button
                                  onClick={() => handleExtend(loan.id_transaksi)}
                                  disabled={loading || loan.jumlah_perpanjangan >= 1}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                                  title="Perpanjang masa pinjam (max 1x)"
                                >
                                  Perpanjang ({loan.jumlah_perpanjangan}/1)
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedReturnTrx(loan.id_transaksi);
                                    setReturnKondisi('baik');
                                  }}
                                  disabled={loading}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-600/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-600/20 cursor-pointer"
                                >
                                  Kembalikan
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Denda */}
          {activeTab === 'denda' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daftar Tunggakan Denda Aktif</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                  <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3">Anggota</th>
                      <th scope="col" className="px-4 py-3">Buku Terkait</th>
                      <th scope="col" className="px-4 py-3">Jenis Denda</th>
                      <th scope="col" className="px-4 py-3">Nominal Denda</th>
                      <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {unpaidFines.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">Tidak ada tunggakan denda aktif.</td>
                      </tr>
                    ) : (
                      unpaidFines.map(d => (
                        <tr key={d.id_denda} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{d.transaksi_peminjaman?.anggota?.nama}</span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono">{d.transaksi_peminjaman?.anggota?.no_identitas}</span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium max-w-xs truncate" title={d.transaksi_peminjaman?.eksemplar?.bahan_pustaka?.judul}>
                            {d.transaksi_peminjaman?.eksemplar?.bahan_pustaka?.judul}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              {d.jenis_denda}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-extrabold text-rose-600 dark:text-rose-400">Rp {Number(d.nominal).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handlePayFine(d.id_denda)}
                              disabled={loading}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              Bayar Lunas
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Reservasi */}
          {activeTab === 'reservasi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* New Reservation Form */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daftar Reservasi Baru</h3>
                <form onSubmit={handleReservasi} className="space-y-4">
                  {/* Select Member */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                      Pilih Anggota Perpustakaan
                    </label>
                    <select
                      value={reservasiAnggotaId}
                      onChange={e => setReservasiAnggotaId(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value={0}>-- Pilih Anggota --</option>
                      {members.map(m => (
                        <option key={m.id_anggota} value={m.id_anggota}>
                          {m.nama} ({m.no_identitas})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Book */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                      Pilih Judul Buku (Bahan Pustaka)
                    </label>
                    <select
                      value={reservasiBahanId}
                      onChange={e => setReservasiBahanId(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value={0}>-- Pilih Judul Buku --</option>
                      {books.map(b => (
                        <option key={b.id_bahan} value={b.id_bahan}>
                          {b.judul} - {b.pengarang || 'Tanpa Pengarang'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !reservasiAnggotaId || !reservasiBahanId}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {loading ? 'Memproses...' : 'Buat Reservasi'}
                  </button>
                </form>
              </div>

              {/* List of Active Reservations */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daftar Antrean Reservasi Aktif</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                    <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">Anggota</th>
                        <th scope="col" className="px-4 py-3">Buku Direservasi</th>
                        <th scope="col" className="px-4 py-3">Tanggal Reservasi</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {activeReservations.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs font-medium">Tidak ada antrean reservasi.</td>
                        </tr>
                      ) : (
                        activeReservations.map(r => (
                          <tr key={r.id_reservasi} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">{r.anggota?.nama}</td>
                            <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">{r.bahan_pustaka?.judul}</td>
                            <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{new Date(r.tanggal_reservasi).toLocaleDateString('id-ID')}</td>
                            <td className="px-4 py-3.5">
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                                {r.status}
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
          )}
        </div>
      </div>
    </div>
  );
}
