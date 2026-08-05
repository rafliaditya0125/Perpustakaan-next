import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Pengaturan & Log | E-Library Perpustakaan',
  description: 'Pengaturan parameter kebijakan sistem perpustakaan, log aktivitas, dan manajemen pengguna.',
};

export default async function SettingsPage() {
  const user = await getSessionUser();

  const parameters = await prisma.parameter_kebijakan.findMany({
    orderBy: { id_parameter: 'asc' },
  });

  const logAktivitas = await prisma.log_aktivitas.findMany({
    orderBy: { waktu: 'desc' },
    take: 50,
    include: { pengguna: true },
  });

  const pengguna = await prisma.pengguna.findMany({
    orderBy: { id_pengguna: 'asc' },
    select: {
      id_pengguna: true,
      nama: true,
      username: true,
      peran: true,
      status_aktif: true,
      created_at: true,
    },
  });

  return (
    <SettingsClient
      currentUser={user}
      parameters={parameters}
      logAktivitas={logAktivitas.map((l: any) => ({
        ...l,
        id_log: l.id_log.toString(),
        waktu: l.waktu.toISOString(),
      }))}
      pengguna={pengguna.map((p: any) => ({
        ...p,
        created_at: p.created_at.toISOString(),
      }))}
    />
  );
}
