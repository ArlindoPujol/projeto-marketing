
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
        <aside className="fixed left-6 top-6 bottom-6 w-64 flex flex-col bg-white/5 dark:bg-[#0F121D]/40 backdrop-blur-[32px] border border-white/10 shadow-2xl rounded-[2.5rem] z-40 overflow-hidden transition-all duration-500">
            {/* Logo Area with subtle glow */}
            <div className="relative p-10 flex items-center justify-center">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                {/* Logo with Glow Effect */}
                <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img
                        src="/logo-light.png"
                        alt="Farmácia10x"
                        className="h-9 w-auto object-contain dark:invert relative z-10"
                    />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-5 space-y-2 custom-scrollbar">
                <div className="px-4 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/30">Navegação</span>
                </div>

                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-500 relative overflow-hidden",
                                isActive
                                    ? "text-white"
                                    : "text-foreground/50 hover:text-foreground"
                            )}
                        >
                            {/* Active/Hover Background */}
                            <div className={cn(
                                "absolute inset-0 transition-all duration-500",
                                isActive
                                    ? "bg-gradient-to-r from-primary to-indigo-600 opacity-100 shadow-lg shadow-primary/20"
                                    : "bg-white/5 opacity-0 group-hover:opacity-100"
                            )} />

                            <link.icon className={cn(
                                "h-5 w-5 relative z-10 transition-all duration-500",
                                isActive ? "scale-110" : "opacity-60 group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-6"
                            )} />

                            <span className="relative z-10 tracking-tight">{link.label}</span>

                            {/* Indicator dot */}
                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Premium Footer */}
            <div className="p-8">
                <div className="p-5 rounded-3xl bg-primary/5 border border-white/5 flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.35em] text-primary">Enterprise</span>
                    <div className="flex items-center gap-1.5 opacity-40">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <span className="text-[9px] font-bold">V 1.2.0</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

