import { memberLoginAction } from '@/lib/actions';
import { BookMarked, User, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Background Glowing Decors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-indigo-500/10 dark:bg-indigo-600/20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-violet-500/10 dark:bg-violet-600/20" />

      {/* Glassmorphism Login Container */}
      <div className="w-full max-w-md backdrop-blur-xl rounded-3xl p-8 border transition-all duration-200 relative z-10 bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-2xl dark:shadow-black/40">
        
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold transition text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 rounded-2xl mb-4 transition bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-600/10 dark:border-indigo-500/20 dark:text-indigo-400">
            <BookMarked className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Login Anggota</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sistem Otomasi Operasional & Sirkulasi Perpustakaan</p>
        </div>

        {/* Login Form */}
        <form action={memberLoginAction} method="POST" className="space-y-5">
          
          {/* Identity Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block text-slate-700 dark:text-slate-300" htmlFor="no_identitas">
              No. Identitas Anggota
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="no_identitas"
                name="no_identitas"
                type="text"
                placeholder="Masukkan nomor identitas..."
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block text-slate-700 dark:text-slate-300" htmlFor="password">
              Password (Tidak Diperlukan)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-600">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Login tanpa password..."
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Masuk anggota cukup dengan memasukkan nomor identitas terdaftar.
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl flex items-center gap-3 text-xs border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition active:scale-[0.98] cursor-pointer"
          >
            Masuk Anggota
          </button>
        </form>

        {/* Footer info credentials */}
        <div className="mt-8 pt-6 border-t text-xs flex flex-col gap-2 items-center text-center border-slate-200 text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
          <p>
            Belum terdaftar?{' '}
            <Link href="/#register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              Daftar keanggotaan di sini
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
