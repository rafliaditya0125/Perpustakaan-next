import prisma from '@/lib/db';
import BooksClient from './BooksClient';

export const dynamic = 'force-dynamic';

export default async function BooksPage() {
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

  return <BooksClient books={books} categories={categories} />;
}
