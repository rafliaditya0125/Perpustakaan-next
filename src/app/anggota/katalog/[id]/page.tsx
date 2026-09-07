import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import { redirect, notFound } from 'next/navigation';
import BookDetailClient from './BookDetailClient';

export const dynamic = 'force-dynamic';

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const session = await getSessionUser();
  if (!session || session.peran !== 'anggota') {
    redirect('/login');
  }

  const { id } = await params;
  const bookId = parseInt(id, 10);

  if (isNaN(bookId)) {
    notFound();
  }

  const book = await prisma.bahan_pustaka.findUnique({
    where: { id_bahan: bookId },
    include: {
      kategori: true,
      eksemplar: {
        orderBy: { id_eksemplar: 'asc' },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return <BookDetailClient book={book} />;
}
