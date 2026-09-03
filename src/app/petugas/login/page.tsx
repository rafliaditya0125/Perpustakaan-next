import { staffLoginAction } from '@/lib/actions';
import { BookMarked, User, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PetugasLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-emerald-500/10 dark:bg-emerald-600/20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-cyan-500/10 dark:bg-cyan-600/20" />

      <div className="w-full max-w-md backdrop-blur-xl rounded-3xl p-8 border transition-all duration-200 relative z-10 bg-white/90 border-slate-200 shadow-xl shadow-slate-200/50 dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-2xl dark:shadow-black/40">
        
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold transition text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3.5 rounded-2xl mb-4 transition bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-400/20 dark:text-emerald-300">
            <BookMarked className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Portal Petugas</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Masuk untuk mengelola operasional dan sirkulasi perpustakaan.</p>
        </div>

        <form action={staffLoginAction} method="POST" className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block text-slate-700 dark:text-slate-300" htmlFor="username">
              Username Petugas
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Username petugas"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password petugas"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm transition outline-none border bg-slate-50/80 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900 dark:focus:border-emerald-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl flex items-center gap-3 text-xs border bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300">
              <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
          >
            Masuk Petugas
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-xs text-center border-slate-200 text-slate-500 dark:border-slate-800/70 dark:text-slate-400">
          <p>Bukan petugas? <Link href="/login" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">Login Anggota di sini</Link></p>
        </div>
      </div>
    </div>
  );
}
