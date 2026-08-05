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
      case 'admin': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'kepala_perpustakaan': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'petugas': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-700 text-slate-400 border-slate-600';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/60 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-700/50 border border-slate-600/40 rounded-xl">
            <Settings className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Pengaturan & Log Sistem</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Konfigurasi kebijakan perpustakaan, audit trail aktivitas, dan manajemen akun pengguna
            </p>
          </div>
          {!isAdmin && (
            <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-amber-950/30 border border-amber-800/40 rounded-xl">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold">Edit Kebijakan: Admin Only</span>
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
                    ? 'text-slate-200 bg-slate-800/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {'count' in tab && (
                  <span className="ml-1 text-[10px] font-bold bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-400 rounded-t-full" />}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* TAB: KEBIJAKAN */}
          {activeTab === 'kebijakan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200">Parameter Kebijakan Sistem</h3>
                {!isAdmin && (
                  <p className="text-xs text-slate-500">* Hanya Admin yang dapat mengubah parameter ini</p>
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
                      className={`bg-slate-950/30 border rounded-xl p-5 transition-all ${
                        isEditing ? 'border-indigo-500/40 bg-indigo-950/10' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-800 rounded-lg">
                            <Icon className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{label}</h4>
                            <p className="text-xs text-slate-500 font-mono">{param.nama_parameter}</p>
                          </div>
                        </div>
                        {isAdmin && !isEditing && (
                          <button
                            onClick={() => handleStartEdit(param)}
                            className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-slate-900 border border-indigo-500/40 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editKeterangan}
                            onChange={(e) => setEditKeterangan(e.target.value)}
                            placeholder="Keterangan (opsional)"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveParam(param.id_parameter)}
                              disabled={isPending}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            >
                              {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                              Simpan
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            >
                              <X className="w-3 h-3" />
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-indigo-400">
                              {param.nama_parameter === 'tarif_denda_harian'
                                ? `Rp ${Number(param.nilai).toLocaleString('id-ID')}`
                                : param.nilai}
                            </span>
                            {param.nama_parameter !== 'tarif_denda_harian' && (
                              <span className="text-xs text-slate-500">
                                {param.nama_parameter.includes('lama_pinjam') ? 'hari' : param.nama_parameter === 'batas_pinjam' ? 'buku' : ''}
                              </span>
                            )}
                          </div>
                          {param.keterangan && (
                            <p className="text-xs text-slate-500 mt-1">{param.keterangan}</p>
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
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-bold text-slate-200 flex-1">Audit Trail — Log Aktivitas Sistem</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Cari aktivitas..."
                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/30">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Pengguna</th>
                      <th className="px-4 py-3">Aktivitas</th>
                      <th className="px-4 py-3">Tabel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-slate-600">
                          {logSearch ? 'Tidak ada log yang cocok dengan pencarian.' : 'Belum ada log aktivitas.'}
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id_log} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                                <UserCheck2 className="w-3 h-3 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-300">{log.pengguna.nama}</p>
                                <p className="text-[10px] text-slate-600">{log.pengguna.peran}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300 max-w-xs">{log.aktivitas}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
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
                <p className="text-xs text-slate-600 text-right">Menampilkan {filteredLogs.length} dari {logAktivitas.length} log terbaru</p>
              )}
            </div>
          )}

          {/* TAB: MANAJEMEN PENGGUNA */}
          {activeTab === 'pengguna' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200">Daftar Pengguna Sistem</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm text-left text-slate-400">
                  <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/30">
                    <tr>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Peran</th>
                      <th className="px-4 py-3">Terdaftar</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengguna.map((p) => (
                      <tr key={p.id_pengguna} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
                              {p.nama.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-200">{p.nama}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">@{p.username}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRoleBadge(p.peran)}`}>
                            {getRoleLabel(p.peran)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {new Date(p.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          {p.status_aktif ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                              <UserCheck2 className="w-3.5 h-3.5" />
                              <span className="font-semibold">Aktif</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-rose-400">
                              <UserX className="w-3.5 h-3.5" />
                              <span className="font-semibold">Nonaktif</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isAdmin && (
                <p className="text-xs text-slate-600 text-center pt-2">
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
