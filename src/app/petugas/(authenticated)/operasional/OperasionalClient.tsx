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
  Edit3,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  waktu?: string | null;
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

  const getCurrentTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const savedBuka = checklistHariIni.find((c) => c.jenis === 'buka');
  const savedTutup = checklistHariIni.find((c) => c.jenis === 'tutup');

  const hadBuka = !!savedBuka;
  const hadTutup = !!savedTutup;

  const [isEditingBuka, setIsEditingBuka] = useState(false);
  const [isEditingTutup, setIsEditingTutup] = useState(false);

  const parsedBukaItems: ChecklistItem[] = (() => {
    if (!savedBuka?.item_checklist) return [];
    try {
      return JSON.parse(savedBuka.item_checklist);
    } catch {
      return [];
    }
  })();

  const parsedTutupItems: ChecklistItem[] = (() => {
    if (!savedTutup?.item_checklist) return [];
    try {
      return JSON.parse(savedTutup.item_checklist);
    } catch {
      return [];
    }
  })();

  const [checklistBuka, setChecklistBuka] = useState<ChecklistItem[]>(() => {
    if (parsedBukaItems.length > 0) {
      return parsedBukaItems;
    }
    return CHECKLIST_BUKA.map(item => ({ ...item, checked: false, waktu: null }));
  });

  const [checklistTutup, setChecklistTutup] = useState<ChecklistItem[]>(() => {
    if (parsedTutupItems.length > 0) {
      return parsedTutupItems;
    }
    return CHECKLIST_TUTUP.map(item => ({ ...item, checked: false, waktu: null }));
  });

  const [catatanBuka, setCatatanBuka] = useState(savedBuka?.catatan || '');
  const [catatanTutup, setCatatanTutup] = useState(savedTutup?.catatan || '');

  // Laporan kejadian form
  const [jenisKejadian, setJenisKejadian] = useState('');
  const [deskripsiKejadian, setDeskripsiKejadian] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showMsg = (type: 'success' | 'error', msg: string) => {
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
    }, 4000);
  };

  const toggleChecklistItem = (jenis: 'buka' | 'tutup', id: string) => {
    const setter = jenis === 'buka' ? setChecklistBuka : setChecklistTutup;
    setter(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nextChecked = !item.checked;
        return {
          ...item,
          checked: nextChecked,
          waktu: nextChecked ? (item.waktu || getCurrentTimeString()) : null,
        };
      })
    );
  };

  const handleTimeChange = (jenis: 'buka' | 'tutup', id: string, newTime: string) => {
    const setter = jenis === 'buka' ? setChecklistBuka : setChecklistTutup;
    setter(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          waktu: newTime,
        };
      })
    );
  };

  const handleSaveChecklist = (jenis: 'buka' | 'tutup') => {
    const items = jenis === 'buka' ? checklistBuka : checklistTutup;
    const catatan = jenis === 'buka' ? catatanBuka : catatanTutup;

    startTransition(async () => {
      const result = await saveChecklistAction(jenis, items, catatan || undefined);

      if (result.success) {
        showMsg('success', `Checklist ${jenis === 'buka' ? 'pembukaan' : 'penutupan'} berhasil disimpan!`);
        if (jenis === 'buka') setIsEditingBuka(false);
        if (jenis === 'tutup') setIsEditingTutup(false);
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
      case 'baru': return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      case 'ditindaklanjuti': return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'selesai': return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const tabs = [
    { id: 'buka', label: 'Checklist Pembukaan', icon: ListChecks, done: hadBuka },
    { id: 'tutup', label: 'Checklist Penutupan', icon: ClipboardCheck, done: hadTutup },
    { id: 'kejadian', label: 'Laporan Kejadian', icon: FileWarning, count: laporanKejadian.filter(l => l.status === 'baru').length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-7 border transition-all duration-200 bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-100/40 border-indigo-200/80 shadow-xs dark:from-slate-900/80 dark:via-indigo-950/40 dark:to-slate-900/80 dark:border-indigo-500/20 dark:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl dark:bg-indigo-600/20 dark:border-indigo-500/30 dark:text-indigo-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Operasional Harian</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              hadBuka 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}>
              {hadBuka ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
              <span>Buka</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              hadTutup 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
            }`}>
              {hadTutup ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Circle className="w-3.5 h-3.5" />}
              <span>Tutup</span>
            </div>
          </div>
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

      {/* Tabs Card */}
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
                    ? 'text-indigo-700 bg-indigo-50/70 dark:text-indigo-400 dark:bg-indigo-600/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {'done' in tab && tab.done && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">OK</span>
                )}
                {'count' in tab && tab.count > 0 && (
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">{tab.count}</span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-7">
          {/* CHECKLIST BUKA */}
          {activeTab === 'buka' && (
            <div className="space-y-6">
              {hadBuka && !isEditingBuka ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="rounded-2xl p-6 border transition-all bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-emerald-200 shadow-xs dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 dark:border-emerald-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                              Checklist Pembukaan Selesai
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-300">
                              Hari Ini
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span>Diisi oleh <strong className="text-slate-800 dark:text-slate-200">{savedBuka?.pengguna?.nama}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{savedBuka?.tanggal ? new Date(savedBuka.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari ini'}</span>
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setChecklistBuka(parsedBukaItems.length > 0 ? parsedBukaItems : CHECKLIST_BUKA.map(i => ({ ...i, checked: false, waktu: null })));
                          setCatatanBuka(savedBuka?.catatan || '');
                          setIsEditingBuka(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 dark:bg-slate-900 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Checklist</span>
                      </button>
                    </div>
                  </div>

                  {/* List Item & Waktu Diceklis */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                        Rincian Item Pengecekan &amp; Waktu Pelaksanaan
                      </h4>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                        {parsedBukaItems.filter(i => i.checked).length} dari {parsedBukaItems.length} item selesai
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {parsedBukaItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                            item.checked
                              ? 'bg-white border-slate-200 shadow-xs dark:bg-slate-950/40 dark:border-slate-800'
                              : 'bg-slate-50/60 border-slate-200/60 opacity-60 dark:bg-slate-950/20 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              item.checked
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                                : 'border-2 border-slate-300 dark:border-slate-600'
                            }`}>
                              {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${item.checked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center pl-8 sm:pl-0">
                            {item.checked ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300 text-xs font-bold">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Pukul {item.waktu ? `${item.waktu} WIB` : 'Selesai'}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Tidak diceklis</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan jika ada */}
                  {savedBuka?.catatan && (
                    <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Catatan Tambahan Petugas
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed whitespace-pre-line">
                        &ldquo;{savedBuka.catatan}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {isEditingBuka && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300 text-xs">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span><strong>Mode Pengeditan:</strong> Anda sedang memperbarui data checklist pembukaan hari ini.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingBuka(false)}
                        className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 hover:underline cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                      <div>
                        <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                          Item Checklist Pembukaan Harian
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Centang setiap tugas yang telah dilakukan. Waktu selesai otomatis tercatat dan dapat disesuaikan.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {checklistBuka.map((item) => (
                        <div
                          key={item.id}
                          className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
                            item.checked
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                              : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-950/30 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem('buka', item.id)}
                            className="flex items-center gap-3.5 flex-1 text-left cursor-pointer focus:outline-none"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                item.checked 
                                  ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-400' 
                                  : 'border-slate-400 dark:border-slate-600'
                              }`}
                            >
                              {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span
                              className={`text-sm font-medium leading-relaxed ${
                                item.checked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {item.label}
                            </span>
                          </button>

                          {item.checked && (
                            <div
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white border-emerald-200 shadow-xs dark:bg-slate-900 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 self-end sm:self-center shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pukul</span>
                              <input
                                type="time"
                                value={item.waktu || getCurrentTimeString()}
                                onChange={(e) => handleTimeChange('buka', item.id, e.target.value)}
                                className="text-xs font-bold bg-transparent outline-none text-emerald-950 dark:text-emerald-200 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                                title="Sesuaikan waktu diceklis"
                              />
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">WIB</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={catatanBuka}
                      onChange={(e) => setCatatanBuka(e.target.value)}
                      rows={3}
                      placeholder="Catatan kondisi khusus, ketidaksesuaian, atau hal penting lainnya..."
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/50 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-900 dark:focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {checklistBuka.filter(i => i.checked).length}/{checklistBuka.length} item selesai
                    </p>
                    <div className="flex items-center gap-2">
                      {isEditingBuka && (
                        <button
                          type="button"
                          onClick={() => setIsEditingBuka(false)}
                          disabled={isPending}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSaveChecklist('buka')}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                      >
                        {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{isEditingBuka ? 'Perbarui Checklist Pembukaan' : 'Simpan Checklist Pembukaan'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHECKLIST TUTUP */}
          {activeTab === 'tutup' && (
            <div className="space-y-6">
              {hadTutup && !isEditingTutup ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="rounded-2xl p-6 border transition-all bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border-emerald-200 shadow-xs dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 dark:border-emerald-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                              Checklist Penutupan Selesai
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-300">
                              Hari Ini
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span>Diisi oleh <strong className="text-slate-800 dark:text-slate-200">{savedTutup?.pengguna?.nama}</strong></span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{savedTutup?.tanggal ? new Date(savedTutup.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari ini'}</span>
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setChecklistTutup(parsedTutupItems.length > 0 ? parsedTutupItems : CHECKLIST_TUTUP.map(i => ({ ...i, checked: false, waktu: null })));
                          setCatatanTutup(savedTutup?.catatan || '');
                          setIsEditingTutup(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 dark:bg-slate-900 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ubah Checklist</span>
                      </button>
                    </div>
                  </div>

                  {/* List Item & Waktu Diceklis */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                        Rincian Item Pengecekan &amp; Waktu Pelaksanaan
                      </h4>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                        {parsedTutupItems.filter(i => i.checked).length} dari {parsedTutupItems.length} item selesai
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {parsedTutupItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                            item.checked
                              ? 'bg-white border-slate-200 shadow-xs dark:bg-slate-950/40 dark:border-slate-800'
                              : 'bg-slate-50/60 border-slate-200/60 opacity-60 dark:bg-slate-950/20 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              item.checked
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                                : 'border-2 border-slate-300 dark:border-slate-600'
                            }`}>
                              {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${item.checked ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center pl-8 sm:pl-0">
                            {item.checked ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300 text-xs font-bold">
                                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Pukul {item.waktu ? `${item.waktu} WIB` : 'Selesai'}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Tidak diceklis</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan jika ada */}
                  {savedTutup?.catatan && (
                    <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Catatan Tambahan Petugas
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed whitespace-pre-line">
                        &ldquo;{savedTutup.catatan}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {isEditingTutup && (
                    <div className="flex items-center justify-between p-3.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300 text-xs">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span><strong>Mode Pengeditan:</strong> Anda sedang memperbarui data checklist penutupan hari ini.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingTutup(false)}
                        className="flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100 hover:underline cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                      <div>
                        <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                          Item Checklist Penutupan Harian
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Centang setiap tugas penutupan yang telah dilakukan. Waktu selesai otomatis tercatat dan dapat disesuaikan.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {checklistTutup.map((item) => (
                        <div
                          key={item.id}
                          className={`w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
                            item.checked
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                              : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-950/30 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem('tutup', item.id)}
                            className="flex items-center gap-3.5 flex-1 text-left cursor-pointer focus:outline-none"
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                item.checked 
                                  ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-400' 
                                  : 'border-slate-400 dark:border-slate-600'
                              }`}
                            >
                              {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span
                              className={`text-sm font-medium leading-relaxed ${
                                item.checked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {item.label}
                            </span>
                          </button>

                          {item.checked && (
                            <div
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-white border-emerald-200 shadow-xs dark:bg-slate-900 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 self-end sm:self-center shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pukul</span>
                              <input
                                type="time"
                                value={item.waktu || getCurrentTimeString()}
                                onChange={(e) => handleTimeChange('tutup', item.id, e.target.value)}
                                className="text-xs font-bold bg-transparent outline-none text-emerald-950 dark:text-emerald-200 cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                                title="Sesuaikan waktu diceklis"
                              />
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">WIB</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      value={catatanTutup}
                      onChange={(e) => setCatatanTutup(e.target.value)}
                      rows={3}
                      placeholder="Catatan kondisi khusus, ringkasan kejadian hari ini..."
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/50 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-900 dark:focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {checklistTutup.filter(i => i.checked).length}/{checklistTutup.length} item selesai
                    </p>
                    <div className="flex items-center gap-2">
                      {isEditingTutup && (
                        <button
                          type="button"
                          onClick={() => setIsEditingTutup(false)}
                          disabled={isPending}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSaveChecklist('tutup')}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                      >
                        {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{isEditingTutup ? 'Perbarui Checklist Penutupan' : 'Simpan Checklist Penutupan'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* LAPORAN KEJADIAN */}
          {activeTab === 'kejadian' && (
            <div className="space-y-6">
              {/* Form Laporan Baru */}
              <div className="rounded-2xl p-6 border transition-all bg-slate-50/70 border-slate-200 dark:bg-slate-950/30 dark:border-slate-800 space-y-4">
                <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Plus className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Laporkan Kejadian Baru</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                      Jenis Kejadian *
                    </label>
                    <div className="relative">
                      <select
                        value={jenisKejadian}
                        onChange={(e) => setJenisKejadian(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition appearance-none cursor-pointer bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:focus:bg-slate-950"
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
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                      Tindak Lanjut (Opsional)
                    </label>
                    <input
                      type="text"
                      value={tindakLanjut}
                      onChange={(e) => setTindakLanjut(e.target.value)}
                      placeholder="Langkah tindak lanjut yang dilakukan..."
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-950"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-700 dark:text-slate-400">
                    Deskripsi Kejadian *
                  </label>
                  <textarea
                    value={deskripsiKejadian}
                    onChange={(e) => setDeskripsiKejadian(e.target.value)}
                    rows={3}
                    placeholder="Jelaskan detail kejadian yang terjadi secara lengkap..."
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:bg-slate-950 resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitKejadian}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 dark:disabled:bg-rose-900 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
                  >
                    {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Simpan Laporan Kejadian</span>
                  </button>
                </div>
              </div>

              {/* Riwayat Laporan Kejadian */}
              <div>
                <h3 className="text-base font-extrabold tracking-tight mb-4 text-slate-900 dark:text-slate-100">Riwayat Laporan Kejadian</h3>
                {laporanKejadian.length === 0 ? (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400 text-sm">
                    Belum ada laporan kejadian tercatat.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {laporanKejadian.map((laporan) => (
                      <div
                        key={laporan.id_kejadian}
                        className="rounded-2xl p-5 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-950/30 dark:border-slate-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{laporan.jenis_kejadian}</span>
                              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusBadge(laporan.status)}`}>
                                {laporan.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{laporan.deskripsi}</p>
                            {laporan.tindak_lanjut && (
                              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium italic">Tindak lanjut: {laporan.tindak_lanjut}</p>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                              <span className="flex items-center gap-1 font-medium">
                                <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <span>{laporan.pengguna?.nama}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <span>{new Date(laporan.tanggal).toLocaleString('id-ID')}</span>
                              </span>
                            </div>
                          </div>
                          {laporan.status !== 'selesai' && (
                            <div className="flex gap-2 shrink-0">
                              {laporan.status === 'baru' && (
                                <button
                                  onClick={() => handleUpdateStatusKejadian(laporan.id_kejadian, 'ditindaklanjuti')}
                                  disabled={isPending}
                                  className="text-xs font-bold px-3 py-1 rounded-xl transition-colors border bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:border-amber-500/20 disabled:opacity-50 cursor-pointer"
                                >
                                  Tindaklanjuti
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatusKejadian(laporan.id_kejadian, 'selesai')}
                                disabled={isPending}
                                className="text-xs font-bold px-3 py-1 rounded-xl transition-colors border bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:border-emerald-500/20 disabled:opacity-50 cursor-pointer"
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
