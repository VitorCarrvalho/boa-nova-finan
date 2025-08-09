-- Correção imediata: Atualizar role do usuário Robson de 'worker' para 'finance'
-- Baseado na consulta anterior, o usuário com email 'robribeir20@gmail.com' precisa ter role 'finance'
UPDATE public.profiles 
SET role = 'finance'::user_role
WHERE email = 'robribeir20@gmail.com' 
  AND name = 'Robson Ribeiro'
  AND role = 'worker';