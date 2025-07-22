
-- Adicionar 'recorrente' ao enum delivery_type
ALTER TYPE delivery_type ADD VALUE 'recorrente';

-- Adicionar campos à tabela video_library
ALTER TABLE public.video_library 
ADD COLUMN url_minio TEXT,
ADD COLUMN categoria TEXT;

-- Adicionar campos à tabela notifications
ALTER TABLE public.notifications 
ADD COLUMN recurrence_frequency TEXT,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Atualizar a constraint de scheduled_time para permitir NULL em notificações únicas
-- e tornar obrigatório apenas para agendadas
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_scheduled_time_check;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_is_active ON public.notifications(is_active);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_type_recurrence ON public.notifications(delivery_type, recurrence_frequency) WHERE delivery_type = 'recorrente';
CREATE INDEX IF NOT EXISTS idx_video_library_categoria ON public.video_library(categoria) WHERE categoria IS NOT NULL;
