import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import AppLayout from '@/components/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

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
    <html lang="pt-BR" suppressHydrationWarning className={cn(GeistSans.variable, GeistMono.variable)}>
      <body className={cn(
        GeistSans.className,
        'antialiased transition-colors duration-500',
        'selection:bg-blue-600/10 selection:text-blue-600 dark:selection:text-blue-400',
      )}>
        <ThemeProvider>
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
