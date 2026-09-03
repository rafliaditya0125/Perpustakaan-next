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
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('perpustakaan-theme') || 'system';
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = stored === 'dark' || (stored === 'system' && prefersDark);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.setAttribute('data-theme', 'dark');
                  } else {
                    root.classList.remove('dark');
                    root.setAttribute('data-theme', 'light');
                  }
                  root.setAttribute('data-theme-preference', stored);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        {children}
        <ThemeSwitcher />
      </body>
    </html>
  );
}
