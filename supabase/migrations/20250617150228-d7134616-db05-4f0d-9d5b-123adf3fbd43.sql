
-- Atualizar a tabela church_events existente com as novas colunas
ALTER TABLE public.church_events 
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS organizer_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS max_attendees INTEGER,
  ADD COLUMN IF NOT EXISTS current_attendees INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Criar tabela para inscrições em eventos
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.church_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waiting')),
  notes TEXT,
  UNIQUE(event_id, member_id)
);

-- Adicionar RLS para event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Política para visualizar inscrições
CREATE POLICY "Users can view event registrations" 
  ON public.event_registrations 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Política para criar inscrições (usuários autenticados)
CREATE POLICY "Authenticated users can register for events" 
  ON public.event_registrations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Política para atualizar inscrições (admins, pastores e o próprio usuário)
CREATE POLICY "Users can update their own registrations" 
  ON public.event_registrations 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'admin', 'pastor')
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE id = member_id 
      AND email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Função para atualizar contador de participantes
CREATE OR REPLACE FUNCTION update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.church_events 
    SET current_attendees = (
      SELECT COUNT(*) 
      FROM public.event_registrations 
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.church_events 
    SET current_attendees = (
      SELECT COUNT(*) 
      FROM public.event_registrations 
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.church_events 
    SET current_attendees = (
      SELECT COUNT(*) 
      FROM public.event_registrations 
      WHERE event_id = OLD.event_id AND status = 'confirmed'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente o contador
DROP TRIGGER IF EXISTS trigger_update_event_attendees ON public.event_registrations;
CREATE TRIGGER trigger_update_event_attendees
  AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_attendees();
