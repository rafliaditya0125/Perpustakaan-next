import prisma from '@/lib/db';
import PublicHomeClient from './PublicHomeClient';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
  const books = await prisma.bahan_pustaka.findMany({
    include: {
      kategori: true,
      eksemplar: true,
    },
    orderBy: { judul: 'asc' },
  });

  const categories = await prisma.kategori.findMany({
    orderBy: { no_klasifikasi: 'asc' },
  });

  return <PublicHomeClient books={books} categories={categories} />;
}
