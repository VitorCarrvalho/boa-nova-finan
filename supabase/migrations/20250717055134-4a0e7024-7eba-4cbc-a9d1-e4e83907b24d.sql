-- Tornar o bucket de anexos público para downloads
UPDATE storage.buckets 
SET public = true 
WHERE id = 'accounts-payable-attachments';

-- Criar políticas para permitir download público dos arquivos
CREATE POLICY "Public access for downloading attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'accounts-payable-attachments');

-- Permitir usuários com permissão inserir anexos
CREATE POLICY "Users with permission can upload attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'accounts-payable-attachments' AND user_has_permission('contas-pagar', 'insert'));

-- Permitir usuários com permissão atualizar anexos
CREATE POLICY "Users with permission can update attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'accounts-payable-attachments' AND user_has_permission('contas-pagar', 'edit'));