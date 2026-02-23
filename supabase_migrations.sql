-- ==============================================================
-- SCRIPT SQL - Criar tabelas faltantes no Supabase
-- Rode no SQL Editor: https://supabase.com/dashboard/project/aadwnvtugvykrwgyspco/sql
-- ==============================================================

-- ---------------------------------------------------------------
-- 1. Verificar/confirmar colunas das tabelas já existentes
-- ---------------------------------------------------------------
-- Se as tabelas acessos, tarefas, reunioes foram criadas com nomes diferentes,
-- ajuste os nomes de coluna nas APIs correspondentes.

-- Estrutura esperada para ACESSOS:
-- id (uuid, default gen_random_uuid()), farmacia_id (uuid, FK), tipo (text),
-- status (text, default 'pending'), referencia_cofre (text), observacao (text),
-- criado_em (timestamptz, default now())

-- Estrutura esperada para TAREFAS:
-- id (uuid), farmacia_id (uuid, FK), titulo (text), descricao (text),
-- status (text, default 'todo'), prioridade (text, default 'medium'),
-- vencimento (timestamptz, nullable), notas (text), criado_em (timestamptz)

-- Estrutura esperada para REUNIOES:
-- id (uuid), farmacia_id (uuid, FK), data (timestamptz), pauta (text),
-- resumo (text), proximos_passos (text), criado_em (timestamptz)

-- ---------------------------------------------------------------
-- 2. Criar tabelas de Playbooks (NÃO EXISTEM AINDA)
-- ---------------------------------------------------------------

-- Templates de Playbook
CREATE TABLE IF NOT EXISTS playbook_templates (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo      text NOT NULL,
    categoria   text NOT NULL DEFAULT '',
    descricao   text NOT NULL DEFAULT '',
    criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Itens dos Templates
CREATE TABLE IF NOT EXISTS playbook_template_itens (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id     uuid NOT NULL REFERENCES playbook_templates(id) ON DELETE CASCADE,
    titulo          text NOT NULL,
    obrigatorio     boolean NOT NULL DEFAULT true,
    ordem           integer NOT NULL DEFAULT 0
);

-- Execuções de Playbook (por farmácia)
CREATE TABLE IF NOT EXISTS playbook_runs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmacia_id uuid NOT NULL REFERENCES farmacias(id) ON DELETE CASCADE,
    template_id uuid NOT NULL REFERENCES playbook_templates(id),
    status      text NOT NULL DEFAULT 'running',
    criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Itens das execuções
CREATE TABLE IF NOT EXISTS playbook_run_itens (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id              uuid NOT NULL REFERENCES playbook_runs(id) ON DELETE CASCADE,
    template_item_id    uuid NOT NULL REFERENCES playbook_template_itens(id),
    concluido           boolean NOT NULL DEFAULT false,
    evidencia_texto     text NOT NULL DEFAULT '',
    observacao          text NOT NULL DEFAULT ''
);

-- ---------------------------------------------------------------
-- 3. Habilitar Row Level Security (RLS) nas novas tabelas
-- ---------------------------------------------------------------
ALTER TABLE playbook_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_template_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_run_itens ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (ajuste conforme sua necessidade de segurança)
CREATE POLICY "allow_all_playbook_templates" ON playbook_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_playbook_template_itens" ON playbook_template_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_playbook_runs" ON playbook_runs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_playbook_run_itens" ON playbook_run_itens FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------
-- 4. Seed inicial dos templates de playbook
-- ---------------------------------------------------------------
WITH t1 AS (
    INSERT INTO playbook_templates (titulo, categoria, descricao)
    VALUES ('Setup Meta Ads', 'Setup', 'Configuração inicial de conta de anúncios e pixel.')
    RETURNING id
)
INSERT INTO playbook_template_itens (template_id, titulo, obrigatorio, ordem)
SELECT id, unnest(ARRAY['Criar Business Manager', 'Configurar Pixel', 'Verificar Domínio']),
       true,
       generate_series(1, 3)
FROM t1;

WITH t2 AS (
    INSERT INTO playbook_templates (titulo, categoria, descricao)
    VALUES ('Setup Google Ads', 'Setup', 'Configuração inicial de conta Google Ads.')
    RETURNING id
)
INSERT INTO playbook_template_itens (template_id, titulo, obrigatorio, ordem)
SELECT id, unnest(ARRAY['Criar Conta', 'Configurar Conversões']),
       true,
       generate_series(1, 2)
FROM t2;

WITH t3 AS (
    INSERT INTO playbook_templates (titulo, categoria, descricao)
    VALUES ('Otimização GMB', 'Otimização', 'Melhorar perfil no Google Meu Negócio.')
    RETURNING id
)
INSERT INTO playbook_template_itens (template_id, titulo, obrigatorio, ordem)
SELECT id, unnest(ARRAY['Atualizar horário', 'Responder avaliações']),
       unnest(ARRAY[true, false]),
       generate_series(1, 2)
FROM t3;

WITH t4 AS (
    INSERT INTO playbook_templates (titulo, categoria, descricao)
    VALUES ('Instagram Base', 'Social', 'Arrumar bio e destaques.')
    RETURNING id
)
INSERT INTO playbook_template_itens (template_id, titulo, obrigatorio, ordem)
SELECT id, unnest(ARRAY['Bio estratégica', 'Destaques padrão']),
       true,
       generate_series(1, 2)
FROM t4;

WITH t5 AS (
    INSERT INTO playbook_templates (titulo, categoria, descricao)
    VALUES ('WhatsApp Business', 'Setup', 'Configurar catálogo e mensagens automáticas.')
    RETURNING id
)
INSERT INTO playbook_template_itens (template_id, titulo, obrigatorio, ordem)
SELECT id, unnest(ARRAY['Catálogo de produtos', 'Mensagem de saudação']),
       unnest(ARRAY[false, true]),
       generate_series(1, 2)
FROM t5;

WITH t6 AS (
    INSERT INTO playbook_templates (titulo, categoria, descricao)
    VALUES ('Revisão Mensal', 'Rotina', 'Checklist de fechamento de mês.')
    RETURNING id
)
INSERT INTO playbook_template_itens (template_id, titulo, obrigatorio, ordem)
SELECT id, unnest(ARRAY['Relatório de Ads', 'Relatório de Vendas']),
       true,
       generate_series(1, 2)
FROM t6;
