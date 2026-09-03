'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Printer, 
  BookPlus, 
  Minus, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBookAction, updateEksemplarKondisiStatus } from '@/lib/actions';

interface BooksClientProps {
  books: any[];
  categories: any[];
}

export default function BooksClient({ books, categories }: BooksClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [judul, setJudul] = useState('');
  const [idKategori, setIdKategori] = useState<number>(categories[0]?.id_kategori || 0);
  const [pengarang, setPengarang] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState<number | ''>('');
  const [isbn, setIsbn] = useState('');
  const [nomorPanggil, setNomorPanggil] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [barcodes, setBarcodes] = useState<string[]>(['']);

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
    setJudul('');
    setIdKategori(categories[0]?.id_kategori || 0);
    setPengarang('');
    setPenerbit('');
    setTahunTerbit('');
    setIsbn('');
    setNomorPanggil('');
    setDeskripsi('');
    setBarcodes(['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validBarcodes = barcodes.map(b => b.trim()).filter(Boolean);
    if (validBarcodes.length === 0) {
      triggerNotify('error', 'Minimal harus mengisi 1 kode barcode eksemplar.');
      return;
    }

    setLoading(true);
    try {
      await createBookAction({
        judul, id_kategori: idKategori, pengarang, penerbit,
        tahun_terbit: tahunTerbit ? Number(tahunTerbit) : undefined,
        isbn, nomor_panggil: nomorPanggil, deskripsi,
        barcodes: validBarcodes
      });
      triggerNotify('success', 'Bahan pustaka dan eksemplar berhasil didaftarkan!');
      setShowAddForm(false);
      resetForm();
      router.refresh();
    } catch {
      triggerNotify('error', 'Terjadi kesalahan sistem saat menyimpan buku.');
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
      {/* Page Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Manajemen Koleksi Buku</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Kelola katalog bahan pustaka, eksemplar fisik, dan label barcode.</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setSelectedBook(null); resetForm(); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <BookPlus className="w-4 h-4" />
          <span>Tambah Buku Baru</span>
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

      {/* Add Book Form */}
      {showAddForm && (
        <div className="rounded-2xl p-6 sm:p-7 border relative max-w-4xl transition-all bg-white border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
          <button 
            onClick={() => setShowAddForm(false)} 
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-5">Formulir Tambah Bahan Pustaka</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Judul Buku / Bahan Pustaka *</label>
              <input 
                type="text" 
                placeholder="Masukkan judul lengkap..." 
                value={judul} 
                onChange={e => setJudul(e.target.value)} 
                required 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Kategori / Klasifikasi *</label>
              <select 
                value={idKategori} 
                onChange={e => setIdKategori(Number(e.target.value))} 
                required 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 cursor-pointer"
              >
                <option value={0}>-- Pilih Kategori --</option>
                {categories.map(c => <option key={c.id_kategori} value={c.id_kategori}>({c.no_klasifikasi}) {c.nama_kategori}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Nomor Panggil</label>
              <input 
                type="text" 
                placeholder="Contoh: 005.1 RAF d (awali REF untuk referensi)..." 
                value={nomorPanggil} 
                onChange={e => setNomorPanggil(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Pengarang</label>
              <input 
                type="text" 
                placeholder="Nama pengarang..." 
                value={pengarang} 
                onChange={e => setPengarang(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Penerbit</label>
              <input 
                type="text" 
                placeholder="Nama penerbit..." 
                value={penerbit} 
                onChange={e => setPenerbit(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Tahun Terbit</label>
              <input 
                type="number" 
                placeholder="Contoh: 2024" 
                value={tahunTerbit} 
                onChange={e => setTahunTerbit(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">ISBN</label>
              <input 
                type="text" 
                placeholder="Nomor ISBN (opsional)..." 
                value={isbn} 
                onChange={e => setIsbn(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">Deskripsi / Sinopsis</label>
              <textarea 
                rows={2} 
                placeholder="Sinopsis atau keterangan buku..." 
                value={deskripsi} 
                onChange={e => setDeskripsi(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900 resize-none"
              />
            </div>

            {/* Barcodes section */}
            <div className="space-y-2 md:col-span-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                  Kode Barcode Eksemplar Fisik *
                  <span className="ml-2 text-indigo-600 dark:text-indigo-400 normal-case font-semibold">({barcodes.filter(b => b.trim()).length} eksemplar)</span>
                </label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setBarcodes([...barcodes, ''])} 
                    className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all border font-semibold bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-600/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5"/> Tambah Eksemplar
                  </button>
                  {barcodes.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setBarcodes(barcodes.slice(0, -1))} 
                      className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all border font-semibold bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-600/10 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-600/20 cursor-pointer"
                    >
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
                    className="px-3 py-2 rounded-xl text-xs font-mono outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="px-5 py-2.5 rounded-xl border text-xs font-semibold transition-colors bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Simpan Buku & Eksemplar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Book Detail Drawer/Modal */}
      {selectedBook && (
        <div className="rounded-2xl p-6 sm:p-7 border relative max-w-4xl transition-all bg-white border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
          <button 
            onClick={() => setSelectedBook(null)} 
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5"/>
          </button>
          <div className="mb-4">
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{selectedBook.judul}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{selectedBook.pengarang} &bull; {selectedBook.penerbit} &bull; {selectedBook.tahun_terbit}</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Detail Eksemplar Fisik</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left text-slate-700 dark:text-slate-400">
                <thead className="text-[10px] uppercase font-bold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5">Kode Barcode</th>
                    <th className="px-3.5 py-2.5">Kondisi</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Lokasi Rak</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {selectedBook.eksemplar.map((eks: any) => (
                    <tr key={eks.id_eksemplar} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900 dark:text-slate-200">{eks.kode_barcode}</td>
                      <td className="px-3.5 py-2.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          eks.kondisi === 'baik' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                          eks.kondisi === 'rusak_ringan' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}>{eks.kondisi}</span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          eks.status === 'tersedia' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                          eks.status === 'dipinjam' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                        }`}>{eks.status}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400">{eks.lokasi_rak || '-'}</td>
                      <td className="px-3.5 py-2.5 text-right">
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
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
      <div className="rounded-2xl p-6 sm:p-7 border transition-all bg-white border-slate-200 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Katalog Bahan Pustaka (OPAC)</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500"/>
            <input 
              type="text" 
              placeholder="Cari judul, pengarang, ISBN..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:bg-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-400">
            <thead className="text-xs uppercase font-semibold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">No. Panggil</th>
                <th className="px-4 py-3">Judul & Pengarang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">ISBN</th>
                <th className="px-4 py-3 text-center">Eksemplar</th>
                <th className="px-4 py-3 text-center">Tersedia</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">Tidak ada bahan pustaka ditemukan.</td></tr>
              ) : (
                filtered.map(b => {
                  const available = b.eksemplar.filter((e: any) => e.status === 'tersedia').length;
                  return (
                    <tr key={b.id_bahan} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.nomor_panggil || '-'}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{b.judul}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.pengarang || 'Tanpa Pengarang'} &bull; {b.penerbit || '-'} &bull; {b.tahun_terbit || '-'}</p>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-500/20 dark:text-indigo-300">
                          {b.kategori?.nama_kategori || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-600 dark:text-slate-400">{b.isbn || '-'}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900 dark:text-slate-200">{b.eksemplar.length}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold text-sm ${available > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{available}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedBook(selectedBook?.id_bahan === b.id_bahan ? null : b)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
