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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen sticky top-0">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <BookMarked className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight tracking-wider text-indigo-400">E-LIBRARY</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Perpustakaan Digital</p>
        </div>
      </div>

      {/* Logged in User Profile Card */}
      <div className="p-4 mx-4 my-6 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
          <UserCheck2 className="w-5 h-5" />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-semibold text-xs truncate text-slate-200" title={user.nama}>{user.nama}</h2>
          <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-semibold">{getRoleLabel(user.peran)}</p>
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500 pl-3'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      {/* Logout Footer Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <button
          onClick={() => logoutAction()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-red-950/30 border border-slate-800 hover:border-red-900/50 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
