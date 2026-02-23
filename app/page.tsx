
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
  urgentTasks: (Tarefa & { farmaciaNome: string })[];
  nextMeetings: (Reuniao & { farmaciaNome: string })[];
  semAtencao: string[];   /* farmácias sem nenhuma tarefa */
  semReuniao30d: string[];   /* farmácias sem reunião nos últimos 30 dias */
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-bold tracking-tight tabular-nums">{value}</h4>
          {sub && <span className="text-[10px] font-bold text-foreground/20">{sub}</span>}
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
          <h3 className="text-xs font-bold uppercase tracking-widest">{title}</h3>
          {sub && <p className="text-[10px] font-medium text-foreground/30 mt-0.5">{sub}</p>}
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

        const overdueTotal = tasks.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today).length;
        const pendingTotal = tasks.filter(t => t.status !== 'done').length;
        const doneTotal = tasks.filter(t => t.status === 'done').length;
        const reuniaoHoje = reunioes.filter(r => {
          const d = new Date(r.data + 'T12:00:00');
          return d >= today && d < tomorrow;
        }).length;

        const farmaciasRows: FarmaciaRow[] = farmacias.map(f => {
          const ft = tasks.filter(t => t.farmaciaId === f.id);
          const done = ft.filter(t => t.status === 'done').length;
          const overdue = ft.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today).length;
          const next = ft
            .filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) >= today)
            .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())[0];
          return {
            id: f.id, nomeFarmacia: f.nomeFarmacia, statusMarketing: f.statusMarketing,
            totalTasks: ft.length, doneTasks: done, overdueTasks: overdue,
            nextTaskLabel: next ? relativeDay(next.vencimento!) : null,
            semTarefas: ft.length === 0,
            cidade: f.cidade, uf: f.uf,
          };
        }).sort((a, b) => b.overdueTasks - a.overdueTasks || a.nomeFarmacia.localeCompare(b.nomeFarmacia));

        const urgentTasks = [
          ...tasks.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today),
          ...tasks.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) >= today && new Date(t.vencimento) < in3),
        ]
          .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
          .slice(0, 6)
          .map(t => ({ ...t, farmaciaNome: fMap[t.farmaciaId] ?? '—' }));

        const nextMeetings = reunioes
          .filter(r => new Date(r.data + 'T12:00:00') >= today)
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .slice(0, 5)
          .map(m => ({ ...m, farmaciaNome: fMap[m.farmaciaId] ?? '—' }));

        const semAtencao = farmacias
          .filter(f => tasks.filter(t => t.farmaciaId === f.id && t.status !== 'done').length === 0)
          .map(f => f.nomeFarmacia)
          .slice(0, 5);

        const ago30 = new Date(today); ago30.setDate(ago30.getDate() - 30);
        const comReuniao30d = new Set(
          reunioes.filter(r => {
            const rd = new Date(r.data + 'T12:00:00');
            return rd >= ago30 && rd <= new Date();
          }).map(r => r.farmaciaId)
        );
        const semReuniao30d = farmacias
          .filter(f => !comReuniao30d.has(f.id))
          .map(f => f.nomeFarmacia)
          .slice(0, 5);

        setData({ totalFarmacias: farmacias.length, overdueTotal, pendingTotal, doneTotal, reuniaoHoje, farmaciasRows, urgentTasks, nextMeetings, semAtencao, semReuniao30d });
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
        {/* Radar de Monitoramento */}
        <div className="lg:col-span-8 glass-card overflow-hidden">
          <SectionHeader
            icon={Activity} color="text-primary"
            title="Radar de Performance" sub="Status atual por unidade"
            action="Gerenciar" actionHref="/farmacias"
          />

          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.03]">
            {data.farmaciasRows.map(f => {
              const pct = f.totalTasks > 0 ? Math.round((f.doneTasks / f.totalTasks) * 100) : 0;
              const hasAlert = f.overdueTasks > 0;

              return (
                <Link key={f.id} href={`/farmacias/${f.id}`} className="flex items-center gap-6 px-8 py-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[14px] font-bold tracking-tight truncate">{f.nomeFarmacia}</span>
                      {hasAlert && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase">
                          Alerta
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1 bg-black/[0.03] dark:bg-white/[0.05] rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-1000', hasAlert ? 'bg-red-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-foreground/40 tabular-nums">{pct}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-10 group-hover:opacity-100 transition-opacity" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Alta Prioridade */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card overflow-hidden">
            <SectionHeader icon={Zap} color="text-amber-500" title="Alta Prioridade" sub="Urgências" action="Ver Tudo" actionHref="/tarefas" />
            <div className="p-4 space-y-1">
              {data.urgentTasks.length === 0 ? (
                <p className="py-8 text-center text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Tudo em ordem</p>
              ) : (
                data.urgentTasks.map(t => (
                  <Link key={t.id} href="/tarefas" className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                    <div className={cn('w-1.5 h-1.5 rounded-full', new Date(t.vencimento!) < today ? 'bg-red-500' : 'bg-amber-500')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate group-hover:text-primary transition-colors">{t.titulo}</p>
                      <p className="text-[9px] font-medium text-foreground/30 truncate">{t.farmaciaNome}</p>
                    </div>
                    <span className="text-[10px] font-bold text-foreground/30">{relativeDay(t.vencimento!)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <SectionHeader icon={Calendar} color="text-indigo-500" title="Próximas Reuniões" sub="Agenda curta" action="Calendário" actionHref="/reunioes" />
            <div className="p-4 space-y-2">
              {data.nextMeetings.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-black/[0.02] dark:border-white/[0.02]">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[14px] font-bold leading-none">{new Date(m.data + 'T12:00:00').getDate()}</span>
                    <span className="text-[8px] font-bold uppercase opacity-30">{new Date(m.data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold truncate">{m.pauta || 'Alinhamento'}</p>
                    <p className="text-[9px] font-medium text-foreground/30 truncate">{m.farmaciaNome}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-8">
          <h3 className="text-sm font-bold tracking-tight mb-2">Oportunidades de Foco</h3>
          <p className="text-[12px] text-foreground/40 leading-relaxed mb-6">Unidades sem tarefas pendentes. Ótimo momento para propor novas estratégias:</p>
          <div className="flex flex-wrap gap-2">
            {data.semAtencao.map(nome => (
              <span key={nome} className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider">{nome}</span>
            ))}
          </div>
        </div>
        <div className="glass-card p-8">
          <h3 className="text-sm font-bold tracking-tight mb-2">Manutenção de Relação</h3>
          <p className="text-[12px] text-foreground/40 leading-relaxed mb-6">Nenhum contato formal nos últimos 30 dias nestas unidades:</p>
          <div className="flex flex-wrap gap-2">
            {data.semReuniao30d.map(nome => (
              <span key={nome} className="px-3 py-1.5 rounded-lg bg-amber-500/5 text-amber-500 text-[10px] font-bold uppercase tracking-wider">{nome}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
