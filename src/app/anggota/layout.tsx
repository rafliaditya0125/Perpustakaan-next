import { getSessionUser } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function AnggotaLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.peran !== 'anggota') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
