
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Store, Flag, CheckSquare, Calendar, Home, Key, Play } from 'lucide-react';

const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/farmacias', label: 'Farmácias', icon: Store },
    { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
    { href: '/reunioes', label: 'Reuniões', icon: Calendar },
    { href: '/acessos', label: 'Acessos', icon: Key },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-72 flex flex-col bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 z-40 transition-all duration-300">
            {/* Logo area - More Apple-like */}
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                        <Store className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight block leading-none">Farmácia10x</span>
                        <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1 block">Enterprise Control</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                <div className="px-4 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Menu Principal</span>
                </div>

                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "nav-item",
                                isActive && "nav-item-active"
                            )}
                        >
                            <link.icon className={cn(
                                "h-5 w-5 transition-transform",
                                isActive ? "scale-110" : "opacity-70"
                            )} />
                            <span className="tracking-tight">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Premium Footer - Minimalist */}
            <div className="p-6 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold">V 1.2.0</span>
                        <span className="text-[9px] font-medium text-foreground/40">Status: Estável</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}


