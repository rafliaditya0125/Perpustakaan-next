'use client';

import { useState } from 'react';
import { createBookAction, updateEksemplarKondisiStatus } from '@/lib/actions';
import { 
  BookPlus, Search, Edit3, Printer, Plus, Minus,
  CheckCircle2, AlertCircle, X, BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BooksClientProps {
  books: any[];
  categories: any[];
}

export default function BooksClient({ books, categories }: BooksClientProps) {
  const router = useRouter();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);

  // Form states
  const [judul, setJudul] = useState('');
  const [idKategori, setIdKategori] = useState(0);
  const [pengarang, setPengarang] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [isbn, setIsbn] = useState('');
  const [nomorPanggil, setNomorPanggil] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [barcodes, setBarcodes] = useState(['']);

  const triggerNotify = (type: 'success' | 'error', msg: string | undefined) => {
    if (type === 'success') {
      setSuccessMsg(msg || 'Operasi berhasil.');
      setErrorMsg(null);
    } else {
      setErrorMsg(msg || 'Terjadi kesalahan.');
      setSuccessMsg(null);
    }
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 5000);
  };

  const resetForm = () => {
    setJudul(''); setIdKategori(0); setPengarang(''); setPenerbit('');
    setTahunTerbit(''); setIsbn(''); setNomorPanggil(''); setDeskripsi('');
    setBarcodes(['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validBarcodes = barcodes.filter(b => b.trim() !== '');
    if (!judul || !idKategori || validBarcodes.length === 0) return;
    setLoading(true);

    try {
      const res = await createBookAction({
        judul, id_kategori: idKategori, pengarang, penerbit,
        tahun_terbit: tahunTerbit ? parseInt(tahunTerbit) : undefined,
        isbn, nomor_panggil: nomorPanggil, deskripsi, barcodes: validBarcodes,
      });

      if (res && 'error' in res) {
        triggerNotify('error', res.error);
      } else {
        triggerNotify('success', 'Bahan pustaka berhasil ditambahkan!');
        resetForm();
        setShowAddForm(false);
        router.refresh();
      }
    } catch {
      triggerNotify('error', 'Gagal menambahkan buku.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEksemplar = async (id: number, kondisi: any, status: any) => {
    setLoading(true);
    try {
      await updateEksemplarKondisiStatus(id, kondisi, status);
      triggerNotify('success', 'Status eksemplar berhasil diperbarui!');
      router.refresh();
    } catch {
      triggerNotify('error', 'Gagal memperbarui eksemplar.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = books.filter(b =>
    b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.pengarang && b.pengarang.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.isbn && b.isbn.includes(searchTerm)) ||
    (b.nomor_panggil && b.nomor_panggil.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Manajemen Koleksi Buku</h1>
          <p className="text-xs text-slate-400 mt-1">Kelola katalog bahan pustaka, eksemplar fisik, dan label barcode.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setSelectedBook(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
        >
          <BookPlus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" /><span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/30 border border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      {/* Add Book Form */}
      {showAddForm && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative max-w-4xl">
          <button onClick={() => setShowAddForm(false)} className="absolute right-4 top-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-md font-bold text-slate-100 mb-5">Formulir Tambah Bahan Pustaka</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Judul Buku / Bahan Pustaka *</label>
              <input type="text" placeholder="Masukkan judul lengkap..." value={judul} onChange={e => setJudul(e.target.value)} required className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Kategori / Klasifikasi *</label>
              <select value={idKategori} onChange={e => setIdKategori(Number(e.target.value))} required className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none">
                <option value={0}>-- Pilih Kategori --</option>
                {categories.map(c => <option key={c.id_kategori} value={c.id_kategori}>({c.no_klasifikasi}) {c.nama_kategori}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Nomor Panggil</label>
              <input type="text" placeholder="Contoh: 005.1 RAF d (awali REF untuk referensi)..." value={nomorPanggil} onChange={e => setNomorPanggil(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Pengarang</label>
              <input type="text" placeholder="Nama pengarang..." value={pengarang} onChange={e => setPengarang(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Penerbit</label>
              <input type="text" placeholder="Nama penerbit..." value={penerbit} onChange={e => setPenerbit(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Tahun Terbit</label>
              <input type="number" placeholder="Contoh: 2024" value={tahunTerbit} onChange={e => setTahunTerbit(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"/>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">ISBN</label>
              <input type="text" placeholder="Nomor ISBN (opsional)..." value={isbn} onChange={e => setIsbn(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none"/>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Deskripsi / Sinopsis</label>
              <textarea rows={2} placeholder="Sinopsis atau keterangan buku..." value={deskripsi} onChange={e => setDeskripsi(e.target.value)} className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-slate-100 outline-none resize-none"/>
            </div>

            {/* Barcodes section */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Kode Barcode Eksemplar Fisik *
                  <span className="ml-2 text-indigo-400 normal-case font-normal">({barcodes.filter(b => b.trim()).length} eksemplar)</span>
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setBarcodes([...barcodes, ''])} className="text-xs flex items-center gap-1 px-2.5 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-600/20 transition-all cursor-pointer">
                    <Plus className="w-3.5 h-3.5"/> Tambah Eksemplar
                  </button>
                  {barcodes.length > 1 && (
                    <button type="button" onClick={() => setBarcodes(barcodes.slice(0, -1))} className="text-xs flex items-center gap-1 px-2.5 py-1 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-600/20 transition-all cursor-pointer">
                      <Minus className="w-3.5 h-3.5"/> Hapus
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {barcodes.map((bc, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Barcode eksemplar ${i + 1}...`}
                    value={bc}
                    onChange={e => { const nb = [...barcodes]; nb[i] = e.target.value; setBarcodes(nb); }}
                    required
                    className="px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 font-mono outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer">Batal</button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer">
                {loading ? 'Menyimpan...' : 'Simpan Buku & Eksemplar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Book Detail Drawer/Modal */}
      {selectedBook && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 relative max-w-4xl">
          <button onClick={() => setSelectedBook(null)} className="absolute right-4 top-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
          <div className="mb-4">
            <h2 className="font-bold text-slate-100">{selectedBook.judul}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{selectedBook.pengarang} &bull; {selectedBook.penerbit} &bull; {selectedBook.tahun_terbit}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Detail Eksemplar Fisik</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-400">
                <thead className="text-[10px] uppercase text-slate-600 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2">Kode Barcode</th>
                    <th className="px-3 py-2">Kondisi</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Lokasi Rak</th>
                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBook.eksemplar.map((eks: any) => (
                    <tr key={eks.id_eksemplar} className="border-b border-slate-800/50">
                      <td className="px-3 py-2 font-mono font-bold text-slate-200">{eks.kode_barcode}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          eks.kondisi === 'baik' ? 'bg-emerald-500/10 text-emerald-400' :
                          eks.kondisi === 'rusak_ringan' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>{eks.kondisi}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          eks.status === 'tersedia' ? 'bg-emerald-500/10 text-emerald-400' :
                          eks.status === 'dipinjam' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>{eks.status}</span>
                      </td>
                      <td className="px-3 py-2 text-slate-500">{eks.lokasi_rak || '-'}</td>
                      <td className="px-3 py-2 text-right">
                        {/* Print barcode label */}
                        <button
                          onClick={() => {
                            const w = window.open('', '_blank');
                            if (w) {
                              w.document.write(`<!DOCTYPE html><html><head><title>Label Barcode</title><style>
                                body{font-family:monospace;display:flex;flex-direction:column;align-items:center;padding:20px;}
                                .label{border:2px solid #000;padding:12px 20px;text-align:center;width:200px;}
                                .title{font-size:10px;font-weight:bold;text-transform:uppercase;margin-bottom:4px;}
                                .barcode{font-size:24px;letter-spacing:4px;margin:8px 0;}
                                .panggil{font-size:11px;font-weight:bold;margin-top:6px;border-top:1px solid #ccc;padding-top:6px;}
                              </style></head><body>
                              <div class="label">
                                <div class="title">${selectedBook.judul.substring(0,30)}${selectedBook.judul.length > 30 ? '...' : ''}</div>
                                <div class="barcode">|||||||||</div>
                                <div style="font-size:13px;font-weight:bold;">${eks.kode_barcode}</div>
                                <div class="panggil">${selectedBook.nomor_panggil || '-'}</div>
                              </div>
                              <script>window.print();</script></body></html>`);
                              w.document.close();
                            }
                          }}
                          className="p-1 hover:bg-slate-800 rounded text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
                          title="Cetak label barcode"
                        >
                          <Printer className="w-3.5 h-3.5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Search & Book List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-md font-bold text-slate-100">Katalog Bahan Pustaka (OPAC)</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
            <input type="text" placeholder="Cari judul, pengarang, ISBN, nomor panggil..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-slate-100 placeholder-slate-600 outline-none"/>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800 bg-slate-950/20">
              <tr>
                <th className="px-4 py-3">No. Panggil</th>
                <th className="px-4 py-3">Judul & Pengarang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">ISBN</th>
                <th className="px-4 py-3">Eksemplar</th>
                <th className="px-4 py-3">Tersedia</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-600 font-medium">Tidak ada bahan pustaka ditemukan.</td></tr>
              ) : (
                filtered.map(b => {
                  const available = b.eksemplar.filter((e: any) => e.status === 'tersedia').length;
                  return (
                    <tr key={b.id_bahan} className="border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-indigo-400">{b.nomor_panggil || '-'}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-200 leading-tight">{b.judul}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{b.pengarang || 'Tanpa Pengarang'} &bull; {b.penerbit || '-'} &bull; {b.tahun_terbit || '-'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{b.kategori?.nama_kategori || '-'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono">{b.isbn || '-'}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-300">{b.eksemplar.length}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold text-sm ${available > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{available}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedBook(selectedBook?.id_bahan === b.id_bahan ? null : b)}
                          className="p-1.5 hover:bg-slate-800 rounded text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer"
                          title="Lihat detail eksemplar"
                        >
                          <BookOpen className="w-4 h-4"/>
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
  );
}
