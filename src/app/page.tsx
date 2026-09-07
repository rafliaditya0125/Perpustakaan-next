import prisma from '@/lib/db';
import PublicHomeClient from './PublicHomeClient';
import { httpArcjet, protectWithArcjet } from '@/lib/arcjet';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const arcjetDecision = await protectWithArcjet(httpArcjet);
  if (!arcjetDecision.allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold">Akses Dibatasi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {arcjetDecision.message || 'Permintaan Anda dibatasi oleh sistem keamanan Arcjet.'}
          </p>
        </div>
      </div>
    );
  }
  type BookWithDetails = Awaited<ReturnType<typeof prisma.bahan_pustaka.findMany>>[number];
  type CategoryItem = Awaited<ReturnType<typeof prisma.kategori.findMany>>[number];

  let books: BookWithDetails[] = [];
  let categories: CategoryItem[] = [];

  try {
    books = await prisma.bahan_pustaka.findMany({
      include: {
        kategori: true,
        eksemplar: true,
      },
      orderBy: { judul: 'asc' },
    });

    categories = await prisma.kategori.findMany({
      orderBy: { no_klasifikasi: 'asc' },
    });
  } catch (error) {
    console.warn('⚠️ Tidak dapat terhubung ke database di RootPage. Menampilkan katalog kosong/offline mode:', error);
  }

  return <PublicHomeClient books={books} categories={categories} />;
}
