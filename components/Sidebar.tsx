
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
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-72 flex flex-col bg-card border-r border-border z-40 transition-all duration-300">
            {/* Logo area - Apple Refined */}
            <div className="h-32 flex items-center px-8 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                        <Store className="text-white h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[20px] font-semibold tracking-tight leading-none text-foreground">Farmácia10x</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-8 px-5 space-y-1.5">
                <div className="px-4 mb-4">
                    <span className="text-[12px] font-semibold text-foreground-tertiary">Menu Principal</span>
                </div>

                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-[12px] font-medium transition-all duration-200",
                                isActive
                                    ? "bg-black/5 dark:bg-white/10 text-foreground"
                                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-foreground-secondary"
                            )}
                        >
                            <link.icon className={cn(
                                "h-4.5 w-4.5 transition-transform",
                                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100 scale-95"
                            )} />
                            <span className="text-[14px]">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* System Status - Minimalist Apple */}
            <div className="p-6 border-t border-border/40">
                <div className="flex items-center gap-2.5 opacity-80 pl-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success ring-2 ring-success/20" />
                    <span className="text-[12px] font-medium text-foreground-secondary">V 1.2.0 · Live</span>
                </div>
            </div>
        </aside>
    );
}


