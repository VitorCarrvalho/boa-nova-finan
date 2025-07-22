-- Adicionar 'recorrente' ao enum delivery_type se ainda não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'recorrente' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'delivery_type')) THEN
        ALTER TYPE delivery_type ADD VALUE 'recorrente';
    END IF;
END $$;