'use client';

import { useState, useTransition } from 'react';
import { updatePolicyAction } from '@/lib/actions';
import {
  Settings,
  Activity,
  Users,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  X,
  Shield,
  Clock,
  UserCheck2,
  UserX,
  BookOpen,
  Coins,
  Timer,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  currentUser: any;
  parameters: any[];
  logAktivitas: any[];
  pengguna: any[];
}

const PARAMETER_ICONS: Record<string, any> = {
  batas_pinjam: BookOpen,
  lama_pinjam_umum: Timer,
  lama_pinjam_referensi: Timer,
  tarif_denda_harian: Coins,
};

const PARAMETER_LABELS: Record<string, string> = {
  batas_pinjam: 'Batas Peminjaman Maksimal',
  lama_pinjam_umum: 'Durasi Pinjam Buku Umum (hari)',
  lama_pinjam_referensi: 'Durasi Pinjam Buku Referensi (hari)',
  tarif_denda_harian: 'Tarif Denda Keterlambatan (Rp/hari)',
};

export default function SettingsClient({
  currentUser,
  parameters,
  logAktivitas,
  pengguna,
}: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<'kebijakan' | 'log' | 'pengguna'>('kebijakan');
  const [editingParam, setEditingParam] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [logSearch, setLogSearch] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = currentUser?.peran === 'admin';

  const showMsg = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccessMsg(msg); setErrorMsg(null); }
    else { setErrorMsg(msg); setSuccessMsg(null); }
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 4000);
  };

  const handleStartEdit = (param: any) => {
    setEditingParam(param.id_parameter);
    setEditValue(param.nilai);
    setEditKeterangan(param.keterangan || '');
  };

  const handleCancelEdit = () => {
    setEditingParam(null);
    setEditValue('');
    setEditKeterangan('');
  };

  const handleSaveParam = (id: number) => {
    if (!editValue.trim()) {
      showMsg('error', 'Nilai parameter tidak boleh kosong.');
      return;
    }
    startTransition(async () => {
      try {
        const result = await updatePolicyAction(id, editValue.trim(), editKeterangan.trim() || undefined);
        if (result.success) {
          showMsg('success', 'Parameter kebijakan berhasil diperbarui.');
          setEditingParam(null);
          router.refresh();
        }
      } catch (err: any) {
        showMsg('error', err.message || 'Gagal memperbarui parameter.');
      }
    });
  };

  const filteredLogs = logAktivitas.filter(log =>
    logSearch === '' ||
    log.aktivitas.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.pengguna.nama.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.tabel_terdampak.toLowerCase().includes(logSearch.toLowerCase())
  );

  const getRoleBadge = (peran: string) => {
    switch (peran) {
      case 'admin': return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20';
      case 'kepala_perpustakaan': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
      case 'petugas': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getRoleLabel = (peran: string) => {
    switch (peran) {
      case 'admin': return 'Administrator';
      case 'kepala_perpustakaan': return 'Kepala Perpustakaan';
      case 'petugas': return 'Petugas Layanan';
      default: return peran;
    }
  };

  const tabs = [
    { id: 'kebijakan', label: 'Parameter Kebijakan', icon: SlidersHorizontal },
    { id: 'log', label: 'Log Aktivitas', icon: Activity, count: logAktivitas.length },
    { id: 'pengguna', label: 'Manajemen Pengguna', icon: Users, count: pengguna.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-7 border transition-all duration-200 bg-gradient-to-r from-slate-100 via-indigo-50/50 to-slate-100 border-slate-200/80 shadow-xs dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-900/80 dark:border-slate-700/40 dark:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl border transition-all bg-white border-slate-200 text-slate-700 shadow-xs dark:bg-slate-700/50 dark:border-slate-600/40 dark:text-slate-300">
              <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Pengaturan &amp; Log Sistem</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Konfigurasi kebijakan perpustakaan, audit trail aktivitas, dan akun pengguna.
              </p>
            </div>
          </div>
          {!isAdmin && (
            <div className="sm:ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400">
              <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Edit Kebijakan: Admin Only</span>
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
                    ? 'text-indigo-700 bg-indigo-50/70 font-bold dark:text-slate-100 dark:bg-slate-800/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {'count' in tab && (
                  <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                    {tab.count}
                  </span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-7">
          {/* TAB: KEBIJAKAN */}
          {activeTab === 'kebijakan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Parameter Kebijakan Sistem</h3>
                {!isAdmin && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">* Hanya Admin yang dapat mengubah parameter ini</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parameters.map((param) => {
                  const Icon = PARAMETER_ICONS[param.nama_parameter] || SlidersHorizontal;
                  const label = PARAMETER_LABELS[param.nama_parameter] || param.nama_parameter;
                  const isEditing = editingParam === param.id_parameter;

                  return (
                    <div
                      key={param.id_parameter}
                      className={`rounded-2xl p-5 border transition-all ${
                        isEditing 
                          ? 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-950/20' 
                          : 'bg-slate-50/80 border-slate-200 shadow-xs dark:bg-slate-950/30 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl border bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 shadow-xs">
                            <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{label}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{param.nama_parameter}</p>
                          </div>
                        </div>
                        {isAdmin && !isEditing && (
                          <button
                            onClick={() => handleStartEdit(param)}
                            className="p-1.5 rounded-lg transition-all text-slate-400 hover:text-indigo-700 hover:bg-indigo-100/70 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 cursor-pointer"
                            title="Ubah parameter"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3 pt-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border transition bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            placeholder="Keterangan (opsional)"
                            className="w-full rounded-xl px-3.5 py-2 text-xs outline-none border transition bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:placeholder:text-slate-600"
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleSaveParam(param.id_parameter)}
                              disabled={isPending}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                              {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                              <span>Simpan</span>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1.5 rounded-xl border text-xs font-semibold px-3.5 py-2 transition-all bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Batal</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                              {param.nama_parameter === 'tarif_denda_harian'
                                ? `Rp ${Number(param.nilai).toLocaleString('id-ID')}`
                                : param.nilai}
                            </span>
                            {param.nama_parameter !== 'tarif_denda_harian' && (
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {param.nama_parameter.includes('lama_pinjam') ? 'hari' : param.nama_parameter === 'batas_pinjam' ? 'buku' : ''}
                              </span>
                            )}
                          </div>
                          {param.keterangan && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{param.keterangan}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: LOG AKTIVITAS */}
          {activeTab === 'log' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Audit Trail — Log Aktivitas Sistem</h3>
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Cari aktivitas atau pengguna..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                  <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Pengguna</th>
                      <th className="px-4 py-3">Aktivitas</th>
                      <th className="px-4 py-3">Tabel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400 font-medium">
                          {logSearch ? 'Tidak ada log yang cocok dengan pencarian.' : 'Belum ada log aktivitas.'}
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id_log} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3.5 text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>{new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full border flex items-center justify-center bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                <UserCheck2 className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{log.pengguna.nama}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{log.pengguna.peran}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-800 dark:text-slate-200 font-medium max-w-xs">{log.aktivitas}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-transparent">
                              {log.tabel_terdampak}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filteredLogs.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-right">Menampilkan {filteredLogs.length} dari {logAktivitas.length} log terbaru</p>
              )}
            </div>
          )}

          {/* TAB: MANAJEMEN PENGGUNA */}
          {activeTab === 'pengguna' && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daftar Pengguna Sistem</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
                  <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Peran</th>
                      <th className="px-4 py-3">Terdaftar</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {pengguna.map((p) => (
                      <tr key={p.id_pengguna} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                              {p.nama.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{p.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs text-indigo-600 dark:text-indigo-400">@{p.username}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getRoleBadge(p.peran)}`}>
                            {getRoleLabel(p.peran)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                          {new Date(p.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3.5">
                          {p.status_aktif ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                              <UserCheck2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Aktif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30">
                              <UserX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>Nonaktif</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isAdmin && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
                  Untuk menambah, mengubah, atau menonaktifkan pengguna, hubungi Administrator sistem.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
