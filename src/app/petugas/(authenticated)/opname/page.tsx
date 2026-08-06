import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/actions';
import OpnameClient from './OpnameClient';

export const metadata = {
  title: 'Stock Opname | E-Library Perpustakaan',
  description: 'Kelola sesi stock opname dan penyiangan (weeding) koleksi perpustakaan.',
};

export default async function OpnamePage() {
  await getSessionUser();

  // Fetch active session
  const activeSesi = await prisma.stock_opname.findFirst({
    where: { status: 'berjalan' },
    include: {
      pengguna: true,
      detail_stock_opname: {
        include: {
          eksemplar: { include: { bahan_pustaka: true } },
        },
        orderBy: { id_detail: 'desc' },
      },
    },
  });

  // Fetch history sessions (completed)
  const riwayatOpname = await prisma.stock_opname.findMany({
    where: { status: 'selesai' },
    orderBy: { tanggal_mulai: 'desc' },
    take: 10,
    include: {
      pengguna: true,
      _count: { select: { detail_stock_opname: true } },
    },
  });

  // Fetch damaged copies for weeding
  const eksemplarRusakBerat = await prisma.eksemplar.findMany({
    where: { kondisi: 'rusak_berat' },
    include: { bahan_pustaka: { include: { kategori: true } } },
    orderBy: { id_eksemplar: 'asc' },
  });

  return (
    <OpnameClient
      activeSesi={activeSesi ? {
        ...activeSesi,
        tanggal_mulai: activeSesi.tanggal_mulai.toISOString(),
        tanggal_selesai: activeSesi.tanggal_selesai?.toISOString() ?? null,
        detail_stock_opname: activeSesi.detail_stock_opname.map((d: any) => ({
          ...d,
        })),
      } : null}
      riwayatOpname={riwayatOpname.map((r: any) => ({
        ...r,
        tanggal_mulai: r.tanggal_mulai.toISOString(),
        tanggal_selesai: r.tanggal_selesai?.toISOString() ?? null,
      }))}
      eksemplarRusakBerat={eksemplarRusakBerat}
    />
  );
}
