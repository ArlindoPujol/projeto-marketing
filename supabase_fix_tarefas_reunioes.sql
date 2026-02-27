-- ==============================================================
-- SCRIPT DE AJUSTE PARA TAREFAS E REUNIÕES
-- Rode este script no Editor SQL do Supabase para garantir:
-- 1. IDs gerados automaticamente (UUID)
-- 2. Data de criação automática (criado_em)
-- 3. Permissão total para o App (RLS)
-- ==============================================================

-- 1. Garantir que as tabelas existam (caso não existam)
CREATE TABLE IF NOT EXISTS tarefas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmacia_id uuid REFERENCES farmacias(id) ON DELETE CASCADE,
    titulo text NOT NULL,
    descricao text,
    status text DEFAULT 'todo',
    prioridade text DEFAULT 'medium',
    vencimento timestamptz,
    notas text,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reunioes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmacia_id uuid REFERENCES farmacias(id) ON DELETE CASCADE,
    data date NOT NULL DEFAULT CURRENT_DATE,
    pauta text,
    resumo text,
    proximos_passos text,
    criado_em timestamptz DEFAULT now(),
    atualizado_em timestamptz DEFAULT now()
);

-- 2. Garantir que os IDs sejam automáticos (caso as tabelas já existissem sem isso)
ALTER TABLE tarefas ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE reunioes ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Garantir data de criação automática
ALTER TABLE tarefas ALTER COLUMN criado_em SET DEFAULT now();
ALTER TABLE reunioes ALTER COLUMN criado_em SET DEFAULT now();

-- 4. Habilitar RLS e Permissões para o App (chave anon)
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon" ON tarefas;
CREATE POLICY "Permitir tudo para anon" ON tarefas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon" ON reunioes;
CREATE POLICY "Permitir tudo para anon" ON reunioes FOR ALL USING (true) WITH CHECK (true);

-- 5. Trigger para atualizar o atualizado_em (opcional, mas recomendado)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tarefas_updated_at ON tarefas;
CREATE TRIGGER update_tarefas_updated_at
    BEFORE UPDATE ON tarefas
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_reunioes_updated_at ON reunioes;
CREATE TRIGGER update_reunioes_updated_at
    BEFORE UPDATE ON reunioes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
