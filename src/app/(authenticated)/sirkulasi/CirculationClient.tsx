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
  Calendar,
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

  // Search filter
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
    }, 5000);
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowNoIdentitas || !borrowBarcode) return;
    setLoading(true);

    try {
      const res = await borrowBookAction(borrowNoIdentitas, borrowBarcode);
      if (res?.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Buku berhasil dipinjam!');
        setBorrowBarcode('');
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal memproses peminjaman.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnTrx) return;
    setLoading(true);

    try {
      const res = await returnBookAction(selectedReturnTrx, returnKondisi);
      if (res?.error) {
        triggerNotify('error', res.error);
      } else {
        const text = res.denda > 0 
          ? `Buku berhasil dikembalikan. Denda yang timbul: Rp${res.denda.toLocaleString('id-ID')}`
          : 'Buku berhasil dikembalikan tanpa denda.';
        triggerNotify('success', text);
        setSelectedReturnTrx(null);
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal memproses pengembalian.');
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (idTrx: number) => {
    setLoading(true);
    try {
      const res = await extendLoanAction(idTrx);
      if (res?.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Masa pinjam buku berhasil diperpanjang!');
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal memperpanjang masa pinjam.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (idDenda: number) => {
    setLoading(true);
    try {
      const res = await payFineAction(idDenda);
      if (res?.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Denda lunas dibayarkan!');
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal membayar denda.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservasiAnggotaId || !reservasiBahanId) return;
    setLoading(true);

    try {
      const res = await createReservasiAction(Number(reservasiAnggotaId), Number(reservasiBahanId));
      if (res?.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Antrean reservasi buku berhasil didaftarkan.');
        setReservasiAnggotaId(0);
        setReservasiBahanId(0);
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal membuat reservasi.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered active loans for pengembalian
  const filteredLoans = activeLoans.filter(l => 
    l.anggota.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.eksemplar.kode_barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.eksemplar.bahan_pustaka.judul.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Sirkulasi &amp; Layanan Anggota</h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola transaksi sirkulasi peminjaman, pengembalian, perpanjangan, denda, dan reservasi buku.
        </p>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 'pinjam', label: 'Peminjaman Buku', icon: ArrowRightLeft },
          { id: 'kembali', label: 'Pengembalian & Perpanjangan', icon: CornerDownLeft },
          { id: 'denda', label: 'Pembayaran Denda', icon: Coins },
          { id: 'reservasi', label: 'Antrean Reservasi', icon: Bookmark },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-600/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6">
        
        {/* Tab 1: Peminjaman */}
        {activeTab === 'pinjam' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-indigo-400" />
                <span>Formulir Peminjaman Baru</span>
              </h3>
              <form onSubmit={handleBorrow} className="space-y-4 max-w-xl">
                {/* Member ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    No. Identitas Anggota (NISN / NIP / NIK)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Masukkan Nomor Identitas Anggota..."
                      value={borrowNoIdentitas}
                      onChange={e => setBorrowNoIdentitas(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Book Barcode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Kode Barcode Eksemplar Buku
                  </label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Scan atau ketik kode barcode buku (mis. B000101)..."
                      value={borrowBarcode}
                      onChange={e => setBorrowBarcode(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  {loading ? 'Memproses...' : 'Proses Peminjaman'}
                </button>
              </form>
            </div>
            
            {/* Policy Notes Info card */}
            <div className="bg-slate-950/55 border border-slate-800 rounded-xl p-5 space-y-4 h-fit">
              <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Aturan SOP Peminjaman</h4>
              <ul className="text-xs text-slate-400 space-y-2.5 list-disc pl-4 leading-relaxed">
                <li>Anggota wajib menunjukkan kartu anggota yang masih aktif.</li>
                <li>Maksimal buku yang boleh dipinjam dalam satu waktu adalah <strong>3 buku</strong>.</li>
                <li>Buku kategori umum dipinjam selama <strong>7 hari</strong>, sedangkan buku referensi (kode panggil diawali &apos;REF&apos;) hanya <strong>3 hari</strong>.</li>
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
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 space-y-4 max-w-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-200">Form Pengembalian Eksemplar</h3>
                  <button 
                    onClick={() => setSelectedReturnTrx(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
                
                {(() => {
                  const selectedTrx = activeLoans.find(l => l.id_transaksi === selectedReturnTrx);
                  if (!selectedTrx) return null;
                  return (
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg text-xs space-y-1 text-slate-300">
                        <p><strong>Judul Buku:</strong> {selectedTrx.eksemplar.bahan_pustaka.judul}</p>
                        <p><strong>Kode Barcode:</strong> {selectedTrx.eksemplar.kode_barcode}</p>
                        <p><strong>Peminjam:</strong> {selectedTrx.anggota.nama} ({selectedTrx.anggota.no_identitas})</p>
                        <p><strong>Tanggal Pinjam:</strong> {new Date(selectedTrx.tanggal_pinjam).toLocaleDateString('id-ID')}</p>
                        <p><strong>Batas Jatuh Tempo:</strong> {new Date(selectedTrx.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}</p>
                      </div>

                      <form onSubmit={handleReturn} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                            Kondisi Buku Saat Dikembalikan
                          </label>
                          <select
                            value={returnKondisi}
                            onChange={e => setReturnKondisi(e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-100 outline-none transition-all"
                          >
                            <option value="baik">Kondisi Baik (Utuh)</option>
                            <option value="rusak_ringan">Rusak Ringan (Tergores/Lipat) (+ Denda Rp15.000)</option>
                            <option value="rusak_berat">Rusak Berat (Robek/Basah) (+ Denda Rp50.000)</option>
                            <option value="hilang">Buku Hilang (+ Denda Ganti Buku Rp100.000)</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
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
                <h3 className="text-md font-bold text-slate-100">Daftar Buku Sedang Dipinjam</h3>
                {/* Search box */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari anggota, barcode, judul..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/20">
                    <tr>
                      <th scope="col" className="px-4 py-3">Peminjam</th>
                      <th scope="col" className="px-4 py-3">Barcode</th>
                      <th scope="col" className="px-4 py-3">Judul Buku</th>
                      <th scope="col" className="px-4 py-3">Tgl Pinjam</th>
                      <th scope="col" className="px-4 py-3">Jatuh Tempo</th>
                      <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-600 font-medium">Tidak ada data peminjaman aktif.</td>
                      </tr>
                    ) : (
                      filteredLoans.map(loan => {
                        const isOverdue = new Date().getTime() > new Date(loan.tanggal_jatuh_tempo).getTime();
                        return (
                          <tr key={loan.id_transaksi} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-200">
                              {loan.anggota.nama}
                              <span className="block text-[10px] text-slate-500 font-normal">{loan.anggota.no_identitas}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono">{loan.eksemplar.kode_barcode}</td>
                            <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={loan.eksemplar.bahan_pustaka.judul}>
                              {loan.eksemplar.bahan_pustaka.judul}
                            </td>
                            <td className="px-4 py-3 text-xs">{new Date(loan.tanggal_pinjam).toLocaleDateString('id-ID')}</td>
                            <td className="px-4 py-3 text-xs">
                              <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                                {new Date(loan.tanggal_jatuh_tempo).toLocaleDateString('id-ID')}
                              </span>
                              {isOverdue && <span className="block text-[9px] text-rose-500 uppercase font-bold mt-0.5">Terlambat</span>}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              {/* Extend Button */}
                              <button
                                onClick={() => handleExtend(loan.id_transaksi)}
                                disabled={loading || loan.jumlah_perpanjangan >= 1}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs rounded-lg transition-all cursor-pointer"
                                title="Perpanjang masa pinjam (max 1x)"
                              >
                                Perpanjang ({loan.jumlah_perpanjangan}/1)
                              </button>
                              
                              {/* Return Button */}
                              <button
                                onClick={() => {
                                  setSelectedReturnTrx(loan.id_transaksi);
                                  setReturnKondisi('baik');
                                }}
                                disabled={loading}
                                className="px-2.5 py-1 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg hover:bg-emerald-600/20 transition-all cursor-pointer"
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
          <div className="space-y-6">
            <h3 className="text-md font-bold text-slate-100">Daftar Tunggakan Denda Aktif</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-400">
                <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/20">
                  <tr>
                    <th scope="col" className="px-4 py-3">Anggota</th>
                    <th scope="col" className="px-4 py-3">Buku Terkait</th>
                    <th scope="col" className="px-4 py-3">Jenis Denda</th>
                    <th scope="col" className="px-4 py-3">Nominal Denda</th>
                    <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidFines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-600 font-medium">Tidak ada tunggakan denda.</td>
                    </tr>
                  ) : (
                    unpaidFines.map(d => (
                      <tr key={d.id_denda} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-200">
                          {d.transaksi_peminjaman.anggota.nama}
                          <span className="block text-[10px] text-slate-500 font-normal">{d.transaksi_peminjaman.anggota.no_identitas}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={d.transaksi_peminjaman.eksemplar.bahan_pustaka.judul}>
                          {d.transaksi_peminjaman.eksemplar.bahan_pustaka.judul}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {d.jenis_denda}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-rose-400">Rp {Number(d.nominal).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handlePayFine(d.id_denda)}
                            disabled={loading}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded-lg transition-all cursor-pointer"
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
              <h3 className="text-sm font-bold text-slate-100">Daftar Reservasi Baru</h3>
              <form onSubmit={handleReservasi} className="space-y-4">
                {/* Select Member */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Pilih Anggota Perpustakaan
                  </label>
                  <select
                    value={reservasiAnggotaId}
                    onChange={e => setReservasiAnggotaId(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-100 outline-none transition-all"
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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Pilih Judul Buku (Bahan Pustaka)
                  </label>
                  <select
                    value={reservasiBahanId}
                    onChange={e => setReservasiBahanId(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-100 outline-none transition-all"
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  {loading ? 'Memproses...' : 'Buat Reservasi'}
                </button>
              </form>
            </div>

            {/* List of Active Reservations */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Daftar Antrean Reservasi Aktif</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/20">
                    <tr>
                      <th scope="col" className="px-4 py-3">Anggota</th>
                      <th scope="col" className="px-4 py-3">Buku Direservasi</th>
                      <th scope="col" className="px-4 py-3">Tanggal Reservasi</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReservations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-600 text-xs">Tidak ada antrean reservasi.</td>
                      </tr>
                    ) : (
                      activeReservations.map(r => (
                        <tr key={r.id_reservasi} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-200">{r.anggota.nama}</td>
                          <td className="px-4 py-3 text-slate-300">{r.bahan_pustaka.judul}</td>
                          <td className="px-4 py-3 text-xs">{new Date(r.tanggal_reservasi).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3">
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
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
  );
}
