import { getSessionUser } from '@/lib/actions';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import MemberTopbar from '@/components/MemberTopbar';
import MfaPromptBanner from '@/components/MfaPromptBanner';

export default async function AnggotaLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.peran !== 'anggota') {
    redirect('/login');
  }

  const member = await prisma.anggota.findUnique({
    where: { id_anggota: user.id_anggota },
    select: {
      id_anggota: true,
      nama: true,
      no_identitas: true,
      email: true,
      jenis_anggota: true,
      mfa_enabled: true,
    },
  });

  const memberData = member || {
    id_anggota: user.id_anggota,
    nama: user.nama,
    no_identitas: user.no_identitas,
    jenis_anggota: 'umum',
    mfa_enabled: false,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <MemberTopbar member={memberData} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MfaPromptBanner
          mfaEnabled={!!member?.mfa_enabled}
          profileUrl="/anggota/profil#security"
          userType="anggota"
        />
        {children}
      </main>
    </div>
  );
}
