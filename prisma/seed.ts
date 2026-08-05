import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import { printDatabaseConfig } from './env-helper';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database perpustakaan...\n');
  
  // Print database config
  printDatabaseConfig();

  // 1. Seed pengguna (Users)
  console.log('Seeding pengguna...');
  const users = [
    {
      nama: 'Administrator',
      username: 'admin',
      password_hash: hashPassword('admin'),
      peran: 'admin' as const,
      status_aktif: true,
    },
    {
      nama: 'Petugas Perpustakaan',
      username: 'petugas',
      password_hash: hashPassword('petugas'),
      peran: 'petugas' as const,
      status_aktif: true,
    },
    {
      nama: 'Kepala Perpustakaan',
      username: 'kepala',
      password_hash: hashPassword('kepala'),
      peran: 'kepala_perpustakaan' as const,
      status_aktif: true,
    },
  ];

  for (const u of users) {
    await prisma.pengguna.upsert({
      where: { username: u.username },
      update: {},
      create: u,
    });
  }

  // 2. Seed parameter_kebijakan (Policy parameters)
  console.log('Seeding parameter kebijakan...');
  const parameters = [
    {
      nama_parameter: 'batas_pinjam',
      nilai: '3',
      keterangan: 'Batas maksimal eksemplar yang boleh dipinjam dalam satu waktu',
    },
    {
      nama_parameter: 'tarif_denda_harian',
      nilai: '1000',
      keterangan: 'Tarif denda keterlambatan pengembalian per hari per eksemplar (Rupiah)',
    },
    {
      nama_parameter: 'lama_pinjam_umum',
      nilai: '7',
      keterangan: 'Durasi maksimal peminjaman untuk koleksi buku umum (hari)',
    },
    {
      nama_parameter: 'lama_pinjam_referensi',
      nilai: '3',
      keterangan: 'Durasi maksimal peminjaman untuk koleksi buku referensi (hari)',
    },
  ];

  for (const p of parameters) {
    await prisma.parameter_kebijakan.upsert({
      where: { nama_parameter: p.nama_parameter },
      update: {},
      create: p,
    });
  }

  // 3. Seed kategori (Categories)
  console.log('Seeding kategori...');
  const categories = [
    { nama_kategori: 'Karya Umum & Komputer', no_klasifikasi: '000' },
    { nama_kategori: 'Filsafat & Psikologi', no_klasifikasi: '100' },
    { nama_kategori: 'Agama', no_klasifikasi: '200' },
    { nama_kategori: 'Ilmu Sosial', no_klasifikasi: '300' },
    { nama_kategori: 'Bahasa', no_klasifikasi: '400' },
    { nama_kategori: 'Sains & Matematika', no_klasifikasi: '500' },
    { nama_kategori: 'Teknologi & Ilmu Terapan', no_klasifikasi: '600' },
    { nama_kategori: 'Kesenian & Rekreasi', no_klasifikasi: '700' },
    { nama_kategori: 'Sastra', no_klasifikasi: '800' },
    { nama_kategori: 'Sejarah & Geografi', no_klasifikasi: '900' },
  ];

  const dbCategories = [];
  for (const cat of categories) {
    const existing = await prisma.kategori.findFirst({
      where: { no_klasifikasi: cat.no_klasifikasi },
    });
    if (existing) {
      dbCategories.push(existing);
    } else {
      const created = await prisma.kategori.create({ data: cat });
      dbCategories.push(created);
    }
  }

  // 4. Seed bahan_pustaka (Books)
  console.log('Seeding bahan pustaka...');
  
  interface BookData {
    judul: string;
    id_kategori: number;
    pengarang: string;
    penerbit: string;
    tahun_terbit: number;
    isbn: string;
    nomor_panggil: string;
    jumlah_eksemplar: number;
    deskripsi: string;
    eksemplars: string[];
  }

  const books: BookData[] = [
    {
      judul: 'Dasar Pemrograman Next.js & TypeScript',
      id_kategori: dbCategories.find(c => c.no_klasifikasi === '000')!.id_kategori,
      pengarang: 'Rafli Aditya',
      penerbit: 'TechPress Jakarta',
      tahun_terbit: 2025,
      isbn: '978-602-1234-56-7',
      nomor_panggil: '005.1 RAF d',
      jumlah_eksemplar: 3,
      deskripsi: 'Panduan lengkap pemrograman web modern menggunakan Next.js App Router dan TypeScript.',
      eksemplars: ['B000101', 'B000102', 'B000103'],
    },
    {
      judul: 'Matematika Diskrit dan Aplikasinya',
      id_kategori: dbCategories.find(c => c.no_klasifikasi === '500')!.id_kategori,
      pengarang: 'Rinaldi Munir',
      penerbit: 'Informatika Bandung',
      tahun_terbit: 2021,
      isbn: '978-602-8765-43-2',
      nomor_panggil: '511.3 MUN m',
      jumlah_eksemplar: 2,
      deskripsi: 'Buku teks standar untuk materi logika, himpunan, graf, pohon, dan algoritma.',
      eksemplars: ['B000501', 'B000502'],
    },
    {
      judul: 'Ensiklopedia Sejarah Dunia',
      id_kategori: dbCategories.find(c => c.no_klasifikasi === '900')!.id_kategori,
      pengarang: 'Prof. Sartono',
      penerbit: 'Gramedia Pustaka Utama',
      tahun_terbit: 2019,
      isbn: '978-979-22-9876-5',
      nomor_panggil: 'REF 909 SAR e', // Buku Referensi
      jumlah_eksemplar: 1,
      deskripsi: 'Buku referensi sejarah lengkap dari zaman kuno hingga era modern.',
      eksemplars: ['B000901'],
    },
  ];

  for (const b of books) {
    const existing = await prisma.bahan_pustaka.findFirst({
      where: { judul: b.judul },
    });
    if (!existing) {
      const createdBook = await prisma.bahan_pustaka.create({
        data: {
          judul: b.judul,
          id_kategori: b.id_kategori,
          pengarang: b.pengarang,
          penerbit: b.penerbit,
          tahun_terbit: b.tahun_terbit,
          isbn: b.isbn,
          nomor_panggil: b.nomor_panggil,
          jumlah_eksemplar: b.jumlah_eksemplar,
          deskripsi: b.deskripsi,
        },
      });

      // Create physical eksemplars
      for (const barcode of b.eksemplars) {
        await prisma.eksemplar.create({
          data: {
            id_bahan: createdBook.id_bahan,
            kode_barcode: barcode,
            kondisi: 'baik',
            status: 'tersedia',
            lokasi_rak: 'Rak A' + b.id_kategori,
          },
        });
      }
    }
  }

  // 5. Seed anggota (Members)
  console.log('Seeding anggota...');
  const members = [
    {
      nama: 'Rafli Aditya',
      no_identitas: 'NISN001',
      email: 'rafli@perpustakaan.my.id',
      no_telepon: '081234567890',
      alamat: 'Jl. Merdeka No. 17, Jakarta',
      jenis_anggota: 'siswa' as const,
      status_aktif: true,
      tanggal_daftar: new Date(),
    },
    {
      nama: 'Jane Doe',
      no_identitas: 'NIK320101010190',
      email: 'jane.doe@gmail.com',
      no_telepon: '08987654321',
      alamat: 'Apartemen Green Pramuka Tower B-10',
      jenis_anggota: 'umum' as const,
      status_aktif: true,
      tanggal_daftar: new Date(),
    },
    {
      nama: 'Prof. Dr. Ir. Budi Santoso',
      no_identitas: 'NIP198005122005011002',
      email: 'budi.santoso@univ.ac.id',
      no_telepon: '081122334455',
      alamat: 'Perumahan Dosen UI Block C',
      jenis_anggota: 'guru_dosen' as const,
      status_aktif: true,
      tanggal_daftar: new Date(),
    },
  ];

  for (const m of members) {
    const existing = await prisma.anggota.findFirst({
      where: { no_identitas: m.no_identitas },
    });
    if (!existing) {
      await prisma.anggota.create({ data: m });
    }
  }

  console.log('Database perpustakaan successfully seeded!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
