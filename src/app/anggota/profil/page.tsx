import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import { redirect } from 'next/navigation';
import MemberProfileClient from './MemberProfileClient';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage() {
  const session = await getSessionUser();
  if (!session || session.peran !== 'anggota') {
    redirect('/login');
  }

  const memberId = session.id_anggota as number;

  const member = await prisma.anggota.findUnique({
    where: { id_anggota: memberId },
  });

  if (!member) {
    redirect('/login');
  }

  const [activeLoansCount, totalLoansCount] = await Promise.all([
    prisma.transaksi_peminjaman.count({
      where: { id_anggota: memberId, status: 'dipinjam' },
    }),
    prisma.transaksi_peminjaman.count({
      where: { id_anggota: memberId },
    }),
  ]);

  const mfaStatus = {
    mfa_enabled: !!member.mfa_enabled,
    remainingRecoveryCodes: member.mfa_recovery_codes
      ? (JSON.parse(member.mfa_recovery_codes) as Array<{ used: boolean }>).filter(
          (c) => !c.used
        ).length
      : 0,
  };

  const serializedMember = {
    id_anggota: member.id_anggota,
    nama: member.nama,
    no_identitas: member.no_identitas,
    email: member.email,
    no_telepon: member.no_telepon,
    alamat: member.alamat,
    jenis_anggota: member.jenis_anggota,
    status_aktif: member.status_aktif,
    tanggal_daftar: member.tanggal_daftar.toISOString(),
  };

  return (
    <MemberProfileClient
      member={serializedMember}
      activeLoansCount={activeLoansCount}
      totalLoansCount={totalLoansCount}
      mfaStatus={mfaStatus}
    />
  );
}
