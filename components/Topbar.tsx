
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFarmacia } from '@/contexts/FarmaciaContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { Moon, Sun, Store, LayoutDashboard, CheckSquare, Calendar, ChevronDown, Search } from 'lucide-react';
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

    return (
        <>
            <header className={cn(
                'fixed top-0 inset-x-0 z-50 transition-all duration-500',
                scrolled
                    ? [
                        'py-2 px-6',
                        'bg-white/75 dark:bg-[#1C1C1E]/80',
                        'backdrop-blur-2xl',
                        'border-b border-black/[0.07] dark:border-white/[0.08]',
                        'shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]',
                    ].join(' ')
                    : 'py-4 px-6 bg-transparent',
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center shrink-0">
                        <img
                            src={theme === 'light' ? '/logo-light.png' : '/logo-dark.png'}
                            alt="Farmácia10x"
                            className="h-7 w-auto object-contain transition-opacity hover:opacity-75"
                        />
                    </Link>

                    {/* ── Nav pill central ── */}
                    <nav className={cn(
                        'flex items-center p-1 rounded-2xl border transition-all duration-500',
                        'bg-black/[0.032] border-black/[0.060]',
                        'dark:bg-white/[0.055] dark:border-white/[0.085]',
                    )}>
                        {links.map(link => {
                            const isActive = pathname === link.href ||
                                (link.href !== '/' && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-250',
                                        'uppercase tracking-[0.06em]',
                                        isActive
                                            ? [
                                                'bg-white text-[#1C1C1E] shadow-[0_1px_3px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.06)]',
                                                'dark:bg-white/[0.13] dark:text-white dark:shadow-[0_1px_3px_rgba(0,0,0,0.40),0_0_0_0.5px_rgba(255,255,255,0.10)]',
                                            ].join(' ')
                                            : [
                                                'text-[#636366] hover:text-[#1C1C1E] hover:bg-black/[0.03]',
                                                'dark:text-[#8E8E93] dark:hover:text-white dark:hover:bg-white/[0.07]',
                                            ].join(' '),
                                    )}
                                >
                                    <link.icon className={cn(
                                        'h-3 w-3 transition-colors',
                                        isActive ? 'text-[#0071E3] dark:text-[#0A84FF]' : 'opacity-50',
                                    )} />
                                    {link.label}
                                </Link>
                            );
                        })}

                        <div className="h-4 w-px mx-1 bg-black/[0.08] dark:bg-white/[0.10]" />

                        {/* Seletor de unidade */}
                        <div className="relative flex items-center gap-1.5 pl-2 pr-1">
                            <Store className="h-3 w-3 text-[#0071E3] dark:text-[#0A84FF] shrink-0" />
                            <select
                                value={selectedFarmaciaId}
                                onChange={e => setSelectedFarmaciaId(e.target.value)}
                                className={cn(
                                    'appearance-none bg-transparent border-none outline-none cursor-pointer pr-4',
                                    'text-[11px] font-semibold uppercase tracking-[0.06em]',
                                    'text-[#1C1C1E]/70 dark:text-white/70',
                                    'hover:text-[#1C1C1E] dark:hover:text-white',
                                    'transition-colors max-w-[160px] truncate focus:ring-0',
                                )}
                            >
                                <option value="global" className="bg-white dark:bg-[#1C1C1E]">Rede Global</option>
                                {farmacias.map(f => (
                                    <option key={f.id} value={f.id} className="bg-white dark:bg-[#1C1C1E]">{f.nomeFarmacia}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-2.5 w-2.5 text-[#8E8E93] pointer-events-none absolute right-1" />
                        </div>
                    </nav>

                    {/* ── Ações ── */}
                    <div className="flex items-center gap-2 shrink-0">

                        {/* Botão busca */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            aria-label="Busca global (Ctrl+K)"
                            className={cn(
                                'flex items-center gap-2 h-8 pl-3 pr-2 rounded-xl border transition-all duration-300',
                                'bg-black/[0.032] border-black/[0.060]',
                                'text-[#636366] hover:text-[#1C1C1E] hover:bg-black/[0.06]',
                                'dark:bg-white/[0.055] dark:border-white/[0.085]',
                                'dark:text-[#8E8E93] dark:hover:text-white dark:hover:bg-white/[0.09]',
                                'active:scale-95',
                            )}
                        >
                            <Search className="h-3.5 w-3.5" />
                            <kbd className="hidden sm:block text-[10px] font-semibold opacity-50">⌃K</kbd>
                        </button>

                        {/* Toggle tema */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Alternar tema"
                            className={cn(
                                'h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-300',
                                'bg-black/[0.032] border-black/[0.060]',
                                'text-[#636366] hover:text-[#1C1C1E] hover:bg-black/[0.06]',
                                'dark:bg-white/[0.055] dark:border-white/[0.085]',
                                'dark:text-[#8E8E93] dark:hover:text-[#FFD60A] dark:hover:bg-white/[0.09]',
                                'active:scale-90',
                            )}
                        >
                            {theme === 'light'
                                ? <Moon className="h-3.5 w-3.5" />
                                : <Sun className="h-3.5 w-3.5 text-[#FFD60A]" />
                            }
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Modal de Busca Global ── */}
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
