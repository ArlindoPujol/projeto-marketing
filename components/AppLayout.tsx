
'use client';

import { FarmaciaProvider } from '@/contexts/FarmaciaContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <FarmaciaProvider>
            <ThemeProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <div className="flex min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 transition-all duration-500">

                            {/* ── BACKGROUND LAYER (Clean Apple Style) ── */}
                            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                                {/* Subtle Glows - Dark Mode Only */}
                                <div className="absolute top-[-10%] left-[15%] w-[40%] h-[40%] rounded-full blur-[140px]
                            opacity-0 dark:opacity-20
                            bg-primary transition-all duration-1000" />

                                <div className="absolute bottom-[0%] right-[5%] w-[35%] h-[35%] rounded-full blur-[130px]
                            opacity-0 dark:opacity-15
                            bg-purple-600 transition-all duration-1000" />

                                {/* Subtle Dot Grid Pattern - Light & Dark */}
                                <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1] transition-opacity duration-700"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, var(--grid-pattern) 1px, transparent 0)',
                                        backgroundSize: '32px 32px',
                                    }}
                                />
                            </div>

                            {/* Sidebar - Fixado à esquerda */}
                            <Sidebar />

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col pl-72 relative z-10">
                                <Topbar />

                                <main className="flex-1 w-full max-w-[1400px] mx-auto px-10 pt-32 pb-20 page-transition">
                                    {children}
                                </main>

                                {/* Footer integrada */}
                                <footer className="w-full py-12 border-t border-black/[0.03] dark:border-white/[0.03]">
                                    <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-30">Infraestrutura OK</span>
                                        </div>
                                        <span className="text-[10px] font-bold tracking-tight opacity-20 uppercase">
                                            © 2026 Farmácia10x · Inteligência em Processos
                                        </span>
                                    </div>
                                </footer>
                            </div>
                        </div>
                    </ConfirmProvider>
                </ToastProvider>
            </ThemeProvider>
        </FarmaciaProvider>
    );
}


