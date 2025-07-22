
-- Adicionar 'recorrente' ao enum delivery_type se ainda não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'recorrente' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'delivery_type')) THEN
        ALTER TYPE delivery_type ADD VALUE 'recorrente';
    END IF;
END $$;

-- Adicionar campos faltantes à tabela notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS recurrence_frequency TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Atualizar a constraint de scheduled_time para permitir NULL em notificações únicas
-- e tornar obrigatório apenas para agendadas
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_scheduled_time_check;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_is_active ON public.notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_type_recurrence ON public.notifications(delivery_type, recurrence_frequency) WHERE delivery_type = 'recorrente';
