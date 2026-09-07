import prisma from '@/lib/db';
import MemberPortalClient from './MemberPortalClient';
import { getSessionUser } from '@/lib/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AnggotaPage() {
  const session = await getSessionUser();
  if (!session || session.peran !== 'anggota') {
    redirect('/login');
  }

  const memberId = session.id_anggota as number;
  const books = await prisma.bahan_pustaka.findMany({
    include: { kategori: true, eksemplar: true },
    orderBy: { judul: 'asc' },
  });

  const activeLoans = await prisma.transaksi_peminjaman.findMany({
    where: { id_anggota: memberId, status: 'dipinjam' },
    include: { eksemplar: { include: { bahan_pustaka: true } } },
    orderBy: { tanggal_jatuh_tempo: 'asc' },
  });

  const loanHistory = await prisma.transaksi_peminjaman.findMany({
    where: { id_anggota: memberId },
    include: { eksemplar: { include: { bahan_pustaka: true } } },
    orderBy: { tanggal_pinjam: 'desc' },
  });

  const member = await prisma.anggota.findUnique({
    where: { id_anggota: memberId },
    select: { mfa_enabled: true, mfa_recovery_codes: true },
  });

  const mfaStatus = {
    mfa_enabled: !!member?.mfa_enabled,
    remainingRecoveryCodes: member?.mfa_recovery_codes
      ? JSON.parse(member.mfa_recovery_codes).filter((c: any) => !c.used).length
      : 0,
  };

  return (
    <MemberPortalClient
      memberName={session.nama}
      books={books}
      activeLoans={activeLoans}
      loanHistory={loanHistory}
      mfaStatus={mfaStatus}
    />
  );
}
