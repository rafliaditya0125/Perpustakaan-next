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
  AlertCircle,
  Upload,
  Trash2,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Barcode as BarcodeIcon,
  RefreshCw,
  Copy,
  Check,
  Pencil
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBookAction, updateBookAction, deleteBookAction, updateEksemplarKondisiStatus } from '@/lib/actions';
import BarcodeDisplay from '@/components/BarcodeDisplay';

// Client-side image compression using HTML5 Canvas to WebP
async function compressImage(
  file: File,
  maxWidth = 600,
  maxHeight = 800,
  quality = 0.8
): Promise<{ dataUrl: string; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context tidak tersedia'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize,
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

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
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverStats, setCoverStats] = useState<{ orig: string; comp: string; ratio: string } | null>(null);
  const [compressing, setCompressing] = useState(false);
  
  // Barcode and copies management (1 barcode per title)
  const [jumlahEksemplar, setJumlahEksemplar] = useState<number>(1);
  const [barcode, setBarcode] = useState<string>('');
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  // Edit Book states
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [editJudul, setEditJudul] = useState('');
  const [editIdKategori, setEditIdKategori] = useState<number>(0);
  const [editPengarang, setEditPengarang] = useState('');
  const [editPenerbit, setEditPenerbit] = useState('');
  const [editTahunTerbit, setEditTahunTerbit] = useState<number | ''>('');
  const [editIsbn, setEditIsbn] = useState('');
  const [editNomorPanggil, setEditNomorPanggil] = useState('');
  const [editDeskripsi, setEditDeskripsi] = useState('');
  const [editCoverImage, setEditCoverImage] = useState<string | null>(null);
  const [editBarcode, setEditBarcode] = useState('');
  const [editJumlahEksemplar, setEditJumlahEksemplar] = useState<number>(1);
  const [editRusakRingan, setEditRusakRingan] = useState<number>(0);
  const [editRusakBerat, setEditRusakBerat] = useState<number>(0);
  const [editLokasiRak, setEditLokasiRak] = useState('');

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

  // Helper to generate a single clean barcode per book title
  const generateSingleBarcode = (prefixOverride?: string) => {
    const selectedCat = categories.find(c => c.id_kategori === idKategori);
    const catCode = selectedCat?.no_klasifikasi || '000';
    const prefix = prefixOverride && prefixOverride.trim() !== ''
      ? prefixOverride.trim().toUpperCase()
      : `B${catCode}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand}`;
  };

  const handleRegenerateBarcode = () => {
    const code = generateSingleBarcode();
    setBarcode(code);
    triggerNotify('success', `Berhasil membuat barcode baru: ${code}`);
  };

  const handleUseIsbnAsBarcode = () => {
    if (!isbn.trim()) {
      triggerNotify('error', 'Nomor ISBN belum diisi.');
      return;
    }
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').trim();
    setBarcode(cleanIsbn || isbn.trim());
    triggerNotify('success', `Barcode diset sesuai ISBN: ${cleanIsbn || isbn.trim()}`);
  };

  const handleJumlahChange = (val: number) => {
    const clamped = Math.max(1, Math.min(50, val || 1));
    setJumlahEksemplar(clamped);
  };

  const handleCopyBarcode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBarcode(code);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  // Function to print vector barcode stickers in a new window
  const handlePrintLabels = (labels: { title: string; callNumber?: string; barcode: string; copyNumber?: number; totalCopies?: number }[]) => {
    if (labels.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) {
      triggerNotify('error', 'Gagal membuka jendela cetak. Izinkan popup pada browser.');
      return;
    }
    const escapeHtml = (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Cetak Label Barcode Perpustakaan</title>
  <style>
    @page { size: auto; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 15px; color: #000; }
    .no-print { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .btn-print { background: #4f46e5; color: white; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .labels-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .label-card {
      border: 1.5px dashed #444;
      border-radius: 10px;
      padding: 10px 14px;
      text-align: center;
      page-break-inside: avoid;
      background: #fff;
    }
    .lib-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #3730a3; letter-spacing: 0.8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 5px; }
    .book-title { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .call-num { font-size: 10px; font-family: monospace; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .barcode-svg-wrap { display: flex; justify-content: center; align-items: center; margin: 4px 0; }
    .barcode-svg-wrap svg { max-width: 100%; height: 42px; }
    .footer-text { font-size: 8px; color: #94a3b8; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.5px; }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .label-card { border: 1.5px solid #000; }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
</head>
<body>
  <div class="no-print">
    <h3 style="margin:0;font-size:15px;">Pratinjau Cetak Label Barcode (${labels.length} Lembar)</h3>
    <button class="btn-print" onclick="window.print()">Cetak Label Sekarang</button>
  </div>
  <div class="labels-container">
    ${labels.map((l, i) => `
      <div class="label-card">
        <div class="lib-title">Perpustakaan Digital</div>
        <div class="book-title">${escapeHtml(l.title || 'Buku Perpustakaan')}</div>
        <div class="call-num">${escapeHtml(l.callNumber || '-')}${l.copyNumber ? ` &bull; Eks #${l.copyNumber}${l.totalCopies ? ` dari ${l.totalCopies}` : ''}` : ''}</div>
        <div class="barcode-svg-wrap">
          <svg id="label-bc-${i}"></svg>
        </div>
        <div class="footer-text">Property of Library</div>
      </div>
    `).join('')}
  </div>
  <script>
    window.onload = function() {
      ${labels.map((l, i) => `
        try {
          JsBarcode("#label-bc-${i}", "${l.barcode}", {
            format: "CODE128",
            width: 1.5,
            height: 38,
            displayValue: true,
            fontSize: 10,
            margin: 0
          });
        } catch(e) { console.error(e); }
      `).join('')}
    };
  </script>
</body>
</html>`);
    w.document.close();
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerNotify('error', 'Format file harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    setCompressing(true);
    try {
      const res = await compressImage(file, 600, 800, 0.82);
      setCoverImage(res.dataUrl);

      const origKB = (res.originalSize / 1024).toFixed(1);
      const compKB = (res.compressedSize / 1024).toFixed(1);
      const savedPct = Math.round((1 - res.compressedSize / res.originalSize) * 100);
      setCoverStats({
        orig: `${origKB} KB`,
        comp: `${compKB} KB`,
        ratio: savedPct > 0 ? `${savedPct}% lebih hemat` : 'Optimal',
      });
    } catch {
      triggerNotify('error', 'Gagal memproses dan mengompres foto sampul.');
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverStats(null);
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
    setCoverImage(null);
    setCoverStats(null);
    setJumlahEksemplar(1);
    setBarcode('');
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setSelectedBook(null);
    resetForm();
    const initialCode = generateSingleBarcode();
    setBarcode(initialCode);
    setJumlahEksemplar(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) {
      triggerNotify('error', 'Kode barcode buku wajib diisi.');
      return;
    }
    if (jumlahEksemplar < 1) {
      triggerNotify('error', 'Jumlah eksemplar minimal 1.');
      return;
    }

    setLoading(true);
    try {
      const res = await createBookAction({
        judul, id_kategori: idKategori, pengarang, penerbit,
        tahun_terbit: tahunTerbit ? Number(tahunTerbit) : undefined,
        isbn, nomor_panggil: nomorPanggil, deskripsi,
        foto_sampul: coverImage || undefined,
        kode_barcode: cleanBarcode,
        jumlah_eksemplar: jumlahEksemplar
      });
      if (res && 'error' in res) {
        triggerNotify('error', res.error);
        return;
      }
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

  const handleOpenEdit = (b: any) => {
    setShowAddForm(false);
    setSelectedBook(null);
    setEditingBook(b);
    setEditJudul(b.judul || '');
    setEditIdKategori(b.id_kategori || categories[0]?.id_kategori || 0);
    setEditPengarang(b.pengarang || '');
    setEditPenerbit(b.penerbit || '');
    setEditTahunTerbit(b.tahun_terbit || '');
    setEditIsbn(b.isbn || '');
    setEditNomorPanggil(b.nomor_panggil || '');
    setEditDeskripsi(b.deskripsi || '');
    setEditCoverImage(b.foto_sampul || null);
    setEditBarcode(b.kode_barcode || b.eksemplar?.[0]?.kode_barcode || '');
    setEditJumlahEksemplar(b.eksemplar.length || 1);
    const rusakRingan = b.eksemplar.filter((e: any) => e.kondisi === 'rusak_ringan').length;
    const rusakBerat = b.eksemplar.filter((e: any) => e.kondisi === 'rusak_berat').length;
    setEditRusakRingan(rusakRingan);
    setEditRusakBerat(rusakBerat);
    setEditLokasiRak(b.eksemplar?.[0]?.lokasi_rak || '');
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    const cleanBarcode = editBarcode.trim();
    if (!cleanBarcode) {
      triggerNotify('error', 'Kode barcode buku wajib diisi.');
      return;
    }
    if (editJumlahEksemplar < 1) {
      triggerNotify('error', 'Jumlah buku minimal 1.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateBookAction(editingBook.id_bahan, {
        judul: editJudul,
        id_kategori: editIdKategori,
        pengarang: editPengarang,
        penerbit: editPenerbit,
        tahun_terbit: editTahunTerbit ? Number(editTahunTerbit) : undefined,
        isbn: editIsbn,
        nomor_panggil: editNomorPanggil,
        deskripsi: editDeskripsi,
        foto_sampul: editCoverImage,
        kode_barcode: cleanBarcode,
        jumlah_eksemplar: editJumlahEksemplar,
        kuantitas_rusak_ringan: editRusakRingan,
        kuantitas_rusak_berat: editRusakBerat,
        lokasi_rak: editLokasiRak,
      });

      if (res && 'error' in res) {
        triggerNotify('error', res.error);
        return;
      }
      triggerNotify('success', 'Data dan jumlah buku berhasil diperbarui!');
      setEditingBook(null);
      router.refresh();
    } catch {
      triggerNotify('error', 'Terjadi kesalahan sistem saat memperbarui buku.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!editingBook) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${editingBook.judul}" beserta seluruh datanya? Tindakan ini tidak dapat dibatalkan.`)) return;

    setLoading(true);
    try {
      const res = await deleteBookAction(editingBook.id_bahan);
      if (res && 'error' in res) {
        triggerNotify('error', res.error);
        return;
      }
      triggerNotify('success', 'Buku berhasil dihapus dari sistem.');
      setEditingBook(null);
      router.refresh();
    } catch {
      triggerNotify('error', 'Gagal menghapus buku.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerNotify('error', 'Format file harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    setCompressing(true);
    try {
      const res = await compressImage(file, 600, 800, 0.82);
      setEditCoverImage(res.dataUrl);
      triggerNotify('success', 'Foto sampul berhasil diunggah.');
    } catch {
      triggerNotify('error', 'Gagal memproses dan mengompres foto sampul.');
    } finally {
      setCompressing(false);
    }
  };

  const filtered = books.filter(b =>
    b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.pengarang && b.pengarang.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.isbn && b.isbn.includes(searchTerm)) ||
    (b.nomor_panggil && b.nomor_panggil.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.kode_barcode && b.kode_barcode.toLowerCase().includes(searchTerm.toLowerCase()))
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
          onClick={handleOpenAddForm}
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

            {/* Foto Sampul Buku */}
            <div className="space-y-2 md:col-span-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-400">
                  Foto Sampul Buku (Otomatis Dikompres)
                </label>
                <span className="text-[11px] text-slate-400">Opsional &bull; Format WebP ringan</span>
              </div>

              {!coverImage ? (
                <label
                  htmlFor="cover-file-input"
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    compressing
                      ? 'bg-slate-50 border-indigo-300 dark:bg-slate-900 dark:border-indigo-800'
                      : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 bg-slate-50/50 dark:border-slate-800 dark:hover:border-indigo-500/50 dark:bg-slate-950/40'
                  }`}
                >
                  <input
                    id="cover-file-input"
                    type="file"
                    accept="image/*"
                    disabled={compressing}
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  {compressing ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="text-xs font-semibold">Mengompresi dan mengoptimasi foto...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Klik atau seret foto sampul buku ke sini
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Mendukung JPG, PNG, WebP &bull; Otomatis dikompresi menjadi WebP
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              ) : (
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-22 rounded-xl overflow-hidden shadow-md border border-white/50 shrink-0 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={coverImage}
                        alt="Preview Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Foto Sampul Siap Diunggah
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Sparkles className="w-3 h-3" /> {coverStats?.ratio || 'Terkonversi'}
                        </span>
                      </div>
                      {coverStats && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                          Ukuran: <span className="line-through text-slate-400">{coverStats.orig}</span> &rarr; <span className="font-bold text-emerald-600 dark:text-emerald-400">{coverStats.comp}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">Format: WebP teroptimasi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <label
                      htmlFor="cover-file-input-change"
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Ganti Foto
                      <input
                        id="cover-file-input-change"
                        type="file"
                        accept="image/*"
                        disabled={compressing}
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-900/40 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Jumlah Eksemplar & Barcode Judul Section (1 Barcode Per Judul) */}
            <div className="space-y-4 md:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <BarcodeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Jumlah Eksemplar &amp; Barcode Judul Buku</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    1 barcode unik untuk 1 judul buku. Semua eksemplar fisik buku ini menggunakan kode barcode yang sama.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRegenerateBarcode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                    title="Generate ulang kode barcode baru"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Acak Kode</span>
                  </button>
                  {isbn.trim() && (
                    <button
                      type="button"
                      onClick={handleUseIsbnAsBarcode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                      title="Gunakan ISBN sebagai barcode"
                    >
                      <BarcodeIcon className="w-3.5 h-3.5" />
                      <span>Pakai ISBN</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!barcode.trim()) {
                        triggerNotify('error', 'Tidak ada barcode untuk dicetak.');
                        return;
                      }
                      const labels = Array.from({ length: jumlahEksemplar }, (_, idx) => ({
                        title: judul || 'Buku Baru',
                        callNumber: nomorPanggil || '-',
                        barcode: barcode.trim(),
                        copyNumber: idx + 1,
                        totalCopies: jumlahEksemplar,
                      }));
                      handlePrintLabels(labels);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-600/30 text-xs font-bold transition cursor-pointer"
                    title={`Cetak ${jumlahEksemplar} label stiker barcode`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Label ({jumlahEksemplar})</span>
                  </button>
                </div>
              </div>

              {/* Quantity Controls & Barcode Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
                {/* Quantity Row */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Jumlah Eksemplar Fisik:
                    </span>
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleJumlahChange(jumlahEksemplar - 1)}
                        disabled={jumlahEksemplar <= 1}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={jumlahEksemplar}
                        onChange={(e) => handleJumlahChange(Number(e.target.value))}
                        className="w-14 text-center text-sm font-extrabold outline-none bg-transparent text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleJumlahChange(jumlahEksemplar + 1)}
                        disabled={jumlahEksemplar >= 50}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Cepat:</span>
                    {[1, 2, 3, 5, 10].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => handleJumlahChange(qty)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                          jumlahEksemplar === qty
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Single Barcode Input & Live Visual Preview */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <BarcodeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Kode Barcode Judul</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCopyBarcode(barcode)}
                        className="p-1 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 flex items-center gap-1 transition cursor-pointer"
                        title="Salin barcode"
                      >
                        {copiedBarcode === barcode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      required
                      placeholder="Scan atau ketik kode barcode..."
                      className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Mencetak label ini akan menghasilkan {jumlahEksemplar} lembar stiker (Eksemplar #1 s/d #{jumlahEksemplar}) dengan barcode ini untuk ditempel ke masing-masing buku fisik.
                    </p>
                  </div>

                  {/* Live Visual Barcode Rendering */}
                  <div className="w-full sm:w-60 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0">
                    <BarcodeDisplay
                      value={barcode || 'B000-0000'}
                      width={1.4}
                      height={44}
                      fontSize={11}
                      displayValue={true}
                    />
                  </div>
                </div>
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

      {/* Edit Book & Quantity Modal */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="rounded-3xl p-5 sm:p-7 border relative max-w-4xl w-full my-auto transition-all bg-white border-slate-200 shadow-2xl dark:bg-slate-900 dark:border-slate-800 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3 sm:gap-4">
                {editCoverImage ? (
                  <img
                    src={editCoverImage}
                    alt={editJudul}
                    className="w-14 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800"
                  />
                ) : (
                  <div className="w-14 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <BookOpen className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-500/20 dark:text-indigo-300">
                      Edit Koleksi Buku &amp; Stok
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID #{editingBook.id_bahan}</span>
                  </div>
                  <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100 mt-1 leading-tight">
                    {editingBook.judul}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingBook.pengarang || 'Tanpa Pengarang'} &bull; {editingBook.penerbit || '-'} &bull; {editingBook.tahun_terbit || '-'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBook(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aggregate Quantity Cards (Stok Fisik Koleksi) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ringkasan Kuantitas Stok Buku Saat Ini
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{editingBook.eksemplar.length}</p>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">Total Kuantitas</p>
                </div>
                <div className="p-3.5 rounded-2xl border bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-center">
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {editingBook.eksemplar.filter((e: any) => e.status === 'tersedia').length}
                  </p>
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mt-0.5">Tersedia (Siap Pinjam)</p>
                </div>
                <div className="p-3.5 rounded-2xl border bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-center">
                  <p className="text-2xl font-black text-amber-700 dark:text-amber-400">
                    {editingBook.eksemplar.filter((e: any) => e.status === 'dipinjam').length}
                  </p>
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase mt-0.5">Sedang Dipinjam</p>
                </div>
                <div className="p-3.5 rounded-2xl border bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-center">
                  <p className="text-2xl font-black text-rose-700 dark:text-rose-400">
                    {editingBook.eksemplar.filter((e: any) => e.kondisi !== 'baik').length}
                  </p>
                  <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase mt-0.5">Kondisi Rusak</p>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              {/* Informational Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Judul Buku *
                  </label>
                  <input
                    type="text"
                    required
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Kategori *
                  </label>
                  <select
                    value={editIdKategori}
                    onChange={(e) => setEditIdKategori(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id_kategori} value={c.id_kategori}>
                        {c.no_klasifikasi} - {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Pengarang
                  </label>
                  <input
                    type="text"
                    value={editPengarang}
                    onChange={(e) => setEditPengarang(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Penerbit
                  </label>
                  <input
                    type="text"
                    value={editPenerbit}
                    onChange={(e) => setEditPenerbit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Tahun Terbit
                  </label>
                  <input
                    type="number"
                    value={editTahunTerbit}
                    onChange={(e) => setEditTahunTerbit(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Nomor Panggil (Call Number)
                  </label>
                  <input
                    type="text"
                    value={editNomorPanggil}
                    onChange={(e) => setEditNomorPanggil(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={editIsbn}
                    onChange={(e) => setEditIsbn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                    Deskripsi / Sinopsis
                  </label>
                  <textarea
                    rows={2}
                    value={editDeskripsi}
                    onChange={(e) => setEditDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm outline-none bg-slate-50 border-slate-300 focus:bg-white focus:border-indigo-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Photo Cover Management */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider block text-slate-700 dark:text-slate-300">
                  Foto Sampul Buku
                </label>
                <div className="flex items-center gap-4">
                  {editCoverImage ? (
                    <img
                      src={editCoverImage}
                      alt="Sampul"
                      className="w-12 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 text-xs font-semibold transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editCoverImage ? 'Ganti Foto' : 'Unggah Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={compressing}
                        onChange={handleEditCoverChange}
                        className="hidden"
                      />
                    </label>
                    {editCoverImage && (
                      <button
                        type="button"
                        onClick={() => setEditCoverImage(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-400 text-xs font-semibold transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical Quantities & Condition Management (Stok Buku) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Kelola Kuantitas &amp; Kondisi Fisik Buku</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Atur kuantitas total buku fisik dan rincian kondisi rusak secara agregat tanpa repot mengelola baris per eksemplar.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  {/* Total Quantity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Total Kuantitas Buku:
                    </label>
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => setEditJumlahEksemplar(Math.max(1, editJumlahEksemplar - 1))}
                        disabled={editJumlahEksemplar <= 1}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={editJumlahEksemplar}
                        onChange={(e) => setEditJumlahEksemplar(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full text-center text-sm font-black outline-none bg-transparent text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setEditJumlahEksemplar(editJumlahEksemplar + 1)}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Kuantitas Rusak Ringan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                      Kuantitas Rusak Ringan:
                    </label>
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => setEditRusakRingan(Math.max(0, editRusakRingan - 1))}
                        disabled={editRusakRingan <= 0}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={editJumlahEksemplar}
                        value={editRusakRingan}
                        onChange={(e) => setEditRusakRingan(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full text-center text-sm font-bold outline-none bg-transparent text-amber-800 dark:text-amber-300"
                      />
                      <button
                        type="button"
                        onClick={() => setEditRusakRingan(editRusakRingan + 1)}
                        disabled={editRusakRingan + editRusakBerat >= editJumlahEksemplar}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Kuantitas Rusak Berat */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                      Kuantitas Rusak Berat:
                    </label>
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => setEditRusakBerat(Math.max(0, editRusakBerat - 1))}
                        disabled={editRusakBerat <= 0}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={editJumlahEksemplar}
                        value={editRusakBerat}
                        onChange={(e) => setEditRusakBerat(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full text-center text-sm font-bold outline-none bg-transparent text-rose-800 dark:text-rose-300"
                      />
                      <button
                        type="button"
                        onClick={() => setEditRusakBerat(editRusakBerat + 1)}
                        disabled={editRusakRingan + editRusakBerat >= editJumlahEksemplar}
                        className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lokasi Rak */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Lokasi Rak:
                    </label>
                    <input
                      type="text"
                      placeholder="Misal: Rak A-01"
                      value={editLokasiRak}
                      onChange={(e) => setEditLokasiRak(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm font-semibold outline-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Barcode Judul Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <BarcodeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Barcode Judul Buku</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editBarcode.trim()) return;
                      const labels = Array.from({ length: editJumlahEksemplar }, (_, idx) => ({
                        title: editJudul,
                        callNumber: editNomorPanggil,
                        barcode: editBarcode.trim(),
                        copyNumber: idx + 1,
                        totalCopies: editJumlahEksemplar,
                      }));
                      handlePrintLabels(labels);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:border-indigo-500/30 dark:text-indigo-300 text-xs font-bold transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Label ({editJumlahEksemplar})</span>
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={editBarcode}
                      onChange={(e) => setEditBarcode(e.target.value)}
                      required
                      placeholder="Kode barcode judul..."
                      className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-full sm:w-56 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center shrink-0">
                    <BarcodeDisplay
                      value={editBarcode || 'B000-0000'}
                      width={1.2}
                      height={32}
                      fontSize={10}
                      displayValue={true}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleDeleteBook}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Buku</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingBook(null)}
                    className="px-5 py-2.5 rounded-xl border text-xs font-semibold bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </form>
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
              placeholder="Cari judul, barcode, ISBN..." 
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
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">ISBN</th>
                <th className="px-4 py-3 text-center">Total Kuantitas</th>
                <th className="px-4 py-3 text-center">Tersedia</th>
                <th className="px-4 py-3 text-center">Rusak</th>
                <th className="px-4 py-3 text-center">Dipinjam</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">Tidak ada bahan pustaka ditemukan.</td></tr>
              ) : (
                filtered.map(b => {
                  const totalCount = b.eksemplar.length;
                  const available = b.eksemplar.filter((e: any) => e.status === 'tersedia').length;
                  const borrowed = b.eksemplar.filter((e: any) => e.status === 'dipinjam').length;
                  const damaged = b.eksemplar.filter((e: any) => e.kondisi !== 'baik').length;
                  const displayBarcode = b.kode_barcode || b.eksemplar?.[0]?.kode_barcode || '-';
                  return (
                    <tr key={b.id_bahan} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{b.nomor_panggil || '-'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {b.foto_sampul ? (
                            <img
                              src={b.foto_sampul}
                              alt={b.judul}
                              className="w-9 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 bg-slate-100 dark:bg-slate-800"
                            />
                          ) : (
                            <div className="w-9 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center text-slate-400">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-1">{b.judul}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.pengarang || 'Tanpa Pengarang'} &bull; {b.penerbit || '-'} &bull; {b.tahun_terbit || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {displayBarcode}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/40 dark:border-indigo-500/20 dark:text-indigo-300">
                          {b.kategori?.nama_kategori || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-600 dark:text-slate-400">{b.isbn || '-'}</td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-slate-900 dark:text-slate-100">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">{totalCount}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          available > 0 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {available}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          damaged > 0 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-400' 
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {damaged}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          borrowed > 0 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400' 
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {borrowed}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 font-bold text-xs transition cursor-pointer shadow-2xs"
                            title="Edit data dan kuantitas buku"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!displayBarcode || displayBarcode === '-') {
                                triggerNotify('error', 'Barcode buku tidak ditemukan.');
                                return;
                              }
                              const labels = Array.from({ length: totalCount }, (_, idx) => ({
                                title: b.judul,
                                callNumber: b.nomor_panggil,
                                barcode: displayBarcode,
                                copyNumber: idx + 1,
                                totalCopies: totalCount,
                              }));
                              handlePrintLabels(labels);
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Cetak stiker label barcode"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
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
