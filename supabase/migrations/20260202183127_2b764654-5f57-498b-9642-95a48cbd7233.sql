-- Corrigir campos NULL em auth.users (criadas manualmente via SQL) que fazem o GoTrue falhar no /token
-- Observação: esses campos têm default '' no schema, então NULL é um estado inválido para o serviço.

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change_confirm_status = COALESCE(email_change_confirm_status, 0)
WHERE email = 'superadmin@gmail.com';

-- Opcional: recarregar cache de schema do PostgREST (não é a causa do erro do Auth, mas ajuda após mudanças)
NOTIFY pgrst, 'reload schema';
