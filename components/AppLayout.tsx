
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
            <ToastProvider>
                <ConfirmProvider>
                    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20 transition-all duration-500">

                        {/* ── BACKGROUND LAYER (Branding Sync) ── */}
                        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                            {/* Subtle Brand Grid */}
                            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] transition-opacity duration-700"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 0)',
                                    backgroundSize: '48px 48px',
                                }}
                            />
                        </div>

                        {/* Sidebar - Fixado à esquerda */}
                        <Sidebar />

                        {/* Main Content Area */}
                        <div className="flex-1 flex flex-col pl-72 relative z-10 transition-all duration-300">
                            <Topbar />

                            <main className="flex-1 w-full max-w-[1600px] mx-auto px-16 pt-36 pb-24 page-transition">
                                {children}
                            </main>

                            {/* Footer Integrada */}
                            <footer className="w-full py-12 border-t border-border/40">
                                <div className="max-w-7xl mx-auto px-10 flex justify-between items-center text-foreground-quaternary">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#42EC61] shadow-[0_0_8px_rgba(66,236,97,0.4)]" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Sistema Live</span>
                                    </div>
                                    <span className="text-[10px] font-bold tracking-tight uppercase opacity-40">
                                        © 2026 Farmácia10x · Marketing Cloud
                                    </span>
                                </div>
                            </footer>
                        </div>
                    </div>
                </ConfirmProvider>
            </ToastProvider>
        </FarmaciaProvider>
    );
}


