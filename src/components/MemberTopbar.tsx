'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookMarked,
  User,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  CreditCard,
} from 'lucide-react';
import { logoutAction } from '@/lib/actions';

interface MemberTopbarProps {
  member: {
    id_anggota: number;
    nama: string;
    no_identitas: string;
    email?: string | null;
    jenis_anggota?: string;
  };
}

export default function MemberTopbar({ member }: MemberTopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Generate initials from name (e.g. "Rafli Aditya" -> "RA")
  const initials = member.nama
    ? member.nama
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : 'A';

  const formatJenisAnggota = (jenis?: string) => {
    switch (jenis) {
      case 'siswa':
        return 'Siswa';
      case 'mahasiswa':
        return 'Mahasiswa';
      case 'guru_dosen':
        return 'Guru / Dosen';
      case 'umum':
        return 'Umum';
      default:
        return 'Anggota';
    }
  };

  const isDashboard = pathname === '/anggota';
  const isProfile = pathname === '/anggota/profil';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl transition-colors border-b bg-white/85 border-slate-200/80 dark:bg-slate-900/85 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/anggota" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-2xl transition bg-emerald-50 border border-emerald-200 text-emerald-600 group-hover:bg-emerald-100 group-hover:border-emerald-300 dark:bg-emerald-600/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:group-hover:bg-emerald-600/20">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight transition text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300">
                  E-Perpustakaan
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Portal Anggota
                </span>
              </div>
            </Link>

            {/* Navigation links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/anggota"
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 ${
                  isDashboard
                    ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/anggota/profil"
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 ${
                  isProfile
                    ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kartu & Profil</span>
              </Link>
            </nav>
          </div>

          {/* Right Section: Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* User Profile Dropdown Container */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition outline-none cursor-pointer bg-slate-50/80 border-slate-200/90 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:border-slate-700/70 dark:hover:bg-slate-800"
              >
                {/* Avatar Badge */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>

                {/* Name & Role preview (hidden on small mobile) */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {member.nama}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {formatJenisAnggota(member.jenis_anggota)}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Modal */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-72 rounded-3xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 bg-white border-slate-200 text-slate-900 shadow-slate-300/40 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:shadow-black/60">
                  
                  {/* Dropdown Header: Account Details */}
                  <div className="px-3.5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 mb-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {member.nama}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      No: {member.no_identitas}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        {formatJenisAnggota(member.jenis_anggota)}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/anggota/profil"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:text-emerald-300 dark:hover:bg-slate-800/80 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover:text-emerald-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Profil Saya</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          Data pribadi & kartu anggota
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/anggota/profil#security"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-300 dark:hover:text-emerald-300 dark:hover:bg-slate-800/80 transition"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span>Keamanan & 2FA</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          Ubah password & autentikasi
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800/80" />

                  {/* Logout Action */}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-100/60 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span>Keluar Akun</span>
                        <span className="text-[10px] font-normal text-rose-400/80">
                          Akhiri sesi di perangkat ini
                        </span>
                      </div>
                    </button>
                  </form>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
