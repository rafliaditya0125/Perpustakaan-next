import { getSessionUser } from '@/lib/actions';
import Sidebar from '@/components/Sidebar';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
