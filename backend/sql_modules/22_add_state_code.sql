-- Adiciona coluna state_code para garantir que sempre tenha o código de 2 letras do estado
ALTER TABLE public.project_locations 
ADD COLUMN IF NOT EXISTS state_code VARCHAR(2);

COMMENT ON COLUMN public.project_locations.state_code IS 'Two-letter state code (e.g., FL, CA, NY)';

-- Atualizar registros existentes onde state já tem o valor de 2 letras
UPDATE public.project_locations 
SET state_code = state 
WHERE LENGTH(state) = 2 AND state_code IS NULL;
