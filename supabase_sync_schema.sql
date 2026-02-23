-- ==============================================================
-- SCRIPT DEFINITIVO DE SINCRONIZAÇÃO - RODAR NO SUPABASE
-- Este script garante que todas as colunas necessárias existam
-- e que as permissões de acesso estejam abertas para o app.
-- ==============================================================

-- 1. Criar colunas de Dados Principais e Endereço
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS responsavel_nome text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS cidade text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS uf text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS endereco text;

-- 2. Criar colunas de Redes Sociais
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS google_my_business text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS site_url text;

-- 3. Criar colunas de Marketing e Vendas (Delivery)
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS tem_entrega boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS entrega_faturamento numeric;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS numero_pedidos text;

-- 4. Criar colunas de Tráfego Pago
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS ja_investiu_trafego boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS quem_fazia_trafego text;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS quanto_investia numeric;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS onde_investia text;

-- 5. Criar colunas de Site e E-commerce
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS tem_site boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS tem_ecommerce boolean DEFAULT false;
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS ecommerce_descricao text;

-- 6. Criar colunas de Gestão e Notas
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS status_marketing text DEFAULT 'waiting_access';
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS prioridade text DEFAULT 'medium';
ALTER TABLE farmacias ADD COLUMN IF NOT EXISTS notas text;

-- 8. Resetar RLS para garantir que o App consiga salvar
ALTER TABLE farmacias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para anon" ON farmacias;
CREATE POLICY "Permitir tudo para anon" ON farmacias FOR ALL USING (true) WITH CHECK (true);

-- 9. Verificar se as colunas foram criadas (Opcional)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'farmacias';
