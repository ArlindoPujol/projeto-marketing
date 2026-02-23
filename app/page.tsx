
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
    <div className={cn(
      'glass-card group p-6 flex flex-col justify-between min-h-[160px]',
      href && 'cursor-pointer'
    )}>
      {/* Background Accent Glow */}
      <div className={cn(
        'absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-[0.15] transition-opacity group-hover:opacity-[0.25]',
        color
      )} />

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex items-center justify-between">
          <div className={cn(
            'flex items-center justify-center w-12 h-12 rounded-2xl border transition-all duration-500',
            'bg-white/5 border-white/10 group-hover:scale-110 group-hover:rotate-3 group-hover:border-primary/50'
          )}>
            <Icon className={cn('h-6 w-6', color.replace('bg-', 'text-'))} />
          </div>
          {href && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 opacity-0 group-hover:opacity-100 transition-all">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-1.5">{label}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-[32px] font-black tracking-tight tabular-nums leading-none">
              {value}
            </h4>
            {sub && <span className="text-[11px] font-bold text-foreground/30">{sub}</span>}
          </div>
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
    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
      <div className="flex items-center gap-4">
        <div className={cn('p-2.5 rounded-2xl bg-opacity-10 shadow-lg', color.replace('text-', 'bg-'))}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <div>
          <h3 className="text-[14px] font-black uppercase tracking-[0.15em]">{title}</h3>
          {sub && <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mt-1">{sub}</p>}
        </div>
      </div>
      {action && actionHref && (
        <Link href={actionHref} className="btn-premium py-2 px-4 shadow-none text-[10px] tracking-widest uppercase">
          {action}
        </Link>
      )}
    </div>
  );
}


