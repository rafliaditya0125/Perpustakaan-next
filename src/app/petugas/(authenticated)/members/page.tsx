import prisma from '@/lib/db';
import MembersClient from './MembersClient';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const members = await prisma.anggota.findMany({
    orderBy: { nama: 'asc' },
  });

  return <MembersClient members={members} />;
}
