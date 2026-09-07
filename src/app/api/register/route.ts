import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { authArcjet, protectWithArcjet } from '@/lib/arcjet';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const arcjetDecision = await protectWithArcjet(authArcjet, request);
    if (!arcjetDecision.allowed) {
      return NextResponse.json(
        { error: arcjetDecision.message || 'Akses dibatasi oleh sistem keamanan.' },
        { status: arcjetDecision.status }
      );
    }

    const body = await request.json();
    const {
      nama,
      no_identitas,
      email,
      no_telepon,
      alamat,
      jenis_anggota,
      password,
      confirmPassword,
      turnstileToken,
    } = body ?? {};

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      undefined;

    const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error || 'Verifikasi keamanan gagal.' },
        { status: 400 }
      );
    }

    if (!nama || !no_identitas || !jenis_anggota) {
      return NextResponse.json({ error: 'Nama, nomor identitas, dan jenis anggota wajib diisi.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password wajib diisi.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ error: 'Konfirmasi password tidak cocok.' }, { status: 400 });
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
        password_hash: hashPassword(password),
        tanggal_daftar: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pendaftaran anggota error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server saat mendaftar anggota.' }, { status: 500 });
  }
}
