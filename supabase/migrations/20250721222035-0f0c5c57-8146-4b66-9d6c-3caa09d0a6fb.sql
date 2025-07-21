
-- Criar tabela para pedidos de oração
CREATE TABLE public.pedidos_oracao (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text,
  texto text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pedidos_oracao_texto_length CHECK (char_length(texto) <= 1000)
);

-- Habilitar RLS na tabela
ALTER TABLE public.pedidos_oracao ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que qualquer usuário (mesmo não autenticado) possa inserir pedidos
CREATE POLICY "Qualquer um pode inserir pedidos de oração"
ON public.pedidos_oracao
FOR INSERT
WITH CHECK (true);

-- Criar política para que apenas admins possam visualizar os pedidos
CREATE POLICY "Apenas admins podem ver pedidos de oração"
ON public.pedidos_oracao
FOR SELECT
USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));
