
'use client';

import { Farmacia, Tarefa, Reuniao } from '@/lib/db';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    Edit, Trash2, MapPin, User, CheckSquare, Calendar, FileText,
    Plus, TrendingUp, Phone, Instagram, Globe, DollarSign, Store,
    Clock, Check, Facebook, LayoutDashboard, StickyNote, X, Save, Shield
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FormButton } from '@/components/ui/FormButton';
import { PageLoader, LoadError } from '@/components/ui/PageLoader';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { useFarmacia } from '@/contexts/FarmaciaContext';

type Tab = 'dados' | 'tarefas' | 'diagnostico' | 'agenda';

const tabLabels: Record<Tab, string> = {
    dados: 'Dados Principais',
    tarefas: 'Tarefas',
    diagnostico: 'Diagnóstico',
    agenda: 'Agenda',
};

const tabIcons: Record<Tab, any> = {
    dados: Store,
    tarefas: CheckSquare,
    diagnostico: FileText,
    agenda: Calendar,
};

// ── Tipos auxiliares ──────────────────────────────────────
interface DiagEntry { id: string; data: string; texto: string; }

// ── Componentes auxiliares ────────────────────────────────

function SectionCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.08] flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{title}</span>
            </div>
            <div className="px-6 grid grid-cols-1 md:grid-cols-2">{children}</div>
        </div>
    );
}

