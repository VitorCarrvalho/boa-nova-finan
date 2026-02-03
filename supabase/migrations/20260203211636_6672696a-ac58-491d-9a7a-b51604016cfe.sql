-- ============================================
-- PARTE 0: Desabilitar TODOS os triggers de auditoria
-- ============================================

ALTER TABLE members DISABLE TRIGGER audit_members;
ALTER TABLE church_events DISABLE TRIGGER audit_church_events;
ALTER TABLE departments DISABLE TRIGGER audit_departments;
ALTER TABLE financial_records DISABLE TRIGGER audit_financial_records;
ALTER TABLE ministries DISABLE TRIGGER audit_ministries;
ALTER TABLE suppliers DISABLE TRIGGER audit_suppliers;
ALTER TABLE accounts_payable DISABLE TRIGGER log_accounts_payable_changes;
ALTER TABLE accounts_payable_approvals DISABLE TRIGGER log_accounts_payable_approvals_changes;
ALTER TABLE expense_categories DISABLE TRIGGER log_expense_categories_changes;

-- ============================================
-- PARTE 1: Atualizar dados existentes com tenant_id
-- ID do IPTM Global: 846fa096-6e2c-4f36-bb2c-3d807c4e4939
-- ============================================

UPDATE members SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE church_events SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE congregations SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE ministries SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE departments SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE suppliers SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE financial_records SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE reconciliations SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE accounts_payable SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE expense_categories SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE notifications SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE accounts_payable_approvals SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE access_profiles SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;

-- ============================================
-- PARTE 2: Reativar triggers de auditoria
-- ============================================

ALTER TABLE members ENABLE TRIGGER audit_members;
ALTER TABLE church_events ENABLE TRIGGER audit_church_events;
ALTER TABLE departments ENABLE TRIGGER audit_departments;
ALTER TABLE financial_records ENABLE TRIGGER audit_financial_records;
ALTER TABLE ministries ENABLE TRIGGER audit_ministries;
ALTER TABLE suppliers ENABLE TRIGGER audit_suppliers;
ALTER TABLE accounts_payable ENABLE TRIGGER log_accounts_payable_changes;
ALTER TABLE accounts_payable_approvals ENABLE TRIGGER log_accounts_payable_approvals_changes;
ALTER TABLE expense_categories ENABLE TRIGGER log_expense_categories_changes;