
-- approval_audit_logs: SET NULL (manter logs de auditoria)
ALTER TABLE public.approval_audit_logs DROP CONSTRAINT approval_audit_logs_congregation_id_fkey;
ALTER TABLE public.approval_audit_logs ADD CONSTRAINT approval_audit_logs_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE SET NULL;

-- financial_records: CASCADE (dados operacionais do tenant)
ALTER TABLE public.financial_records DROP CONSTRAINT financial_records_congregation_id_fkey;
ALTER TABLE public.financial_records ADD CONSTRAINT financial_records_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE CASCADE;

-- members: CASCADE (dados operacionais do tenant)
ALTER TABLE public.members DROP CONSTRAINT members_congregation_id_fkey;
ALTER TABLE public.members ADD CONSTRAINT members_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE CASCADE;

-- reconciliations: CASCADE (dados operacionais do tenant)
ALTER TABLE public.reconciliations DROP CONSTRAINT reconciliations_congregation_id_fkey;
ALTER TABLE public.reconciliations ADD CONSTRAINT reconciliations_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE CASCADE;

-- accounts_payable: CASCADE (dados operacionais do tenant)
ALTER TABLE public.accounts_payable DROP CONSTRAINT accounts_payable_congregation_id_fkey;
ALTER TABLE public.accounts_payable ADD CONSTRAINT accounts_payable_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE CASCADE;

-- service_providers: SET NULL (dados públicos compartilhados)
ALTER TABLE public.service_providers DROP CONSTRAINT service_providers_congregation_id_fkey;
ALTER TABLE public.service_providers ADD CONSTRAINT service_providers_congregation_id_fkey FOREIGN KEY (congregation_id) REFERENCES public.congregations(id) ON DELETE SET NULL;
