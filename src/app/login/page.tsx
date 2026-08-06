import { loginAction } from '@/lib/actions';
import { BookMarked, User, Lock, AlertTriangle } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden font-sans">
      {/* Background Glowing Decors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Glassmorphism Login Container */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-4 shadow-inner shadow-indigo-500/10">
            <BookMarked className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">E-Perpustakaan</h1>
          <p className="text-xs text-slate-400 mt-1">Sistem Otomasi Operasional & Sirkulasi Perpustakaan</p>
        </div>

        {/* Login Form */}
        <form action={loginAction} method="POST" className="space-y-6">
          
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Masukkan username petugas..."
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
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
                placeholder="Masukkan password..."
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
          >
            Masuk ke Sistem
          </button>
        </form>

        {/* Footer info credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col gap-1 items-center">
          <p>Sistem ini dilindungi enkripsi standar keamanan perpustakaan.</p>
          <p className="text-slate-600 mt-2 font-mono">
            Demo: admin/admin | petugas/petugas | kepala/kepala
          </p>
        </div>

      </div>
    </div>
  );
}
