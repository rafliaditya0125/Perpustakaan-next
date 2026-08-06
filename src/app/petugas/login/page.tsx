import { staffLoginAction } from '@/lib/actions';
import { BookMarked, User, Lock, AlertTriangle } from 'lucide-react';

export default async function PetugasLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-3xl text-emerald-300 mb-4 shadow-inner shadow-emerald-500/10">
            <BookMarked className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Portal Petugas</h1>
          <p className="text-sm text-slate-400 mt-2 text-center">Masuk sebagai Admin / Petugas / Kepala Perpustakaan untuk mengelola operasional perpustakaan.</p>
        </div>

        <form action={staffLoginAction} method="POST" className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block" htmlFor="username">
              Username Petugas
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Username petugas"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Password petugas"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex items-center gap-3 text-sm text-rose-300">
              <AlertTriangle className="w-5 h-5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            Masuk Petugas
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/70 text-xs text-slate-500 text-center">
          <p>Masuk sebagai anggota? <a href="/login" className="font-semibold text-white underline">Login Anggota</a></p>
        </div>
      </div>
    </div>
  );
}
