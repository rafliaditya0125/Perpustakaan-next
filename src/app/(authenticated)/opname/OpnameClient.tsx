'use client';

import { useState, useTransition } from 'react';
import {
  startStockOpnameAction,
  processStockOpnameItemAction,
  finishStockOpnameAction,
} from '@/lib/actions';
import {
  PackageSearch,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ScanLine,
  History,
  Scissors,
  ClipboardCheck,
  Archive,
  Info,
  BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OpnameClientProps {
  activeSesi: any | null;
  riwayatOpname: any[];
  eksemplarRusakBerat: any[];
}

const STATUS_DITEMUKAN_OPTIONS = [
  { value: 'ditemukan', label: 'Ditemukan', color: 'emerald' },
  { value: 'tidak_ditemukan', label: 'Tidak Ditemukan', color: 'rose' },
  { value: 'rusak', label: 'Rusak', color: 'amber' },
] as const;

export default function OpnameClient({
  activeSesi,
  riwayatOpname,
  eksemplarRusakBerat,
}: OpnameClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<'opname' | 'riwayat' | 'weeding'>('opname');

  const [barcode, setBarcode] = useState('');
  const [statusDitemukan, setStatusDitemukan] = useState<'ditemukan' | 'tidak_ditemukan' | 'rusak'>('ditemukan');
  const [catatan, setCatatan] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showMsg = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccessMsg(msg); setErrorMsg(null); }
    else { setErrorMsg(msg); setSuccessMsg(null); }
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 5000);
  };

  const handleStartSesi = () => {
    startTransition(async () => {
      const result = await startStockOpnameAction();
      if ('error' in result && result.error) {
        showMsg('error', result.error as string);
      } else {
        showMsg('success', 'Sesi Stock Opname baru berhasil dimulai!');
        router.refresh();
      }
    });
  };

  const handleScanBarcode = () => {
    if (!activeSesi) return;
    if (!barcode.trim()) {
      showMsg('error', 'Barcode tidak boleh kosong.');
      return;
    }
    startTransition(async () => {
      const result = await processStockOpnameItemAction(
        activeSesi.id_opname,
        barcode.trim(),
        statusDitemukan,
        catatan.trim() || undefined
      );
      if ('error' in result && result.error) {
        showMsg('error', result.error as string);
      } else {
        showMsg('success', `Barcode ${barcode} berhasil dicatat sebagai "${statusDitemukan}".`);
        setBarcode('');
        setCatatan('');
        router.refresh();
      }
    });
  };

  const handleFinishSesi = () => {
    if (!activeSesi) return;
    if (!confirm('Yakin ingin menyelesaikan sesi stock opname ini? Tindakan ini tidak bisa dibatalkan.')) return;
    startTransition(async () => {
      const result = await finishStockOpnameAction(activeSesi.id_opname);
      if (result.success) {
        showMsg('success', 'Sesi Stock Opname berhasil diselesaikan!');
        router.refresh();
      }
    });
  };

  const ditemukanCount = activeSesi?.detail_stock_opname?.filter((d: any) => d.status_ditemukan === 'ditemukan').length ?? 0;
  const tidakDitemukanCount = activeSesi?.detail_stock_opname?.filter((d: any) => d.status_ditemukan === 'tidak_ditemukan').length ?? 0;
  const rusakCount = activeSesi?.detail_stock_opname?.filter((d: any) => d.status_ditemukan === 'rusak').length ?? 0;
  const totalScanned = activeSesi?.detail_stock_opname?.length ?? 0;

  const tabs = [
    { id: 'opname', label: 'Sesi Stock Opname', icon: PackageSearch },
    { id: 'riwayat', label: 'Riwayat Sesi', icon: History, count: riwayatOpname.length },
    { id: 'weeding', label: 'Penyiangan (Weeding)', icon: Scissors, count: eksemplarRusakBerat.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/80 to-violet-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-600/20 border border-violet-500/30 rounded-xl">
            <PackageSearch className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Stock Opname & Penyiangan</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Verifikasi fisik eksemplar koleksi dan pengelolaan bahan pustaka rusak
            </p>
          </div>
          {activeSesi && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-amber-400">SESI AKTIF</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-950/30 border border-emerald-700/40 text-emerald-300 p-4 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-950/30 border border-rose-700/40 text-rose-300 p-4 rounded-xl text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                  isActive
                    ? 'text-violet-400 bg-violet-600/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {'count' in tab && tab.count > 0 && (
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab.id === 'weeding' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-700 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB: STOCK OPNAME */}
          {activeTab === 'opname' && (
            <div className="space-y-6">
              {!activeSesi ? (
                /* No active session */
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                    <PackageSearch className="w-16 h-16 text-slate-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-200">Tidak Ada Sesi Stock Opname Aktif</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      Mulai sesi baru untuk melakukan verifikasi fisik eksemplar koleksi perpustakaan.
                      Setiap eksemplar dipindai dan dicatat statusnya (ditemukan, tidak ditemukan, atau rusak).
                    </p>
                  </div>
                  <button
                    onClick={handleStartSesi}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-violet-900/30"
                  >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Mulai Sesi Stock Opname Baru
                  </button>
                </div>
              ) : (
                /* Active session */
                <>
                  {/* Session Info */}
                  <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Sesi Aktif Sejak</p>
                      <p className="text-sm font-bold text-amber-300">
                        {new Date(activeSesi.tanggal_mulai).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-amber-500">Dimulai oleh: {activeSesi.pengguna.nama}</p>
                    </div>
                    <button
                      onClick={handleFinishSesi}
                      disabled={isPending}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                      Selesaikan Sesi
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Ditemukan', count: ditemukanCount, color: 'emerald' },
                      { label: 'Tidak Ditemukan', count: tidakDitemukanCount, color: 'rose' },
                      { label: 'Rusak', count: rusakCount, color: 'amber' },
                    ].map(stat => (
                      <div key={stat.label} className={`bg-${stat.color}-950/20 border border-${stat.color}-800/40 rounded-xl p-4 text-center`}>
                        <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.count}</p>
                        <p className={`text-xs text-${stat.color}-500 font-semibold mt-1`}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Scan Form */}
                  <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-violet-400" />
                      Pindai Barcode Eksemplar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Kode Barcode *
                        </label>
                        <input
                          type="text"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleScanBarcode()}
                          placeholder="Scan atau ketik barcode..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                          autoFocus
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Status Fisik *
                        </label>
                        <div className="flex gap-2">
                          {STATUS_DITEMUKAN_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setStatusDitemukan(opt.value)}
                              className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${
                                statusDitemukan === opt.value
                                  ? opt.color === 'emerald'
                                    ? 'bg-emerald-600 border-emerald-500 text-white'
                                    : opt.color === 'rose'
                                    ? 'bg-rose-600 border-rose-500 text-white'
                                    : 'bg-amber-600 border-amber-500 text-white'
                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Catatan (Opsional)
                        </label>
                        <input
                          type="text"
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="Kondisi khusus, keterangan..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleScanBarcode}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
                      >
                        {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                        Proses Barcode (Enter)
                      </button>
                    </div>
                  </div>

                  {/* Scanned Items Table */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-3">
                      Item Terpindai ({totalScanned})
                    </h3>
                    {totalScanned === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-sm border border-slate-800 rounded-xl">
                        Belum ada item yang dipindai. Mulai scan barcode eksemplar di atas.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-sm text-left text-slate-400">
                          <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/30">
                            <tr>
                              <th className="px-4 py-3">Barcode</th>
                              <th className="px-4 py-3">Judul Buku</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Catatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeSesi.detail_stock_opname.map((detail: any) => (
                              <tr key={detail.id_detail} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-slate-300">{detail.eksemplar.kode_barcode}</td>
                                <td className="px-4 py-3 text-slate-200 max-w-xs truncate" title={detail.eksemplar.bahan_pustaka.judul}>
                                  {detail.eksemplar.bahan_pustaka.judul}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    detail.status_ditemukan === 'ditemukan'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : detail.status_ditemukan === 'tidak_ditemukan'
                                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {detail.status_ditemukan.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">{detail.catatan || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: RIWAYAT */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Riwayat Sesi Stock Opname</h3>
              {riwayatOpname.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-sm">
                  Belum ada sesi stock opname yang diselesaikan.
                </div>
              ) : (
                <div className="space-y-3">
                  {riwayatOpname.map((sesi) => (
                    <div key={sesi.id_opname} className="bg-slate-950/30 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Archive className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-bold text-slate-200">
                            Sesi #{sesi.id_opname} — {new Date(sesi.tanggal_mulai).toLocaleDateString('id-ID')}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">Selesai</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 pl-7">
                          <span>Oleh: {sesi.pengguna.nama}</span>
                          {sesi.tanggal_selesai && (
                            <span>Selesai: {new Date(sesi.tanggal_selesai).toLocaleDateString('id-ID')}</span>
                          )}
                          <span>{sesi._count.detail_stock_opname} item dipindai</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: WEEDING */}
          {activeTab === 'weeding' && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-800/40 rounded-xl p-4">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-300 space-y-1">
                  <p className="font-bold">Penyiangan (Weeding) Koleksi</p>
                  <p className="text-xs text-amber-400/80">
                    Berikut adalah daftar eksemplar dengan kondisi <strong>rusak berat</strong> yang perlu dievaluasi untuk penarikan dari koleksi aktif.
                    Petugas dapat memperbarui status eksemplar di menu Koleksi Buku.
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-200">
                Eksemplar Rusak Berat ({eksemplarRusakBerat.length})
              </h3>

              {eksemplarRusakBerat.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/50" />
                  <p className="text-slate-500 text-sm text-center">Tidak ada eksemplar dengan kondisi rusak berat. Koleksi dalam kondisi baik!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/30">
                      <tr>
                        <th className="px-4 py-3">Barcode</th>
                        <th className="px-4 py-3">Judul Buku</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">No. Panggil</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Lokasi Rak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eksemplarRusakBerat.map((eks) => (
                        <tr key={eks.id_eksemplar} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-300">{eks.kode_barcode}</td>
                          <td className="px-4 py-3 text-slate-200 max-w-xs">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate" title={eks.bahan_pustaka.judul}>{eks.bahan_pustaka.judul}</span>
                            </div>
                            <p className="text-xs text-slate-500 pl-6">{eks.bahan_pustaka.pengarang || '-'}</p>
                          </td>
                          <td className="px-4 py-3 text-xs">{eks.bahan_pustaka.kategori.nama_kategori}</td>
                          <td className="px-4 py-3 font-mono text-xs">{eks.bahan_pustaka.nomor_panggil || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                              {eks.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">{eks.lokasi_rak || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
