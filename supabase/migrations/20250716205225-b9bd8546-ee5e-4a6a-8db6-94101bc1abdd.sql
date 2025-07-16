-- Recreate the missing trigger function and trigger
CREATE OR REPLACE FUNCTION public.update_month_from_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.month = DATE_TRUNC('month', NEW.reconciliation_date)::DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER update_reconciliation_month
BEFORE INSERT OR UPDATE ON public.reconciliations
FOR EACH ROW
EXECUTE FUNCTION public.update_month_from_date();