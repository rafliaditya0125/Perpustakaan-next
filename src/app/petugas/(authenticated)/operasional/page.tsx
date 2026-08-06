import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import OperasionalClient from './OperasionalClient';

export const metadata = {
  title: 'Operasional Harian | E-Library Perpustakaan',
  description: 'Kelola checklist operasional harian dan laporan kejadian perpustakaan.',
};

export default async function OperasionalPage() {
  const user = await getSessionUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch checklist hari ini
  const checklistHariIni = await prisma.checklist_operasional.findMany({
    where: { tanggal: today },
    include: { pengguna: true },
    orderBy: { id_checklist: 'desc' },
  });

  // Fetch laporan kejadian (terbaru 20)
  const laporanKejadian = await prisma.laporan_kejadian.findMany({
    orderBy: { tanggal: 'desc' },
    take: 20,
    include: { pengguna: true },
  });

  return (
    <OperasionalClient
      user={user}
      checklistHariIni={checklistHariIni.map((c: any) => ({ ...c, tanggal: c.tanggal.toISOString() }))}
      laporanKejadian={laporanKejadian.map((l: any) => ({ ...l, tanggal: l.tanggal.toISOString() }))}
    />
  );
}
