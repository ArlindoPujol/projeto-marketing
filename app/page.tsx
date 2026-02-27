
'use client';

import { useFarmacia } from '@/contexts/FarmaciaContext';
import { useEffect, useState } from 'react';
import { Farmacia, Tarefa, Reuniao } from '@/lib/db';
import {
  Store, AlertTriangle, Clock, Calendar, Activity,
  ChevronRight, CheckCircle2, Zap, ExternalLink,
  TrendingUp, Bell, AlertCircle, Circle, ArrowRight,
  Target, Users, MapPin, ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/PageLoader';

/* ── helpers ─────────────────────────────────────────── */
function todayMidnight() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function tomorrowMidnight() { const d = todayMidnight(); d.setDate(d.getDate() + 1); return d; }

function relativeDay(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  const diff = Math.round((d.getTime() - todayMidnight().getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d atrás`;
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  return `em ${diff}d`;
}

const statusConfig: Record<string, { label: string; dot: string; color: string }> = {
  running: { label: 'Em execução', dot: 'bg-emerald-500', color: 'text-emerald-500' },
  waiting_access: { label: 'Ag. acesso', dot: 'bg-amber-500', color: 'text-amber-500' },
  paused: { label: 'Pausada', dot: 'bg-gray-400', color: 'text-gray-400' },
  done: { label: 'Concluída', dot: 'bg-blue-500', color: 'text-blue-500' },
};

/* ── tipos ────────────────────────────────────────────── */
interface FarmaciaRow {
  id: string; nomeFarmacia: string; statusMarketing: string;
  totalTasks: number; doneTasks: number; overdueTasks: number;
  nextTaskLabel?: string | null; semTarefas: boolean;
  cidade?: string | null; uf?: string | null;
}

interface DashData {
  totalFarmacias: number;
  overdueTotal: number;
  pendingTotal: number;
  doneTotal: number;
  reuniaoHoje: number;
  farmaciasRows: FarmaciaRow[];
  timelineTasks: {
    overdue: (Tarefa & { farmaciaNome: string })[];
    today: (Tarefa & { farmaciaNome: string })[];
    tomorrow: (Tarefa & { farmaciaNome: string })[];
    upcoming: (Tarefa & { farmaciaNome: string })[];
  };
  nextMeetings: (Reuniao & { farmaciaNome: string })[];
}

/* ── componentes auxiliares ──────────────────────────── */

function StatCard({ label, value, sub, icon: Icon, color, href }: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; href?: string;
}) {
  const inner = (
    <div className="glass-card p-6 flex flex-col justify-between min-h-[140px] group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
          'bg-black/[0.03] dark:bg-white/[0.05] group-hover:scale-110 group-hover:bg-primary/10'
        )}>
          <Icon className={cn('h-5 w-5', color.replace('bg-', 'text-'))} />
        </div>
        {href && <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-primary translate-x-[-4px] group-hover:translate-x-0" />}
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground-tertiary mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</h4>
          {sub && <span className="text-[11px] font-bold text-foreground-quaternary">{sub}</span>}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionHeader({ icon: Icon, color, title, sub, action, actionHref }: {
  icon: any; color: string; title: string; sub?: string; action?: string; actionHref?: string;
}) {
  return (
    <div className="px-8 py-5 border-b border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={cn('h-5 w-5 opacity-40', color)} />
        <div>
          <h3 className="text-[13px] font-black uppercase tracking-[0.18em] text-foreground">{title}</h3>
          {sub && <p className="text-[11px] font-bold text-foreground-tertiary mt-1">{sub}</p>}
        </div>
      </div>
      {action && actionHref && (
        <Link href={actionHref} className="text-[10px] font-bold text-primary hover:underline tracking-widest uppercase">
          {action}
        </Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { selectedFarmaciaId } = useFarmacia();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = todayMidnight();
  const tomorrow = tomorrowMidnight();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [fRes, tRes, rRes] = await Promise.all([
          fetch('/api/farmacias', { cache: 'no-store' }),
          fetch('/api/tarefas', { cache: 'no-store' }),
          fetch('/api/reunioes', { cache: 'no-store' }),
        ]);
        const allF: Farmacia[] = await fRes.json();
        const allT: Tarefa[] = await tRes.json();
        const allR: Reuniao[] = await rRes.json();

        const farmacias = selectedFarmaciaId === 'global' ? allF : allF.filter(f => f.id === selectedFarmaciaId);
        const tasks = selectedFarmaciaId === 'global' ? allT : allT.filter(t => t.farmaciaId === selectedFarmaciaId);
        const reunioes = selectedFarmaciaId === 'global' ? allR : allR.filter(r => r.farmaciaId === selectedFarmaciaId);

        const fMap = Object.fromEntries(allF.map(f => [f.id, f.nomeFarmacia]));
        const in3 = new Date(today); in3.setDate(in3.getDate() + 3);

        // Função auxiliar para comparar datas ignorando horas e fuso horário
        const isOverdue = (venc: string | null) => {
          if (!venc) return false;
          // Garante que comparamos apenas a parte da data YYYY-MM-DD
          const dv = new Date(venc.split('T')[0] + 'T23:59:59');
          return dv < today;
        };

        const overdueTotal = tasks.filter(t => t.status !== 'done' && isOverdue(t.vencimento)).length;
        const pendingTotal = tasks.filter(t => t.status !== 'done').length;
        const doneTotal = tasks.filter(t => t.status === 'done').length;

        const reuniaoHoje = reunioes.filter(r => {
          const d = new Date(r.data.split('T')[0] + 'T12:00:00');
          return d >= today && d < tomorrow;
        }).length;

        const farmaciasRows: FarmaciaRow[] = farmacias.map(f => {
          const ft = tasks.filter(t => t.farmaciaId === f.id);
          const done = ft.filter(t => t.status === 'done').length;
          const overdue = ft.filter(t => t.status !== 'done' && isOverdue(t.vencimento)).length;
          const next = ft
            .filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento.split('T')[0] + 'T23:59:59') >= today)
            .sort((a, b) => new Date(a.vencimento!.split('T')[0]).getTime() - new Date(b.vencimento!.split('T')[0]).getTime())[0];
          return {
            id: f.id, nomeFarmacia: f.nomeFarmacia, statusMarketing: f.statusMarketing,
            totalTasks: ft.length, doneTasks: done, overdueTasks: overdue,
            nextTaskLabel: next ? relativeDay(next.vencimento!) : null,
            semTarefas: ft.length === 0,
            cidade: f.cidade, uf: f.uf,
          };
        }).sort((a, b) => b.overdueTasks - a.overdueTasks || a.nomeFarmacia.localeCompare(b.nomeFarmacia));

        const timelineTasks = {
          overdue: tasks.filter(t => t.status !== 'done' && isOverdue(t.vencimento))
            .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
            .map(t => ({ ...t, farmaciaNome: fMap[t.farmaciaId] ?? '—' })),
          today: tasks.filter(t => {
            if (t.status === 'done' || !t.vencimento) return false;
            const d = new Date(t.vencimento.split('T')[0] + 'T12:00:00');
            return d >= today && d < tomorrow;
          }).map(t => ({ ...t, farmaciaNome: fMap[t.farmaciaId] ?? '—' })),
          tomorrow: tasks.filter(t => {
            if (t.status === 'done' || !t.vencimento) return false;
            const d = new Date(t.vencimento.split('T')[0] + 'T12:00:00');
            const nextDay = new Date(tomorrow); nextDay.setDate(nextDay.getDate() + 1);
            return d >= tomorrow && d < nextDay;
          }).map(t => ({ ...t, farmaciaNome: fMap[t.farmaciaId] ?? '—' })),
          upcoming: tasks.filter(t => {
            if (t.status === 'done' || !t.vencimento) return false;
            const d = new Date(t.vencimento.split('T')[0] + 'T12:00:00');
            const dayAfterTom = new Date(tomorrow); dayAfterTom.setDate(dayAfterTom.getDate() + 1);
            return d >= dayAfterTom;
          }).sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
            .slice(0, 10)
            .map(t => ({ ...t, farmaciaNome: fMap[t.farmaciaId] ?? '—' })),
        };

        const nextMeetings = reunioes
          .filter(r => new Date(r.data + 'T12:00:00') >= today)
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .slice(0, 5)
          .map(m => ({ ...m, farmaciaNome: fMap[m.farmaciaId] ?? '—' }));

        setData({
          totalFarmacias: farmacias.length,
          overdueTotal,
          pendingTotal,
          doneTotal,
          reuniaoHoje,
          farmaciasRows,
          timelineTasks,
          nextMeetings
        });
      } catch (e) {
        console.error('Erro no Dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedFarmaciaId]);

  if (loading) return <PageLoader label="Autenticando..." />;
  if (!data) return null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-10 page-transition">

      {/* Header - Apple Style */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{greet}.</h1>
        <p className="text-[13px] font-medium text-foreground/40">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <StatCard label="Unidades" value={data.totalFarmacias} icon={Store} color="text-primary" href="/farmacias" />
        <StatCard label="Atrasadas" value={data.overdueTotal} icon={AlertTriangle} color="text-red-500" href="/tarefas" />
        <StatCard label="Pendentes" value={data.pendingTotal} icon={Clock} color="text-amber-500" href="/tarefas" />
        <StatCard label="Concluídas" value={data.doneTotal} icon={CheckCircle2} color="text-emerald-500" href="/tarefas" />
        <StatCard label="Reuniões Hoje" value={data.reuniaoHoje} icon={Calendar} color="text-indigo-500" href="/reunioes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Radar de Monitoramento - Agora Menor */}
        <div className="lg:col-span-4 glass-card overflow-hidden h-fit">
          <SectionHeader
            icon={Activity} color="text-primary"
            title="Radar" sub="Performance por unidade"
            action="Ver rede" actionHref="/farmacias"
          />

          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03] max-h-[400px] overflow-y-auto">
            {data.farmaciasRows.slice(0, 8).map(f => {
              const pct = f.totalTasks > 0 ? Math.round((f.doneTasks / f.totalTasks) * 100) : 0;
              const hasAlert = f.overdueTasks > 0;

              return (
                <Link key={f.id} href={`/farmacias/${f.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[14px] font-bold tracking-tight truncate text-foreground group-hover:text-blue-500 transition-colors uppercase">{f.nomeFarmacia}</span>
                      {hasAlert && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-black/[0.05] dark:bg-white/[0.1] rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-1000', hasAlert ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'bg-primary')} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-black text-foreground-tertiary tabular-nums">{pct}%</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Reuniões */}
        <div className="lg:col-span-8 glass-card overflow-hidden">
          <SectionHeader icon={Calendar} color="text-indigo-500" title="Próximas Reuniões" sub="Agenda confirmada" action="Agenda Completa" actionHref="/reunioes" />
          <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
            {data.nextMeetings.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Nenhuma reunião agendada</div>
            ) : (
              data.nextMeetings.map(m => (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/[0.01] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.05] hover:border-blue-500/20 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-all group-hover:shadow-md">
                    <span className="text-[18px] font-black leading-none text-foreground">{new Date(m.data + 'T12:00:00').getDate()}</span>
                    <span className="text-[10px] font-black uppercase text-foreground-tertiary">{new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black truncate group-hover:text-blue-500 transition-colors uppercase tracking-tight text-foreground">{m.pauta || 'Alinhamento'}</p>
                    <p className="text-[11px] font-bold text-foreground-tertiary truncate flex items-center gap-1.5 mt-1">
                      <Store className="h-3.5 w-3.5" />
                      {m.farmaciaNome}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* NOVA SEÇÃO: LINHA DO TEMPO DE TAREFAS */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Linha do Tempo de Tarefas</h3>
                <p className="text-[10px] font-medium text-foreground/30">O que você precisa realizar hoje e nos próximos dias</p>
              </div>
            </div>
            <Link href="/tarefas" className="text-[10px] font-bold text-primary hover:underline tracking-widest uppercase">Ver Kanban</Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Coluna 1: Atrasadas */}
            <TaskTimelineColumn title="Atrasadas" icon={AlertCircle} color="text-red-500" tasks={data.timelineTasks.overdue} />
            {/* Coluna 2: Hoje */}
            <TaskTimelineColumn title="Hoje" icon={Target} color="text-blue-500" tasks={data.timelineTasks.today} />
            {/* Coluna 3: Amanhã */}
            <TaskTimelineColumn title="Amanhã" icon={Clock} color="text-amber-500" tasks={data.timelineTasks.tomorrow} />
            {/* Coluna 4: Próximas */}
            <TaskTimelineColumn title="Próximas" icon={Calendar} color="text-indigo-500" tasks={data.timelineTasks.upcoming} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskTimelineColumn({ title, icon: Icon, color, tasks }: { title: string, icon: any, color: string, tasks: (Tarefa & { farmaciaNome: string })[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-foreground-tertiary">{title}</span>
        </div>
        <span className="text-[11px] font-black tabular-nums px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.1] text-foreground-tertiary">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-black/[0.08] dark:border-white/[0.1] rounded-2xl">
            <p className="text-[10px] font-black text-foreground-quaternary uppercase tracking-widest">Vazio</p>
          </div>
        ) : (
          tasks.slice(0, 5).map(t => (
            <Link key={t.id} href={`/farmacias/${t.farmaciaId}?tab=tarefas`} className="block group">
              <div className="glass-card p-4 hover:border-blue-500/40 transition-all hover:-translate-y-1 hover:shadow-lg dark:hover:bg-white/[0.05]">
                <p className="text-[14px] font-bold text-foreground group-hover:text-blue-500 transition-colors leading-snug mb-1.5">{t.titulo}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black text-foreground-tertiary truncate flex-1 uppercase tracking-wider">{t.farmaciaNome}</span>
                  {t.vencimento && (
                    <span className="text-[10px] font-black tabular-nums text-foreground-quaternary">{new Date(t.vencimento.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
