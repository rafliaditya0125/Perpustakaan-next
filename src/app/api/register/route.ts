import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nama,
      no_identitas,
      email,
      no_telepon,
      alamat,
      jenis_anggota,
    } = body ?? {};

    if (!nama || !no_identitas || !jenis_anggota) {
      return NextResponse.json({ error: 'Nama, nomor identitas, dan jenis anggota wajib diisi.' }, { status: 400 });
    }

    const allowedTypes = ['siswa', 'mahasiswa', 'guru_dosen', 'umum'];
    if (!allowedTypes.includes(jenis_anggota)) {
      return NextResponse.json({ error: 'Jenis anggota tidak valid.' }, { status: 400 });
    }

    const existing = await prisma.anggota.findUnique({
      where: { no_identitas },
    });

    if (existing) {
      return NextResponse.json({ error: 'Nomor identitas sudah terdaftar.' }, { status: 409 });
    }

    await prisma.anggota.create({
      data: {
        nama,
        no_identitas,
        email: email || null,
        no_telepon: no_telepon || null,
        alamat: alamat || null,
        jenis_anggota,
        tanggal_daftar: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pendaftaran anggota error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat mendaftar anggota.' }, { status: 500 });
  }
}
