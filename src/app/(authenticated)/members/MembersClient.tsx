'use client';

import { useState } from 'react';
import { createMemberAction, updateMemberAction } from '@/lib/actions';
import { 
  UserPlus, 
  Edit, 
  Search, 
  UserCheck, 
  UserX,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MembersClientProps {
  members: any[];
}

export default function MembersClient({ members }: MembersClientProps) {
  const router = useRouter();

  // Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // Form inputs
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
    }, 5000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !noIdentitas) return;
    setLoading(true);

    try {
      const res = await createMemberAction({
        nama,
        no_identitas: noIdentitas,
        email: email || undefined,
        no_telepon: noTelepon || undefined,
        alamat: alamat || undefined,
        jenis_anggota: jenisAnggota,
      });

      if (res?.error) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Anggota berhasil ditambahkan!');
        setNama('');
        setNoIdentitas('');
        setEmail('');
        setNoTelepon('');
        setAlamat('');
        setJenisAnggota('siswa');
        setShowAddForm(false);
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal menambahkan anggota.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !nama || !noIdentitas) return;
    setLoading(true);

    try {
      const res = await updateMemberAction(editingMember.id_anggota, {
        nama,
        no_identitas: noIdentitas,
        email: email || undefined,
        no_telepon: noTelepon || undefined,
        alamat: alamat || undefined,
        jenis_anggota: jenisAnggota,
        status_aktif: statusAktif,
      });

      if (res && 'error' in res && res.error) {
        triggerNotify('error', res.error as string);
      } else {
        triggerNotify('success', 'Data anggota berhasil diperbarui!');
        setEditingMember(null);
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal memperbarui data anggota.');
    } finally {
      setLoading(false);
    }
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

  const toggleStatusDirectly = async (m: any) => {
    setLoading(true);
    try {
      const res = await updateMemberAction(m.id_anggota, {
        nama: m.nama,
        no_identitas: m.no_identitas,
        email: m.email || undefined,
        no_telepon: m.no_telepon || undefined,
        alamat: m.alamat || undefined,
        jenis_anggota: m.jenis_anggota,
        status_aktif: !m.status_aktif,
      });

      if (res && 'error' in res && res.error) {
        triggerNotify('error', res.error as string);
      } else {
        triggerNotify('success', `Anggota ${m.nama} berhasil ${!m.status_aktif ? 'diaktifkan' : 'dinonaktifkan'}.`);
        router.refresh();
      }
    } catch (err) {
      triggerNotify('error', 'Gagal mengubah status aktif anggota.');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Manajemen Keanggotaan</h1>
          <p className="text-xs text-slate-400 mt-1">Daftarkan dan kelola data status keanggotaan perpustakaan.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingMember(null);
            setNama('');
            setNoIdentitas('');
            setEmail('');
            setNoTelepon('');
            setAlamat('');
            setJenisAnggota('siswa');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Anggota Baru</span>
        </button>
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

      {/* Add / Edit Form Modal representation */}
      {(showAddForm || editingMember) && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative max-w-3xl">
          <button 
            onClick={() => {
              setShowAddForm(false);
              setEditingMember(null);
            }}
            className="absolute right-4 top-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-md font-bold text-slate-100 mb-4">
            {showAddForm ? 'Formulir Tambah Anggota' : `Formulir Edit Anggota: ${editingMember.nama}`}
          </h2>

          <form onSubmit={showAddForm ? handleAddSubmit : handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap..."
                value={nama}
                onChange={e => setNama(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"
              />
            </div>

            {/* No. Identitas */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">No. Identitas (NISN / NIP / NIK)</label>
              <input
                type="text"
                placeholder="Masukkan nomor identitas unik..."
                value={noIdentitas}
                onChange={e => setNoIdentitas(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email</label>
              <input
                type="email"
                placeholder="Alamat surel (opsional)..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"
              />
            </div>

            {/* No. Telepon */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">No. Telepon / WA</label>
              <input
                type="text"
                placeholder="Nomor HP aktif..."
                value={noTelepon}
                onChange={e => setNoTelepon(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"
              />
            </div>

            {/* Jenis Anggota */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Kategori Anggota</label>
              <select
                value={jenisAnggota}
                onChange={e => setJenisAnggota(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"
              >
                <option value="siswa">Siswa</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="guru_dosen">Guru / Dosen</option>
                <option value="umum">Umum</option>
              </select>
            </div>

            {/* Status Aktif (only edit) */}
            {editingMember && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Status Keaktifan</label>
                <select
                  value={statusAktif ? 'aktif' : 'nonaktif'}
                  onChange={e => setStatusAktif(e.target.value === 'aktif')}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif / Blokir</option>
                </select>
              </div>
            )}

            {/* Alamat */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Alamat Domisili</label>
              <textarea
                rows={2}
                placeholder="Masukkan alamat tinggal saat ini..."
                value={alamat}
                onChange={e => setAlamat(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMember(null);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & List table card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-md font-bold text-slate-100">Daftar Anggota Terdaftar</h2>
          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, identitas, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 placeholder-slate-600 outline-none"
            />
          </div>
        </div>

        {/* Table data */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/20">
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
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-600 font-medium">Tidak ada data anggota ditemukan.</td>
                </tr>
              ) : (
                filteredMembers.map(m => (
                  <tr key={m.id_anggota} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-slate-200">{m.no_identitas}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-300">{m.nama}</td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {m.jenis_anggota}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs space-y-0.5">
                      <p>{m.email || '-'}</p>
                      <p className="text-slate-500">{m.no_telepon || '-'}</p>
                      <p className="text-slate-500 max-w-xs truncate text-[11px]" title={m.alamat}>{m.alamat || '-'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs">{new Date(m.tanggal_daftar).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleStatusDirectly(m)}
                        disabled={loading}
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                          m.status_aktif 
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400' 
                            : 'bg-rose-500/10 text-rose-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                        }`}
                        title={m.status_aktif ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                      >
                        {m.status_aktif ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => startEdit(m)}
                        disabled={loading}
                        className="p-1 hover:bg-slate-800 rounded text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
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
