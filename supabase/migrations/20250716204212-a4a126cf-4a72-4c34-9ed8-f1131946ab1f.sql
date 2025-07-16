-- Add reconciliation_date field to reconciliations table
ALTER TABLE public.reconciliations 
ADD COLUMN reconciliation_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Create trigger to automatically update month based on reconciliation_date
CREATE OR REPLACE FUNCTION public.update_month_from_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month = DATE_TRUNC('month', NEW.reconciliation_date)::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that runs before insert/update
CREATE TRIGGER update_reconciliation_month
BEFORE INSERT OR UPDATE ON public.reconciliations
FOR EACH ROW
EXECUTE FUNCTION public.update_month_from_date();

-- Migrate existing data: set reconciliation_date to the first day of the month
UPDATE public.reconciliations 
SET reconciliation_date = month 
WHERE reconciliation_date = CURRENT_DATE;