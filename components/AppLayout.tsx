
'use client';

import { FarmaciaProvider } from '@/contexts/FarmaciaContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';
import Topbar from './Topbar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <FarmaciaProvider>
            <ThemeProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased selection:bg-blue-500/15 transition-all duration-700">

                            {/* ── Camada de fundo decorativa — Apple-style ── */}
                            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

                                {/* Light: fundo puro, sem ruído — Apple usa F2F2F7 clean */}
                                {/* Dark: blobs de vibrância suave como no macOS */}
                                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[140px]
                            opacity-0 dark:opacity-100
                            bg-[#0071E3]/[0.07]
                            transition-all duration-1000" />
                                <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[130px]
                            opacity-0 dark:opacity-100
                            bg-[#5E5CE6]/[0.06]
                            transition-all duration-1000" />
                                <div className="absolute top-[35%] right-[15%] w-[35%] h-[35%] rounded-full blur-[110px]
                            opacity-0 dark:opacity-100
                            bg-[#0A84FF]/[0.04]
                            transition-all duration-1000" />

                                {/* Grid de pontos ultra-sutil — dark only */}
                                <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)',
                                        backgroundSize: '36px 36px',
                                    }}
                                />
                            </div>

                            {/* Topbar */}
                            <Topbar />

                            {/* Conteúdo */}
                            <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10 transition-all duration-500">
                                {children}
                            </main>

                            {/* Footer */}
                            <footer className="w-full py-10 border-t border-black/[0.04] dark:border-white/[0.06] relative z-10">
                                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity duration-500">
                                    <img
                                        src="/logo-light.png"
                                        alt="Farmácia10x"
                                        className="h-4 w-auto grayscale contrast-125 dark:invert dark:brightness-150"
                                    />
                                    <span className="text-[9px] font-medium tracking-tight text-gray-500 dark:text-gray-400">
                                        © 2026 Plataforma de Inteligência em Marketing. Todos os direitos reservados.
                                    </span>
                                </div>
                            </footer>
                        </div>
                    </ConfirmProvider>
                </ToastProvider>
            </ThemeProvider>
        </FarmaciaProvider>
    );
}
