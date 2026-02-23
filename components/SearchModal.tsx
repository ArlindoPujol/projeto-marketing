
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Store, CheckSquare, Calendar, ArrowRight, X, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Farmacia, Tarefa, Reuniao } from '@/lib/db';
import { useFarmacia } from '@/contexts/FarmaciaContext';

/* ── tipos ─────────────────────────────────────────── */
interface Result {
    id: string;
    type: 'farmacia' | 'tarefa' | 'reuniao';
    title: string;
    subtitle: string;
    href: string;
    badge?: { label: string; cls: string };
}

const typeConfig = {
    farmacia: { label: 'Farmácias', icon: Store, color: 'text-blue-500' },
    tarefa: { label: 'Tarefas', icon: CheckSquare, color: 'text-emerald-500' },
    reuniao: { label: 'Reuniões', icon: Calendar, color: 'text-purple-500' },
};

const prioLabel: Record<string, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' };
const prioCls: Record<string, string> = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-gray-400/10 text-gray-500 border-gray-300/40',
};

/* ── hook: atalho de teclado ──────────────────────── */
export function useSearchModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(o => !o);
            }
            if (e.key === 'Escape') setOpen(false);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return { open, setOpen };
}

/* ── componente principal ───────────────────────────── */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const router = useRouter();
    const { farmacias } = useFarmacia();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Result[]>([]);
    const [cursor, setCursor] = useState(0);
    const [loading, setLoading] = useState(false);

    /* Foco quando abre */
    useEffect(() => {
        if (open) { setTimeout(() => inputRef.current?.focus(), 60); setQuery(''); setResults([]); setCursor(0); }
    }, [open]);

    /* Busca */
    const search = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); return; }
        setLoading(true);
        try {
            const [tRes, rRes] = await Promise.all([
                fetch('/api/tarefas', { cache: 'no-store' }),
                fetch('/api/reunioes', { cache: 'no-store' }),
            ]);
            const [tarefas, reunioes]: [Tarefa[], Reuniao[]] =
                await Promise.all([tRes.json(), rRes.json()]);

            /* Mapa id → nome */
            const fMap = Object.fromEntries(farmacias.map(f => [f.id, f.nomeFarmacia]));

            const lower = q.toLowerCase();
            const out: Result[] = [];

            /* Farmácias */
            farmacias
                .filter(f =>
                    (f.nomeFarmacia || '').toLowerCase().includes(lower) ||
                    (f.cidade || '').toLowerCase().includes(lower) ||
                    (f.responsavelNome || '').toLowerCase().includes(lower)
                )
                .slice(0, 4)
                .forEach(f => out.push({
                    id: f.id, type: 'farmacia',
                    title: f.nomeFarmacia || 'Farmácia',
                    subtitle: [f.cidade, f.uf].filter(Boolean).join(' · ') || 'Local pendente',
                    href: `/farmacias/${f.id}`,
                }));

            /* Tarefas */
            const today = new Date(); today.setHours(0, 0, 0, 0);
            tarefas
                .filter(t =>
                    t.titulo.toLowerCase().includes(lower) ||
                    t.descricao?.toLowerCase().includes(lower) ||
                    fMap[t.farmaciaId]?.toLowerCase().includes(lower)
                )
                .slice(0, 4)
                .forEach(t => {
                    const overdue = t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today;
                    out.push({
                        id: t.id, type: 'tarefa',
                        title: t.titulo,
                        subtitle: fMap[t.farmaciaId] ?? '—',
                        href: `/tarefas`,
                        badge: overdue
                            ? { label: 'Atrasada', cls: 'bg-red-500/10 text-red-500 border-red-500/20' }
                            : {
                                label: prioLabel[t.prioridade === 'Alta' || t.prioridade === 'high' ? 'high' :
                                    t.prioridade === 'Baixa' || t.prioridade === 'low' ? 'low' : 'medium'],
                                cls: prioCls[t.prioridade === 'Alta' || t.prioridade === 'high' ? 'high' :
                                    t.prioridade === 'Baixa' || t.prioridade === 'low' ? 'low' : 'medium']
                            },
                    });
                });

            /* Reuniões */
            reunioes
                .filter(r =>
                    r.pauta?.toLowerCase().includes(lower) ||
                    r.resumo?.toLowerCase().includes(lower) ||
                    fMap[r.farmaciaId]?.toLowerCase().includes(lower)
                )
                .slice(0, 3)
                .forEach(r => out.push({
                    id: r.id, type: 'reuniao',
                    title: r.pauta || 'Reunião sem pauta',
                    subtitle: `${fMap[r.farmaciaId] ?? '—'} · ${new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`,
                    href: `/reunioes`,
                }));

            setResults(out);
            setCursor(0);
        } finally {
            setLoading(false);
        }
    }, []);

    /* Debounce */
    useEffect(() => {
        const t = setTimeout(() => search(query), 200);
        return () => clearTimeout(t);
    }, [query, search]);

    /* Navegação teclado */
    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
        if (e.key === 'Enter' && results[cursor]) {
            router.push(results[cursor].href);
            onClose();
        }
    }

    /* Scroll automático do item selecionado */
    useEffect(() => {
        listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [cursor]);

    if (!open) return null;

    /* Agrupar resultados */
    const groups = (['farmacia', 'tarefa', 'reuniao'] as const)
        .map(type => ({ type, items: results.filter(r => r.type === type) }))
        .filter(g => g.items.length > 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9998] bg-black/30 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={cn(
                'fixed z-[9999] top-[18%] left-1/2 -translate-x-1/2 w-full max-w-[580px] mx-auto px-4',
            )}>
                <div className={cn(
                    'rounded-2xl border overflow-hidden',
                    'shadow-[0_32px_80px_-12px_rgba(0,0,0,0.25),0_8px_24px_-4px_rgba(0,0,0,0.15),0_0_0_0.5px_rgba(0,0,0,0.08)]',
                    'dark:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.80),0_8px_32px_-4px_rgba(0,0,0,0.60),0_0_0_0.5px_rgba(255,255,255,0.07)]',
                    /* Light */
                    'bg-white/95 border-black/[0.07]',
                    /* Dark */
                    'dark:bg-[#1C1C1E]/95 dark:border-white/[0.10]',
                    'backdrop-blur-2xl',
                )}>

                    {/* Campo de busca */}
                    <div className={cn(
                        'flex items-center gap-3 px-4 py-3.5',
                        'border-b border-black/[0.06] dark:border-white/[0.08]',
                    )}>
                        <Search className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            query ? 'text-[#0071E3] dark:text-[#0A84FF]' : 'text-[#8E8E93]',
                        )} />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Buscar farmácias, tarefas, reuniões…"
                            className={cn(
                                'flex-1 bg-transparent border-none outline-none',
                                'text-[15px] font-medium text-[#1C1C1E] dark:text-[#F5F5F7]',
                                'placeholder:text-[#8E8E93]',
                            )}
                        />
                        {query && (
                            <button onClick={() => setQuery('')} className="shrink-0 text-[#8E8E93] hover:text-[#636366] transition-colors">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-[#D1D1D6] dark:border-[#48484A] text-[10px] font-semibold text-[#8E8E93] bg-[#F2F2F7] dark:bg-[#2C2C2E]">
                            Esc
                        </kbd>
                    </div>

                    {/* Resultados */}
                    <div ref={listRef} className="max-h-[400px] overflow-y-auto">
                        {loading && (
                            <div className="py-10 flex items-center justify-center gap-2 text-[#8E8E93]">
                                <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                <span className="text-[12px] font-medium">Buscando…</span>
                            </div>
                        )}

                        {!loading && query && results.length === 0 && (
                            <div className="py-14 text-center">
                                <Search className="h-7 w-7 text-[#D1D1D6] dark:text-[#48484A] mx-auto mb-3" />
                                <p className="text-[13px] font-semibold text-[#636366]">Nenhum resultado para</p>
                                <p className="text-[12px] text-[#8E8E93] mt-0.5">"{query}"</p>
                            </div>
                        )}

                        {!loading && !query && (
                            <div className="py-10 text-center">
                                <p className="text-[12px] font-medium text-[#8E8E93]">Digite para buscar em toda a rede</p>
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    {['Farmácias', 'Tarefas', 'Reuniões'].map((l, i) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#AEAEB2]">
                                            {i === 0 && <Store className="h-3 w-3 text-blue-400" />}
                                            {i === 1 && <CheckSquare className="h-3 w-3 text-emerald-400" />}
                                            {i === 2 && <Calendar className="h-3 w-3 text-purple-400" />}
                                            {l}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!loading && groups.map(group => {
                            const cfg = typeConfig[group.type];
                            const Icon = cfg.icon;
                            return (
                                <div key={group.type}>
                                    {/* Cabeçalho do grupo */}
                                    <div className={cn(
                                        'flex items-center gap-2 px-4 py-2',
                                        'border-b border-black/[0.04] dark:border-white/[0.05]',
                                        'bg-[#F2F2F7]/60 dark:bg-white/[0.025]',
                                    )}>
                                        <Icon className={cn('h-3 w-3', cfg.color)} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#8E8E93]">{cfg.label}</span>
                                    </div>

                                    {group.items.map(result => {
                                        const globalIdx = results.indexOf(result);
                                        const isActive = globalIdx === cursor;
                                        return (
                                            <button
                                                key={result.id}
                                                data-idx={globalIdx}
                                                onClick={() => { router.push(result.href); onClose(); }}
                                                onMouseEnter={() => setCursor(globalIdx)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                                                    'border-b border-black/[0.03] dark:border-white/[0.04] last:border-0',
                                                    isActive
                                                        ? 'bg-[#0071E3] dark:bg-[#0A84FF]'
                                                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.04]',
                                                )}
                                            >
                                                <Icon className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    isActive ? 'text-white/80' : cfg.color,
                                                )} />

                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        'text-[13px] font-semibold truncate',
                                                        isActive ? 'text-white' : 'text-[#1C1C1E] dark:text-[#F5F5F7]',
                                                    )}>
                                                        {result.title}
                                                    </p>
                                                    <p className={cn(
                                                        'text-[11px] truncate mt-0.5',
                                                        isActive ? 'text-white/65' : 'text-[#8E8E93]',
                                                    )}>
                                                        {result.subtitle}
                                                    </p>
                                                </div>

                                                {result.badge && !isActive && (
                                                    <span className={cn(
                                                        'shrink-0 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full border',
                                                        result.badge.cls,
                                                    )}>
                                                        {result.badge.label}
                                                    </span>
                                                )}

                                                <ArrowRight className={cn(
                                                    'h-3.5 w-3.5 shrink-0 transition-opacity',
                                                    isActive ? 'text-white/70 opacity-100' : 'text-[#D1D1D6] opacity-0 group-hover:opacity-100',
                                                )} />
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rodapé com hints de teclado */}
                    {results.length > 0 && (
                        <div className={cn(
                            'flex items-center gap-4 px-4 py-2.5',
                            'border-t border-black/[0.06] dark:border-white/[0.08]',
                            'bg-[#F2F2F7]/60 dark:bg-white/[0.025]',
                        )}>
                            {[
                                { keys: ['↑', '↓'], label: 'navegar' },
                                { keys: ['↵'], label: 'abrir' },
                                { keys: ['Esc'], label: 'fechar' },
                            ].map(({ keys, label }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5">
                                        {keys.map(k => (
                                            <kbd key={k} className="px-1.5 py-0.5 rounded border border-[#D1D1D6] dark:border-[#48484A] text-[10px] font-semibold text-[#636366] dark:text-[#8E8E93] bg-white dark:bg-[#2C2C2E]">
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                    <span className="text-[10px] text-[#AEAEB2]">{label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
