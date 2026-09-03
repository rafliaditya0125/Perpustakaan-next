'use client';

import { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  UserCheck, 
  UserX, 
  Edit, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createMemberAction, updateMemberAction } from '@/lib/actions';

interface MembersClientProps {
  members: any[];
}

export default function MembersClient({ members }: MembersClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [noIdentitas, setNoIdentitas] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisAnggota, setJenisAnggota] = useState<'siswa' | 'mahasiswa' | 'guru_dosen' | 'umum'>('siswa');
  const [statusAktif, setStatusAktif] = useState(true);

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
    }, 4000);
  };

  const resetForm = () => {
    setNama('');
    setNoIdentitas('');
    setEmail('');
    setNoTelepon('');
    setAlamat('');
    setJenisAnggota('siswa');
    setStatusAktif(true);
  };

  const startEdit = (m: any) => {
    setEditingMember(m);
    setNama(m.nama);
    setNoIdentitas(m.no_identitas);
    setEmail(m.email || '');
    setNoTelepon(m.no_telepon || '');
    setAlamat(m.alamat || '');
    setJenisAnggota(m.jenis_anggota);
    setStatusAktif(m.status_aktif);
    setShowAddForm(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMemberAction({
        nama,
        no_identitas: noIdentitas,
        email: email || undefined,
        no_telepon: noTelepon || undefined,
        alamat: alamat || undefined,
        jenis_anggota: jenisAnggota,
      });
      triggerNotify('success', 'Anggota baru berhasil didaftarkan!');
      setShowAddForm(false);
      resetForm();
      router.refresh();
    } catch {
      triggerNotify('error', 'Gagal mendaftarkan anggota. Nomor Identitas mungkin sudah terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setLoading(true);
    try {
      await updateMemberAction(editingMember.id_anggota, {
        nama,
        no_identitas: noIdentitas,
        email: email || undefined,
        no_telepon: noTelepon || undefined,
        alamat: alamat || undefined,
        jenis_anggota: jenisAnggota,
        status_aktif: statusAktif,
      });
      triggerNotify('success', 'Data anggota berhasil diperbarui!');
      setEditingMember(null);
      resetForm();
      router.refresh();
    } catch {
      triggerNotify('error', 'Gagal memperbarui data anggota.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusDirectly = async (m: any) => {
    setLoading(true);
    try {
      await updateMemberAction(m.id_anggota, {
        nama: m.nama,
        no_identitas: m.no_identitas,
        email: m.email || undefined,
        no_telepon: m.no_telepon || undefined,
        alamat: m.alamat || undefined,
        jenis_anggota: m.jenis_anggota,
        status_aktif: !m.status_aktif,
      });
      triggerNotify('success', `Status anggota ${m.nama} berhasil diubah!`);
      router.refresh();
    } catch {
      triggerNotify('error', 'Gagal mengubah status anggota.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.no_identitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Manajemen Anggota</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Kelola data keanggotaan siswa, guru, dosen, dan umum.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingMember(null);
            resetForm();
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Anggota</span>
        </button>
      </div>

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

      {/* Add / Edit Form Modal */}
      {(showAddForm || editingMember) && (
        <div className="rounded-2xl p-6 sm:p-7 border relative max-w-3xl transition-all bg-white border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
          <button 
            onClick={() => {
              setShowAddForm(false);
              setEditingMember(null);
            }}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
            {showAddForm ? 'Formulir Tambah Anggota' : `Formulir Edit Anggota: ${editingMember.nama}`}
          </h2>

          <form onSubmit={showAddForm ? handleAddSubmit : handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap..."
                value={nama}
                onChange={e => setNama(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>

            {/* No. Identitas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">No. Identitas (NISN / NIP / NIK)</label>
              <input
                type="text"
                placeholder="Masukkan nomor identitas unik..."
                value={noIdentitas}
                onChange={e => setNoIdentitas(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Email</label>
              <input
                type="email"
                placeholder="Alamat surel (opsional)..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>

            {/* No. Telepon */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">No. Telepon / WA</label>
              <input
                type="text"
                placeholder="Nomor HP aktif..."
                value={noTelepon}
                onChange={e => setNoTelepon(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>

            {/* Jenis Anggota */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Kategori Anggota</label>
              <select
                value={jenisAnggota}
                onChange={e => setJenisAnggota(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 cursor-pointer"
              >
                <option value="siswa">Siswa</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="guru_dosen">Guru / Dosen</option>
                <option value="umum">Umum</option>
              </select>
            </div>

            {/* Status Aktif (only edit) */}
            {editingMember && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Status Keaktifan</label>
                <select
                  value={statusAktif ? 'aktif' : 'nonaktif'}
                  onChange={e => setStatusAktif(e.target.value === 'aktif')}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 cursor-pointer"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif / Blokir</option>
                </select>
              </div>
            )}

            {/* Alamat */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Alamat Domisili</label>
              <textarea
                rows={2}
                placeholder="Masukkan alamat tinggal saat ini..."
                value={alamat}
                onChange={e => setAlamat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMember(null);
                }}
                className="px-5 py-2.5 rounded-xl border text-xs font-semibold transition-colors bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & List table card */}
      <div className="rounded-2xl p-6 sm:p-7 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Daftar Anggota Terdaftar</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, identitas, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
            />
          </div>
        </div>

        {/* Table data */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
            <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3">No. Identitas</th>
                <th scope="col" className="px-4 py-3">Nama Lengkap</th>
                <th scope="col" className="px-4 py-3">Kategori</th>
                <th scope="col" className="px-4 py-3">Kontak &amp; Alamat</th>
                <th scope="col" className="px-4 py-3">Tgl Daftar</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">Tidak ada data anggota ditemukan.</td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id_anggota} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{m.no_identitas}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">{m.nama}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-500/20 dark:text-indigo-300">
                        {m.jenis_anggota}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs space-y-0.5">
                      <p className="text-slate-900 dark:text-slate-300">{m.email || '-'}</p>
                      <p className="text-slate-500 dark:text-slate-400">{m.no_telepon || '-'}</p>
                      <p className="text-slate-400 dark:text-slate-500 max-w-xs truncate text-[11px]" title={m.alamat}>{m.alamat || '-'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{new Date(m.tanggal_daftar).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleStatusDirectly(m)}
                        disabled={loading}
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 transition-all border cursor-pointer ${
                          m.status_aktif 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/25' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/25'
                        }`}
                        title={m.status_aktif ? 'Status: Aktif (Klik untuk menonaktifkan)' : 'Status: Nonaktif (Klik untuk mengaktifkan)'}
                      >
                        {m.status_aktif ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => startEdit(m)}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        title="Edit data anggota"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
