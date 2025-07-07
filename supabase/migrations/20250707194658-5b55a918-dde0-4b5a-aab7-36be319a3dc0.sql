
-- Create enum for notification types
CREATE TYPE public.notification_type AS ENUM ('texto', 'texto_com_video', 'video');

-- Create enum for delivery types
CREATE TYPE public.delivery_type AS ENUM ('unico', 'agendado');

-- Create enum for notification status
CREATE TYPE public.notification_status AS ENUM ('scheduled', 'sent', 'error', 'cancelled', 'inactive');

-- Create enum for recipient profiles
CREATE TYPE public.recipient_profile AS ENUM ('pastores', 'financeiro', 'membros', 'todos');

-- Create video library table
CREATE TABLE public.video_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  minio_video_id TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_type notification_type NOT NULL,
  message_content TEXT NOT NULL,
  video_id UUID REFERENCES public.video_library(id) NULL,
  delivery_type delivery_type NOT NULL,
  recipient_profiles recipient_profile[] NOT NULL,
  scheduled_time TIME NULL,
  status notification_status NOT NULL DEFAULT 'scheduled',
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  n8n_payload JSONB NULL,
  error_message TEXT NULL
);

-- Add Row Level Security (RLS) for video_library
ALTER TABLE public.video_library ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to manage video library
CREATE POLICY "Admins podem gerenciar biblioteca de vídeos" 
  ON public.video_library 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Add Row Level Security (RLS) for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to manage notifications
CREATE POLICY "Admins podem gerenciar notificações" 
  ON public.notifications 
  FOR ALL 
  USING (get_current_user_role() = ANY (ARRAY['superadmin'::user_role, 'admin'::user_role]));

-- Create indexes for better performance
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_delivery_type ON public.notifications(delivery_type);
CREATE INDEX idx_video_library_active ON public.video_library(is_active);
