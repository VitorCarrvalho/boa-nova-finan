
-- Update the existing user_role enum to include the new roles
ALTER TYPE public.user_role ADD VALUE 'assistente';
ALTER TYPE public.user_role ADD VALUE 'analista';
ALTER TYPE public.user_role ADD VALUE 'coordenador';
ALTER TYPE public.user_role ADD VALUE 'gerente';
ALTER TYPE public.user_role ADD VALUE 'diretor';
ALTER TYPE public.user_role ADD VALUE 'presidente';

-- Note: 'pastor' already exists in the current enum
-- The existing roles are: 'superadmin', 'admin', 'finance', 'pastor', 'worker'
-- After this update, the complete enum will include all roles
