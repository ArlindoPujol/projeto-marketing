
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Tarefa, Farmacia } from '@/lib/db';
import { useFarmacia } from '@/contexts/FarmaciaContext';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import {
    CheckCircle2, Clock, AlertTriangle, Circle,
    ExternalLink, ListTodo, Activity, Search, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── helpers ───────────────────────────────────────── */
function todayMidnight() {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}

const prioConfig = {
    high: { label: 'Alta', cls: 'bg-red-500/10    text-red-500    border-red-500/20' },
    medium: { label: 'Média', cls: 'bg-amber-500/10  text-amber-500  border-amber-500/20' },
    low: { label: 'Baixa', cls: 'bg-gray-400/10   text-gray-500   border-gray-300/40' },
};

type PrioFilter = 'all' | 'high' | 'medium' | 'low';
type TarefaEnriquecida = Tarefa & { farmaciaNome: string };

/* ── skeleton ───────────────────────────────────────── */
function KanbanSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(col => (
                <div key={col} className="glass-card rounded-2xl overflow-hidden dark:border dark:border-white/[0.09]">
                    <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                        <div className="h-2.5 w-24 bg-black/[0.06] dark:bg-white/[0.08] rounded-full animate-pulse" />
                        <div className="h-4 w-6 bg-black/[0.04] dark:bg-white/[0.06] rounded-full animate-pulse" />
                    </div>
                    <div className="p-3 space-y-2.5">
                        {Array.from({ length: col === 1 ? 2 : 3 }).map((_, i) => (
                            <div key={i} className="rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.04] px-4 py-3 space-y-2.5 animate-pulse">
                                <div className="flex gap-2 items-center">
                                    <div className="h-4 w-4 rounded-full bg-black/[0.06] dark:bg-white/[0.08] shrink-0" />
                                    <div className="h-2.5 flex-1 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                                </div>
                                <div className="h-2 w-1/2 bg-black/[0.04] dark:bg-white/[0.06] rounded-full ml-6" />
                                <div className="flex justify-between mt-3 ml-0.5">
                                    <div className="h-3.5 w-12 bg-black/[0.04] dark:bg-white/[0.06] rounded-full" />
                                    <div className="h-3.5 w-16 bg-black/[0.04] dark:bg-white/[0.06] rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── coluna ─────────────────────────────────────────── */
function Column({ title, icon: Icon, iconColor, count, empty, emptyHint, children, headerCls }: {
    title: string; icon: any; iconColor: string; count: number;
    empty: string; emptyHint?: string; children: React.ReactNode; headerCls: string;
}) {
    return (
        <div className={cn('flex flex-col glass-card rounded-2xl overflow-hidden', 'dark:border dark:border-white/[0.09]')}>
            <div className={cn('px-5 py-4 flex items-center justify-between border-b', 'border-black/[0.04] dark:border-white/[0.06]', headerCls)}>
                <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', iconColor)} />
                    <span className="text-[11px] font-black uppercase tracking-[0.08em] text-gray-900 dark:text-white">{title}</span>
                </div>
                <span className="text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-gray-500 dark:text-gray-400">{count}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[calc(100vh-300px)]">
                {count === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center gap-2">
                        <Icon className={cn('h-6 w-6 opacity-20', iconColor)} />
                        <p className="text-[10px] font-medium text-gray-400">{empty}</p>
                        {emptyHint && <p className="text-[9px] text-gray-400/60 max-w-[160px] leading-relaxed">{emptyHint}</p>}
                    </div>
                ) : children}
            </div>
        </div>
    );
}

/* ── card de tarefa ─────────────────────────────────── */
function TaskCard({ t, onToggle }: { t: TarefaEnriquecida; onToggle: (id: string, newStatus: 'todo' | 'done') => void }) {
    const { toast } = useToast();
    const [toggling, setToggling] = useState(false);
    const isOverdue = t.status !== 'done' && t.vencimento && new Date(t.vencimento) < todayMidnight();
    const isDone = t.status === 'done';
    const normalizedPrio = (t.prioridade === 'Alta' || t.prioridade === 'high') ? 'high' :
        (t.prioridade === 'Baixa' || t.prioridade === 'low') ? 'low' : 'medium';
    const prio = prioConfig[normalizedPrio];

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        const newStatus = isDone ? 'todo' : 'done';
        setToggling(true);
        try {
            const res = await fetch(`/api/tarefas/${t.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                onToggle(t.id, newStatus);
                toast(
                    newStatus === 'done' ? `"${t.titulo}" concluída ✓` : `"${t.titulo}" reaberta`,
                    newStatus === 'done' ? 'success' : 'info',
                );
            } else {
                toast('Erro ao atualizar tarefa', 'error');
            }
        } catch {
            toast('Erro de conexão', 'error');
        } finally {
            setToggling(false);
        }
    }

    return (
        <div className={cn(
            'group rounded-xl border px-4 py-3 transition-all duration-200',
            'bg-white/70 border-black/[0.06] hover:border-black/[0.10] hover:shadow-sm',
            'dark:bg-white/[0.04] dark:border-white/[0.07] dark:hover:border-white/[0.12]',
            isDone && 'opacity-50',
        )}>
            {/* Linha 1: toggle + título + link */}
            <div className="flex items-start gap-2.5 mb-2">
                <button
                    onClick={handleToggle}
                    disabled={toggling}
                    title={isDone ? 'Reabrir tarefa' : 'Marcar como concluída'}
                    className={cn(
                        'shrink-0 mt-0.5 h-4 w-4 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200',
                        toggling && 'opacity-40',
                        isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-gray-300 dark:border-white/20 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
                    )}
                >
                    {isDone
                        ? <CheckCircle2 className="h-2.5 w-2.5" />
                        : toggling ? <div className="h-2 w-2 border border-gray-400 border-t-transparent rounded-full animate-spin" /> : null
                    }
                </button>

                <p className={cn(
                    'flex-1 text-[12px] font-semibold text-gray-900 dark:text-white leading-snug',
                    isDone && 'line-through text-gray-400 dark:text-gray-500',
                )}>
                    {t.titulo}
                </p>

                <Link
                    href={`/farmacias/${t.farmaciaId}`}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.07] hover:bg-blue-500/10 text-gray-400 hover:text-blue-500"
                    title="Ver perfil da farmácia"
                >
                    <ExternalLink className="h-3 w-3" />
                </Link>
            </div>

            {/* Farmácia */}
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-2.5 truncate pl-[26px]">{t.farmaciaNome}</p>

            {/* Prioridade + data */}
            <div className="flex items-center justify-between gap-2">
                <span className={cn('text-[9px] font-bold uppercase tracking-wide px-1.5 py-[2px] rounded-full border', prio.cls)}>
                    {prio.label}
                </span>
                {t.vencimento && (
                    <span className={cn('text-[10px] font-medium tabular-nums flex items-center gap-1', isOverdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500')}>
                        <Clock className="h-2.5 w-2.5" />
                        {isOverdue ? 'Atrasada · ' : ''}
                        {new Date(t.vencimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                )}
            </div>

            {t.descricao && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed line-clamp-2 pl-0.5">{t.descricao}</p>
            )}
        </div>
    );
}

/* ── página principal ───────────────────────────────── */
export default function TarefasPage() {
    const { selectedFarmaciaId, farmacias } = useFarmacia();
    const [tarefas, setTarefas] = useState<TarefaEnriquecida[]>([]);
    const [loading, setLoading] = useState(true);
    const [prioFilt, setPrioFilt] = useState<PrioFilter>('all');
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const tRes = await fetch('/api/tarefas', { cache: 'no-store' });
            const allTarefas: Tarefa[] = await tRes.json();

            const map = Object.fromEntries(farmacias.map(f => [f.id, f.nomeFarmacia]));
            const filtered = selectedFarmaciaId === 'global'
                ? allTarefas
                : allTarefas.filter(t => t.farmaciaId === selectedFarmaciaId);
            setTarefas(filtered.map(t => ({ ...t, farmaciaNome: map[t.farmaciaId] ?? '—' })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [selectedFarmaciaId, farmacias]);

    useEffect(() => { load(); }, [load]);

    /* Toggle otimista */
    function handleToggle(id: string, newStatus: 'todo' | 'done') {
        setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }

    const today = todayMidnight();

    /* Filtros combinados: prioridade + busca */
    const applyFilters = (arr: TarefaEnriquecida[]) => {
        let out = arr;
        if (prioFilt !== 'all') out = out.filter(t => t.prioridade === prioFilt);
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            out = out.filter(t =>
                t.titulo.toLowerCase().includes(q) ||
                t.farmaciaNome.toLowerCase().includes(q) ||
                t.descricao?.toLowerCase().includes(q)
            );
        }
        return out;
    };

    const sortByVenc = (a: TarefaEnriquecida, b: TarefaEnriquecida) => {
        if (!a.vencimento && !b.vencimento) return 0;
        if (!a.vencimento) return 1;
        if (!b.vencimento) return -1;
        return new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime();
    };

    const atrasadas = applyFilters(tarefas.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today)).sort(sortByVenc);
    const pendentes = applyFilters(tarefas.filter(t => t.status !== 'done' && !(t.vencimento && new Date(t.vencimento) < today))).sort(sortByVenc);
    const concluidas = applyFilters(tarefas.filter(t => t.status === 'done'));

    /* Contagens brutas para badges do header */
    const atrasadasTotal = tarefas.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today).length;
    const pendentesTotal = tarefas.filter(t => t.status !== 'done' && !(t.vencimento && new Date(t.vencimento) < today)).length;
    const concluidasTotal = tarefas.filter(t => t.status === 'done').length;

    const hasActiveFilter = prioFilt !== 'all' || search.trim().length > 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-[15px] font-black uppercase tracking-[0.06em] text-gray-900 dark:text-white flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-blue-500" />
                        Tarefas
                    </h1>
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">
                        {tarefas.length} tarefa{tarefas.length !== 1 ? 's' : ''} no total
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar tarefa ou farmácia…"
                            className={cn(
                                'h-8 pl-8 pr-8 rounded-xl border text-[11px] font-medium outline-none transition-all w-52',
                                'bg-white/60 border-black/[0.07] text-gray-900 placeholder:text-gray-400',
                                'dark:bg-white/[0.06] dark:border-white/[0.10] dark:text-white dark:placeholder:text-gray-500',
                                'focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10',
                            )}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    {/* Filtro de prioridade */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08]">
                        {(['all', 'high', 'medium', 'low'] as PrioFilter[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setPrioFilt(f)}
                                className={cn(
                                    'px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all',
                                    prioFilt === f
                                        ? 'bg-white dark:bg-white/[0.12] text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
                                )}
                            >
                                {f === 'all' ? 'Todas' : f === 'high' ? 'Alta' : f === 'medium' ? 'Média' : 'Baixa'}
                            </button>
                        ))}
                    </div>

                    {/* Resumo */}
                    {atrasadasTotal > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/8 border border-red-500/15">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-[10px] font-bold text-red-500">{atrasadasTotal} atrasada{atrasadasTotal > 1 ? 's' : ''}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.05] dark:border-white/[0.08]">
                        <Activity className="h-3 w-3 text-blue-500" />
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{pendentesTotal} pendente{pendentesTotal !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{concluidasTotal} concluída{concluidasTotal !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* ── Aviso de filtro ativo ── */}
            {hasActiveFilter && !loading && (
                <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                    <span className="h-1 w-1 rounded-full bg-blue-500 inline-block" />
                    Filtrando resultados
                    {search && <span className="text-gray-500">· busca: <strong className="text-gray-700 dark:text-gray-300">"{search}"</strong></span>}
                    {prioFilt !== 'all' && <span className="text-gray-500">· prioridade: <strong className="text-gray-700 dark:text-gray-300">{prioFilt === 'high' ? 'Alta' : prioFilt === 'medium' ? 'Média' : 'Baixa'}</strong></span>}
                    <button onClick={() => { setSearch(''); setPrioFilt('all'); }} className="ml-1 text-blue-500 hover:opacity-70 transition-opacity">
                        Limpar ×
                    </button>
                </div>
            )}

            {/* ── Kanban ── */}
            {loading ? <KanbanSkeleton /> : (
                <>
                    {tarefas.length === 0 ? (
                        <div className="glass-card rounded-2xl py-24 text-center dark:border dark:border-white/[0.09]">
                            <ListTodo className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-[13px] font-bold text-gray-400">Nenhuma tarefa cadastrada</p>
                            <p className="text-[10px] text-gray-400/60 mt-2">
                                Acesse o perfil de uma farmácia e adicione tarefas na aba <strong>Acompanhamento</strong>
                            </p>
                            <Link href="/farmacias" className="mt-5 inline-block text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:opacity-70 transition-opacity">
                                Ver Farmácias →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 items-start">
                            <Column title="Pendentes" icon={Circle} iconColor="text-blue-500"
                                count={pendentes.length} empty="Tudo em dia!"
                                emptyHint={hasActiveFilter ? 'Nenhum resultado para este filtro' : undefined}
                                headerCls="">
                                {pendentes.map(t => <TaskCard key={t.id} t={t} onToggle={handleToggle} />)}
                            </Column>

                            <Column title="Atrasadas" icon={AlertTriangle} iconColor="text-red-500"
                                count={atrasadas.length} empty="Sem atrasos"
                                emptyHint={hasActiveFilter ? 'Nenhum resultado para este filtro' : undefined}
                                headerCls="bg-red-500/[0.03] dark:bg-red-500/[0.05]">
                                {atrasadas.map(t => <TaskCard key={t.id} t={t} onToggle={handleToggle} />)}
                            </Column>

                            <Column title="Concluídas" icon={CheckCircle2} iconColor="text-emerald-500"
                                count={concluidas.length} empty="Nenhuma concluída ainda"
                                emptyHint={hasActiveFilter ? 'Nenhum resultado para este filtro' : 'Marque tarefas usando o botão circular em cada card'}
                                headerCls="bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]">
                                {concluidas.map(t => <TaskCard key={t.id} t={t} onToggle={handleToggle} />)}
                            </Column>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
