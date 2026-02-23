-- ==============================================================
-- CHECK SCHEMA AND FIX ID GENERATION
-- Rodar no Supabase SQL Editor
-- ==============================================================

-- 1. Ver estrutura atual
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'farmacias';

-- 2. Garantir que o ID seja gerado automaticamente se for UUID
-- Se o seu ID for UUID, rode isto:
ALTER TABLE farmacias ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Garantir que a tabela tenha todas as colunas necessárias com nomes EXATOS
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS nome_farmacia text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS responsavel_nome text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS uf text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS google_my_business text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS site_url text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS tem_entrega boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS entrega_faturamento numeric;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS numero_pedidos text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS ja_investiu_trafego boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS quem_fazia_trafego text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS quanto_investia numeric;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS onde_investia text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS tem_site boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS tem_ecommerce boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS ecommerce_descricao text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS status_marketing text DEFAULT 'waiting_access';
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'medium';
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS criado_em timestamp with time zone DEFAULT now();
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS atualizado_em timestamp with time zone DEFAULT now();
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS acessos_enviados_whatsapp boolean DEFAULT false;

-- 4. Criar Trigger para atualizar o atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_farmacias_updated_at ON farmacias;
CREATE TRIGGER update_farmacias_updated_at
    BEFORE UPDATE ON farmacias
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
