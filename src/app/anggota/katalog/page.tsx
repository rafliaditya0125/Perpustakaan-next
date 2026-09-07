import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import { redirect } from 'next/navigation';
import BookCatalogClient from './BookCatalogClient';

export const dynamic = 'force-dynamic';

export default async function MemberCatalogPage() {
  const session = await getSessionUser();
  if (!session || session.peran !== 'anggota') {
    redirect('/login');
  }

  const books = await prisma.bahan_pustaka.findMany({
    include: {
      kategori: true,
      eksemplar: true,
    },
    orderBy: { judul: 'asc' },
  });

  const categories = await prisma.kategori.findMany({
    orderBy: { nama_kategori: 'asc' },
  });

  return <BookCatalogClient books={books} categories={categories} />;
}
