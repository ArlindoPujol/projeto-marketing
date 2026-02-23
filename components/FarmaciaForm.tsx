'use client';

import { Farmacia } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    ArrowLeft, Eye, EyeOff, Shield, ShoppingBag,
    Database, FileText, Instagram, Check
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FormButton } from '@/components/ui/FormButton';
import { FormMessage } from '@/components/ui/FormMessage';
import { useFarmacia } from '@/contexts/FarmaciaContext';

interface Props { initialData?: Farmacia; }

// ─────────────────────────────────────────────────────────
// Helpers definidos FORA do componente principal
// (evita unmount/remount a cada keystroke)
// ─────────────────────────────────────────────────────────

const inputCls =
    "w-full bg-black/[0.02] border border-black/[0.04] rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:border-blue-400/50 transition-colors";

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 block">{children}</label>;
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-black/[0.04]">
            <Icon className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500">{title}</span>
        </div>
    );
}

function Toggle({ value, onTrue, onFalse }: { value: boolean; onTrue: () => void; onFalse: () => void; }) {
    return (
        <div className="flex bg-black/[0.02] border border-black/[0.04] p-0.5 rounded-lg w-fit mt-1.5">
            <button type="button" onClick={onTrue}
                className={cn("px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                    value ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                Sim
            </button>
            <button type="button" onClick={onFalse}
                className={cn("px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                    !value ? "bg-white text-gray-700 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                Não
            </button>
        </div>
    );
}

function ExpandPanel({ show, children }: { show: boolean; children: React.ReactNode }) {
    if (!show) return null;
    return (
        <div className="mt-3 p-4 bg-blue-500/[0.04] border border-blue-400/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {children}
        </div>
    );
}

// (Componente PasswordInput removido conforme solicitação de simplificação de acessos)

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────
export default function FarmaciaForm({ initialData }: Props) {
    const router = useRouter();
    const { refreshFarmacias } = useFarmacia();
    type BtnState = 'idle' | 'loading' | 'success' | 'error';
    const [btnState, setBtnState] = useState<BtnState>('idle');
    const [error, setError] = useState('');

    // Campos textuais simples
    const f = initialData || {} as Partial<Farmacia>;

    const [nomeFarmacia, setNomeFarmacia] = useState(f.nomeFarmacia || '');
    const [responsavelNome, setResponsavelNome] = useState(f.responsavelNome || '');
    const [whatsapp, setWhatsapp] = useState(f.whatsapp || '');
    const [cidade, setCidade] = useState(f.cidade || '');
    const [uf, setUf] = useState(f.uf || '');
    const [endereco, setEndereco] = useState(f.endereco || '');

    // Redes sociais
    const [instagram, setInstagram] = useState(f.instagram || '');
    const [facebook, setFacebook] = useState(f.facebook || '');
    const [googleMyBusiness, setGoogleMyBusiness] = useState(f.googleMyBusiness || '');

    // Acessos
    const [acessosEnviadosWhatsapp, setAcessosEnviadosWhatsapp] = useState(f.acessosEnviadosWhatsapp || false);

    // Estrutura
    const [temDelivery, setTemDelivery] = useState(initialData?.temDelivery || false);
    const [faturamentoDelivery, setFaturamentoDelivery] = useState<string>(
        initialData?.faturamentoDeliveryMensal != null ? String(initialData.faturamentoDeliveryMensal) : ''
    );
    const [numeroPedidos, setNumeroPedidos] = useState(initialData?.numeroPedidos || '');

    const [jaInvestiuTrafego, setJaInvestiuTrafego] = useState(initialData?.jaInvestiuTrafego || false);
    const [quemFaziaTrafego, setQuemFaziaTrafego] = useState(initialData?.quemFaziaTrafego || '');
    const [quantoInvestia, setQuantoInvestia] = useState<string>(
        initialData?.quantoInvestia != null ? String(initialData.quantoInvestia) : ''
    );
    const [ondeInvestia, setOndeInvestia] = useState<string[]>(
        initialData?.ondeInvestia ? initialData.ondeInvestia.split(',').map(s => s.trim()) : []
    );

    const [temSite, setTemSite] = useState(initialData?.temSite ?? false);
    const [siteUrl, setSiteUrl] = useState(initialData?.siteUrl ?? '');

    const [temEcommerce, setTemEcommerce] = useState(initialData?.temEcommerce ?? false);
    const [ecommerceNotas, setEcommerceNotas] = useState(initialData?.ecommerceDescricao ?? '');

    const [notas, setNotas] = useState(initialData?.notas ?? '');

    const toggleOndeInvestia = (plat: string) =>
        setOndeInvestia(prev => prev.includes(plat) ? prev.filter(p => p !== plat) : [...prev, plat]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBtnState('loading');
        setError('');

        const payload: Partial<Farmacia> = {
            nomeFarmacia,
            responsavelNome,
            whatsapp,
            cidade,
            uf,
            endereco,
            instagram,
            facebook,
            googleMyBusiness: googleMyBusiness || null,
            acessosEnviadosWhatsapp,
            temDelivery,
            faturamentoDeliveryMensal: faturamentoDelivery ? parseFloat(faturamentoDelivery) : null,
            numeroPedidos: numeroPedidos || null,
            jaInvestiuTrafego,
            quemFaziaTrafego: quemFaziaTrafego || null,
            quantoInvestia: quantoInvestia ? parseFloat(quantoInvestia) : null,
            ondeInvestia: ondeInvestia.length ? ondeInvestia.join(', ') : null,
            temSite,
            siteUrl: siteUrl || null,
            temEcommerce,
            ecommerceDescricao: ecommerceNotas || null,
            notas: notas || null,
            statusMarketing: initialData?.statusMarketing || 'waiting_access',
            prioridade: initialData?.prioridade || 'medium',
        };

        console.log('Enviando Payload:', payload);

        try {
            const url = initialData ? `/api/farmacias/${initialData.id}` : '/api/farmacias';
            const method = initialData ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const rawResult = await res.json();
            console.log('Resultado da API:', rawResult);

            if (!res.ok) {
                console.error('ERRO NA API:', rawResult);
                throw new Error(rawResult.error || 'Falha ao salvar — tente novamente.');
            }

            console.log('SUCESSO NA API:', rawResult);


            await refreshFarmacias();
            setBtnState('success');
            setTimeout(() => { router.push('/farmacias'); router.refresh(); }, 1200);
        } catch (err: any) {
            console.error('Erro ao salvar farmácia:', err);
            setError(err.message);
            setBtnState('error');
            setTimeout(() => setBtnState('idle'), 5000);
        }

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Farmácias</p>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        {initialData ? 'Editar Farmácia' : 'Cadastrar Nova Farmácia'}
                    </h2>
                </div>
                <Link href="/farmacias"
                    className="p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04] hover:bg-black/[0.05] text-gray-500 transition-all">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            </div>

            {error && (
                <FormMessage
                    type="error"
                    message={error}
                    onDismiss={() => setError('')}
                    autoDismiss={6000}
                />
            )}

            {/* ── Linha 1: Dados Principais + Redes Sociais ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Dados Principais */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                    <SectionHeader icon={Database} title="Dados Principais" />

                    <div>
                        <Label>Nome da Farmácia *</Label>
                        <input required value={nomeFarmacia} onChange={e => setNomeFarmacia(e.target.value)}
                            placeholder="Farmácia Exemplo" className={inputCls} />
                    </div>
                    <div>
                        <Label>Nome do Responsável *</Label>
                        <input required value={responsavelNome} onChange={e => setResponsavelNome(e.target.value)}
                            placeholder="Nome completo" className={inputCls} />
                    </div>
                    <div>
                        <Label>WhatsApp / Telefone *</Label>
                        <input required value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                            placeholder="(00) 00000-0000" className={inputCls} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <Label>Cidade *</Label>
                            <input required value={cidade} onChange={e => setCidade(e.target.value)}
                                placeholder="São Paulo" className={inputCls} />
                        </div>
                        <div>
                            <Label>UF *</Label>
                            <input required value={uf} onChange={e => setUf(e.target.value)}
                                maxLength={2} placeholder="SP" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <Label>Endereço</Label>
                        <input value={endereco} onChange={e => setEndereco(e.target.value)}
                            placeholder="Rua, número, bairro" className={inputCls} />
                    </div>
                </div>

                {/* Redes Sociais */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                    <SectionHeader icon={Instagram} title="Redes Sociais" />
                    <div>
                        <Label>Instagram</Label>
                        <input value={instagram} onChange={e => setInstagram(e.target.value)}
                            placeholder="@farmaciaexemplo" className={inputCls} />
                    </div>
                    <div>
                        <Label>Facebook</Label>
                        <input value={facebook} onChange={e => setFacebook(e.target.value)}
                            placeholder="facebook.com/farmaciaexemplo" className={inputCls} />
                    </div>
                    <div>
                        <Label>Google Meu Negócio (GMN)</Label>
                        <input value={googleMyBusiness} onChange={e => setGoogleMyBusiness(e.target.value)}
                            placeholder="maps.app.goo.gl/..." className={inputCls} />
                    </div>
                </div>
            </div>

            {/* ── Card: Acessos ── */}
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20">
                            <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-500 block mb-0.5">Controle de Acessos</span>
                            <h3 className="text-sm font-bold text-gray-800 tracking-tight">Os dados de acesso foram enviados via WhatsApp?</h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setAcessosEnviadosWhatsapp(!acessosEnviadosWhatsapp)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 border",
                            acessosEnviadosWhatsapp
                                ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20 scale-[1.02]"
                                : "bg-black/[0.02] text-gray-400 border-black/[0.05] hover:bg-black/[0.04]"
                        )}
                    >
                        {acessosEnviadosWhatsapp ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Dados Enviados
                            </>
                        ) : (
                            "Marcar como Enviado"
                        )}
                    </button>
                </div>
            </div>

            {/* ── Card: Estrutura da Farmácia ── */}
            <div className="glass-card p-6 rounded-2xl">
                <SectionHeader icon={ShoppingBag} title="Estrutura da Farmácia" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Delivery */}
                    <div>
                        <Label>Possui Delivery?</Label>
                        <Toggle value={temDelivery} onTrue={() => setTemDelivery(true)} onFalse={() => setTemDelivery(false)} />
                        <ExpandPanel show={temDelivery}>
                            <div>
                                <Label>Faturamento Delivery (R$/mês)</Label>
                                <input type="number" value={faturamentoDelivery}
                                    onChange={e => setFaturamentoDelivery(e.target.value)}
                                    placeholder="Ex: 5000" className={inputCls} />
                            </div>
                            <div>
                                <Label>Nº de Pedidos / mês</Label>
                                <input type="number" value={numeroPedidos}
                                    onChange={e => setNumeroPedidos(e.target.value)}
                                    placeholder="Ex: 120" className={inputCls} />
                            </div>
                        </ExpandPanel>
                    </div>

                    {/* Tráfego */}
                    <div>
                        <Label>Investe em Tráfego Pago?</Label>
                        <Toggle value={jaInvestiuTrafego} onTrue={() => setJaInvestiuTrafego(true)} onFalse={() => setJaInvestiuTrafego(false)} />
                        <ExpandPanel show={jaInvestiuTrafego}>
                            <div>
                                <Label>Quem gerenciava?</Label>
                                <input value={quemFaziaTrafego} onChange={e => setQuemFaziaTrafego(e.target.value)}
                                    placeholder="Nome ou agência" className={inputCls} />
                            </div>
                            <div>
                                <Label>Quanto investia / mês (R$)</Label>
                                <input type="number" value={quantoInvestia}
                                    onChange={e => setQuantoInvestia(e.target.value)}
                                    placeholder="Ex: 1500" className={inputCls} />
                            </div>
                            <div>
                                <Label>Onde investia?</Label>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {['Google', 'Facebook', 'Instagram', 'Outros'].map(plat => (
                                        <button key={plat} type="button"
                                            onClick={() => toggleOndeInvestia(plat)}
                                            className={cn(
                                                "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
                                                ondeInvestia.includes(plat)
                                                    ? "bg-blue-600 text-white border-blue-600"
                                                    : "bg-black/[0.02] text-gray-500 border-black/[0.06] hover:border-blue-400/40"
                                            )}>
                                            {plat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </ExpandPanel>
                    </div>

                    {/* Site */}
                    <div>
                        <Label>Tem Site?</Label>
                        <Toggle value={temSite} onTrue={() => setTemSite(true)} onFalse={() => setTemSite(false)} />
                        <ExpandPanel show={temSite}>
                            <div>
                                <Label>URL do Site</Label>
                                <input type="url" value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
                                    placeholder="https://farmacia.com.br" className={inputCls} />
                            </div>
                        </ExpandPanel>
                    </div>

                    {/* E-commerce */}
                    <div>
                        <Label>Tem E-commerce?</Label>
                        <Toggle value={temEcommerce} onTrue={() => setTemEcommerce(true)} onFalse={() => setTemEcommerce(false)} />
                        <ExpandPanel show={temEcommerce}>
                            <div>
                                <Label>Descreva o e-commerce</Label>
                                <textarea rows={3} value={ecommerceNotas}
                                    onChange={e => setEcommerceNotas(e.target.value)}
                                    placeholder="Plataforma, produtos, volume..."
                                    className={cn(inputCls, "resize-none")} />
                            </div>
                        </ExpandPanel>
                    </div>
                </div>
            </div>

            {/* ── Card: Anotações ── */}
            <div className="glass-card p-6 rounded-2xl">
                <SectionHeader icon={FileText} title="Anotações Importantes" />
                <textarea rows={5} value={notas} onChange={e => setNotas(e.target.value)}
                    placeholder="Observações gerais, pontos de atenção, informações relevantes sobre a farmácia..."
                    className={cn(inputCls, "resize-none")} />
            </div>

            {/* ── Botão ── */}
            <div className="flex justify-end pb-6">
                <FormButton
                    state={btnState}
                    size="lg"
                    idleLabel={initialData ? 'Salvar Alterações' : 'Cadastrar Farmácia'}
                    loadingLabel="Salvando…"
                    successLabel="Salvo com sucesso!"
                    errorLabel="Erro ao salvar"
                />
            </div>
        </form>
    );
}
