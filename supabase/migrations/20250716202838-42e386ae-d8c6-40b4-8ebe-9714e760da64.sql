-- Adicionar políticas RLS para melhorar acesso a dropdowns

-- Política para fornecedores (suppliers)
CREATE POLICY "Users can view suppliers for dropdowns" 
ON public.suppliers 
FOR SELECT 
USING (
  user_has_permission('fornecedores', 'view') OR 
  user_has_permission('financeiro', 'view')
);

-- Política para membros (members) 
CREATE POLICY "Users can view members for dropdowns" 
ON public.members 
FOR SELECT 
USING (
  user_has_permission('membros', 'view') OR 
  user_has_permission('financeiro', 'view')
);

-- Política para ministérios (ministries)
CREATE POLICY "Users can view ministries for dropdowns" 
ON public.ministries 
FOR SELECT 
USING (
  user_has_permission('ministerios', 'view') OR 
  user_has_permission('membros', 'view')
);