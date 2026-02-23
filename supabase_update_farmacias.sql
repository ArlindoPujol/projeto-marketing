-- ==============================================================
-- SCRIPT DE ATUALIZAÇÃO DA TABELA FARMACIAS
-- Rode este script no Editor SQL do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================

-- 1. Adicionar colunas que podem estar faltando
ALTER TABLE farmacias 
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS facebook text,
ADD COLUMN IF NOT EXISTS google_my_business text,
ADD COLUMN IF NOT EXISTS numero_pedidos text,
ADD COLUMN IF NOT EXISTS quem_fazia_trafego text,
ADD COLUMN IF NOT EXISTS quanto_investia numeric,
ADD COLUMN IF NOT EXISTS onde_investia text,
ADD COLUMN IF NOT EXISTS tem_site boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS site_url text,
ADD COLUMN IF NOT EXISTS tem_ecommerce boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ecommerce_descricao text,
ADD COLUMN IF NOT EXISTS notas text,
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS youtube text,
ADD COLUMN IF NOT EXISTS website text;

-- 2. Garantir que as colunas existentes tenham o tipo correto (opcional, mas recomendado)
-- ALTER TABLE farmacias ALTER COLUMN instagram TYPE text;

-- 3. Habilitar RLS e criar política de acesso (caso não exista)
-- Isso garante que a chave 'anon' do seu app possa ler e escrever
ALTER TABLE farmacias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir tudo para anon" ON farmacias;
CREATE POLICY "Permitir tudo para anon" ON farmacias 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Notificar sucesso
-- Você pode rodar um SELECT para confirmar as colunas:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'farmacias';
