-- Verificar se a tabela documentation_sections existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'documentation_sections';