import prisma from '@/lib/db';
import PublicHomeClient from './PublicHomeClient';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  let books: any[] = [];
  let categories: any[] = [];

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
