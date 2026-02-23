
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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Get current page label for breadcrumbs
    const currentLink = links.find(l => pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href)));

    return (
        <>
            <header className={cn(
                'fixed top-0 left-72 right-0 z-40 transition-all duration-500 py-6 px-10',
                scrolled && 'backdrop-blur-xl bg-background/40 border-b border-white/5 py-4'
            )}>
                <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">

                    {/* ── Breadcrumbs / Title ── */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-foreground/40 text-[11px] font-bold uppercase tracking-widest">
                            <Home className="h-3.5 w-3.5" />
                            <span>/</span>
                            <span className="text-foreground/80">{currentLink?.label || 'Dashboard'}</span>
                        </div>
                    </div>

                    {/* ── Central / Right Actions ── */}
                    <div className="flex items-center gap-4">

                        {/* Seletor de unidade Premium */}
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all group">
                            <Store className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                            <select
                                value={selectedFarmaciaId}
                                onChange={e => setSelectedFarmaciaId(e.target.value)}
                                className="appearance-none bg-transparent border-none outline-none cursor-pointer text-[12px] font-black uppercase tracking-wider pr-4 focus:ring-0"
                            >
                                <option value="global" className="bg-[#0F121D]">Rede Global</option>
                                {farmacias.map(f => (
                                    <option key={f.id} value={f.id} className="bg-[#0F121D]">{f.nomeFarmacia}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-3 w-3 opacity-30" />
                        </div>

                        <div className="h-6 w-px bg-white/10 mx-2" />

                        {/* Busca */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-90 shadow-lg"
                        >
                            <Search className="h-4.5 w-4.5 text-foreground/60" />
                        </button>

                        {/* Tema */}
                        <button
                            onClick={toggleTheme}
                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-amber-400/5 transition-all active:scale-90 shadow-lg"
                        >
                            {theme === 'light'
                                ? <Moon className="h-4.5 w-4.5 text-foreground/60" />
                                : <Sun className="h-4.5 w-4.5 text-amber-400" />
                            }
                        </button>

                        {/* User Profile Placeholder matching Reference */}
                        <div className="flex items-center gap-3 pl-2">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-[11px] font-black tracking-tight">Arlindo Pujol</span>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Admin</span>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 p-0.5 shadow-lg shadow-primary/10 transition-transform hover:scale-105 cursor-pointer">
                                <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Arlindo+Pujol&background=random" alt="User" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}

