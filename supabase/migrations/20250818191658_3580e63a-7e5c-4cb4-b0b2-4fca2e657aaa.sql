-- Atualizar congregações com os pastores corretos
-- IPTM - Caxias: Etiane + Rodrigo Marcolino
UPDATE public.congregations 
SET responsible_pastor_ids = ARRAY['f392ae29-440d-474a-a394-e968df56b0fb', '6dda1890-4c90-4240-80b1-7ed4b8a0ccf2']
WHERE name = 'IPTM - Caxias';

-- IPTM - Nova Iguaçu: Jefferson
UPDATE public.congregations 
SET responsible_pastor_ids = ARRAY['1e2e7281-a818-48d9-b467-5249f0d14181']
WHERE name = 'IPTM - Nova Iguaçu';

-- IPTM - São Gonçalo: Contato
UPDATE public.congregations 
SET responsible_pastor_ids = ARRAY['3c9d8eb6-2e69-4bb7-ba98-1408436be76f']
WHERE name = 'IPTM - São Gonçalo';