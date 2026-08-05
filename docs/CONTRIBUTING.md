# 🤝 Contributing to E-Perpustakaan

Terima kasih telah tertarik untuk berkontribusi pada project E-Perpustakaan! Panduan ini akan membantu Anda memulai.

---

## 📋 Code of Conduct

Project ini mengikuti kode etik berikut:
- Bersikap hormat dan profesional
- Menerima kritik konstruktif
- Fokus pada apa yang terbaik untuk komunitas
- Menunjukkan empati terhadap kontributor lain

---

## 🚀 Cara Berkontribusi

### 1. Melaporkan Bug

Jika menemukan bug, buat issue dengan informasi berikut:
- **Deskripsi bug**: Penjelasan singkat dan jelas
- **Cara reproduksi**: Langkah-langkah untuk memunculkan bug
- **Perilaku yang diharapkan**: Apa yang seharusnya terjadi
- **Perilaku aktual**: Apa yang benar-benar terjadi
- **Screenshot**: Jika memungkinkan
- **Environment**: OS, browser, Node.js version

**Template Issue Bug:**
```markdown
## Deskripsi Bug
[Jelaskan bug secara singkat]

## Cara Reproduksi
1. Buka halaman...
2. Klik tombol...
3. Scroll ke...
4. Lihat error

## Perilaku yang Diharapkan
[Apa yang seharusnya terjadi]

## Perilaku Aktual
[Apa yang benar-benar terjadi]

## Screenshot
[Jika ada]

## Environment
- OS: [e.g., Windows 11, Ubuntu 22.04]
- Browser: [e.g., Chrome 120, Firefox 119]
- Node.js: [e.g., v18.17.0]
```

### 2. Request Fitur Baru

Untuk mengajukan fitur baru, buat issue dengan format:
- **Deskripsi fitur**: Apa yang ingin Anda tambahkan
- **Use case**: Kapan dan mengapa fitur ini berguna
- **Alternatif**: Solusi alternatif yang sudah Anda pertimbangkan

**Template Issue Feature Request:**
```markdown
## Deskripsi Fitur
[Jelaskan fitur yang ingin ditambahkan]

## Use Case
[Kapan dan bagaimana fitur ini akan digunakan]

## Manfaat
[Mengapa fitur ini penting]

## Alternatif
[Solusi alternatif yang sudah dipertimbangkan]

## Implementasi Usulan (Opsional)
[Ide implementasi jika ada]
```

### 3. Pull Request

#### Workflow Git

1. **Fork repository** ke akun GitHub Anda
2. **Clone** fork Anda:
   ```bash
   git clone https://github.com/username-anda/Perpustakaan-next.git
   cd Perpustakaan-next
   ```

3. **Buat branch baru** dari `main`:
   ```bash
   git checkout -b feature/nama-fitur
   # atau
   git checkout -b fix/nama-bug
   ```

4. **Buat perubahan** Anda dan commit:
   ```bash
   git add .
   git commit -m "feat: menambahkan fitur X"
   ```

5. **Push** ke fork Anda:
   ```bash
   git push origin feature/nama-fitur
   ```

6. **Buat Pull Request** dari fork Anda ke repository utama

#### Commit Message Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Fitur baru
- `fix`: Bug fix
- `docs`: Perubahan dokumentasi
- `style`: Format code (tidak mengubah logika)
- `refactor`: Refactoring code
- `test`: Menambah atau memperbaiki test
- `chore`: Maintenance (dependency update, dll.)

**Contoh:**
```bash
feat(circulation): menambahkan fitur auto-renewal

Implementasi perpanjangan otomatis 3 hari sebelum jatuh tempo
untuk anggota premium.

Closes #123
```

```bash
fix(books): memperbaiki bug search barcode

Search barcode tidak case-sensitive dan trim whitespace.

Fixes #456
```

---

## 🏗️ Development Setup

### 1. Fork & Clone
```bash
git clone https://github.com/username-anda/Perpustakaan-next.git
cd Perpustakaan-next
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
Ikuti panduan di `SETUP.md`

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Linting
```bash
npm run lint
```

### 6. Check TypeScript
```bash
npx tsc --noEmit
```

---

## 📝 Coding Standards

### TypeScript
- Gunakan TypeScript untuk semua file baru
- Definisikan types/interfaces untuk props dan data
- Avoid `any` type

**Good:**
```typescript
interface Member {
  id_anggota: number;
  nama: string;
  status_aktif: boolean;
}

