
'use client';

import { Farmacia, Tarefa, Reuniao } from '@/lib/db';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Search, Filter, Store, ChevronRight, Activity, Plus,
    Calendar, CheckSquare, AlertTriangle, Pencil, Trash2, Phone,
    ShieldCheck, ShieldAlert, MapPin, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { useFarmacia } from '@/contexts/FarmaciaContext';
import { PageLoader } from '@/components/ui/PageLoader';

const statusConfig: Record<string, { label: string; cls: string }> = {
    running: { label: 'Em execução', cls: 'bg-green-500/5  text-green-600  border-green-500/15' },
    waiting_access: { label: 'Ag. acesso', cls: 'bg-yellow-500/5 text-yellow-600 border-yellow-500/15' },
    paused: { label: 'Pausada', cls: 'bg-gray-100     text-gray-500   border-gray-200' },
    completed: { label: 'Concluída', cls: 'bg-blue-500/5  text-blue-600  border-blue-500/15' },
};

export default function FarmaciasPage() {
    const confirm = useConfirm();
    const { toast } = useToast();
    const { farmacias, refreshFarmacias } = useFarmacia();
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [reunioes, setReunioes] = useState<Reuniao[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/tarefas', { cache: 'no-store' }).then(res => res.json()),
            fetch('/api/reunioes', { cache: 'no-store' }).then(res => res.json()),
        ]).then(([tarefasData, reunioesData]) => {
            setTarefas(tarefasData);
            setReunioes(reunioesData);
            setLoading(false);
        });
    }, []);

    async function handleDelete(e: React.MouseEvent, id: string, nome: string) {
        e.preventDefault();
        e.stopPropagation();
        const ok = await confirm({
            title: `Excluir "${nome}"?`,
            message: 'Esta ação não pode ser desfeita. Todos os dados desta farmácia serão removidos permanentemente.',
            confirmLabel: 'Excluir',
            cancelLabel: 'Cancelar',
            variant: 'danger',
            confirmGhost: false
        } as any);
        if (!ok) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/farmacias/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await refreshFarmacias();
                toast(`"${nome}" excluída com sucesso`, 'success');
            } else {
                toast('Erro ao excluir farmácia', 'error');
            }
        } finally {
            setDeletingId(null);
        }
    }

    const filtered = farmacias.filter(f =>
        (f.nomeFarmacia || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.cidade || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <PageLoader label="Consultando rede…" />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">

            {/* Barra de busca + botão nova farmácia */}
            <div className="flex items-center gap-3">
                <div className="relative group flex-1 max-w-2xl">
                    <div className={[
                        "relative flex items-center rounded-2xl p-1.5 transition-all duration-300",
                        /* Light */
                        "bg-white/50 border border-black/[0.05] shadow-sm",
                        "focus-within:border-blue-500/30 focus-within:bg-white",
                        /* Dark — minimalista */
                        "dark:bg-white/[0.04] dark:border-white/[0.08]",
                        "dark:focus-within:border-blue-400/25 dark:focus-within:bg-white/[0.06]",
                    ].join(' ')}>
                        <div className="pl-3 pr-2">
                            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
                        </div>
                        <input
                            placeholder="Filtrar por nome ou cidade..."
                            className="flex-1 bg-transparent border-none text-sm py-2 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-0 font-medium"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="hidden lg:flex items-center gap-2 px-4 border-l border-black/[0.05] dark:border-white/[0.06]">
                            <Filter className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400/70">Filtros</span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/farmacias/nova"
                    className={[
                        "flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap",
                        /* Light */
                        "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-px",
                        /* Dark — minimalista */
                        "dark:bg-blue-600/90 dark:hover:bg-blue-500/90",
                        "dark:shadow-[0_0_16px_-4px_rgba(59,130,246,0.4)]",
                        "dark:hover:shadow-[0_0_24px_-4px_rgba(59,130,246,0.6)] dark:hover:-translate-y-px",
                    ].join(' ')}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Nova Farmácia
                </Link>
            </div>

            {/* Contador */}
            {filtered.length > 0 && (
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 -mt-4">
                    {filtered.length} {filtered.length === 1 ? 'unidade' : 'unidades'} encontrada{filtered.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Grid de cards */}
            {filtered.length === 0 ? (
                <div className="py-20 text-center glass-card rounded-2xl border-dashed">
                    <Store className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Nenhuma farmácia encontrada</p>
                    <Link href="/farmacias/nova" className="inline-flex items-center gap-1.5 mt-4 text-blue-500 font-bold text-xs hover:underline">
                        <Plus className="h-3.5 w-3.5" /> Cadastrar nova farmácia
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map(farmacia => {
                        const farmaciaTarefas = tarefas.filter(t => t.farmaciaId === farmacia.id);
                        const totalTarefas = farmaciaTarefas.length;
                        const concluidasTarefas = farmaciaTarefas.filter(t => t.status === 'done').length;
                        const pendentes = farmaciaTarefas.filter(t => t.status !== 'done');
                        const progresso = Math.round((concluidasTarefas / (totalTarefas || 1)) * 100);

                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const emBreve = new Date(today); emBreve.setDate(emBreve.getDate() + 3);

                        const temAtrasada = pendentes.some(t => t.vencimento && new Date(t.vencimento) < today);
                        const temProxima = !temAtrasada && pendentes.some(t =>
                            t.vencimento && new Date(t.vencimento) >= today && new Date(t.vencimento) <= emBreve
                        );

                        const farmaciaReunioes = reunioes.filter(r => r.farmaciaId === farmacia.id);
                        const proximaReuniao = farmaciaReunioes
                            .filter(r => new Date(r.data + 'T12:00:00') >= today)
                            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
                        const ultimaReuniao = farmaciaReunioes
                            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
                        const reuniaoRef = proximaReuniao || ultimaReuniao;

                        const isDeleting = deletingId === farmacia.id;

                        return (
                            <Link key={farmacia.id} href={`/farmacias/${farmacia.id}`} className="group">
                                <div className={cn(
                                    "relative flex flex-col h-full rounded-3xl transition-all duration-500 overflow-hidden",
                                    /* Base */
                                    "bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]",
                                    "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]",
                                    "dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]",
                                    "hover:-translate-y-1.5",
                                    /* Alertas coloridos */
                                    temAtrasada && "ring-1 ring-red-500/20 shadow-red-500/5 hover:shadow-red-500/10",
                                    temProxima && "ring-1 ring-orange-500/20 shadow-orange-500/5 hover:shadow-orange-500/10",
                                    isDeleting && "opacity-50 pointer-events-none"
                                )}>

                                    {/* Faixa Superior de Status - Premium */}
                                    <div className={cn(
                                        "h-1 w-full",
                                        temAtrasada ? "bg-red-500" :
                                            temProxima ? "bg-orange-500" :
                                                farmacia.acessosEnviadosWhatsapp ? "bg-blue-500" : "bg-transparent"
                                    )} />

                                    <div className="p-6 flex flex-col gap-5">
                                        {/* Header: Nome e Local */}
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight tracking-tight uppercase">
                                                    {farmacia.nomeFarmacia}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{farmacia.cidade}{farmacia.uf ? ` · ${farmacia.uf}` : ''}</span>
                                                </div>
                                            </div>

                                            {/* Badge de Acessos - O ponto principal solicitado */}
                                            <div className={cn(
                                                "shrink-0 flex items-center justify-center p-2 rounded-2xl border transition-all duration-300",
                                                farmacia.acessosEnviadosWhatsapp
                                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-[0_0_12px_-4px_rgba(59,130,246,0.5)]"
                                                    : "bg-black/[0.02] dark:bg-white/5 border-black/[0.05] dark:border-white/10 text-gray-300 dark:text-gray-600"
                                            )} title={farmacia.acessosEnviadosWhatsapp ? "Acessos Enviados" : "Acessos Pendentes"}>
                                                {farmacia.acessosEnviadosWhatsapp ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                            </div>
                                        </div>

                                        {/* Pills de Status */}
                                        <div className="flex flex-wrap gap-2">
                                            {temAtrasada && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500 text-white text-[8px] font-black uppercase tracking-widest">
                                                    <AlertTriangle className="h-2.5 w-2.5" /> Atraso
                                                </span>
                                            )}
                                            {temProxima && !temAtrasada && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest">
                                                    <Clock className="h-2.5 w-2.5" /> Próximo
                                                </span>
                                            )}
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                farmacia.acessosEnviadosWhatsapp
                                                    ? "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10"
                                                    : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-white/5"
                                            )}>
                                                {farmacia.acessosEnviadosWhatsapp ? 'Acessos OK' : 'Sem Acesso'}
                                            </span>
                                        </div>

                                        {/* Tasks Section */}
                                        <div className="space-y-3 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.05]">
                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    <CheckSquare className="h-3 w-3" />
                                                    <span>Progresso</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{progresso}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        temAtrasada ? "bg-red-500" : temProxima ? "bg-orange-500" : "bg-blue-500"
                                                    )}
                                                    style={{ width: `${progresso}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-tight">
                                                {totalTarefas === 0 ? 'Sem tarefas ativas' : `${concluidasTarefas}/${totalTarefas} finalizadas`}
                                            </p>
                                        </div>

                                        {/* Bottom Data */}
                                        <div className="space-y-2 mt-auto">
                                            {reuniaoRef && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    <Calendar className="h-3.5 w-3.5 text-blue-500/70" />
                                                    <span>
                                                        {proximaReuniao ? 'Próxima: ' : 'Última: '}
                                                        <span className="font-bold text-gray-900 dark:text-gray-200">
                                                            {new Date(reuniaoRef.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                            {farmacia.whatsapp && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                                                    <span className="tabular-nums">{farmacia.whatsapp}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="mt-auto px-6 py-4 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01] border-t border-black/[0.03] dark:border-white/[0.05]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/10">
                                                {farmacia.responsavelNome?.substring(0, 1).toUpperCase() || 'R'}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{farmacia.responsavelNome?.split(' ')[0] || 'Resp.'}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Link href={`/farmacias/${farmacia.id}/editar`} onClick={e => e.stopPropagation()} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Link>
                                            <button onClick={e => handleDelete(e, farmacia.id, farmacia.nomeFarmacia)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="w-px h-3 bg-black/5 dark:bg-white/5 mx-1" />
                                            <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-700 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
