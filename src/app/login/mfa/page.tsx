import MemberMfaClient from './MemberMfaClient';

export const metadata = {
  title: 'Verifikasi Dua Langkah (2FA) | Login Anggota',
  description: 'Verifikasi dua langkah untuk anggota perpustakaan.',
};

export default async function MemberMfaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Background Glowing Decors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-indigo-500/10 dark:bg-indigo-600/20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none bg-violet-500/10 dark:bg-violet-600/20" />

      <MemberMfaClient errorMsg={errorMsg} />
    </div>
  );
}
