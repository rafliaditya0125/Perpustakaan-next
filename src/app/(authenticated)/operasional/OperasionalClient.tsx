'use client';

import { useState, useTransition } from 'react';
import {
  saveChecklistAction,
  createLaporanKejadianAction,
  updateLaporanKejadianStatus,
} from '@/lib/actions';
import {
  ClipboardCheck,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Plus,
  Send,
  RefreshCw,
  Clock,
  User,
  ChevronDown,
  FileWarning,
  ListChecks,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

const CHECKLIST_BUKA: { id: string; label: string }[] = [
  { id: 'ac', label: 'Menghidupkan AC dan memastikan suhu ruangan nyaman' },
  { id: 'lampu', label: 'Menyalakan semua lampu penerangan ruang baca' },
  { id: 'komputer', label: 'Menyalakan komputer petugas dan OPAC' },
  { id: 'meja_sirkulasi', label: 'Menyiapkan meja sirkulasi (stempel, form, slip peminjaman)' },
  { id: 'rak_rapi', label: 'Memeriksa kerapian rak buku dan rak yang perlu shelving' },
  { id: 'pintu', label: 'Membuka pintu utama dan memasang tanda "BUKA"' },
  { id: 'buku_kembali', label: 'Memproses buku kembalian dari kotak pengembalian' },
];

const CHECKLIST_TUTUP: { id: string; label: string }[] = [
  { id: 'shelving', label: 'Melakukan shelving buku yang belum dikembalikan ke rak' },
  { id: 'sirkulasi_ringkasan', label: 'Mencatat ringkasan transaksi sirkulasi hari ini' },
  { id: 'komputer_off', label: 'Mematikan semua komputer dan perangkat elektronik' },
  { id: 'lampu_off', label: 'Mematikan semua lampu penerangan' },
  { id: 'ac_off', label: 'Mematikan AC dan memastikan suhu aman' },
  { id: 'pintu_kunci', label: 'Mengunci pintu utama dan memasang tanda "TUTUP"' },
  { id: 'laporan_harian', label: 'Menyimpan laporan kejadian / insiden hari ini (jika ada)' },
];

const JENIS_KEJADIAN_OPTIONS = [
  'Kerusakan Fasilitas/Infrastruktur',
  'Buku Hilang / Dilaporkan Hilang',
  'Buku Rusak / Dirusak',
  'Keadaan Darurat (Kebakaran, dll.)',
  'Pelanggaran Tata Tertib',
  'Gangguan Sistem Komputer',
  'Lainnya',
];

interface OperasionalClientProps {
  user: any;
  checklistHariIni: any[];
  laporanKejadian: any[];
}

export default function OperasionalClient({
  user,
  checklistHariIni,
  laporanKejadian,
}: OperasionalClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<'buka' | 'tutup' | 'kejadian'>('buka');

  const [checklistBuka, setChecklistBuka] = useState<ChecklistItem[]>(
    CHECKLIST_BUKA.map(item => ({ ...item, checked: false }))
  );
  const [checklistTutup, setChecklistTutup] = useState<ChecklistItem[]>(
    CHECKLIST_TUTUP.map(item => ({ ...item, checked: false }))
  );
  const [catatanBuka, setCatatanBuka] = useState('');
  const [catatanTutup, setCatatanTutup] = useState('');

  // Laporan kejadian form
  const [jenisKejadian, setJenisKejadian] = useState('');
  const [deskripsiKejadian, setDeskripsiKejadian] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hadBuka = checklistHariIni.some((c) => c.jenis === 'buka');
  const hadTutup = checklistHariIni.some((c) => c.jenis === 'tutup');

  const showMsg = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setErrorMsg(null);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
    }
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 4000);
  };

  const toggleChecklistItem = (type: 'buka' | 'tutup', id: string) => {
    if (type === 'buka') {
      setChecklistBuka(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    } else {
      setChecklistTutup(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
    }
  };

  const handleSaveChecklist = (jenis: 'buka' | 'tutup') => {
    const items = jenis === 'buka' ? checklistBuka : checklistTutup;
    const catatan = jenis === 'buka' ? catatanBuka : catatanTutup;
    const allChecked = items.every(i => i.checked);

    if (!allChecked) {
      showMsg('error', 'Harap centang semua item checklist sebelum menyimpan.');
      return;
    }

    startTransition(async () => {
      const result = await saveChecklistAction(jenis, items, catatan || undefined);
      if (result.success) {
        showMsg('success', `Checklist ${jenis === 'buka' ? 'pembukaan' : 'penutupan'} berhasil disimpan!`);
        router.refresh();
      } else {
        showMsg('error', 'Gagal menyimpan checklist.');
      }
    });
  };

  const handleSubmitKejadian = () => {
    if (!jenisKejadian || !deskripsiKejadian.trim()) {
      showMsg('error', 'Jenis kejadian dan deskripsi wajib diisi.');
      return;
    }

    startTransition(async () => {
      const result = await createLaporanKejadianAction({
        jenis_kejadian: jenisKejadian,
        deskripsi: deskripsiKejadian,
        tindak_lanjut: tindakLanjut || undefined,
      });
      if (result.success) {
        showMsg('success', 'Laporan kejadian berhasil disimpan.');
        setJenisKejadian('');
        setDeskripsiKejadian('');
        setTindakLanjut('');
        router.refresh();
      } else {
        showMsg('error', 'Gagal menyimpan laporan kejadian.');
      }
    });
  };

  const handleUpdateStatusKejadian = (id: number, status: 'baru' | 'ditindaklanjuti' | 'selesai') => {
    startTransition(async () => {
      await updateLaporanKejadianStatus(id, status);
      router.refresh();
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'baru': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'ditindaklanjuti': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'selesai': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const tabs = [
    { id: 'buka', label: 'Checklist Pembukaan', icon: ListChecks, done: hadBuka },
    { id: 'tutup', label: 'Checklist Penutupan', icon: ClipboardCheck, done: hadTutup },
    { id: 'kejadian', label: 'Laporan Kejadian', icon: FileWarning, count: laporanKejadian.filter(l => l.status === 'baru').length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/80 to-indigo-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl">
            <ClipboardList className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Operasional Harian</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${hadBuka ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {hadBuka ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              Buka
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${hadTutup ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {hadTutup ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              Tutup
            </div>
          </div>
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
                    ? 'text-indigo-400 bg-indigo-600/5'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {'done' in tab && tab.done && (
                  <span className="ml-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">OK</span>
                )}
                {'count' in tab && tab.count > 0 && (
                  <span className="ml-1 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* CHECKLIST BUKA */}
          {activeTab === 'buka' && (
            <div className="space-y-5">
              {hadBuka ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-emerald-400">Checklist Pembukaan Selesai</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Diisi oleh {checklistHariIni.find(c => c.jenis === 'buka')?.pengguna.nama} hari ini.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-4">Item Checklist Pembukaan Harian</h3>
                    <div className="space-y-2">
                      {checklistBuka.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem('buka', item.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                            item.checked
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                              : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            item.checked ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600'
                          }`}>
                            {item.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm font-medium ${item.checked ? 'line-through opacity-60' : ''}`}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={catatanBuka}
                      onChange={(e) => setCatatanBuka(e.target.value)}
                      rows={3}
                      placeholder="Catatan kondisi khusus, ketidaksesuaian, atau hal penting lainnya..."
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-500">
                      {checklistBuka.filter(i => i.checked).length}/{checklistBuka.length} item selesai
                    </p>
                    <button
                      onClick={() => handleSaveChecklist('buka')}
                      disabled={isPending}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Simpan Checklist Pembukaan
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHECKLIST TUTUP */}
          {activeTab === 'tutup' && (
            <div className="space-y-5">
              {hadTutup ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-emerald-400">Checklist Penutupan Selesai</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Diisi oleh {checklistHariIni.find(c => c.jenis === 'tutup')?.pengguna.nama} hari ini.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 mb-4">Item Checklist Penutupan Harian</h3>
                    <div className="space-y-2">
                      {checklistTutup.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem('tutup', item.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                            item.checked
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                              : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            item.checked ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600'
                          }`}>
                            {item.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm font-medium ${item.checked ? 'line-through opacity-60' : ''}`}>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={catatanTutup}
                      onChange={(e) => setCatatanTutup(e.target.value)}
                      rows={3}
                      placeholder="Catatan kondisi khusus, ringkasan kejadian hari ini..."
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-slate-500">
                      {checklistTutup.filter(i => i.checked).length}/{checklistTutup.length} item selesai
                    </p>
                    <button
                      onClick={() => handleSaveChecklist('tutup')}
                      disabled={isPending}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Simpan Checklist Penutupan
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* LAPORAN KEJADIAN */}
          {activeTab === 'kejadian' && (
            <div className="space-y-6">
              {/* Form Laporan Baru */}
              <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-400" />
                  Laporkan Kejadian Baru
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Jenis Kejadian *
                    </label>
                    <div className="relative">
                      <select
                        value={jenisKejadian}
                        onChange={(e) => setJenisKejadian(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih Jenis Kejadian --</option>
                        {JENIS_KEJADIAN_OPTIONS.map(j => (
                          <option key={j} value={j}>{j}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Tindak Lanjut (Opsional)
                    </label>
                    <input
                      type="text"
                      value={tindakLanjut}
                      onChange={(e) => setTindakLanjut(e.target.value)}
                      placeholder="Langkah tindak lanjut yang dilakukan..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Deskripsi Kejadian *
                  </label>
                  <textarea
                    value={deskripsiKejadian}
                    onChange={(e) => setDeskripsiKejadian(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan detail kejadian yang terjadi secara lengkap..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitKejadian}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-rose-700 hover:bg-rose-600 disabled:bg-rose-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
                  >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Simpan Laporan Kejadian
                  </button>
                </div>
              </div>

              {/* Riwayat Laporan Kejadian */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-4">Riwayat Laporan Kejadian</h3>
                {laporanKejadian.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 text-sm">
                    Belum ada laporan kejadian tercatat.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {laporanKejadian.map((laporan) => (
                      <div
                        key={laporan.id_kejadian}
                        className="bg-slate-950/30 border border-slate-800 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-100">{laporan.jenis_kejadian}</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusBadge(laporan.status)}`}>
                                {laporan.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{laporan.deskripsi}</p>
                            {laporan.tindak_lanjut && (
                              <p className="text-xs text-slate-500 italic">Tindak lanjut: {laporan.tindak_lanjut}</p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {laporan.pengguna.nama}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(laporan.tanggal).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                          {laporan.status !== 'selesai' && (
                            <div className="flex gap-2 shrink-0">
                              {laporan.status === 'baru' && (
                                <button
                                  onClick={() => handleUpdateStatusKejadian(laporan.id_kejadian, 'ditindaklanjuti')}
                                  disabled={isPending}
                                  className="text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Tindaklanjuti
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatusKejadian(laporan.id_kejadian, 'selesai')}
                                disabled={isPending}
                                className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Selesai
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
