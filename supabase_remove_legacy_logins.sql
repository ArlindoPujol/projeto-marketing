-- SCRIPT PARA REMOVER COLUNAS LEGADAS DE LOGIN
-- Este script remove as colunas de login que não são mais utilizadas, 
-- conforme solicitado para simplificação do sistema.

ALTER TABLE farmacias 
DROP COLUMN IF EXISTS email_google,
DROP COLUMN IF EXISTS senha_google,
DROP COLUMN IF EXISTS login_instagram,
DROP COLUMN IF EXISTS senha_instagram,
DROP COLUMN IF EXISTS login_facebook,
DROP COLUMN IF EXISTS senha_facebook;

-- Verificação das colunas restantes
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'farmacias';
