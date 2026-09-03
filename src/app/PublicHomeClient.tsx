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

export default function PublicHomeClient({ books, categories }: PublicHomeClientProps) {
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
    () => books.reduce((sum, book) => sum + book.eksemplar.filter((eks: any) => eks.status === 'tersedia').length, 0),
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
        setSuccessMsg('Pendaftaran anggota berhasil! Silakan cek data Anda atau hubungi petugas untuk aktivasi kartu anggota.');
        resetForm();
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat mengirim pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 transition">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-200 transition">
                  E-Perpustakaan
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Katalog & Layanan
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#catalog" className="hover:text-white transition py-1">
                Katalog Buku
              </a>
              <a href="#ketentuan" className="hover:text-white transition py-1">
                Ketentuan Layanan
              </a>
              <a href="#register" className="hover:text-white transition py-1">
                Daftar Anggota
              </a>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-[0.98] transition"
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
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-300">
              <a
                href="#catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition"
              >
                Katalog Buku
              </a>
              <a
                href="#ketentuan"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition"
              >
                Ketentuan Layanan
              </a>
              <a
                href="#register"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition"
              >
                Daftar Anggota
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
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
              <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-8 shadow-xl shadow-slate-950/20">
                <div className="flex items-center gap-3 text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-[0.3em] font-semibold">Katalog Publik</span>
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Temukan koleksi buku perpustakaan kami dan daftar sebagai anggota secara mudah.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Akses katalog publik tanpa login, lihat judul buku, kategori, dan status ketersediaan. Jika Anda belum menjadi anggota, silakan daftar sekarang untuk mendapatkan kartu anggota dan layanan peminjaman.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#catalog" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500">
                    Lihat Katalog
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href="#register" className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigo-500 hover:text-white">
                    Daftar Anggota
                    <Users className="w-4 h-4" />
                  </a>
                  <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950/40 px-5 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-900/50 hover:border-indigo-400 hover:text-white">
                    Masuk Anggota
                    <LogIn className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total Judul</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{books.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Ketersediaan</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{availableCount}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Kategori</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{categories.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Keanggotaan</p>
                  <p className="mt-4 text-3xl font-semibold text-white">Terbuka untuk semua</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div id="ketentuan" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 scroll-mt-24">
                <div className="flex items-center gap-3 text-emerald-300">
                  <ClipboardList className="w-5 h-5" />
                  <h2 className="text-lg font-semibold text-white">Ketentuan Pendaftaran Anggota</h2>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                  <li>• Anggota dapat terdaftar sebagai siswa, mahasiswa, guru/dosen, atau umum.</li>
                  <li>• Setelah terdaftar, anggota aktif dapat meminjam maksimal 3 eksemplar sekaligus.</li>
                  <li>• Masa peminjaman umum 7 hari; koleksi referensi hanya dibaca di tempat.</li>
                  <li>• Anggota yang memiliki tunggakan denda tidak dapat meminjam sampai denda dilunasi.</li>
                  <li>• Pendaftaran gratis dan dapat dilakukan secara online melalui formulir di bawah ini.</li>
                </ul>
              </div>

              <div id="register" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 scroll-mt-24">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Formulir Pendaftaran</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Daftar Anggota Baru</h2>
                  </div>
                  <div className="rounded-2xl bg-indigo-600/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">Gratis</div>
                </div>

                {successMsg && (
                  <div className="mt-5 rounded-2xl border border-emerald-700/50 bg-emerald-950/30 p-4 text-sm text-emerald-200">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{successMsg}</div>
                  </div>
                )}
                {errorMsg && (
                  <div className="mt-5 rounded-2xl border border-rose-700/50 bg-rose-950/30 p-4 text-sm text-rose-200">
                    <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400" />{errorMsg}</div>
                  </div>
                )}

                <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Nama Lengkap *</span>
                      <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                        required
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>No. Identitas *</span>
                      <input
                        type="text"
                        value={noIdentitas}
                        onChange={(e) => setNoIdentitas(e.target.value)}
                        placeholder="NISN / NIP / NIK"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (opsional)"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      <span>No. Telepon</span>
                      <input
                        type="text"
                        value={noTelepon}
                        onChange={(e) => setNoTelepon(e.target.value)}
                        placeholder="Nomor telepon (opsional)"
                        className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
                      />
                    </label>
                  </div>

                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Alamat</span>
                    <textarea
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Alamat lengkap (opsional)"
                      rows={3}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 resize-none"
                    />
                  </label>

                  <label className="space-y-2 text-sm text-slate-300">
                    <span>Jenis Anggota</span>
                    <select
                      value={jenisAnggota}
                      onChange={(e) => setJenisAnggota(e.target.value as any)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
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
                    className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? 'Mengirim pendaftaran...' : 'Daftar Sekarang'}
                  </button>
                </form>
              </div>
            </div>
          </section>

          <section id="catalog" className="space-y-6 scroll-mt-24">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Katalog Publik</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Daftar Buku Tersedia</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400 max-w-2xl">
                  Cari katalog berdasarkan judul, pengarang, kategori, ISBN, atau nomor panggil. Semua data buku bisa diakses tanpa perlu login.
                </p>
              </div>
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari buku..."
                  className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 py-3 pl-12 pr-4 text-sm text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl shadow-slate-950/20">
              <div className="grid gap-0 divide-y divide-slate-800">
                {filteredBooks.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">Tidak ada buku yang cocok dengan pencarian.</div>
                ) : (
                  filteredBooks.map((book) => (
                    <div key={book.id_bahan} className="p-6 hover:bg-slate-950/50 transition">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                            <span>{book.kategori?.nama_kategori || 'Kategori tidak tersedia'}</span>
                            <span className="text-slate-700">•</span>
                            <span>{book.eksemplar.length} eksemplar</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{book.judul}</h3>
                          <p className="text-sm leading-6 text-slate-400">
                            {book.pengarang ? `Pengarang: ${book.pengarang}` : 'Pengarang tidak tersedia'} • {book.penerbit || 'Penerbit tidak tersedia'} • {book.tahun_terbit || '-'}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 rounded-3xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-right text-slate-300">
                          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Ketersediaan</span>
                          <span className="text-2xl font-semibold text-white">{book.eksemplar.filter((eks: any) => eks.status === 'tersedia').length}</span>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Tersedia</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
