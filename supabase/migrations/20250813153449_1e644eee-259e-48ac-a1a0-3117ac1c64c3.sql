-- Adicionar novos campos para melhorar recorrência
ALTER TABLE accounts_payable 
ADD COLUMN IF NOT EXISTS recurrence_day_of_week INTEGER, -- Para recorrência semanal (0=domingo, 1=segunda, etc)
ADD COLUMN IF NOT EXISTS recurrence_day_of_month INTEGER, -- Para recorrência mensal (1-31)
ADD COLUMN IF NOT EXISTS next_occurrence_date DATE, -- Próxima data de ocorrência
ADD COLUMN IF NOT EXISTS is_future_scheduled BOOLEAN DEFAULT false, -- Para diferenciar de recorrente
ADD COLUMN IF NOT EXISTS future_scheduled_date DATE; -- Data específica para agendamento futuro

-- Atualizar o enum de frequência de recorrência para incluir novas opções
ALTER TYPE public.account_payable_status ADD VALUE IF NOT EXISTS 'future_scheduled';

-- Comentário para explicar a diferença:
-- is_recurring = true + recurrence_frequency = conta que se repete periodicamente
-- is_future_scheduled = true + future_scheduled_date = conta única agendada para o futuro

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_accounts_payable_next_occurrence 
ON accounts_payable(next_occurrence_date) 
WHERE next_occurrence_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_accounts_payable_future_scheduled 
ON accounts_payable(future_scheduled_date) 
WHERE is_future_scheduled = true;