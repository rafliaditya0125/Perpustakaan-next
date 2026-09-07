import prisma from '@/lib/db';
import MemberDashboardClient from './MemberDashboardClient';
import { getSessionUser } from '@/lib/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AnggotaPage() {
  const session = await getSessionUser();
  if (!session || session.peran !== 'anggota') {
    redirect('/login');
  }

  const memberId = session.id_anggota as number;

  const [activeLoans, loanHistory, unpaidFines, pendingRequests] = await Promise.all([
    prisma.transaksi_peminjaman.findMany({
      where: { id_anggota: memberId, status: 'dipinjam' },
      include: {
        eksemplar: {
          include: {
            bahan_pustaka: {
              include: { kategori: true },
            },
          },
        },
        denda: true,
      },
      orderBy: { tanggal_jatuh_tempo: 'asc' },
    }),
    prisma.transaksi_peminjaman.findMany({
      where: { id_anggota: memberId },
      include: {
        eksemplar: {
          include: {
            bahan_pustaka: {
              include: { kategori: true },
            },
          },
        },
        denda: true,
      },
      orderBy: { tanggal_pinjam: 'desc' },
      take: 20,
    }),
    prisma.denda.aggregate({
      where: {
        transaksi_peminjaman: { id_anggota: memberId },
        status_pembayaran: 'belum_bayar',
      },
      _sum: { nominal: true },
    }),
    prisma.reservasi.findMany({
      where: { id_anggota: memberId, status: 'menunggu' },
      include: {
        bahan_pustaka: {
          include: {
            kategori: true,
            eksemplar: true,
          },
        },
      },
      orderBy: { tanggal_reservasi: 'desc' },
    }),
  ]);

  const unpaidFinesTotal = unpaidFines._sum.nominal ? Number(unpaidFines._sum.nominal) : 0;

  return (
    <MemberDashboardClient
      memberName={session.nama}
      memberId={memberId}
      memberIdentity={session.no_identitas || '-'}
      activeLoans={activeLoans}
      loanHistory={loanHistory}
      unpaidFinesTotal={unpaidFinesTotal}
      pendingRequests={pendingRequests}
    />
  );
}