/* ── Página principal ────────────────────────────────── */
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

        /* ── KPIs ── */
        const overdueTotal = tasks.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today).length;
        const pendingTotal = tasks.filter(t => t.status !== 'done').length;
        const doneTotal = tasks.filter(t => t.status === 'done').length;
        const reuniaoHoje = reunioes.filter(r => {
          const d = new Date(r.data + 'T12:00:00');
          return d >= today && d < tomorrow;
        }).length;

        /* ── Radar Rows ── */
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

        /* ── Urgências ── */
        const urgentTasks = [
          ...tasks.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) < today),
          ...tasks.filter(t => t.status !== 'done' && t.vencimento && new Date(t.vencimento) >= today && new Date(t.vencimento) < in3),
        ]
          .sort((a, b) => new Date(a.vencimento!).getTime() - new Date(b.vencimento!).getTime())
          .slice(0, 6)
          .map(t => ({ ...t, farmaciaNome: fMap[t.farmaciaId] ?? '—' }));

        /* ── Próximas Reuniões ── */
        const nextMeetings = reunioes
          .filter(r => new Date(r.data + 'T12:00:00') >= today)
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
          .slice(0, 5)
          .map(m => ({ ...m, farmaciaNome: fMap[m.farmaciaId] ?? '—' }));

        /* ── Insights ── */
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

  if (loading) return <PageLoader label="Mapeando sua rede..." />;
  if (!data) return null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] md:text-[42px] font-black text-[#1C1C1E] dark:text-white tracking-tighter leading-none">
            {greet}.
          </h1>
          <p className="text-[13px] font-medium text-[#8E8E93] mt-2">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data.overdueTotal > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">{data.overdueTotal} Emergência{data.overdueTotal > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard label="Unidades" value={data.totalFarmacias} icon={Store} color="bg-blue-500" href="/farmacias" />
        <StatCard label="Atrasadas" value={data.overdueTotal} icon={AlertTriangle} color="bg-red-500" href="/tarefas" />
        <StatCard label="Pendentes" value={data.pendingTotal} icon={Clock} color="bg-[#FF9500]" href="/tarefas" />
        <StatCard label="Concluídas" value={data.doneTotal} icon={CheckCircle2} color="bg-[#34C759]" href="/tarefas" />
        <StatCard label="Reuniões Hoje" value={data.reuniaoHoje} icon={Calendar} color="bg-[#AF52DE]" href="/reunioes" />
      </div>

      {/* ── Conteúdo Principal ── */}
      <div className="grid gap-6 lg:grid-cols-12">

        {/* Radar de Monitoramento */}
        <div className="lg:col-span-8 glass-card border-none shadow-none">
          <SectionHeader
            icon={Target} color="text-primary"
            title="Radar de Performance" sub="Atividades por unidade"
            action="Configurações" actionHref="/farmacias"
          />

          <div className="divide-y divide-white/5">
            {data.farmaciasRows.length === 0 ? (
              <div className="py-20 text-center">
                <Store className="h-10 w-10 mx-auto text-foreground/10 mb-4" />
                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">Nenhuma unidade cadastrada</p>
              </div>
            ) : (
              data.farmaciasRows.map(f => {
                const pct = f.totalTasks > 0 ? Math.round((f.doneTasks / f.totalTasks) * 100) : 0;
                const st = statusConfig[f.statusMarketing] ?? statusConfig['paused'];

                return (
                  <Link key={f.id} href={`/farmacias/${f.id}`} className="flex items-center gap-6 px-8 py-6 hover:bg-white/[0.03] transition-colors group">
                    <div className={cn('h-3 w-3 rounded-full shrink-0 ring-4 ring-opacity-20', st.dot, st.color.replace('text-', 'ring-'))} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-[15px] font-extrabold tracking-tight truncate">{f.nomeFarmacia}</span>
                        {f.overdueTasks > 0 && (
                          <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/10 uppercase tracking-widest">
                            {f.overdueTasks} Alerta{f.overdueTasks > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-1000 ease-out', f.overdueTasks > 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-primary shadow-[0_0_10px_rgba(62,123,255,0.3)]')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-black text-foreground/40 tabular-nums w-8">{pct}%</span>
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col items-end gap-1.5">
                      <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em]">Pé na estrada</p>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                        <MapPin className="h-3 w-3 opacity-30" /> {f.cidade || '—'}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Urgências & Agenda */}
        <div className="lg:col-span-4 space-y-6">

          {/* Urgências */}
          <div className="glass-card border-none">
            <SectionHeader icon={Zap} color="text-amber-400" title="Alta Prioridade" sub="Resolver agora" action="Expandir" actionHref="/tarefas" />
            <div className="p-4 space-y-2">
              {data.urgentTasks.length === 0 ? (
                <div className="py-10 text-center opacity-40">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]">Operação Limpa</p>
                </div>
              ) : (
                data.urgentTasks.map(t => (
                  <Link key={t.id} href={`/tarefas`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/[0.04] transition-all group border border-transparent hover:border-white/5">
                    <div className={cn('h-2 w-2 rounded-full shrink-0', new Date(t.vencimento!) < today ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-amber-400')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold truncate group-hover:text-primary transition-colors">{t.titulo}</p>
                      <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.15em] mt-1 truncate">{t.farmaciaNome}</p>
                    </div>
                    <span className={cn('text-[10px] font-black tabular-nums whitespace-nowrap', new Date(t.vencimento!) < today ? 'text-red-400' : 'text-amber-400')}>{relativeDay(t.vencimento!)}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Agenda Curta */}
          <div className="glass-card border-none">
            <SectionHeader icon={Users} color="text-purple-400" title="Próximas Reuniões" sub="Timeline de contato" action="Agenda" actionHref="/reunioes" />
            <div className="p-4 space-y-3">
              {data.nextMeetings.length === 0 ? (
                <div className="py-10 text-center opacity-20 font-black text-[10px] uppercase tracking-[0.2em]">Agenda vazia</div>
              ) : (
                data.nextMeetings.map(m => {
                  const d = new Date(m.data + 'T12:00:00');
                  const isHoje = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={m.id} className="flex items-center gap-5 p-4 rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-all group">
                      <div className={cn(
                        'flex flex-col items-center justify-center w-12 h-12 rounded-2xl border shrink-0 transition-transform group-hover:scale-105',
                        isHoje ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30' : 'bg-white/5 border-white/10'
                      )}>
                        <span className="text-[15px] font-black leading-none">{d.getDate()}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter mt-1 opacity-60">{d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-extrabold truncate">{m.pauta || 'Reunião de Alinhamento'}</p>
                        <p className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.15em] mt-1 truncate">{m.farmaciaNome}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Seção de Insights ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card border-none p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 shadow-lg">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[18px] font-black tracking-tight">Oportunidades de Foco</h3>
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">Análise Proativa</p>
            </div>
          </div>
          <div className="space-y-6">
            {data.semAtencao.length > 0 ? (
              <>
                <p className="text-[13px] text-foreground/60 leading-relaxed font-medium">As seguintes unidades estão sem tarefas pendentes. Talvez seja hora de propor um novo projeto ou ação estratégica:</p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {data.semAtencao.map(nome => (
                    <span key={nome} className="px-4 py-2 rounded-xl bg-orange-500/5 text-orange-400 text-[10px] font-black uppercase tracking-[0.15em] border border-orange-500/10">{nome}</span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[13px] text-emerald-400 font-black uppercase tracking-widest">Todas as unidades possuem atividades em andamento. ✅</p>
            )}
          </div>
        </div>

        <div className="glass-card border-none p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[18px] font-black tracking-tight">Análise de Relacionamento</h3>
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">Gestão de Contato</p>
            </div>
          </div>
          <div className="space-y-6">
            {data.semReuniao30d.length > 0 ? (
              <>
                <p className="text-[13px] text-foreground/60 leading-relaxed font-medium">Não detectamos reuniões nos últimos 30 dias para estas unidades. Um contato proativo pode fortalecer a parceria:</p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  {data.semReuniao30d.map(nome => (
                    <span key={nome} className="px-4 py-2 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.15em] border border-primary/10">{nome}</span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[13px] text-emerald-400 font-black uppercase tracking-widest">Você manteve contato com toda a sua rede no último mês. 🤝</p>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
