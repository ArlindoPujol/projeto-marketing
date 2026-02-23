
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Reuniao, Farmacia } from '@/lib/db';
import { useFarmacia } from '@/contexts/FarmaciaContext';
import Link from 'next/link';
import {
    ChevronLeft, ChevronRight, Calendar, Clock,
    FileText, CheckSquare, ExternalLink, Users, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── skeleton ────────────────────────────────────────── */
function ReuniasSkeleton() {
    return (
        <div className="grid grid-cols-7 gap-4 items-start">
            {/* Calendário skeleton */}
            <div className="col-span-3 glass-card rounded-2xl p-6 dark:border dark:border-white/[0.09] space-y-4 animate-pulse">
                <div className="flex items-center justify-between mb-5">
                    <div className="h-4 w-4 bg-black/[0.06] dark:bg-white/[0.08] rounded" />
                    <div className="h-3 w-32 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                    <div className="h-4 w-4 bg-black/[0.06] dark:bg-white/[0.08] rounded" />
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 mx-auto rounded-xl bg-black/[0.04] dark:bg-white/[0.06]" />
                    ))}
                </div>
            </div>
            {/* Lista skeleton */}
            <div className="col-span-4 space-y-4">
                {[0, 1].map(i => (
                    <div key={i} className="glass-card rounded-2xl overflow-hidden dark:border dark:border-white/[0.09] animate-pulse">
                        <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.06]">
                            <div className="h-2.5 w-36 bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />
                        </div>
                        <div className="p-4 space-y-3">
                            {[0, 1].map(j => (
                                <div key={j} className="rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.04] px-4 py-3 space-y-2">
                                    <div className="h-2.5 w-2/3 bg-black/[0.05] dark:bg-white/[0.07] rounded-full" />
                                    <div className="h-2 w-1/2 bg-black/[0.04] dark:bg-white/[0.06] rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── helpers ────────────────────────────────────────── */
type ReuniaoEnriquecida = Reuniao & { farmaciaNome: string };

function toDateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function reuniaoKey(r: Reuniao) {
    return toDateKey(new Date(r.data));
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/* ── calendário ─────────────────────────────────────── */
function MiniCalendar({
    year, month, dots, selected, onSelect, onPrev, onNext,
}: {
    year: number; month: number;
    dots: Set<string>;
    selected: string | null;
    onSelect: (key: string) => void;
    onPrev: () => void; onNext: () => void;
}) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // pad to 6 rows
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="select-none">
            {/* Navegação */}
            <div className="flex items-center justify-between mb-5">
                <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[12px] font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white">
                    {MESES[month]} {year}
                </span>
                <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-gray-500 dark:text-gray-400">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-7 mb-2">
                {DIAS_SEMANA.map(d => (
                    <div key={d} className="text-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grade */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;

                    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasDot = dots.has(key);
                    const isToday = key === todayKey;
                    const isSelected = key === selected;

                    return (
                        <button
                            key={key}
                            onClick={() => onSelect(isSelected ? '' : key)}
                            className={cn(
                                'relative flex flex-col items-center justify-center h-8 w-8 mx-auto rounded-xl text-[11px] font-bold transition-all',
                                isSelected
                                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                    : isToday
                                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.07]',
                            )}
                        >
                            {day}
                            {hasDot && (
                                <span className={cn(
                                    'absolute bottom-0.5 h-1 w-1 rounded-full',
                                    isSelected ? 'bg-white/70' : 'bg-blue-500',
                                )} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── card de reunião ─────────────────────────────────── */
function MeetingCard({ r, compact = false }: { r: ReuniaoEnriquecida; compact?: boolean }) {
    const d = new Date(r.data);
    const isPast = d < new Date();

    return (
        <div className={cn(
            'rounded-xl border transition-all group',
            compact ? 'px-4 py-3' : 'px-5 py-4',
            'bg-white/70 border-black/[0.06] hover:border-black/[0.10] hover:shadow-sm',
            'dark:bg-white/[0.04] dark:border-white/[0.07] dark:hover:border-white/[0.12]',
            isPast && 'opacity-60',
        )}>
            <div className="flex items-start justify-between gap-3 mb-1.5">
                <p className={cn('font-semibold text-gray-900 dark:text-white leading-snug', compact ? 'text-[11px]' : 'text-[12px]')}>
                    {r.pauta}
                </p>
                <Link
                    href={`/farmacias/${r.farmaciaId}`}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.07] hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-500"
                    title="Ver perfil da farmácia"
                >
                    <ExternalLink className="h-3 w-3" />
                </Link>
            </div>

            <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[9px] font-semibold text-gray-400 flex items-center gap-1">
                    <Users className="h-2.5 w-2.5" />
                    {r.farmaciaNome}
                </span>
                <span className="text-[9px] font-semibold text-gray-400 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} · {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {!compact && r.resumo && (
                <div className="mb-2.5 space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                        <FileText className="h-2.5 w-2.5" /> Resumo
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{r.resumo}</p>
                </div>
            )}

            {!compact && r.proximosPassos && (
                <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                        <CheckSquare className="h-2.5 w-2.5" /> Próximos Passos
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{r.proximosPassos}</p>
                </div>
            )}
        </div>
    );
}

/* ── Seção colapsável ────────────────────────────────── */
function Section({ title, count, icon: Icon, iconColor, children, defaultOpen = true }: any) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div>
            <button
                onClick={() => setOpen((o: boolean) => !o)}
                className="w-full flex items-center justify-between mb-3 group/sec"
            >
                <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', iconColor)} />
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-900 dark:text-white">{title}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-gray-500 dark:text-gray-400 tabular-nums">{count}</span>
                </div>
                <ChevronRight className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', open && 'rotate-90')} />
            </button>
            {open && <div className="space-y-2.5">{children}</div>}
        </div>
    );
}

/* ── página ─────────────────────────────────────────── */
export default function ReunioesPage() {
    const { selectedFarmaciaId, farmacias } = useFarmacia();
    const [reunioes, setReunioes] = useState<ReuniaoEnriquecida[]>([]);
    const [loading, setLoading] = useState(true);
    const [curYear, setCurYear] = useState(() => new Date().getFullYear());
    const [curMonth, setCurMonth] = useState(() => new Date().getMonth());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const rRes = await fetch('/api/reunioes', { cache: 'no-store' });
                const allReunioes: Reuniao[] = await rRes.json();

                const map = Object.fromEntries(farmacias.map(f => [f.id, f.nomeFarmacia]));

                const filtered = selectedFarmaciaId === 'global'
                    ? allReunioes
                    : allReunioes.filter(r => r.farmaciaId === selectedFarmaciaId);

                setReunioes(filtered.map(r => ({ ...r, farmaciaNome: map[r.farmaciaId] ?? '—' })));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [selectedFarmaciaId, farmacias]);

    /* dots para o calendário */
    const dots = useMemo(() => new Set(reunioes.map(reuniaoKey)), [reunioes]);

    /* reuniões do dia selecionado */
    const dayMeetings = useMemo(() =>
        selectedDay ? reunioes.filter(r => reuniaoKey(r) === selectedDay).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()) : [],
        [selectedDay, reunioes]);

    const now = new Date();
    const futuras = reunioes.filter(r => new Date(r.data) > now).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    const passadas = reunioes.filter(r => new Date(r.data) <= now).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    function prevMonth() {
        if (curMonth === 0) { setCurMonth(11); setCurYear(y => y - 1); }
        else setCurMonth(m => m - 1);
    }
    function nextMonth() {
        if (curMonth === 11) { setCurMonth(0); setCurYear(y => y + 1); }
        else setCurMonth(m => m + 1);
    }

    /* reuniões de hoje */
    const todayKey = toDateKey(new Date());
    const reunioesHoje = reunioes.filter(r => reuniaoKey(r) === todayKey);

    return (
        <div className="space-y-5 animate-in fade-in duration-700">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-base font-black uppercase tracking-[0.1em] text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-cyan-500" />
                        Reuniões
                    </h1>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                        {futuras.length} futura{futuras.length !== 1 ? 's' : ''} · {passadas.length} realizada{passadas.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* ── Banner: reunião hoje ── */}
            {!loading && reunioesHoje.length > 0 && (
                <div className={cn(
                    'rounded-2xl px-5 py-3.5 flex items-center gap-3',
                    'bg-cyan-500/8 border border-cyan-500/20',
                )}>
                    <div className="flex items-center justify-center h-7 w-7 rounded-xl bg-cyan-500/15 shrink-0">
                        <Bell className="h-3.5 w-3.5 text-cyan-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-cyan-700 dark:text-cyan-300">
                            Você tem {reunioesHoje.length} reunião{reunioesHoje.length > 1 ? 'ões' : ''} hoje
                        </p>
                        <p className="text-[9px] text-cyan-600/70 dark:text-cyan-400/70 truncate">
                            {reunioesHoje.map(r => `${r.pauta} — ${new Date(r.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`).join(' · ')}
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedDay(todayKey)}
                        className="shrink-0 text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest hover:opacity-70 transition-opacity"
                    >
                        Ver →
                    </button>
                </div>
            )}

            {/* ── Layout principal ── */}
            {loading ? <ReuniasSkeleton /> : reunioes.length === 0 ? (
                <div className={cn('glass-card rounded-2xl py-24 text-center dark:border dark:border-white/[0.09]')}>
                    <Calendar className="h-10 w-10 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Nenhuma reunião cadastrada</p>
                    <p className="text-[9px] text-gray-400/60 mt-2">Acesse o perfil de uma farmácia e adicione reuniões na aba <strong>Reuniões</strong></p>
                    <Link href="/farmacias" className="mt-5 inline-block text-[9px] font-bold text-cyan-500 uppercase tracking-widest hover:opacity-70 transition-opacity">
                        Ver Farmácias →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-4 items-start">

                    {/* Calendário */}
                    <div className={cn(
                        'col-span-3 glass-card rounded-2xl p-6',
                        'dark:border dark:border-white/[0.09]',
                    )}>
                        <MiniCalendar
                            year={curYear}
                            month={curMonth}
                            dots={dots}
                            selected={selectedDay}
                            onSelect={setSelectedDay}
                            onPrev={prevMonth}
                            onNext={nextMonth}
                        />

                        {/* Legenda */}
                        <div className="mt-6 pt-5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-500" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Reunião</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-blue-500/20 ring-2 ring-blue-500/40" />
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Hoje</span>
                            </div>
                        </div>

                        {/* Resumo do mês */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {[
                                { label: 'Este mês', value: reunioes.filter(r => { const d = new Date(r.data); return d.getMonth() === curMonth && d.getFullYear() === curYear; }).length, color: 'text-blue-500' },
                                { label: 'Total', value: reunioes.length, color: 'text-gray-600 dark:text-gray-300' },
                            ].map(s => (
                                <div key={s.label} className="rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] p-3 text-center">
                                    <p className={cn('text-xl font-black tabular-nums', s.color)}>{s.value}</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detalhe / Lista */}
                    <div className="col-span-4 space-y-4">

                        {/* Dia selecionado */}
                        {selectedDay && (
                            <div className={cn(
                                'glass-card rounded-2xl overflow-hidden',
                                'dark:border dark:border-white/[0.09]',
                            )}>
                                <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-900 dark:text-white flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                        {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                    </h3>
                                    <button onClick={() => setSelectedDay(null)} className="text-[8px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                                        Fechar ×
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    {dayMeetings.length === 0 ? (
                                        <p className="text-[9px] text-gray-400 italic text-center py-6">Nenhuma reunião neste dia</p>
                                    ) : dayMeetings.map(r => <MeetingCard key={r.id} r={r} />)}
                                </div>
                            </div>
                        )}

                        {/* Próximas reuniões */}
                        <div className={cn(
                            'glass-card rounded-2xl overflow-hidden',
                            'dark:border dark:border-white/[0.09]',
                        )}>
                            <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.06]">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-cyan-500" />
                                    Próximas Reuniões
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 tabular-nums">{futuras.length}</span>
                                </h3>
                            </div>
                            <div className="p-4 space-y-2.5 max-h-64 overflow-y-auto">
                                {futuras.length === 0 ? (
                                    <p className="text-[9px] text-gray-400 italic text-center py-8">Nenhuma reunião futura agendada</p>
                                ) : futuras.map(r => <MeetingCard key={r.id} r={r} compact />)}
                            </div>
                        </div>

                        {/* Reuniões passadas */}
                        {passadas.length > 0 && (
                            <div className={cn(
                                'glass-card rounded-2xl overflow-hidden',
                                'dark:border dark:border-white/[0.09]',
                            )}>
                                <div className="p-4">
                                    <Section
                                        title="Realizadas"
                                        count={passadas.length}
                                        icon={CheckSquare}
                                        iconColor="text-emerald-500"
                                        defaultOpen={false}
                                    >
                                        <div className="max-h-64 overflow-y-auto space-y-2.5">
                                            {passadas.map(r => <MeetingCard key={r.id} r={r} compact />)}
                                        </div>
                                    </Section>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
