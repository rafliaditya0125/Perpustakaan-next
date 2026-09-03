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
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-7 border transition-all duration-200 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50/50 border-violet-200/80 shadow-xs dark:from-slate-900/80 dark:via-violet-950/40 dark:to-slate-900/80 dark:border-violet-500/20 dark:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl border transition-all bg-white border-violet-200 text-violet-700 shadow-xs dark:bg-violet-600/20 dark:border-violet-500/30 dark:text-violet-400">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Stock Opname &amp; Penyiangan</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Verifikasi fisik eksemplar koleksi dan evaluasi penyiangan bahan pustaka rusak.
              </p>
            </div>
          </div>
          {activeSesi && (
            <div className="sm:ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
              <div className="w-2 h-2 rounded-full animate-pulse bg-amber-500 dark:bg-amber-400" />
              <span>SESI AKTIF BERJALAN</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-sm border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-700/40 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl text-sm border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-700/40 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs Container */}
      <div className="rounded-2xl overflow-hidden border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 relative whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-violet-700 bg-violet-50/70 font-bold dark:text-violet-400 dark:bg-violet-600/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {'count' in tab && tab.count > 0 && (
                  <span className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    tab.id === 'weeding' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-500 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-7">
          {/* TAB: STOCK OPNAME */}
          {activeTab === 'opname' && (
            <div className="space-y-6">
              {!activeSesi ? (
                /* No active session */
                <div className="flex flex-col items-center justify-center py-16 gap-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="p-5 rounded-2xl border bg-white border-slate-200 shadow-xs dark:bg-slate-800/50 dark:border-slate-700">
                    <PackageSearch className="w-14 h-14 text-violet-600 dark:text-slate-400" />
                  </div>
                  <div className="text-center space-y-2 max-w-md px-4">
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Tidak Ada Sesi Stock Opname Aktif</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Mulai sesi baru untuk melakukan verifikasi fisik eksemplar koleksi perpustakaan.
                      Setiap eksemplar dipindai dan dicatat status fisiknya (ditemukan, tidak ditemukan, atau rusak).
                    </p>
                  </div>
                  <button
                    onClick={handleStartSesi}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md shadow-violet-600/20 cursor-pointer"
                  >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Mulai Sesi Stock Opname Baru</span>
                  </button>
                </div>
              ) : (
                /* Active session */
                <>
                  {/* Session Info */}
                  <div className="rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Sesi Stock Opname Aktif</p>
                      <p className="text-base font-extrabold text-amber-950 dark:text-amber-200">
                        {new Date(activeSesi.tanggal_mulai).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">Dimulai oleh: <span className="font-semibold">{activeSesi.pengguna?.nama}</span></p>
                    </div>
                    <button
                      onClick={handleFinishSesi}
                      disabled={isPending}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                      <span>Selesaikan Sesi</span>
                    </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border text-center transition-all bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40">
                      <p className="text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400">{ditemukanCount}</p>
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-500 mt-1 uppercase tracking-wider">Ditemukan</p>
                    </div>
                    <div className="p-4 rounded-2xl border text-center transition-all bg-rose-50/80 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40">
                      <p className="text-3xl font-extrabold tracking-tight text-rose-700 dark:text-rose-400">{tidakDitemukanCount}</p>
                      <p className="text-xs font-bold text-rose-800 dark:text-rose-500 mt-1 uppercase tracking-wider">Tidak Ditemukan</p>
                    </div>
                    <div className="p-4 rounded-2xl border text-center transition-all bg-amber-50/80 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40">
                      <p className="text-3xl font-extrabold tracking-tight text-amber-700 dark:text-amber-400">{rusakCount}</p>
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-500 mt-1 uppercase tracking-wider">Rusak</p>
                    </div>
                  </div>

                  {/* Scan Form */}
                  <div className="rounded-2xl p-6 border transition-all bg-slate-50/80 border-slate-200 dark:bg-slate-950/30 dark:border-slate-800 space-y-4">
                    <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <ScanLine className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span>Pindai Barcode Eksemplar</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                          Kode Barcode *
                        </label>
                        <input
                          type="text"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleScanBarcode()}
                          placeholder="Scan atau ketik barcode..."
                          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-600"
                          autoFocus
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                          Status Fisik *
                        </label>
                        <div className="flex gap-2">
                          {STATUS_DITEMUKAN_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setStatusDitemukan(opt.value)}
                              className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                statusDitemukan === opt.value
                                  ? opt.color === 'emerald'
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : opt.color === 'rose'
                                    ? 'bg-rose-600 border-rose-600 text-white'
                                    : 'bg-amber-600 border-amber-600 text-white'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                          Catatan (Opsional)
                        </label>
                        <input
                          type="text"
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="Kondisi khusus, keterangan..."
                          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleScanBarcode}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                      >
                        {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                        <span>Proses Barcode (Enter)</span>
                      </button>
                    </div>
                  </div>

                  {/* Scanned Items Table */}
                  <div>
                    <h3 className="text-base font-extrabold tracking-tight mb-3 text-slate-900 dark:text-slate-100">
                      Item Terpindai ({totalScanned})
                    </h3>
                    {totalScanned === 0 ? (
                      <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400 text-sm">
                        Belum ada item yang dipindai. Mulai scan barcode eksemplar di atas.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                          <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                            <tr>
                              <th className="px-4 py-3">Barcode</th>
                              <th className="px-4 py-3">Judul Buku</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {activeSesi.detail_stock_opname.map((detail: any) => (
                              <tr key={detail.id_detail} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                                <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{detail.eksemplar?.kode_barcode}</td>
                                <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate" title={detail.eksemplar?.bahan_pustaka?.judul}>
                                  {detail.eksemplar?.bahan_pustaka?.judul}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                    detail.status_ditemukan === 'ditemukan'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                      : detail.status_ditemukan === 'tidak_ditemukan'
                                      ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                  }`}>
                                    {detail.status_ditemukan.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{detail.catatan || '-'}</td>
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
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Riwayat Sesi Stock Opname</h3>
              {riwayatOpname.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400 text-sm">
                  Belum ada sesi stock opname yang diselesaikan.
                </div>
              ) : (
                <div className="space-y-3">
                  {riwayatOpname.map((sesi) => (
                    <div key={sesi.id_opname} className="rounded-2xl p-5 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-950/30 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Archive className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                            Sesi #{sesi.id_opname} — {new Date(sesi.tanggal_mulai).toLocaleDateString('id-ID')}
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">Selesai</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pl-7 flex-wrap">
                          <span>Oleh: <strong className="text-slate-800 dark:text-slate-200">{sesi.pengguna?.nama}</strong></span>
                          {sesi.tanggal_selesai && (
                            <span>Selesai: {new Date(sesi.tanggal_selesai).toLocaleDateString('id-ID')}</span>
                          )}
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sesi._count?.detail_stock_opname ?? 0} item dipindai</span>
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
              <div className="flex items-start gap-3 rounded-2xl p-4 border bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-300">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-bold text-amber-950 dark:text-amber-200">Penyiangan (Weeding) Koleksi</p>
                  <p className="text-xs text-amber-800 dark:text-amber-400/90 leading-relaxed">
                    Berikut adalah daftar eksemplar dengan kondisi <strong>rusak berat</strong> yang perlu dievaluasi untuk penarikan dari koleksi aktif.
                    Petugas dapat memperbarui status eksemplar di menu Koleksi Buku.
                  </p>
                </div>
              </div>

              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Eksemplar Rusak Berat ({eksemplarRusakBerat.length})
              </h3>

              {eksemplarRusakBerat.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-slate-600 dark:text-slate-400 text-sm text-center">Tidak ada eksemplar dengan kondisi rusak berat. Koleksi dalam kondisi baik!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                    <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Barcode</th>
                        <th className="px-4 py-3">Judul Buku</th>
                        <th className="px-4 py-3">Kategori</th>
                        <th className="px-4 py-3">No. Panggil</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Lokasi Rak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {eksemplarRusakBerat.map((eks) => (
                        <tr key={eks.id_eksemplar} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{eks.kode_barcode}</td>
                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-900 dark:text-slate-100 truncate" title={eks.bahan_pustaka?.judul}>{eks.bahan_pustaka?.judul}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 mt-0.5">{eks.bahan_pustaka?.pengarang || '-'}</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-500/20 dark:text-indigo-300">
                              {eks.bahan_pustaka?.kategori?.nama_kategori || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">{eks.bahan_pustaka?.nomor_panggil || '-'}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                              {eks.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{eks.lokasi_rak || '-'}</td>
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
