'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  BookOpen,
  Users,
  Search,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogIn,
  Menu,
  X,
} from 'lucide-react';

interface PublicHomeClientProps {
  books: any[];
  categories: any[];
}

export default function PublicHomeClient({ books = [], categories = [] }: PublicHomeClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState('');
  const [noIdentitas, setNoIdentitas] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisAnggota, setJenisAnggota] = useState<'siswa' | 'mahasiswa' | 'guru_dosen' | 'umum'>('siswa');

  const availableCount = useMemo(
    () =>
      books.reduce(
        (sum, book) => sum + (book.eksemplar?.filter((eks: any) => eks.status === 'tersedia').length || 0),
        0
      ),
    [books]
  );

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return books;

    return books.filter((book) => {
      return [
        book.judul,
        book.pengarang,
        book.penerbit,
        book.isbn,
        book.nomor_panggil,
        book.kategori?.nama_kategori,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [books, searchTerm]);

  const resetForm = () => {
    setNama('');
    setNoIdentitas('');
    setEmail('');
    setNoTelepon('');
    setAlamat('');
    setJenisAnggota('siswa');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!nama.trim() || !noIdentitas.trim()) {
      setErrorMsg('Nama dan nomor identitas wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          no_identitas: noIdentitas.trim(),
          email: email.trim() || undefined,
          no_telepon: noTelepon.trim() || undefined,
          alamat: alamat.trim() || undefined,
          jenis_anggota: jenisAnggota,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        setErrorMsg(result.error || 'Gagal mendaftarkan anggota. Silakan coba lagi.');
      } else {
        setSuccessMsg(
          'Pendaftaran anggota berhasil! Silakan cek data Anda atau hubungi petugas untuk aktivasi kartu anggota.'
        );
        resetForm();
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat mengirim pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl transition-colors border-b bg-white/80 border-slate-200/80 dark:bg-slate-950/80 dark:border-slate-800/80 shadow-xs dark:shadow-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl transition bg-indigo-50 border border-indigo-200 text-indigo-600 group-hover:bg-indigo-100 group-hover:border-indigo-300 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:group-hover:bg-indigo-600/20">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight transition text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                  E-Perpustakaan
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  Katalog & Layanan
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#catalog" className="transition hover:text-indigo-600 dark:hover:text-white py-1">
                Katalog Buku
              </a>
              <a href="#ketentuan" className="transition hover:text-indigo-600 dark:hover:text-white py-1">
                Ketentuan Layanan
              </a>
              <a href="#register" className="transition hover:text-indigo-600 dark:hover:text-white py-1">
                Daftar Anggota
              </a>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Anggota</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl transition border bg-slate-100/80 border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t backdrop-blur-2xl px-4 py-4 space-y-3 bg-white/95 border-slate-200 dark:bg-slate-950/95 dark:border-slate-800/80">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <a
                href="#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                Katalog Buku
              </a>
              <a
                href="#ketentuan"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                Ketentuan Layanan
              </a>
              <a
                href="#register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                Daftar Anggota
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Anggota</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="space-y-6">
              {/* Hero Banner Card */}
              <div className="rounded-3xl p-8 sm:p-10 border transition-all duration-200 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50/60 border-slate-200 shadow-sm shadow-slate-200/50 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-950/80 dark:border-slate-800 dark:shadow-xl dark:shadow-black/20">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-[0.25em]">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Katalog Publik & Layanan</span>
                </div>
                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Temukan koleksi buku perpustakaan & daftar keanggotaan dengan mudah.
                </h1>
                <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                  Akses katalog publik tanpa login untuk mengecek judul buku, pengarang, kategori, dan ketersediaan eksemplar. Daftarkan diri Anda sekarang untuk mulai meminjam buku favorit Anda.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#catalog"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition active:scale-[0.98]"
                  >
                    <span>Lihat Katalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#register"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold border transition bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 shadow-xs dark:bg-slate-900/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-indigo-500 dark:hover:text-white"
                  >
                    <Users className="w-4 h-4" />
                    <span>Daftar Anggota</span>
                  </a>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold border transition bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:hover:text-white"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk Anggota</span>
                  </Link>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl p-6 border transition-all bg-white border-slate-200/80 shadow-xs hover:shadow-md dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-lg dark:hover:border-slate-700">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Total Judul</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{books.length}</p>
                </div>
                <div className="rounded-3xl p-6 border transition-all bg-white border-slate-200/80 shadow-xs hover:shadow-md dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-lg dark:hover:border-slate-700">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Ketersediaan</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-indigo-600 dark:text-white">{availableCount}</p>
                </div>
                <div className="rounded-3xl p-6 border transition-all bg-white border-slate-200/80 shadow-xs hover:shadow-md dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-lg dark:hover:border-slate-700">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Kategori</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{categories.length}</p>
                </div>
                <div className="rounded-3xl p-6 border transition-all bg-white border-slate-200/80 shadow-xs hover:shadow-md dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-lg dark:hover:border-slate-700">
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Keanggotaan</p>
                  <p className="mt-3 text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Terbuka Untuk Semua</p>
                </div>
              </div>
            </div>

            {/* Right Column: Ketentuan & Form Pendaftaran */}
            <div className="space-y-6">
              {/* Ketentuan Section */}
              <div id="ketentuan" className="rounded-3xl p-6 sm:p-7 border transition-all bg-white border-slate-200/80 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-lg scroll-mt-24">
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <ClipboardList className="w-5 h-5 shrink-0" />
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">Ketentuan Pendaftaran Anggota</h2>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>Anggota dapat terdaftar sebagai siswa, mahasiswa, guru/dosen, atau umum.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>Setelah terdaftar, anggota aktif dapat meminjam maksimal 3 eksemplar sekaligus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>Masa peminjaman umum 7 hari; koleksi referensi khusus dibaca di tempat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>Anggota yang memiliki tunggakan denda tidak dapat meminjam hingga denda dilunasi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 font-bold">•</span>
                    <span>Pendaftaran gratis dan dapat langsung dilakukan secara online melalui formulir di bawah.</span>
                  </li>
                </ul>
              </div>

              {/* Formulir Pendaftaran */}
              <div id="register" className="rounded-3xl p-6 sm:p-7 border transition-all bg-white border-slate-200/80 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-lg scroll-mt-24">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-500 dark:text-slate-400">Formulir Pendaftaran</p>
                    <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Daftar Anggota Baru</h2>
                  </div>
                  <div className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                    Gratis
                  </div>
                </div>

                {successMsg && (
                  <div className="mt-5 rounded-2xl p-4 text-sm border bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700/50 dark:text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  </div>
                )}
                {errorMsg && (
                  <div className="mt-5 rounded-2xl p-4 text-sm border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-700/50 dark:text-rose-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  </div>
                )}

                <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      <span>Nama Lengkap *</span>
                      <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-2xl px-4 py-3 text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500"
                        required
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      <span>No. Identitas *</span>
                      <input
                        type="text"
                        value={noIdentitas}
                        onChange={(e) => setNoIdentitas(e.target.value)}
                        placeholder="NISN / NIP / NIK"
                        className="w-full rounded-2xl px-4 py-3 text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      <span>Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (opsional)"
                        className="w-full rounded-2xl px-4 py-3 text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500"
                      />
                    </label>
                    <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      <span>No. Telepon</span>
                      <input
                        type="text"
                        value={noTelepon}
                        onChange={(e) => setNoTelepon(e.target.value)}
                        placeholder="Nomor telepon (opsional)"
                        className="w-full rounded-2xl px-4 py-3 text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500"
                      />
                    </label>
                  </div>

                  <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <span>Alamat</span>
                    <textarea
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Alamat lengkap tempat tinggal (opsional)"
                      rows={3}
                      className="w-full rounded-2xl px-4 py-3 text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500 resize-none"
                    />
                  </label>

                  <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <span>Jenis Anggota</span>
                    <select
                      value={jenisAnggota}
                      onChange={(e) => setJenisAnggota(e.target.value as any)}
                      className="w-full rounded-2xl px-4 py-3 text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 dark:focus:border-indigo-500"
                    >
                      <option value="siswa">Siswa</option>
                      <option value="mahasiswa">Mahasiswa</option>
                      <option value="guru_dosen">Guru / Dosen</option>
                      <option value="umum">Umum</option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Mengirim pendaftaran...' : 'Daftar Sekarang'}
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Catalog Section */}
          <section id="catalog" className="space-y-6 scroll-mt-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-indigo-600 dark:text-indigo-400">Katalog Publik</p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Daftar Buku Tersedia</h2>
                <p className="mt-2 text-sm leading-relaxed max-w-2xl text-slate-600 dark:text-slate-400">
                  Cari katalog buku berdasarkan judul, pengarang, penerbit, nomor panggil, atau kategori secara real-time tanpa perlu login.
                </p>
              </div>
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari judul buku, pengarang, ISBN..."
                  className="w-full rounded-full py-3 pl-12 pr-4 text-sm transition outline-none border shadow-xs bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border transition bg-white border-slate-200/80 shadow-xs dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-xl">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredBooks.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <BookOpen className="mx-auto h-8 w-8 text-slate-400 mb-3 opacity-60" />
                    <p className="font-medium">Tidak ada buku yang cocok dengan pencarian.</p>
                    <p className="text-xs mt-1 text-slate-400">Coba ubah kata kunci pencarian Anda.</p>
                  </div>
                ) : (
                  filteredBooks.map((book) => {
                    const availableEks = book.eksemplar?.filter((eks: any) => eks.status === 'tersedia').length || 0;
                    const totalEks = book.eksemplar?.length || 0;

                    return (
                      <div key={book.id_bahan} className="p-6 transition hover:bg-slate-50/90 dark:hover:bg-slate-950/50">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                              <span className="rounded-full px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-500/30">
                                {book.kategori?.nama_kategori || 'Umum'}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {totalEks} eksemplar total
                              </span>
                              {book.nomor_panggil && (
                                <>
                                  <span className="text-slate-300 dark:text-slate-700">•</span>
                                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                    {book.nomor_panggil}
                                  </span>
                                </>
                              )}
                            </div>
                            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
                              {book.judul}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {book.pengarang ? `Pengarang: ${book.pengarang}` : 'Pengarang tidak dicantumkan'} • {book.penerbit || 'Penerbit -'} • {book.tahun_terbit || '-'}
                            </p>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center rounded-2xl border px-4 py-3 text-right bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950/60 dark:border-slate-800 dark:text-slate-300 shrink-0 min-w-[130px]">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400">Status</span>
                            <div className="flex items-baseline gap-1 sm:mt-1">
                              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{availableEks}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">/ {totalEks}</span>
                            </div>
                            <span className={`text-[11px] font-semibold mt-0.5 ${availableEks > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {availableEks > 0 ? 'Tersedia Dipinjam' : 'Sedang Dipinjam'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t py-8 transition-colors bg-white border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800/80 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Sistem Manajemen Perpustakaan</span>
            <span>— Otomasi & Sirkulasi</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500">
            Koleksi buku, peminjaman, & otomasi operasional perpustakaan
          </p>
        </div>
      </footer>
    </div>
  );
}
