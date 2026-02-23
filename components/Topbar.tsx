
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

    const currentLink = links.find(l => pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href)));

    return (
        <>
            <header className={cn(
                'fixed top-0 left-72 right-0 z-30 transition-all duration-300 py-6 px-10',
                scrolled && 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 py-4'
            )}>
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">

                    {/* Breadcrumbs - Extremely clean */}
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/30">
                        <Home className="h-3.5 w-3.5 opacity-50" />
                        <span>/</span>
                        <span className="text-foreground/80">{currentLink?.label || 'Início'}</span>
                    </div>

                    <div className="flex items-center gap-6">

                        {/* Seletor Ultra Minimal */}
                        <div className="flex items-center gap-2 group cursor-pointer pr-4 border-r border-black/5 dark:border-white/5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <select
                                value={selectedFarmaciaId}
                                onChange={e => setSelectedFarmaciaId(e.target.value)}
                                className="appearance-none bg-transparent border-none outline-none text-[12px] font-bold uppercase tracking-widest cursor-pointer focus:ring-0 py-1"
                            >
                                <option value="global" className="bg-white dark:bg-black">Rede Global</option>
                                {farmacias.map(f => (
                                    <option key={f.id} value={f.id} className="bg-white dark:bg-black">{f.nomeFarmacia}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-3 w-3 opacity-20" />
                        </div>

                        {/* Ações Rápidas */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                            >
                                <Search className="h-4.5 w-4.5 opacity-40" />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90"
                            >
                                {theme === 'light'
                                    ? <Moon className="h-4.5 w-4.5 opacity-40" />
                                    : <Sun className="h-4.5 w-4.5 text-amber-500" />
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
