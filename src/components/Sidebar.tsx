'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  RefreshCw, 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  PackageSearch, 
  Settings, 
  LogOut, 
  UserCheck2, 
  BookMarked 
} from 'lucide-react';
import { logoutAction } from '@/lib/actions';

interface SidebarProps {
  user: {
    nama: string;
    username: string;
    peran: 'admin' | 'kepala_perpustakaan' | 'petugas';
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'kepala_perpustakaan': return 'Kepala Perpustakaan';
      case 'petugas': return 'Petugas Layanan';
      default: return role;
    }
  };

  const navItems = [
    { href: '/petugas/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'kepala_perpustakaan', 'petugas'] },
    { href: '/petugas/sirkulasi', label: 'Sirkulasi & Denda', icon: RefreshCw, roles: ['admin', 'petugas'] },
    { href: '/petugas/books', label: 'Koleksi Buku', icon: BookOpen, roles: ['admin', 'kepala_perpustakaan', 'petugas'] },
    { href: '/petugas/members', label: 'Keanggotaan', icon: Users, roles: ['admin', 'petugas'] },
    { href: '/petugas/operasional', label: 'Operasional Harian', icon: ClipboardCheck, roles: ['admin', 'petugas'] },
    { href: '/petugas/opname', label: 'Stock Opname', icon: PackageSearch, roles: ['admin', 'petugas', 'kepala_perpustakaan'] },
    { href: '/petugas/settings', label: 'Pengaturan & Log', icon: Settings, roles: ['admin'] },
  ];

  return (
    <aside className="w-64 border-r flex flex-col h-screen sticky top-0 transition-colors duration-200 bg-white border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b transition-colors gap-3 bg-slate-50/80 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm leading-tight tracking-tight text-indigo-600 dark:text-indigo-400">E-LIBRARY</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold dark:text-slate-400">Perpustakaan Digital</p>
        </div>
      </div>

      {/* Logged in User Profile Card */}
      <div className="p-4 mx-4 my-6 rounded-2xl flex items-center gap-3 transition-colors border bg-slate-50 border-slate-200 dark:bg-slate-950/40 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors bg-white text-indigo-600 border-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700 shrink-0">
          <UserCheck2 className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-bold text-xs truncate text-slate-900 dark:text-slate-200" title={user.nama}>{user.nama}</h2>
          <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-semibold dark:text-slate-400">{getRoleLabel(user.peran)}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(user.peran))
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-xs dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Logout Footer Section */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
        <button
          onClick={() => logoutAction()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all border bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-red-950/30 dark:hover:text-white dark:hover:border-red-900/50 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
