
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFarmacia } from '@/contexts/FarmaciaContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { Moon, Sun, Store, LayoutDashboard, CheckSquare, Calendar, ChevronDown, Search, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchModal, useSearchModal } from './SearchModal';

interface SimpleFarmacia { id: string; nomeFarmacia: string; }

const links = [
    { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/farmacias', label: 'Farmácias', icon: Store },
    { href: '/tarefas', label: 'Tarefas', icon: CheckSquare },
    { href: '/reunioes', label: 'Reuniões', icon: Calendar },
];

export default function Topbar() {
    const pathname = usePathname();
    const { selectedFarmaciaId, setSelectedFarmaciaId, farmacias } = useFarmacia();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const { open: searchOpen, setOpen: setSearchOpen } = useSearchModal();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const currentLink = links.find(l => pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href)));

    return (
        <>
            <header className={cn(
                'fixed top-0 left-72 right-0 z-30 transition-all duration-300 px-12 border-b border-transparent',
                scrolled && 'bg-background/80 backdrop-blur-md border-border py-2'
            )}>
                <div className="max-w-[1600px] mx-auto flex items-center justify-between h-20">

                    {/* Breadcrumbs - Apple Style */}
                    <div className="flex items-center gap-2 text-[13px] font-medium text-foreground-secondary">
                        <Home className="h-4 w-4 opacity-70" />
                        <span className="opacity-30">/</span>
                        <span>{currentLink?.label || 'Início'}</span>
                    </div>

                    <div className="flex items-center gap-6">

                        {/* Seletor Minimalista Customizado (Estilo Apple) */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2.5 bg-card border border-border px-3.5 py-2 rounded-[12px] group cursor-pointer hover:border-primary/40 transition-all shadow-sm active:scale-95"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-success ring-2 ring-success/20" />
                                <span className="text-[13px] font-semibold text-foreground">
                                    {selectedFarmaciaId === 'global' ? 'Rede Global' : farmacias.find(f => f.id === selectedFarmaciaId)?.nomeFarmacia}
                                </span>
                                <ChevronDown className={cn("h-4 w-4 opacity-40 transition-transform duration-200", isDropdownOpen && "rotate-180")} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute top-full mt-2 left-0 min-w-[200px] py-1 bg-card border border-border rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 origin-top">
                                        <button
                                            onClick={() => { setSelectedFarmaciaId('global'); setIsDropdownOpen(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]",
                                                selectedFarmaciaId === 'global' ? "text-primary" : "text-foreground"
                                            )}
                                        >
                                            Rede Global
                                        </button>
                                        <div className="h-px bg-border/40 mx-2 my-1" />
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {farmacias.map(f => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => { setSelectedFarmaciaId(f.id); setIsDropdownOpen(false); }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]",
                                                        selectedFarmaciaId === f.id ? "text-primary" : "text-foreground"
                                                    )}
                                                >
                                                    {f.nomeFarmacia}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* System Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.03] dark:hover:bg-white/5 transition-all active:scale-90"
                            >
                                <Search className="h-4 w-4 text-foreground-secondary" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.03] dark:hover:bg-white/5 transition-all active:scale-90"
                            >
                                {theme === 'light'
                                    ? <Moon className="h-4 w-4 text-foreground-secondary" />
                                    : <Sun className="h-4 w-4 text-amber-400" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
