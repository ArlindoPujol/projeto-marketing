
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
    <div className="glass-card flex flex-col justify-between p-6 group h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
          'bg-primary/10'
        )}>
          <Icon className={cn('h-5 w-5 text-primary')} />
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-semibold tracking-tight text-foreground mb-1">{value}</h4>
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-medium text-foreground-secondary">{label}</p>
          {sub && <span className="text-[12px] font-medium text-foreground-tertiary">{sub}</span>}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

function SectionHeader({ icon: Icon, color, title, sub, action, actionHref }: {
  icon: any; color: string; title: string; sub?: string;
  action?: string; actionHref?: string;
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border/40 mb-2">
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10')}>
          <Icon className={cn('h-4.5 w-4.5 text-primary')} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[16px] font-semibold tracking-tight text-foreground">{title}</h3>
          {sub && <p className="text-[12px] font-medium text-foreground-tertiary">{sub}</p>}
        </div>
      </div>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="text-[12px] font-medium text-primary hover:text-primary-hover transition-colors"
        >
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
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-[34px] font-bold tracking-tight text-foreground leading-tight">Visão Geral</h2>
        <p className="text-[15px] font-medium text-foreground-secondary opacity-80">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs Grid - Clean Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard label="Unidades ativas" value={data.totalFarmacias} icon={Store} color="text-primary" href="/farmacias" />
        <StatCard label="Atrasadas" value={data.overdueTotal} icon={AlertTriangle} color="text-danger" />
        <StatCard label="Pendentes" value={data.pendingTotal} icon={Clock} color="text-warning" />
        <StatCard label="Concluídas" value={data.doneTotal} icon={CheckCircle2} color="text-success" />
        <StatCard label="Reuniões hoje" value={data.reuniaoHoje} icon={Calendar} color="text-primary" href="/reunioes" />
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Radar de Monitoramento */}
        <div className="lg:col-span-4 glass-card overflow-hidden h-fit">
          <SectionHeader
            icon={Activity} color="text-primary"
            title="Radar" sub="Performance por unidade"
            action="Ver rede" actionHref="/farmacias"
          />

          <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
            {data.farmaciasRows.slice(0, 8).map(f => {
              const pct = f.totalTasks > 0 ? Math.round((f.doneTasks / f.totalTasks) * 100) : 0;
              const hasAlert = f.overdueTasks > 0;

              return (
                <Link key={f.id} href={`/farmacias/${f.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold tracking-tight truncate text-foreground group-hover:text-primary transition-colors">{f.nomeFarmacia}</span>
                        {hasAlert && <div className="w-1.5 h-1.5 rounded-full bg-danger" />}
                      </div>
                      <span className="text-[12px] font-medium text-foreground-secondary">{pct}%</span>
                    </div>

                    <div className="h-1.5 w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-1000 ease-out rounded-full", hasAlert ? 'bg-danger' : 'bg-success')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Reuniões */}
        <div className="lg:col-span-8 glass-card overflow-hidden">
          <SectionHeader icon={Calendar} color="text-primary" title="Próximas Reuniões" sub="Agenda confirmada" action="Agenda Completa" actionHref="/reunioes" />
          <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
            {data.nextMeetings.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-[13px] font-medium text-foreground-tertiary">Nenhuma reunião agendada</div>
            ) : (
              data.nextMeetings.map(m => (
                <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="w-14 h-14 rounded-xl bg-background border border-border/50 flex flex-col items-center justify-center shrink-0 shadow-sm transition-all">
                    <span className="text-[20px] font-semibold leading-none text-foreground">{new Date(m.data + 'T12:00:00').getDate()}</span>
                    <span className="text-[11px] font-medium text-foreground-tertiary uppercase mt-0.5">{new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold truncate group-hover:text-primary transition-colors text-foreground">{m.pauta || 'Alinhamento'}</p>
                    <p className="text-[13px] font-medium text-foreground-tertiary truncate flex items-center gap-1.5 mt-1">
                      <Store className="h-3.5 w-3.5 opacity-60" />
                      {m.farmaciaNome}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* NOVA SEÇÃO: LINHA DO TEMPO DE TAREFAS */}
        <div className="lg:col-span-12 space-y-6 mt-8">
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold tracking-tight text-foreground">Linha do Tempo de Tarefas</h3>
                <p className="text-[13px] font-medium text-foreground-tertiary">O que você precisa realizar hoje e nos próximos dias</p>
              </div>
            </div>
            <Link href="/tarefas" className="text-[13px] font-medium text-primary hover:text-primary-hover transition-colors">Ver Kanban</Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Colunas */}
            <TaskTimelineColumn title="Atrasadas" icon={AlertCircle} color="text-danger" tasks={data.timelineTasks.overdue} />
            <TaskTimelineColumn title="Hoje" icon={Target} color="text-primary" tasks={data.timelineTasks.today} />
            <TaskTimelineColumn title="Amanhã" icon={Clock} color="text-warning" tasks={data.timelineTasks.tomorrow} />
            <TaskTimelineColumn title="Próximas" icon={Calendar} color="text-foreground-tertiary" tasks={data.timelineTasks.upcoming} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskTimelineColumn({ title, icon: Icon, color, tasks }: { title: string, icon: any, color: string, tasks: (Tarefa & { farmaciaNome: string })[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <span className="text-[13px] font-semibold text-foreground-secondary">{title}</span>
        </div>
        <span className="text-[12px] font-semibold tabular-nums px-2.5 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] text-foreground-secondary">{tasks.length}</span>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-[20px] bg-black/[0.01] dark:bg-white/[0.01]">
            <p className="text-[13px] font-medium text-foreground-quaternary">Nenhuma tarefa</p>
          </div>
        ) : (
          tasks.slice(0, 5).map(t => (
            <Link key={t.id} href={`/farmacias/${t.farmaciaId}?tab=tarefas`} className="block group">
              <div className="glass-card p-5 hover:border-border-focus transition-all hover:scale-[1.02] active:scale-[0.98]">
                <p className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">{t.titulo}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-medium text-foreground-tertiary truncate flex-1">{t.farmaciaNome}</span>
                  {t.vencimento && (
                    <span className="text-[12px] font-medium text-foreground-secondary tabular-nums">{new Date(t.vencimento.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
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
