// --- Tipos Globais ---

export type StatusMarketing = 'waiting_access' | 'setup' | 'running' | 'paused' | 'Configurando'; // Adicionado "Configurando" do Supabase
export type Prioridade = 'low' | 'medium' | 'high' | 'Baixa' | 'Média' | 'Alta'; // Adicionado valores em PT do Supabase
export type AcessoStatus = 'pending' | 'ok' | 'issue' | 'pendente' | 'concluido' | 'erro';
export type TarefaStatus = 'todo' | 'doing' | 'done' | 'pendente' | 'em_andamento' | 'concluido';
export type PlaybookRunStatus = 'running' | 'done';

export interface Farmacia {
    id: string;
    nomeFarmacia: string;
    responsavelNome: string | null;
    whatsapp: string | null;
    cidade: string | null;
    uf: string | null;
    endereco?: string;
    instagram: string | null;
    facebook?: string;
    googleMyBusiness?: string;
    linkedin?: string;
    youtube?: string;
    website?: string;
    temDelivery?: boolean;
    faturamentoDeliveryMensal?: number | null;
    numeroPedidos?: string;
    jaInvestiuTrafego: boolean;
    quemFaziaTrafego?: string | null;
    quantoInvestia?: number | null;
    entregaFaturamento?: string | null; // Alinhado com o Supabase
    ondeInvestia?: string;
    temSite?: boolean;
    siteUrl: string | null;
    temEcommerce?: boolean;
    ecommerceDescricao?: string;
    statusMarketing: StatusMarketing | string;
    prioridade: Prioridade | string;
    notas?: string;
    criadoEm?: string;
    atualizadoEm?: string;
    // Campos legados de Login (Sendo migrados para tabela Acessos)
    emailGoogle?: string;
    senhaGoogle?: string;
    loginInstagram?: string;
    senhaInstagram?: string;
    loginFacebook?: string;
    senhaFacebook?: string;
}

export interface Acesso {
    id: string;
    farmaciaId: string;
    tipo: string;
    status: AcessoStatus | string;
    referenciaCofre?: string;
    observacao: string;
}

export interface PlaybookTemplateItem {
    id: string;
    titulo: string;
    obrigatorio: boolean;
    ordem: number;
}

export interface PlaybookTemplate {
    id: string;
    titulo: string;
    categoria: string;
    descricao: string;
    itens: PlaybookTemplateItem[];
}

export interface PlaybookRun {
    id: string;
    farmaciaId: string;
    templateId: string;
    status: PlaybookRunStatus | string;
    criadoEm: string;
}

export interface PlaybookRunItem {
    id: string;
    runId: string;
    templateItemId: string;
    concluido: boolean;
    evidenciaTexto: string;
    observacao: string;
}

export interface Tarefa {
    id: string;
    farmaciaId: string;
    titulo: string;
    descricao: string;
    status: TarefaStatus | string;
    prioridade?: Prioridade | string;
    vencimento: string | null;
    notas?: string;
}

export interface Reuniao {
    id: string;
    farmaciaId: string;
    data: string;
    pauta: string;
    resumo: string;
    proximosPassos?: string;
}

export interface DB {
    farmacias: Farmacia[];
    acessos: Acesso[];
    playbookTemplates: PlaybookTemplate[];
    playbookRuns: PlaybookRun[];
    playbookRunItens: PlaybookRunItem[];
    tarefas: Tarefa[];
    reunioes: Reuniao[];
}

// Nota: A lógica de readDB/writeDB para arquivo local foi removida.
// O projeto agora utiliza exclusivamente o Supabase via APIs.
