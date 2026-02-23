
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
    { href: '/playbooks', label: 'Playbooks', icon: Play },
    { href: '/seed', label: 'Seed', icon: Flag },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-5 top-5 bottom-5 w-64 flex flex-col bg-white/40 dark:bg-black/40 backdrop-blur-[32px] border border-white/40 dark:border-white/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] rounded-[2.5rem] z-40 overflow-hidden transition-all duration-500">
            {/* Logo Area with subtle glow */}
            <div className="relative p-8 flex items-center justify-center">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                {/* Light Mode Logo */}
                <img
                    src="/logo-light.png"
                    alt="Farmácia10x"
                    className="h-10 w-auto object-contain max-w-full dark:hidden drop-shadow-[0_2px_10px_rgba(37,99,235,0.1)] transition-transform hover:scale-105 duration-700"
                />
                {/* Dark Mode Logo */}
                <img
                    src="/logo-dark.png"
                    alt="Farmácia10x"
                    className="h-10 w-auto object-contain max-w-full hidden dark:block drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)] transition-transform hover:scale-105 duration-700"
                />
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-1.5 custom-scrollbar">
                <div className="px-4 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Navegação</span>
                </div>
                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-500 relative overflow-hidden",
                                isActive
                                    ? "text-blue-600 dark:text-white"
                                    : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {/* Smooth reveal background */}
                            <div className={cn(
                                "absolute inset-0 transition-all duration-500",
                                isActive
                                    ? "bg-blue-600/10 dark:bg-blue-500/20 opacity-100"
                                    : "bg-white/50 dark:bg-white/5 opacity-0 group-hover:opacity-100"
                            )} />

                            {/* Active mark cursor */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full shadow-[2px_0_10px_rgba(37,99,235,0.4)]" />
                            )}

                            <link.icon className={cn(
                                "h-5 w-5 relative z-10 transition-all duration-500",
                                isActive ? "text-blue-600 dark:text-blue-400 scale-110" : "opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-3"
                            )} />
                            <span className="relative z-10 tracking-tight">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Premium Footer Info */}
            <div className="p-6">
                <div className="p-4 rounded-3xl bg-blue-600/5 dark:bg-white/5 border border-white/20 dark:border-white/5 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/60 dark:text-blue-400/60">Farmácia10x</span>
                    <span className="text-[10px] font-bold text-gray-400">Enterprise Edition</span>
                </div>
            </div>
        </aside>
    );
}
