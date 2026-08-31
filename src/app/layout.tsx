import type { Metadata } from "next";
import "./globals.css";
import ThemeSwitcher from '@/components/ThemeSwitcher';

export const metadata: Metadata = {
  title: "Sistem Manajemen Perpustakaan",
  description: "Aplikasi Otomasi Sirkulasi, Koleksi, & Operasional Perpustakaan berdasarkan SOP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 font-sans">{children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