function updateMember(member: Member): Promise<void> {
  // ...
}
```

**Bad:**
```typescript
function updateMember(member: any) {
  // ...
}
```

### React Components
- Gunakan functional components dengan hooks
- Pisahkan logic dan presentation
- Gunakan Server Components di halaman, Client Components untuk interactivity

**File Naming:**
- Components: `PascalCase.tsx` (e.g., `MembersClient.tsx`)
- Pages: `page.tsx`, `layout.tsx`
- Utilities: `camelCase.ts` (e.g., `actions.ts`)

### Tailwind CSS
- Gunakan utility classes, hindari custom CSS
- Gunakan design tokens yang ada (colors, spacing)
- Keep classes organized: layout → spacing → styling → states

**Good:**
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all">
```

**Bad:**
```tsx
<button style={{ backgroundColor: '#4F46E5', padding: '8px 16px' }}>
```

### Prisma Schema
- Gunakan snake_case untuk field names (sesuai konvensi database)
- Tambahkan `@@index` untuk foreign keys
- Gunakan enums untuk status/type fields

---

## 🧪 Testing (Future)

Saat ini belum ada test suite. Kontribusi untuk menambahkan testing sangat dihargai!

Rencana testing stack:
- **Unit Tests**: Vitest
- **Integration Tests**: Playwright
- **E2E Tests**: Playwright

---

## 📖 Documentation

### README Updates
Jika menambah fitur baru, update:
- Section "Fitur Utama"
- Section "Tech Stack" (jika ada dependency baru)
- Screenshots (jika ada perubahan UI signifikan)

### Code Comments
- Gunakan JSDoc untuk fungsi publik
- Jelaskan "why" bukan "what"
- Hindari comment yang obvious

**Good:**
```typescript
/**
 * Calculate late fine based on overdue days
 * @param dueDate - Original due date
 * @param returnDate - Actual return date
 * @returns Fine amount in Rupiah
 */
function calculateLateFine(dueDate: Date, returnDate: Date): number {
  // Business rule: Rp1,000 per day late fee
  const days = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
  return days > 0 ? days * 1000 : 0;
}
```

---

## 🔍 Code Review Process

Pull Request Anda akan di-review dengan checklist:

- ✅ Code mengikuti style guide
- ✅ Tidak ada TypeScript errors
- ✅ Linting passed
- ✅ Fitur bekerja sesuai ekspektasi
- ✅ Tidak ada breaking changes (kecuali major version)
- ✅ Documentation updated (jika perlu)
- ✅ Commit messages mengikuti convention

**Review Timeline:**
- Initial response: 1-3 hari
- Full review: 3-7 hari
- Merge: Setelah semua check passed

---

## 🎯 Priority Areas

Area yang sangat membutuhkan kontribusi:

### High Priority
- 🔴 Security improvements (bcrypt, CSRF protection)
- 🔴 Testing infrastructure (unit, integration, e2e)
- 🔴 Accessibility improvements (ARIA, keyboard navigation)
- 🔴 Performance optimization (caching, lazy loading)

### Medium Priority
- 🟡 Advanced reporting & analytics
- 🟡 Export to PDF/Excel
- 🟡 Email/SMS notifications
- 🟡 Multi-language support (i18n)

### Low Priority (Nice to Have)
- 🟢 Book cover images
- 🟢 Advanced search filters
- 🟢 Dark/Light mode toggle
- 🟢 Keyboard shortcuts

---

## 📄 License

Dengan berkontribusi, Anda menyetujui bahwa kontribusi Anda akan dilisensikan di bawah lisensi yang sama dengan project ini.

---

## 💬 Komunikasi

- **GitHub Issues**: Untuk bug reports dan feature requests
- **Pull Requests**: Untuk code contributions
- **Email**: rafli@perpustakaan.my.id (untuk pertanyaan umum)

---

## 🙏 Terima Kasih!

Setiap kontribusi, tidak peduli seberapa kecil, sangat berarti bagi project ini. Terima kasih telah meluangkan waktu untuk berkontribusi! 🎉

---

**Happy Contributing! 🚀**
