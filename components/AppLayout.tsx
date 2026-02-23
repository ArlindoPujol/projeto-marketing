
'use client';

import { FarmaciaProvider } from '@/contexts/FarmaciaContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <FarmaciaProvider>
            <ThemeProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <div className="flex min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 transition-all duration-700">

                            {/* ── BACKGROUND LAYER (Premium Depth) ── */}
                            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                                {/* Radiant Midnight Blobs */}
                                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full blur-[120px]
                            opacity-0 dark:opacity-[0.15]
                            bg-primary
                            animate-glow transition-all duration-1000" />
                                
                                <div className="absolute bottom-[0%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[130px]
                            opacity-0 dark:opacity-[0.12]
                            bg-purple-600
                            transition-all duration-1000" />

                                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full blur-[100px]
                            opacity-0 dark:opacity-[0.08]
                            bg-cyan-500
                            transition-all duration-1000" />

                                {/* Subtle Dot Grid Pattern */}
                                <div className="absolute inset-0 opacity-0 dark:opacity-[0.15] transition-opacity duration-700"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1.5px)',
                                        backgroundSize: '40px 40px',
                                    }}
                                />
                                
                                {/* Noise Overlayer for texture */}
                                <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                                    }}
                                />
                            </div>

                            {/* Sidebar - Fixado à esquerda */}
                            <Sidebar />

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col pl-72 relative z-10 transition-all duration-500">
                                {/* Topbar can be inside here if needed */}
                                <Topbar />

                                <main className="flex-1 w-full max-w-[1600px] mx-auto px-8 pt-32 pb-20 overflow-visible">
                                    {children}
                                </main>

                                {/* Footer integrated into main scroll */}
                                <footer className="w-full py-10 border-t border-black/[0.04] dark:border-white/[0.06]">
                                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity duration-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase">System Online</span>
                                        </div>
                                        <span className="text-[9px] font-medium tracking-tight text-gray-400">
                                            © 2026 Inteligência em Marketing · Farmácia10x
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

