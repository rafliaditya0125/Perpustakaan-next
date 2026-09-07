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
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBookAction, updateEksemplarKondisiStatus } from '@/lib/actions';
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
  
  // Barcode and copies management
  const [jumlahEksemplar, setJumlahEksemplar] = useState<number>(1);
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [barcodes, setBarcodes] = useState<string[]>(['']);
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

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

  // Helper to generate barcode strings based on category, salt, and copy sequence
  const generateBarcodeList = (count: number, prefixOverride?: string) => {
    const selectedCat = categories.find(c => c.id_kategori === idKategori);
    const catCode = selectedCat?.no_klasifikasi || '000';
    const prefix = prefixOverride && prefixOverride.trim() !== ''
      ? prefixOverride.trim().toUpperCase()
      : `B${catCode}`;
    
    // Unique salt to avoid collisions
    const timeSalt = Math.floor(100 + Math.random() * 900);
    const list: string[] = [];
    for (let i = 1; i <= count; i++) {
      const seq = String(i).padStart(2, '0');
      list.push(`${prefix}${timeSalt}${seq}`);
    }
    return list;
  };

  // Handle quantity change with smart preservation and generation
  const handleJumlahChange = (newQty: number) => {
    const safeQty = Math.max(1, Math.min(50, newQty));
    setJumlahEksemplar(safeQty);

    const validCurrent = barcodes.filter(b => b.trim());
    if (validCurrent.length === 0) {
      setBarcodes(generateBarcodeList(safeQty, customPrefix));
    } else if (validCurrent.length < safeQty) {
      // Append extra barcodes matching the pattern of the first barcode
      const first = validCurrent[0];
      const basePrefix = first.length > 2 ? first.slice(0, -2) : first;
      const additional: string[] = [];
      for (let i = validCurrent.length + 1; i <= safeQty; i++) {
        additional.push(`${basePrefix}${String(i).padStart(2, '0')}`);
      }
      setBarcodes([...validCurrent, ...additional]);
    } else {
      setBarcodes(validCurrent.slice(0, safeQty));
    }
  };

  const handleRegenerateBarcodes = () => {
    const newList = generateBarcodeList(jumlahEksemplar, customPrefix);
    setBarcodes(newList);
    triggerNotify('success', `Berhasil membuat ${jumlahEksemplar} barcode baru!`);
  };

  const handleBarcodeChange = (index: number, val: string) => {
    const next = [...barcodes];
    next[index] = val;
    setBarcodes(next);
  };

  const handleCopyBarcode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBarcode(code);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  // Function to print vector barcode stickers in a new window
  const handlePrintLabels = (labels: { title: string; callNumber?: string; barcode: string }[]) => {
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
    <h3 style="margin:0;font-size:15px;">Pratinjau Cetak Label Barcode (${labels.length} Eksemplar)</h3>
    <button class="btn-print" onclick="window.print()">Cetak Label Sekarang</button>
  </div>
  <div class="labels-container">
    ${labels.map((l, i) => `
      <div class="label-card">
        <div class="lib-title">Perpustakaan Digital</div>
        <div class="book-title">${escapeHtml(l.title || 'Buku Perpustakaan')}</div>
        <div class="call-num">${escapeHtml(l.callNumber || '-')}</div>
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
    setCustomPrefix('');
    setBarcodes(['']);
  };

  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setSelectedBook(null);
    resetForm();
    const initialList = generateBarcodeList(1);
    setBarcodes(initialList);
    setJumlahEksemplar(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validBarcodes = barcodes.map(b => b.trim()).filter(Boolean);
    if (validBarcodes.length === 0) {
      triggerNotify('error', 'Minimal harus ada 1 kode barcode eksemplar.');
      return;
    }

    setLoading(true);
    try {
      const res = await createBookAction({
        judul, id_kategori: idKategori, pengarang, penerbit,
        tahun_terbit: tahunTerbit ? Number(tahunTerbit) : undefined,
        isbn, nomor_panggil: nomorPanggil, deskripsi,
        foto_sampul: coverImage || undefined,
        barcodes: validBarcodes
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

            {/* Jumlah Eksemplar & Barcode Generator Section */}
            <div className="space-y-4 md:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <BarcodeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Jumlah Eksemplar &amp; Barcode Generator</span>
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ketik berapa jumlah eksemplar buku fisik, barcode akan otomatis ter-generate dan siap dicetak.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerateBarcodes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                    title="Generate ulang kode barcode baru"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Acak Ulang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const validCodes = barcodes.filter(b => b.trim());
                      if (validCodes.length === 0) {
                        triggerNotify('error', 'Tidak ada barcode untuk dicetak.');
                        return;
                      }
                      handlePrintLabels(
                        validCodes.map(bc => ({
                          title: judul || 'Buku Baru',
                          callNumber: nomorPanggil || '-',
                          barcode: bc,
                        }))
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-600/20 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-600/30 text-xs font-bold transition cursor-pointer"
                    title="Cetak stiker barcode eksemplar"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Label Barcode</span>
                  </button>
                </div>
              </div>

              {/* Quantity Controls & Quick Presets */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Jumlah Eksemplar:
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

                  {/* Quick Preset Buttons */}
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

                  {/* Custom Prefix option */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[11px] text-slate-500">Awalan Kode:</span>
                    <input
                      type="text"
                      placeholder="Misal: BK-..."
                      value={customPrefix}
                      onChange={(e) => {
                        setCustomPrefix(e.target.value);
                      }}
                      onBlur={() => {
                        setBarcodes(generateBarcodeList(jumlahEksemplar, customPrefix));
                      }}
                      className="w-24 px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                {/* Barcode Visual Preview Cards Grid */}
                <div className="pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {barcodes.map((bc, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center relative group"
                      >
                        <div className="w-full flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                            Eksemplar #{i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBarcode(bc)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Salin barcode"
                          >
                            {copiedBarcode === bc ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Visual Barcode rendered via react-barcode */}
                        <div className="w-full flex justify-center py-1 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg overflow-x-auto">
                          <BarcodeDisplay
                            value={bc}
                            width={1.2}
                            height={36}
                            fontSize={10}
                            displayValue={true}
                          />
                        </div>

                        {/* Editable Barcode Code */}
                        <div className="w-full mt-2">
                          <input
                            type="text"
                            value={bc}
                            onChange={(e) => handleBarcodeChange(i, e.target.value)}
                            required
                            placeholder={`Kode barcode #${i + 1}`}
                            className="w-full text-center px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
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

      {/* Book Detail Drawer/Modal */}
      {selectedBook && (
        <div className="rounded-2xl p-6 sm:p-7 border relative max-w-4xl transition-all bg-white border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800">
          <button 
            onClick={() => setSelectedBook(null)} 
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5"/>
          </button>
          <div className="flex items-start gap-4 mb-5">
            {selectedBook.foto_sampul ? (
              <img 
                src={selectedBook.foto_sampul} 
                alt={selectedBook.judul}
                className="w-16 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800"
              />
            ) : (
              <div className="w-16 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <BookOpen className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1">
              <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 leading-tight">{selectedBook.judul}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">{selectedBook.pengarang || 'Tanpa Pengarang'} &bull; {selectedBook.penerbit || '-'} &bull; {selectedBook.tahun_terbit || '-'}</p>
              {selectedBook.deskripsi && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{selectedBook.deskripsi}</p>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Detail Eksemplar Fisik</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left text-slate-700 dark:text-slate-400">
                <thead className="text-[10px] uppercase font-bold border-b bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5">Barcode Eksemplar</th>
                    <th className="px-3.5 py-2.5">Kondisi</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Lokasi Rak</th>
                    <th className="px-3.5 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {selectedBook.eksemplar.map((eks: any) => (
                    <tr key={eks.id_eksemplar} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-200">
                            {eks.kode_barcode}
                          </span>
                          <div className="bg-white p-1 rounded border border-slate-200 dark:border-slate-800 shadow-2xs">
                            <BarcodeDisplay
                              value={eks.kode_barcode}
                              width={1.1}
                              height={28}
                              fontSize={9}
                              displayValue={false}
                            />
                          </div>
                        </div>
                      </td>
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
                            handlePrintLabels([{
                              title: selectedBook.judul,
                              callNumber: selectedBook.nomor_panggil,
                              barcode: eks.kode_barcode
                            }]);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs font-semibold"
                          title="Cetak label barcode eksemplar ini"
                        >
                          <Printer className="w-3.5 h-3.5"/>
                          <span className="hidden sm:inline">Cetak</span>
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