function InfoField({ label, value, icon: Icon, isLink, isBlue, fullWidth }: {
    label: string; value?: string | null; icon?: any; isLink?: boolean; isBlue?: boolean; fullWidth?: boolean;
}) {
    const display = value || '—';
    return (
        <div className={cn("flex flex-col gap-1.5 py-4 border-b border-black/[0.04] dark:border-white/[0.08] last:border-0", fullWidth && "col-span-2")}>
            <div className="flex items-center gap-1.5">
                {Icon && <Icon className="h-3 w-3 text-gray-300 dark:text-gray-600" />}
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">{label}</span>
            </div>
            {isLink && value ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-500 hover:underline truncate">{display}</a>
            ) : (
                <span className={cn("text-sm font-semibold tracking-tight", isBlue ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-gray-100", !value && "text-gray-300 dark:text-gray-700 font-normal italic")}>
                    {display}
                </span>
            )}
        </div>
    );
}

function BoolBadge({ value, label }: { value: boolean; label: string }) {
    return (
        <div className="flex flex-col gap-1.5 py-4 border-b border-black/[0.04] last:border-0">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">{label}</span>
            <span className={cn(
                "self-start text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                value ? "bg-green-500/5 text-green-600 border-green-500/15" : "bg-gray-100 text-gray-400 border-gray-200"
            )}>
                {value ? "Sim" : "Não"}
            </span>
        </div>
    );
}

// ── Formulário de reunião (usado tanto para criar quanto editar) ──
function ReuniaoForm({
    inicial, onSalvar, onCancelar, saving
}: {
    inicial?: Partial<Reuniao>;
    onSalvar: (dados: Partial<Reuniao>) => Promise<void>;
    onCancelar: () => void;
    saving: boolean;
}) {
    const [data, setData] = useState(inicial?.data?.substring(0, 10) || '');
    const [pauta, setPauta] = useState(inicial?.pauta || '');
    const [resumo, setResumo] = useState(inicial?.resumo || '');
    const [proximosPassos, setProximosPassos] = useState(inicial?.proximosPassos || '');

    const inputCls = "w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.1] rounded-xl px-4 py-3.5 text-base font-bold text-foreground placeholder:text-foreground-quaternary focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all";

    return (
        <div className="glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 border-dashed">
            <div className="px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.08] flex items-center gap-2 bg-black/[0.01] dark:bg-white/[0.01]">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground-tertiary">
                    {inicial?.id ? 'Editar Reunião' : 'Nova Reunião'}
                </span>
            </div>
            <form
                className="p-6 space-y-5"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await onSalvar({ data, pauta, resumo, proximosPassos });
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground-tertiary">Data da Reunião</label>
                        <input type="date" required value={data} onChange={e => setData(e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground-tertiary">Pauta</label>
                        <input type="text" required value={pauta} onChange={e => setPauta(e.target.value)} placeholder="Assunto principal..." className={inputCls} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground-tertiary">Resumo / O que foi discutido</label>
                    <textarea rows={4} value={resumo} onChange={e => setResumo(e.target.value)} placeholder="Principais pontos abordados..." className={cn(inputCls, "resize-none")} />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground-tertiary">Próximos Passos</label>
                    <textarea rows={3} value={proximosPassos} onChange={e => setProximosPassos(e.target.value)} placeholder="Ações definidas para os próximos dias..." className={cn(inputCls, "resize-none")} />
                </div>
                <div className="flex gap-3 pt-2">
                    <FormButton
                        state={saving ? 'loading' : 'idle'}
                        idleLabel={inicial?.id ? 'Salvar Reunião' : 'Agendar Reunião'}
                        loadingLabel="Salvando…"
                        successLabel="Salvo!"
                        size="md"
                        fullWidth
                    />
                    <button type="button" onClick={onCancelar}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.12] text-foreground-secondary font-bold text-[11px] uppercase tracking-widest hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all">
                        <X className="h-4 w-4" />
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

// ══════════════════════════════════════════════════════════
export default function FarmaciaDetailsPage() {
    const { id } = useParams() as { id: string };
    const { selectedFarmaciaId, setSelectedFarmaciaId } = useFarmacia();
    const router = useRouter();
    const confirm = useConfirm();
    const { toast } = useToast();
    const [farmacia, setFarmacia] = useState<Farmacia | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('dados');
    const [loading, setLoading] = useState(true);

    // Tarefas
    const [tarefas, setTarefas] = useState<Tarefa[]>([]);

    // Reuniões
    const [reunioes, setReunioes] = useState<Reuniao[]>([]);
    const [agendandoReuniao, setAgendandoReuniao] = useState(false);
    const [reuniaoEditandoId, setReuniaoEditandoId] = useState<string | null>(null);
    const [savingReuniao, setSavingReuniao] = useState(false);

    // Diagnóstico
    const [diagEntries, setDiagEntries] = useState<DiagEntry[]>([]);
    const [novaEntradaTexto, setNovaEntradaTexto] = useState('');
    const [savingDiag, setSavingDiag] = useState(false);
    const [editandoDiagId, setEditandoDiagId] = useState<string | null>(null);
    const [editandoDiagTexto, setEditandoDiagTexto] = useState('');

    // Carrega entradas de diagnóstico do campo notas (JSON)
    function parseDiagEntries(notas: string): DiagEntry[] {
        try {
            const parsed = JSON.parse(notas);
            if (Array.isArray(parsed)) return parsed;
        } catch { }
        // Migração: se for texto puro, converte para entrada única
        if (notas?.trim()) {
            return [{ id: 'legacy', data: new Date().toISOString().substring(0, 10), texto: notas }];
        }
        return [];
    }

    async function saveDiagEntries(entries: DiagEntry[]) {
        setSavingDiag(true);
        await fetch(`/api/farmacias/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notas: JSON.stringify(entries) })
        });
        setSavingDiag(false);
    }

    // Funções auxiliares de limpeza
    const getCleanId = useCallback(() => decodeURIComponent(String(id)).trim(), [id]);

    const fetchTarefas = useCallback(async () => {
        const cleanId = getCleanId();
        if (!cleanId || cleanId === 'undefined') return [];

        try {
            console.log(`[DEBUG] Buscando tarefas para farmacia: "${cleanId}"`);

            const res = await fetch(`/api/tarefas?farmaciaId=${cleanId}`, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache' }
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`[DEBUG] Servidor retornou ${data.length} tarefas.`, data);

                // O servidor já filtra por farmacia_id.
                setTarefas(data);
                return data;
            } else {
                const err = await res.text();
                console.error('[DEBUG] Erro na API ao buscar tarefas:', err);
            }
        } catch (error) {
            console.error('[DEBUG] Falha ao carregar tarefas', error);
        }
        return [];
    }, [getCleanId]);

    const fetchDetails = useCallback(async () => {
        const cleanId = getCleanId();
        if (!cleanId || cleanId === 'undefined') return;

        setLoading(true);
        try {
            const [fRes, rRes] = await Promise.all([
                fetch(`/api/farmacias/${cleanId}`, { cache: 'no-store' }),
                fetch(`/api/reunioes?farmaciaId=${cleanId}`, { cache: 'no-store' })
            ]);
            if (fRes.ok) {
                const f: Farmacia = await fRes.json();
                setFarmacia(f);
                setDiagEntries(parseDiagEntries(f.notas || ''));
            }
            await fetchTarefas();
            if (rRes.ok) setReunioes(await rRes.json());
        } catch (error) {
            console.error('Falha ao carregar detalhes', error);
        } finally {
            setLoading(false);
        }
    }, [getCleanId, fetchTarefas]);

    useEffect(() => {
        const cleanId = getCleanId();
        if (!cleanId || cleanId === 'undefined') return;

        // Sincroniza a farmácia selecionada no contexto global
        if (selectedFarmaciaId !== cleanId) {
            setSelectedFarmaciaId(cleanId);
        }

        fetchDetails();
    }, [getCleanId, setSelectedFarmaciaId, selectedFarmaciaId, fetchDetails]);

    if (loading) return <PageLoader label="Carregando dados da unidade…" />;
    if (!farmacia) return <LoadError message="Unidade não encontrada." onRetry={() => window.location.reload()} />;

    // ── Handlers de Diagnóstico ────────────────────────────
    async function handleAddDiag() {
        if (!novaEntradaTexto.trim()) return;
        const newEntry: DiagEntry = {
            id: Date.now().toString(),
            data: new Date().toISOString().substring(0, 10),
            texto: novaEntradaTexto.trim()
        };
        const updated = [newEntry, ...diagEntries];
        setDiagEntries(updated);
        setNovaEntradaTexto('');
        await saveDiagEntries(updated);
    }

    async function handleDeleteDiag(diagId: string) {
        const ok = await confirm({
            title: 'Remover registro de diagnóstico?',
            message: 'Este registro será excluído permanentemente.',
            confirmLabel: 'Remover',
            variant: 'warning',
        });
        if (!ok) return;
        const updated = diagEntries.filter(e => e.id !== diagId);
        setDiagEntries(updated);
        await saveDiagEntries(updated);
        toast('Registro removido', 'info');
    }

    async function handleEditDiag(diagId: string) {
        const updated = diagEntries.map(e => e.id === diagId ? { ...e, texto: editandoDiagTexto } : e);
        setDiagEntries(updated);
        setEditandoDiagId(null);
        await saveDiagEntries(updated);
    }

    // ── Handlers de Reunião ────────────────────────────────
    async function handleSalvarReuniao(dados: Partial<Reuniao>) {
        const cleanId = getCleanId();
        if (!cleanId || cleanId === 'undefined') {
            toast('Erro: ID da farmácia não identificado', 'error');
            return;
        }

        setSavingReuniao(true);
        try {
            if (reuniaoEditandoId) {
                const res = await fetch(`/api/reunioes/${reuniaoEditandoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
                if (res.ok) {
                    toast('Reunião atualizada com sucesso!', 'success');
                    await fetchDetails(); // Recarrega tudo para garantir sincronia
                    setReuniaoEditandoId(null);
                } else {
                    const errData = await res.json().catch(() => ({ error: 'Erro ao atualizar' }));
                    toast(`Erro: ${errData.error}`, 'error');
                }
            } else {
                const res = await fetch('/api/reunioes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ farmaciaId: cleanId, ...dados })
                });
                if (res.ok) {
                    toast('Reunião agendada com sucesso!', 'success');
                    await fetchDetails(); // Recarrega tudo
                    setAgendandoReuniao(false);
                } else {
                    const errData = await res.json().catch(() => ({ error: 'Erro ao agendar' }));
                    toast(`Erro: ${errData.error}`, 'error');
                }
            }
        } catch (error) {
            console.error('Falha ao salvar reunião', error);
            toast('Erro de conexão ao salvar reunião', 'error');
        } finally {
            setSavingReuniao(false);
        }
    }

    async function handleDeleteReuniao(reuniaoId: string) {
        const ok = await confirm({
            title: 'Remover esta reunião?',
            message: 'O registro da reunião e suas anotações serão excluídos permanentemente.',
            confirmLabel: 'Remover',
            variant: 'danger',
        });
        if (!ok) return;
        const res = await fetch(`/api/reunioes/${reuniaoId}`, { method: 'DELETE' });
        if (res.ok) {
            setReunioes(prev => prev.filter(r => r.id !== reuniaoId));
            toast('Reunião removida', 'info');
        }
    }

    async function handleDeleteTarefa(tarefaId: string) {
        const ok = await confirm({
            title: 'Remover esta tarefa?',
            message: 'Esta tarefa será excluída permanentemente.',
            confirmLabel: 'Remover',
            variant: 'danger',
        });
        if (!ok) return;
        setTarefas(prev => prev.filter(t => t.id !== tarefaId));
        await fetch(`/api/tarefas/${tarefaId}`, { method: 'DELETE' });
        toast('Tarefa removida', 'info');
    }

    const inputCls = "w-full bg-black/[0.02] border border-black/[0.05] rounded-xl px-4 py-3 text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 transition-colors";

    // ── Helpers de compatibilidade: lê campos novos OU parse do notas antigo ──
    const rawNotas = farmacia.notas || '';
    const parseNotas = (prefix: string) => {
        const block = rawNotas.split('\n\n').find(b => b.startsWith(prefix));
        return block ? block.replace(prefix, '').trim() : null;
    };
    const numeroPedidosDisplay = farmacia.numeroPedidos || parseNotas('Pedidos/mês:');
    const ondeInvestiaDisplay = farmacia.ondeInvestia || parseNotas('Plataformas de tráfego:');
    const ecommerceDisplay = farmacia.ecommerceDescricao || parseNotas('E-commerce:');
    // Remove linhas geradas automaticamente do campo notas para exibição
    const notasLimpas = rawNotas
        .split('\n\n')
        .filter(b =>
            !b.startsWith('Pedidos/mês:') &&
            !b.startsWith('Plataformas de tráfego:') &&
            !b.startsWith('E-commerce:')
        )
        .join('\n\n')
        .trim();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">{farmacia.nomeFarmacia}</h1>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                        <MapPin className="h-3 w-3 text-blue-400" />
                        <span>{farmacia.cidade}{farmacia.uf ? `, ${farmacia.uf}` : ''}</span>
                    </div>
                </div>
            </div>

            {/* Abas */}
            <div className="flex items-center gap-2 bg-black/[0.02] dark:bg-white/[0.03] p-1.5 rounded-2xl border border-black/[0.05] dark:border-white/[0.1] w-fit backdrop-blur-xl">
                {(Object.keys(tabLabels) as Tab[]).map((tab) => {
                    const Icon = tabIcons[tab];
                    const isActive = activeTab === tab;
                    return (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-300",
                            isActive
                                ? "bg-white dark:bg-white/12 text-blue-600 dark:text-white shadow-md border border-black/[0.02] dark:border-white/10"
                                : "text-foreground-tertiary hover:text-foreground dark:hover:text-white"
                        )}>
                            <Icon className={cn("h-4 w-4 transition-transform duration-300", isActive ? "text-blue-500 scale-110" : "opacity-30")} />
                            {tabLabels[tab]}
                        </button>
                    );
                })}
            </div>

            {/* Conteúdo */}
            <div className="animate-in fade-in duration-500">

                {/* ══ ABA: DADOS PRINCIPAIS ══ */}
                {activeTab === 'dados' && (
                    <div className="space-y-4">

                        {/* Linha 1: Dados Principais + Redes Sociais lado a lado */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                            {/* Card: Dados Principais */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-black/[0.04] flex items-center gap-2">
                                    <Store className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">Dados Principais</span>
                                </div>
                                <div className="px-5 divide-y divide-black/[0.04]">
                                    <InfoField label="Nome da Farmácia" value={farmacia.nomeFarmacia} icon={Store} />
                                    <InfoField label="Responsável" value={farmacia.responsavelNome} icon={User} />
                                    <InfoField label="WhatsApp / Telefone" value={farmacia.whatsapp} icon={Phone} />
                                    <div className="grid grid-cols-2">
                                        <InfoField label="Cidade" value={farmacia.cidade} icon={MapPin} />
                                        <InfoField label="UF" value={farmacia.uf} />
                                    </div>
                                    <InfoField label="Endereço" value={farmacia.endereco} icon={MapPin} />
                                    <InfoField
                                        label="Status de Acessos"
                                        value={farmacia.acessosEnviadosWhatsapp ? "Enviados via WhatsApp" : "Não enviados"}
                                        icon={Shield}
                                        isBlue={!!farmacia.acessosEnviadosWhatsapp}
                                    />
                                </div>
                            </div>

                            {/* Card: Redes Sociais */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-black/[0.04] flex items-center gap-2">
                                    <Instagram className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">Redes Sociais</span>
                                </div>
                                <div className="px-5 divide-y divide-black/[0.04]">
                                    <InfoField
                                        label="Instagram"
                                        value={farmacia.instagram ? `@${farmacia.instagram.replace('@', '')}` : null}
                                        icon={Instagram}
                                    />
                                    <InfoField
                                        label="Facebook"
                                        value={farmacia.facebook || null}
                                        icon={Facebook}
                                    />
                                    <InfoField
                                        label="Google Meu Negócio (GMN)"
                                        value={farmacia.googleMyBusiness || null}
                                        icon={LayoutDashboard}
                                        isLink
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card: Marketing & Vendas — com sub-seções */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/[0.04] flex items-center gap-2">
                                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">Marketing & Vendas</span>
                            </div>

                            <div className="divide-y divide-black/[0.04]">

                                {/* Sub-seção: Delivery */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Delivery</span>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                                            farmacia.temDelivery
                                                ? "bg-green-500/5 text-green-600 border-green-500/15"
                                                : "bg-gray-100 text-gray-400 border-gray-200"
                                        )}>{farmacia.temDelivery ? 'Sim' : 'Não'}</span>
                                    </div>
                                    {farmacia.temDelivery ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Faturamento / mês</span>
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {farmacia.faturamentoDeliveryMensal
                                                        ? `R$ ${Number(farmacia.faturamentoDeliveryMensal).toLocaleString('pt-BR')}`
                                                        : '—'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Nº de Pedidos / mês</span>
                                                <span className="text-sm font-semibold text-gray-800">
                                                    {numeroPedidosDisplay || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-300 italic">Sem delivery cadastrado</p>
                                    )}
                                </div>

                                {/* Sub-seção: Tráfego Pago */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Tráfego Pago</span>
                                        <span className={cn(
                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                                            farmacia.jaInvestiuTrafego
                                                ? "bg-green-500/5 text-green-600 border-green-500/15"
                                                : "bg-gray-100 text-gray-400 border-gray-200"
                                        )}>{farmacia.jaInvestiuTrafego ? 'Sim' : 'Não'}</span>
                                    </div>
                                    {farmacia.jaInvestiuTrafego ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Quem gerenciava</span>
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {farmacia.quemFaziaTrafego || '—'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Investimento / mês</span>
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {farmacia.quantoInvestia
                                                            ? `R$ ${Number(farmacia.quantoInvestia).toLocaleString('pt-BR')}`
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                            {ondeInvestiaDisplay && (
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Plataformas utilizadas</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {ondeInvestiaDisplay.split(',').map(p => p.trim()).filter(Boolean).map(plat => (
                                                            <span key={plat} className="text-[8px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-500/5 text-blue-600 border border-blue-500/15">
                                                                {plat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-300 italic">Sem investimento em tráfego</p>
                                    )}
                                </div>

                                {/* Sub-seção: Site & E-commerce */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Site & E-commerce</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Tem Site?</span>
                                            <span className={cn(
                                                "self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                                                farmacia.temSite
                                                    ? "bg-green-500/5 text-green-600 border-green-500/15"
                                                    : "bg-gray-100 text-gray-400 border-gray-200"
                                            )}>{farmacia.temSite ? 'Sim' : 'Não'}</span>
                                            {farmacia.temSite && farmacia.siteUrl && (
                                                <a href={farmacia.siteUrl.startsWith('http') ? farmacia.siteUrl : `https://${farmacia.siteUrl}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-blue-500 hover:underline truncate mt-1">
                                                    {farmacia.siteUrl}
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">Tem E-commerce?</span>
                                            <span className={cn(
                                                "self-start text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                                                farmacia.temEcommerce
                                                    ? "bg-green-500/5 text-green-600 border-green-500/15"
                                                    : "bg-gray-100 text-gray-400 border-gray-200"
                                            )}>{farmacia.temEcommerce ? 'Sim' : 'Não'}</span>
                                            {farmacia.temEcommerce && ecommerceDisplay && (
                                                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                    {ecommerceDisplay}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Card: Anotações */}
                        {notasLimpas && (
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="px-5 py-3 border-b border-black/[0.04] flex items-center gap-2">
                                    <StickyNote className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">Anotações</span>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{notasLimpas}</p>
                                </div>
                            </div>
                        )}

                    </div>
                )}



                {/* ══ ABA: TAREFAS ══ */}
                {activeTab === 'tarefas' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Tarefas</h3>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                                    {tarefas.filter(t => t.status === 'done').length}/{tarefas.length} concluídas
                                </p>
                            </div>
                        </div>

                        {/* Form nova tarefa */}
                        <div className="glass-card p-2 rounded-2xl border-dashed">
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const formData = new FormData(form);
                                    try {
                                        const cleanId = getCleanId();
                                        const res = await fetch('/api/tarefas', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                farmaciaId: cleanId,
                                                titulo: formData.get('titulo'),
                                                vencimento: formData.get('vencimento'),
                                                prioridade: 'medium',
                                                status: 'todo',
                                                descricao: ''
                                            })
                                        });
                                        if (res.ok) {
                                            toast('Tarefa adicionada com sucesso!', 'success');
                                            await fetchTarefas(); // Recarrega a lista do servidor para garantir sincronia
                                            form.reset();
                                        } else {
                                            const errData = await res.json().catch(() => ({ error: 'Erro de resposta' }));
                                            toast(`Erro ao salvar: ${errData.error || 'Verifique os dados'}`, 'error');
                                        }
                                    } catch (err) {
                                        toast('Erro de conexão ao adicionar tarefa', 'error');
                                    }
                                }}
                                className="flex flex-col lg:flex-row gap-3 p-2"
                            >
                                <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/[0.05] dark:border-white/[0.1] px-4 flex items-center focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
                                    <Plus className="h-4 w-4 text-foreground-quaternary mr-3" />
                                    <input name="titulo" required placeholder="O que precisa ser feito?"
                                        className="w-full bg-transparent border-none py-3.5 text-base font-bold focus:ring-0 text-foreground placeholder:text-foreground-quaternary" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="date" name="vencimento" required
                                        className="bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-black/[0.05] dark:border-white/[0.1] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground-secondary focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all outline-none" />
                                    <button type="submit" className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                        Adicionar
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Lista de tarefas */}
                        <div className="space-y-2">
                            {tarefas.length === 0 && (
                                <div className="py-12 text-center glass-card rounded-2xl border-dashed">
                                    <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Nenhuma tarefa cadastrada</p>
                                </div>
                            )}
                            {tarefas.map((tarefa) => {
                                const isDone = tarefa.status === 'done' || tarefa.status === 'concluido';
                                const today = new Date(); today.setHours(0, 0, 0, 0);
                                // Normaliza a data para evitar problemas de fuso horário
                                const dataVenc = tarefa.vencimento ? new Date(tarefa.vencimento.split('T')[0] + 'T23:59:59') : null;
                                const isLate = !isDone && dataVenc && dataVenc < today;
                                return (
                                    <div key={tarefa.id} className={cn(
                                        "group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300",
                                        isDone
                                            ? "bg-green-500/[0.04] border-green-500/20"
                                            : isLate
                                                ? "bg-red-500/[0.04] border-red-500/20 shadow-sm"
                                                : "bg-[#FDFDFD] dark:bg-white/[0.03] border-black/[0.05] dark:border-white/[0.08] shadow-sm hover:border-blue-500/30"
                                    )}>
                                        {/* Checkbox */}
                                        <button
                                            onClick={async () => {
                                                const newStatus = isDone ? 'todo' : 'done';
                                                setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: newStatus } : t));
                                                await fetch(`/api/tarefas/${tarefa.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: newStatus })
                                                });
                                            }}
                                            className={cn(
                                                "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                                                isDone ? "bg-green-500 border-green-500" : "border-gray-200 hover:border-green-400"
                                            )}
                                        >
                                            {isDone && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                        </button>

                                        {/* Título + meta */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className={cn(
                                                "text-[15px] font-bold tracking-tight truncate",
                                                isDone ? "line-through text-foreground-quaternary" : "text-foreground"
                                            )}>{tarefa.titulo}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={cn("text-[11px] font-black uppercase tracking-widest",
                                                    isDone ? "text-green-500/60" : isLate ? "text-red-500" : "text-foreground-tertiary")}>
                                                    {tarefa.vencimento ? new Date(tarefa.vencimento.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem data'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Deletar */}
                                        <button
                                            onClick={() => handleDeleteTarefa(tarefa.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══ ABA: DIAGNÓSTICO ══ */}
                {activeTab === 'diagnostico' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Diagnóstico</h3>
                                <p className="text-[11px] text-foreground-tertiary font-bold uppercase tracking-widest mt-1">
                                    {diagEntries.length} {diagEntries.length === 1 ? 'registro' : 'registros'}
                                </p>
                            </div>
                        </div>

                        {/* Nova entrada */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/[0.04] dark:border-white/[0.08] flex items-center gap-2">
                                <StickyNote className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground-tertiary">
                                    Nova Observação — {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="p-4 space-y-3">
                                <textarea
                                    value={novaEntradaTexto}
                                    onChange={e => setNovaEntradaTexto(e.target.value)}
                                    rows={4}
                                    placeholder="Registre aqui diagnósticos, pontos de atenção, oportunidades identificadas..."
                                    className="w-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.1] rounded-xl px-4 py-3 text-base text-foreground placeholder:text-foreground-quaternary font-bold focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                                />
                                <button
                                    onClick={handleAddDiag}
                                    disabled={savingDiag || !novaEntradaTexto.trim()}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-40"
                                >
                                    <Plus className="h-4 w-4" />
                                    {savingDiag ? 'Salvando...' : 'Adicionar Registro'}
                                </button>
                            </div>
                        </div>

                        {/* Histórico de entradas */}
                        {diagEntries.length === 0 ? (
                            <div className="py-12 text-center glass-card rounded-2xl border-dashed">
                                <FileText className="h-7 w-7 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Nenhum registro de diagnóstico</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">Histórico</span>
                                    <div className="flex-1 h-px bg-black/[0.05]" />
                                </div>
                                {diagEntries.map((entry) => (
                                    <div key={entry.id} className="glass-card rounded-2xl overflow-hidden group">
                                        {/* Header do card */}
                                        <div className="px-5 py-3 border-b border-black/[0.04] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.15em]">
                                                    {new Date(entry.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditandoDiagId(entry.id); setEditandoDiagTexto(entry.texto); }}
                                                    className="p-1.5 rounded-lg text-foreground-tertiary hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDiag(entry.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                                                    title="Remover"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="p-5">
                                            {editandoDiagId === entry.id ? (
                                                <div className="space-y-3">
                                                    <textarea
                                                        value={editandoDiagTexto}
                                                        onChange={e => setEditandoDiagTexto(e.target.value)}
                                                        rows={4}
                                                        className="w-full bg-black/[0.02] border border-blue-400/30 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium focus:outline-none focus:border-blue-400 transition-colors resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditDiag(entry.id)}
                                                            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                                                            <Save className="h-3 w-3" /> Salvar
                                                        </button>
                                                        <button onClick={() => setEditandoDiagId(null)}
                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-black/[0.06] text-gray-500 font-bold text-[9px] uppercase tracking-widest hover:bg-black/[0.02] transition-all">
                                                            <X className="h-3 w-3" /> Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.texto}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ══ ABA: AGENDA ══ */}
                {activeTab === 'agenda' && (
                    <div className="max-w-3xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Agenda de Reuniões</h3>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
                                    {reunioes.length} {reunioes.length === 1 ? 'reunião realizada' : 'reuniões realizadas'}
                                </p>
                            </div>
                            {!agendandoReuniao && !reuniaoEditandoId && (
                                <button onClick={() => setAgendandoReuniao(true)}
                                    className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all">
                                    <Plus className="h-3.5 w-3.5" />
                                    Registrar Reunião
                                </button>
                            )}
                        </div>

                        {/* Formulário nova reunião */}
                        {agendandoReuniao && (
                            <ReuniaoForm
                                onSalvar={handleSalvarReuniao}
                                onCancelar={() => setAgendandoReuniao(false)}
                                saving={savingReuniao}
                            />
                        )}

                        {/* Histórico */}
                        {reunioes.length === 0 && !agendandoReuniao ? (
                            <div className="py-16 text-center glass-card rounded-2xl border-dashed">
                                <Calendar className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest">Nenhuma reunião registrada</p>
                                <p className="text-gray-300 text-xs mt-1">Clique em "Registrar Reunião" para começar</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reunioes.length > 0 && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">Histórico</span>
                                        <div className="flex-1 h-px bg-black/[0.05]" />
                                        <span className="text-[9px] font-bold text-gray-300">{reunioes.length} {reunioes.length === 1 ? 'registro' : 'registros'}</span>
                                    </div>
                                )}
                                {reunioes.map((meet) => (
                                    <div key={meet.id}>
                                        {/* Modo edição */}
                                        {reuniaoEditandoId === meet.id ? (
                                            <ReuniaoForm
                                                inicial={meet}
                                                onSalvar={handleSalvarReuniao}
                                                onCancelar={() => setReuniaoEditandoId(null)}
                                                saving={savingReuniao}
                                            />
                                        ) : (
                                            /* Modo visualização */
                                            <div className="glass-card rounded-2xl overflow-hidden group border-black/[0.05] dark:border-white/[0.1]">
                                                <div className="px-5 py-4 bg-black/[0.01] dark:bg-white/[0.02] border-b border-black/[0.05] dark:border-white/[0.1] flex items-center justify-between transition-colors group-hover:bg-black/[0.02] dark:group-hover:bg-white/[0.04]">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                        <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest">
                                                            {new Date(meet.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                                                        <button
                                                            onClick={() => setReuniaoEditandoId(meet.id)}
                                                            className="p-2 rounded-xl text-foreground-tertiary hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                                            title="Editar reunião"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReuniao(meet.id)}
                                                            className="p-2 rounded-xl text-foreground-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                            title="Remover reunião"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-5">
                                                    <div>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-foreground-tertiary mb-1.5">Pauta</p>
                                                        <p className="text-base font-bold text-foreground leading-snug">{meet.pauta}</p>
                                                    </div>
                                                    {meet.resumo && (
                                                        <div className="space-y-1.5">
                                                            <p className="text-[11px] font-black uppercase tracking-widest text-foreground-tertiary">Resumo</p>
                                                            <p className="text-[15px] font-medium text-foreground-secondary leading-relaxed">{meet.resumo}</p>
                                                        </div>
                                                    )}
                                                    {meet.proximosPassos && (
                                                        <div className="bg-blue-500/[0.04] dark:bg-blue-500/[0.08] border border-blue-500/20 rounded-2xl p-4 shadow-sm">
                                                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1.5">Próximos Passos</p>
                                                            <p className="text-[15px] font-bold text-foreground-secondary leading-relaxed">{meet.proximosPassos}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
