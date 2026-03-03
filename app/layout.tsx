import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'Farmácia10x | Inteligência de Marketing',
  description: 'Sistema de Marketing para Farmácias',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={openSans.variable}>
      <body className={cn(
        openSans.className,
        'antialiased transition-colors duration-500',
        'selection:bg-[#27B5ED]/20 selection:text-[#27B5ED]',
      )}>
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
