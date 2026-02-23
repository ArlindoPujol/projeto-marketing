
'use client';

import { Farmacia, Tarefa, Reuniao } from '@/lib/db';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Search, Filter, Store, ChevronRight, Activity, Plus,
    Calendar, CheckSquare, AlertTriangle, Pencil, Trash2, Phone
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
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

                        const borderClass = temAtrasada
                            ? 'border-red-400/60 shadow-[0_0_0_1px_rgba(239,68,68,0.15),0_2px_12px_rgba(239,68,68,0.08)]'
                            : temProxima
                                ? 'border-orange-400/50 shadow-[0_0_0_1px_rgba(251,146,60,0.15),0_2px_12px_rgba(251,146,60,0.06)]'
                                : 'border-black/[0.04]';

                        const statusInfo = statusConfig[farmacia.statusMarketing || ''] ?? { label: 'Ativa', cls: 'bg-blue-500/5 text-blue-600 border-blue-500/15' };
                        const isDeleting = deletingId === farmacia.id;

                        return (
                            <Link key={farmacia.id} href={`/farmacias/${farmacia.id}`} className="group">
                                <div className={cn(
                                    "relative flex flex-col gap-3 p-4 rounded-2xl bg-white border shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5",
                                    borderClass,
                                    isDeleting && "opacity-50 pointer-events-none"
                                )}>
                                    {/* Faixa de alerta no topo */}
                                    {(temAtrasada || temProxima) && (
                                        <div className={cn(
                                            "absolute top-0 left-0 right-0 h-0.5",
                                            temAtrasada
                                                ? "bg-gradient-to-r from-red-400 via-red-500 to-red-400"
                                                : "bg-gradient-to-r from-orange-300 via-orange-400 to-orange-300"
                                        )} />
                                    )}

                                    {/* Header: nome + cidade/UF + ícone */}
                                    <div className="flex items-start justify-between gap-2 pt-0.5">
                                        <div className="flex-1 min-w-0">
                                            {/* Nome da farmácia — destaque principal */}
                                            <h3 className="text-[15px] font-black text-gray-900 dark:text-white leading-tight uppercase tracking-tight truncate mb-1">
                                                {farmacia.nomeFarmacia}
                                            </h3>
                                            {/* Cidade + UF abaixo do nome */}
                                            <div className="flex items-center gap-1.5">
                                                <Activity className={cn("h-2.5 w-2.5 shrink-0",
                                                    temAtrasada ? "text-red-400" : temProxima ? "text-orange-400" : "text-blue-400"
                                                )} />
                                                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                                                    {farmacia.cidade}{farmacia.uf ? ` · ${farmacia.uf}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "shrink-0 p-1.5 rounded-lg border",
                                            temAtrasada ? "bg-red-500/8 border-red-400/25" :
                                                temProxima ? "bg-orange-500/8 border-orange-400/25" :
                                                    "bg-blue-500/8 border-blue-400/20"
                                        )}>
                                            <Store className={cn("h-3.5 w-3.5",
                                                temAtrasada ? "text-red-500" :
                                                    temProxima ? "text-orange-500" :
                                                        "text-blue-500"
                                            )} />
                                        </div>
                                    </div>

                                    {/* Alertas */}
                                    {temAtrasada && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/[0.05] border border-red-400/15 rounded-lg">
                                            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Tarefa em atraso</span>
                                        </div>
                                    )}
                                    {temProxima && !temAtrasada && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-500/[0.05] border border-orange-400/15 rounded-lg">
                                            <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-orange-500">Vence em breve</span>
                                        </div>
                                    )}

                                    {/* Progresso de tarefas */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Tarefas</span>
                                            <span className="text-[9px] font-bold text-gray-500">{progresso}%</span>
                                        </div>
                                        <div className="h-0.5 w-full bg-black/[0.05] rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700",
                                                    temAtrasada ? "bg-red-400" :
                                                        temProxima ? "bg-orange-400" :
                                                            "bg-blue-500"
                                                )}
                                                style={{ width: `${progresso}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Info: tarefas */}
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className={cn("h-3 w-3 shrink-0",
                                            temAtrasada ? "text-red-400" : temProxima ? "text-orange-400" : "text-gray-400"
                                        )} />
                                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                                            {totalTarefas === 0
                                                ? 'Sem tarefas cadastradas'
                                                : `${concluidasTarefas} de ${totalTarefas} tarefas concluída${concluidasTarefas !== 1 ? 's' : ''}`
                                            }
                                        </span>
                                    </div>

                                    {/* Info: reunião */}
                                    {reuniaoRef && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-blue-400 shrink-0" />
                                            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                                                {proximaReuniao ? 'Próxima: ' : 'Última: '}
                                                <span className={cn("font-bold", proximaReuniao ? "text-blue-500" : "text-gray-500")}>
                                                    {new Date(reuniaoRef.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </span>
                                        </div>
                                    )}

                                    {/* Info: WhatsApp */}
                                    {farmacia.whatsapp && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                                            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate">{farmacia.whatsapp}</span>
                                        </div>
                                    )}

                                    {/* Rodapé: responsável + ações + ver */}
                                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/[0.07]">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.10em] text-gray-500 dark:text-gray-400 truncate mr-2">
                                            {farmacia.responsavelNome || 'Resp. não definido'}
                                        </span>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Editar */}
                                            <Link
                                                href={`/farmacias/${farmacia.id}/editar`}
                                                onClick={e => e.stopPropagation()}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-wider text-gray-400 hover:text-blue-600 hover:bg-blue-500/5 border border-transparent hover:border-blue-500/15 transition-all duration-200"
                                            >
                                                <Pencil className="h-2.5 w-2.5" />
                                                Editar
                                            </Link>

                                            {/* Excluir */}
                                            <button
                                                onClick={e => handleDelete(e, farmacia.id, farmacia.nomeFarmacia)}
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-wider text-gray-400 hover:text-red-600 hover:bg-red-500/5 border border-transparent hover:border-red-500/15 transition-all duration-200"
                                            >
                                                <Trash2 className="h-2.5 w-2.5" />
                                                Excluir
                                            </button>

                                            {/* Ver */}
                                            <div className="flex items-center gap-0.5 text-gray-400 group-hover:text-blue-500 transition-colors pl-1 border-l border-black/[0.05]">
                                                <span className="text-[8px] font-bold uppercase tracking-widest">Ver</span>
                                                <ChevronRight className="h-3 w-3" />
                                            </div>
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
