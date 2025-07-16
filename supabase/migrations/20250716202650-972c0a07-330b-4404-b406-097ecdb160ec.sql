-- Adicionar políticas RLS para permitir visualização de profiles ativos para dropdowns
CREATE POLICY "Users can view active profiles for dropdowns" 
ON public.profiles 
FOR SELECT 
USING (approval_status = 'ativo' AND user_has_permission('membros', 'view'));

-- Melhorar política para permitir visualização de profiles com role pastor
CREATE POLICY "Users can view active pastor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  approval_status = 'ativo' AND 
  role = 'pastor' AND 
  user_has_permission('financeiro', 'view')
);