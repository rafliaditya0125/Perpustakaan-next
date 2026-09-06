import MfaChallengeClient from './MfaChallengeClient';

export const metadata = {
  title: 'Verifikasi Dua Langkah (2FA) | Portal Petugas',
  description: 'Verifikasi dua langkah untuk staf dan pengelola perpustakaan.',
};

export default async function PetugasMfaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-emerald-500/10 dark:bg-emerald-600/20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-cyan-500/10 dark:bg-cyan-600/20" />

      <MfaChallengeClient errorMsg={errorMsg} isStaff={true} />
    </div>
  );
}
