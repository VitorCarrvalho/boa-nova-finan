
-- Adicionar campos faltantes à tabela video_library
ALTER TABLE public.video_library 
ADD COLUMN IF NOT EXISTS url_minio TEXT,
ADD COLUMN IF NOT EXISTS categoria TEXT;

-- Adicionar índice para melhor performance na categoria
CREATE INDEX IF NOT EXISTS idx_video_library_categoria 
ON public.video_library(categoria) 
WHERE categoria IS NOT NULL;
