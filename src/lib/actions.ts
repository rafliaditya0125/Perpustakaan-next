'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from './db';
import { JenisDenda, KondisiEksemplar, StatusEksemplar } from '@prisma/client';
import crypto from 'crypto';

// Helper to hash password
function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Log activities helper
async function logAktivitas(id_pengguna: number, aktivitas: string, tabel_terdampak: string) {
  try {
    await prisma.log_aktivitas.create({
      data: {
        id_pengguna,
        aktivitas,
        tabel_terdampak,
      },
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

// 1. AUTH ACTIONS
export async function loginAction(formData: FormData) {
  'use server';
  
  // Validate formData exists
  if (!formData || !(formData instanceof FormData)) {
    redirect('/login?error=' + encodeURIComponent('Invalid form submission'));
  }
  
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    redirect('/login?error=' + encodeURIComponent('Username dan password wajib diisi'));
  }

  try {
    const user = await prisma.pengguna.findUnique({
      where: { username },
    });

    if (!user || !user.status_aktif) {
      redirect('/login?error=' + encodeURIComponent('Username tidak ditemukan atau akun tidak aktif'));
    }

    const hashedPassword = hashPassword(password);
    if (user.password_hash !== hashedPassword) {
      redirect('/login?error=' + encodeURIComponent('Password salah'));
    }

    // Set cookie session (simple JSON string base64 encoded for demonstration security)
    const sessionData = JSON.stringify({
      id_pengguna: user.id_pengguna,
      nama: user.nama,
      username: user.username,
      peran: user.peran,
    });
    
    const cookieStore = await cookies();
    cookieStore.set('session-user', Buffer.from(sessionData).toString('base64'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    await logAktivitas(user.id_pengguna, 'Login ke sistem', 'pengguna');
  } catch (err) {
    console.error('Login error:', err);
    redirect('/login?error=' + encodeURIComponent('Terjadi kesalahan sistem saat login'));
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session-user');
  
  if (sessionCookie) {
    try {
      const userData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('ascii'));
      await logAktivitas(userData.id_pengguna, 'Logout dari sistem', 'pengguna');
    } catch (_) {}
  }
  
  cookieStore.delete('session-user');
  redirect('/login');
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session-user');
  if (!session) return null;
  try {
    return JSON.parse(Buffer.from(session.value, 'base64').toString('ascii'));
  } catch (err) {
    return null;
  }
}

// 2. MEMBER ACTIONS
export async function createMemberAction(data: {
  nama: string;
  no_identitas: string;
  email?: string;
  no_telepon?: string;
  alamat?: string;
  jenis_anggota: 'siswa' | 'mahasiswa' | 'guru_dosen' | 'umum';
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const existing = await prisma.anggota.findUnique({
    where: { no_identitas: data.no_identitas },
  });
  if (existing) {
    return { error: 'Nomor identitas sudah terdaftar.' };
  }

  const newMember = await prisma.anggota.create({
    data: {
      ...data,
      tanggal_daftar: new Date(),
    },
  });

  await logAktivitas(user.id_pengguna, `Menambahkan anggota baru: ${data.nama}`, 'anggota');
  return { success: true, member: newMember };
}

export async function updateMemberAction(id: number, data: {
  nama: string;
  no_identitas: string;
  email?: string;
  no_telepon?: string;
  alamat?: string;
  jenis_anggota: 'siswa' | 'mahasiswa' | 'guru_dosen' | 'umum';
  status_aktif: boolean;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.anggota.update({
    where: { id_anggota: id },
    data,
  });

  await logAktivitas(user.id_pengguna, `Mengubah data anggota: ${data.nama}`, 'anggota');
  return { success: true };
}

// 3. BOOK & COLLECTION ACTIONS
export async function createBookAction(data: {
  judul: string;
  id_kategori: number;
  pengarang?: string;
  penerbit?: string;
  tahun_terbit?: number;
  isbn?: string;
  nomor_panggil?: string;
  deskripsi?: string;
  barcodes: string[];
}): Promise<{ success: true } | { error: string }> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Check barcodes unique
  for (const barcode of data.barcodes) {
    const existing = await prisma.eksemplar.findUnique({
      where: { kode_barcode: barcode },
    });
    if (existing) {
      return { error: `Kode barcode ${barcode} sudah digunakan.` };
    }
  }

  const book = await prisma.bahan_pustaka.create({
    data: {
      judul: data.judul,
      id_kategori: data.id_kategori,
      pengarang: data.pengarang,
      penerbit: data.penerbit,
      tahun_terbit: data.tahun_terbit,
      isbn: data.isbn,
      nomor_panggil: data.nomor_panggil,
      jumlah_eksemplar: data.barcodes.length,
      deskripsi: data.deskripsi,
    },
  });

  for (const barcode of data.barcodes) {
    await prisma.eksemplar.create({
      data: {
        id_bahan: book.id_bahan,
        kode_barcode: barcode,
        kondisi: 'baik',
        status: 'tersedia',
        lokasi_rak: 'Rak-' + data.nomor_panggil?.substring(0, 3) || 'Rak-Umum',
      },
    });
  }

  await logAktivitas(user.id_pengguna, `Menambahkan bahan pustaka baru: ${data.judul}`, 'bahan_pustaka');
  return { success: true };
}

export async function updateEksemplarKondisiStatus(id: number, kondisi: 'baik' | 'rusak_ringan' | 'rusak_berat', status: 'tersedia' | 'dipinjam' | 'dalam_perbaikan' | 'hilang') {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const updated = await prisma.eksemplar.update({
    where: { id_eksemplar: id },
    data: { kondisi, status },
    include: { bahan_pustaka: true },
  });

  await logAktivitas(user.id_pengguna, `Mengubah kondisi/status eksemplar ${updated.kode_barcode} (${updated.bahan_pustaka.judul})`, 'eksemplar');
  return { success: true };
}

// 4. SIRKULASI ACTIONS
export async function borrowBookAction(no_identitas: string, barcode: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Find member
  const member = await prisma.anggota.findUnique({
    where: { no_identitas },
  });
  if (!member) {
    return { error: 'Anggota tidak ditemukan.' };
  }
  if (!member.status_aktif) {
    return { error: 'Status keanggotaan tidak aktif.' };
  }

  // Validation 1: Fines check (SOP §9.4: "Anggota yang memiliki tunggakan denda tidak diperkenankan meminjam")
  const activeFines = await prisma.denda.findMany({
    where: {
      status_pembayaran: 'belum_bayar',
      transaksi_peminjaman: {
        id_anggota: member.id_anggota,
      },
    },
  });
  if (activeFines.length > 0) {
    return { error: 'Anggota memiliki tunggakan denda yang belum dilunasi.' };
  }

  // Validation 2: Active loans check (SOP §5.2: "Maksimal 3 eksemplar bahan pustaka")
  const activeLoans = await prisma.transaksi_peminjaman.findMany({
    where: {
      id_anggota: member.id_anggota,
      status: 'dipinjam',
    },
  });

  // Get policy parameter 'batas_pinjam'
  const policyLimitParam = await prisma.parameter_kebijakan.findUnique({
    where: { nama_parameter: 'batas_pinjam' },
  });
  const maxLimit = parseInt(policyLimitParam?.nilai || '3');

  if (activeLoans.length >= maxLimit) {
    return { error: `Anggota sudah mencapai batas maksimal peminjaman (${maxLimit} buku).` };
  }

  // Find eksemplar
  const eksemplar = await prisma.eksemplar.findUnique({
    where: { kode_barcode: barcode },
    include: { bahan_pustaka: true },
  });
  if (!eksemplar) {
    return { error: 'Eksemplar buku tidak ditemukan.' };
  }
  if (eksemplar.status !== 'tersedia') {
    return { error: `Buku dengan barcode ${barcode} sedang tidak tersedia (Status: ${eksemplar.status}).` };
  }

  // Policy: duration of loan based on category (SOP §5.3: "7 hari buku umum, 3 hari referensi")
  // Let's check call number starts with 'REF'
  const isReference = eksemplar.bahan_pustaka.nomor_panggil?.toUpperCase().startsWith('REF') || false;
  
  const paramKey = isReference ? 'lama_pinjam_referensi' : 'lama_pinjam_umum';
  const durationParam = await prisma.parameter_kebijakan.findUnique({
    where: { nama_parameter: paramKey },
  });
  const days = parseInt(durationParam?.nilai || (isReference ? '3' : '7'));

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + days);

  // Transaction block
  await prisma.$transaction([
    prisma.transaksi_peminjaman.create({
      data: {
        id_anggota: member.id_anggota,
        id_eksemplar: eksemplar.id_eksemplar,
        id_pengguna: user.id_pengguna,
        tanggal_pinjam: today,
        tanggal_jatuh_tempo: dueDate,
        status: 'dipinjam',
      },
    }),
    prisma.eksemplar.update({
      where: { id_eksemplar: eksemplar.id_eksemplar },
      data: { status: 'dipinjam' },
    }),
  ]);

  await logAktivitas(user.id_pengguna, `Memproses pinjaman buku ${eksemplar.bahan_pustaka.judul} untuk anggota ${member.nama}`, 'transaksi_peminjaman');
  return { success: true };
}

export async function returnBookAction(id_transaksi: number, kondisi_kembali: 'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang') {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const trx = await prisma.transaksi_peminjaman.findUnique({
    where: { id_transaksi },
    include: { eksemplar: { include: { bahan_pustaka: true } }, anggota: true },
  });

  if (!trx || trx.status !== 'dipinjam') {
    return { error: 'Transaksi tidak ditemukan atau sudah dikembalikan.' };
  }

  const today = new Date();
  
  // Calculate late days
  const timeDiff = today.getTime() - new Date(trx.tanggal_jatuh_tempo).getTime();
  const lateDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  let dendaNominal = 0;
  let dendaType: JenisDenda | null = null;

  if (lateDays > 0) {
    const rateParam = await prisma.parameter_kebijakan.findUnique({
      where: { nama_parameter: 'tarif_denda_harian' },
    });
    const rate = parseInt(rateParam?.nilai || '1000');
    dendaNominal = lateDays * rate;
    dendaType = 'terlambat';
  }

  let finalStatusEksemplar: StatusEksemplar = 'tersedia';
  let finalKondisiEksemplar: KondisiEksemplar = 'baik';

  if (kondisi_kembali === 'rusak_ringan') {
    finalKondisiEksemplar = 'rusak_ringan';
    finalStatusEksemplar = 'dalam_perbaikan';
    // Add fine for damage (e.g. flat Rp 10,000 for simple demonstration, or configured)
    dendaNominal += 15000;
    dendaType = dendaType ? 'terlambat' : 'rusak';
  } else if (kondisi_kembali === 'rusak_berat') {
    finalKondisiEksemplar = 'rusak_berat';
    finalStatusEksemplar = 'dalam_perbaikan';
    dendaNominal += 50000;
    dendaType = dendaType ? 'terlambat' : 'rusak';
  } else if (kondisi_kembali === 'hilang') {
    finalKondisiEksemplar = 'rusak_berat'; // Lost
    finalStatusEksemplar = 'hilang';
    // Lost fine (e.g., flat Rp 100,000)
    dendaNominal += 100000;
    dendaType = 'hilang';
  }

  // Update DB transaction
  await prisma.$transaction(async (tx) => {
    await tx.transaksi_peminjaman.update({
      where: { id_transaksi },
      data: {
        tanggal_kembali_aktual: today,
        status: kondisi_kembali === 'hilang' ? 'hilang' : 'dikembalikan',
      },
    });

    await tx.eksemplar.update({
      where: { id_eksemplar: trx.id_eksemplar },
      data: {
        status: finalStatusEksemplar,
        kondisi: finalKondisiEksemplar,
      },
    });

    if (dendaNominal > 0 && dendaType) {
      await tx.denda.create({
        data: {
          id_transaksi: trx.id_transaksi,
          jenis_denda: dendaType,
          nominal: dendaNominal,
          status_pembayaran: 'belum_bayar',
        },
      });
    }
  });

  await logAktivitas(user.id_pengguna, `Memproses pengembalian buku ${trx.eksemplar.bahan_pustaka.judul} dari anggota ${trx.anggota.nama}`, 'transaksi_peminjaman');
  return { success: true, denda: dendaNominal };
}

export async function extendLoanAction(id_transaksi: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const trx = await prisma.transaksi_peminjaman.findUnique({
    where: { id_transaksi },
    include: { eksemplar: { include: { bahan_pustaka: true } }, anggota: true },
  });

  if (!trx || trx.status !== 'dipinjam') {
    return { error: 'Transaksi tidak ditemukan atau buku sudah dikembalikan.' };
  }

  // SOP §8.3: "perpanjangan masa pinjam maksimal 1 kali"
  if (trx.jumlah_perpanjangan >= 1) {
    return { error: 'Batas maksimal perpanjangan sudah tercapai (1 kali).' };
  }

  // SOP §8.2: "validasi apakah buku sedang dipesan (reservasi) oleh anggota lain"
  const reservationCount = await prisma.reservasi.count({
    where: {
      id_bahan: trx.eksemplar.id_bahan,
      status: 'menunggu',
    },
  });

  if (reservationCount > 0) {
    return { error: 'Buku tidak bisa diperpanjang karena sudah direservasi oleh anggota lain.' };
  }

  // Calculate new due date (add 7 days for general books, 3 days for reference)
  const isReference = trx.eksemplar.bahan_pustaka.nomor_panggil?.toUpperCase().startsWith('REF') || false;
  const paramKey = isReference ? 'lama_pinjam_referensi' : 'lama_pinjam_umum';
  const durationParam = await prisma.parameter_kebijakan.findUnique({
    where: { nama_parameter: paramKey },
  });
  const days = parseInt(durationParam?.nilai || (isReference ? '3' : '7'));

  const newDueDate = new Date(trx.tanggal_jatuh_tempo);
  newDueDate.setDate(newDueDate.getDate() + days);

  await prisma.transaksi_peminjaman.update({
    where: { id_transaksi },
    data: {
      tanggal_jatuh_tempo: newDueDate,
      jumlah_perpanjangan: trx.jumlah_perpanjangan + 1,
    },
  });

  await logAktivitas(user.id_pengguna, `Memproses perpanjangan peminjaman ${trx.eksemplar.bahan_pustaka.judul} untuk anggota ${trx.anggota.nama}`, 'transaksi_peminjaman');
  return { success: true };
}

export async function payFineAction(id_denda: number): Promise<{ success: true } | { error: string }> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const denda = await prisma.denda.update({
    where: { id_denda },
    data: {
      status_pembayaran: 'lunas',
      tanggal_bayar: new Date(),
    },
    include: { transaksi_peminjaman: { include: { anggota: true } } },
  });

  await logAktivitas(user.id_pengguna, `Menerima pembayaran denda dari ${denda.transaksi_peminjaman.anggota.nama} sebesar Rp${denda.nominal.toString()}`, 'denda');
  return { success: true };
}

export async function createReservasiAction(id_anggota: number, id_bahan: number): Promise<{ success: true } | { error: string }> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const existing = await prisma.reservasi.findFirst({
    where: { id_anggota, id_bahan, status: 'menunggu' },
  });
  if (existing) {
    return { error: 'Reservasi untuk buku ini sudah ada.' };
  }

  const newReservation = await prisma.reservasi.create({
    data: {
      id_anggota,
      id_bahan,
      tanggal_reservasi: new Date(),
      status: 'menunggu',
    },
    include: { anggota: true, bahan_pustaka: true },
  });

  await logAktivitas(user.id_pengguna, `Menambahkan antrean reservasi buku ${newReservation.bahan_pustaka.judul} untuk ${newReservation.anggota.nama}`, 'reservasi');
  return { success: true };
}

// 5. OPERASIONAL HARIANS
export async function saveChecklistAction(jenis: 'buka' | 'tutup', items: any, catatan?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const checklist = await prisma.checklist_operasional.create({
    data: {
      id_pengguna: user.id_pengguna,
      tanggal: new Date(),
      jenis,
      item_checklist: JSON.stringify(items),
      catatan,
    },
  });

  await logAktivitas(user.id_pengguna, `Mengisi checklist operasional ${jenis} harian`, 'checklist_operasional');
  return { success: true, checklist };
}

export async function createLaporanKejadianAction(data: {
  jenis_kejadian: string;
  deskripsi: string;
  tindak_lanjut?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const report = await prisma.laporan_kejadian.create({
    data: {
      id_pengguna: user.id_pengguna,
      tanggal: new Date(),
      jenis_kejadian: data.jenis_kejadian,
      deskripsi: data.deskripsi,
      tindak_lanjut: data.tindak_lanjut,
      status: 'baru',
    },
  });

  await logAktivitas(user.id_pengguna, `Melaporkan kejadian insiden: ${data.jenis_kejadian}`, 'laporan_kejadian');
  return { success: true, report };
}

export async function updateLaporanKejadianStatus(id: number, status: 'baru' | 'ditindaklanjuti' | 'selesai', tindak_lanjut?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.laporan_kejadian.update({
    where: { id_kejadian: id },
    data: {
      status,
      tindak_lanjut,
    },
  });

  await logAktivitas(user.id_pengguna, `Memperbarui status penanganan laporan kejadian #${id}`, 'laporan_kejadian');
  return { success: true };
}

// 6. STOCK OPNAME ACTIONS
export async function startStockOpnameAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Check if there is an active running stock opname
  const active = await prisma.stock_opname.findFirst({
    where: { status: 'berjalan' },
  });
  if (active) {
    return { error: 'Sudah ada kegiatan Stock Opname yang sedang berjalan.' };
  }

  const opname = await prisma.stock_opname.create({
    data: {
      id_pengguna: user.id_pengguna,
      tanggal_mulai: new Date(),
      status: 'berjalan',
    },
  });

  await logAktivitas(user.id_pengguna, 'Memulai sesi Stock Opname baru', 'stock_opname');
  return { success: true, opname };
}

export async function processStockOpnameItemAction(id_opname: number, barcode: string, status_ditemukan: 'ditemukan' | 'tidak_ditemukan' | 'rusak', catatan?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const eksemplar = await prisma.eksemplar.findUnique({
    where: { kode_barcode: barcode },
  });
  if (!eksemplar) {
    return { error: `Barcode ${barcode} tidak ditemukan di sistem.` };
  }

  // Check if already checked in this session
  const checked = await prisma.detail_stock_opname.findFirst({
    where: {
      id_opname,
      id_eksemplar: eksemplar.id_eksemplar,
    },
  });

  if (checked) {
    return { error: `Buku dengan barcode ${barcode} sudah diproses sebelumnya dalam sesi ini.` };
  }

  // Add detail
  await prisma.detail_stock_opname.create({
    data: {
      id_opname,
      id_eksemplar: eksemplar.id_eksemplar,
      status_ditemukan,
      catatan,
    },
  });

  // If status is damaged/lost, update the physical eksemplar status as well
  if (status_ditemukan === 'rusak') {
    await prisma.eksemplar.update({
      where: { id_eksemplar: eksemplar.id_eksemplar },
      data: { kondisi: 'rusak_berat', status: 'dalam_perbaikan' },
    });
  } else if (status_ditemukan === 'tidak_ditemukan') {
    await prisma.eksemplar.update({
      where: { id_eksemplar: eksemplar.id_eksemplar },
      data: { status: 'hilang' },
    });
  }

  return { success: true };
}

export async function finishStockOpnameAction(id_opname: number) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  // Close session
  await prisma.stock_opname.update({
    where: { id_opname },
    data: {
      tanggal_selesai: new Date(),
      status: 'selesai',
    },
  });

  await logAktivitas(user.id_pengguna, `Menyelesaikan sesi Stock Opname #${id_opname}`, 'stock_opname');
  return { success: true };
}

// 7. POLICY PARAMETERS ACTIONS
export async function updatePolicyAction(id: number, nilai: string, keterangan?: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.peran !== 'admin') throw new Error('Only admin can update policies');

  const param = await prisma.parameter_kebijakan.update({
    where: { id_parameter: id },
    data: { nilai, keterangan },
  });

  await logAktivitas(user.id_pengguna, `Mengubah parameter kebijakan ${param.nama_parameter} menjadi: ${nilai}`, 'parameter_kebijakan');
  return { success: true };
}
