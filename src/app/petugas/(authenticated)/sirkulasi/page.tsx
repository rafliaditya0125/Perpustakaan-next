import prisma from '@/lib/db';
import CirculationClient from './CirculationClient';

export const dynamic = 'force-dynamic';

export default async function SirkulasiPage() {
  // Fetch active loans (dipinjam)
  const activeLoans = await prisma.transaksi_peminjaman.findMany({
    where: { status: 'dipinjam' },
    include: {
      anggota: true,
      eksemplar: {
        include: { bahan_pustaka: true },
      },
    },
    orderBy: { id_transaksi: 'desc' },
  });

  // Fetch unpaid fines (belum_bayar)
  const unpaidFines = await prisma.denda.findMany({
    where: { status_pembayaran: 'belum_bayar' },
    include: {
      transaksi_peminjaman: {
        include: {
          anggota: true,
          eksemplar: { include: { bahan_pustaka: true } },
        },
      },
    },
    orderBy: { id_denda: 'desc' },
  });

  // Fetch active reservations (menunggu)
  const activeReservations = await prisma.reservasi.findMany({
    where: { status: 'menunggu' },
    include: {
      anggota: true,
      bahan_pustaka: true,
    },
    orderBy: { id_reservasi: 'desc' },
  });

  // Fetch all members for reservasi selection
  const members = await prisma.anggota.findMany({
    where: { status_aktif: true },
    orderBy: { nama: 'asc' },
  });

  // Fetch all books for reservasi selection
  const books = await prisma.bahan_pustaka.findMany({
    orderBy: { judul: 'asc' },
  });

  return (
    <CirculationClient
      activeLoans={activeLoans}
      unpaidFines={unpaidFines}
      activeReservations={activeReservations}
      members={members}
      books={books}
    />
  );
}
