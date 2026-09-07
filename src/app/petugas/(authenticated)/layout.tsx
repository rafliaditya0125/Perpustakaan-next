import { getSessionUser } from '@/lib/actions';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import MfaPromptBanner from '@/components/MfaPromptBanner';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/petugas/login');
  }

  const currentUser = await prisma.pengguna.findUnique({
    where: { id_pengguna: user.id_pengguna },
    select: { mfa_enabled: true },
  });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <MfaPromptBanner
            mfaEnabled={!!currentUser?.mfa_enabled}
            profileUrl="/petugas/settings?tab=keamanan"
            userType="petugas"
          />
          {children}
        </div>
      </main>
    </div>
  );
}
