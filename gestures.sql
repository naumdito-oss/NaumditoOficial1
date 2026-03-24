-- 1. Criar a tabela de micro gestos
CREATE TABLE IF NOT EXISTS public.micro_gestures (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_prompt TEXT NOT NULL,
  image_url TEXT
);

-- 2. Habilitar RLS
ALTER TABLE public.micro_gestures ENABLE ROW LEVEL SECURITY;

-- 3. Permitir leitura para todos os usuários autenticados
CREATE POLICY "Permitir leitura de micro gestos" ON public.micro_gestures
FOR SELECT TO authenticated USING (true);

-- 4. Permitir atualização para usuários autenticados (para podermos salvar as imagens geradas)
CREATE POLICY "Permitir atualização de micro gestos" ON public.micro_gestures
FOR UPDATE TO authenticated USING (true);

-- 5. Permitir inserção para usuários autenticados (para podermos popular a tabela)
CREATE POLICY "Permitir inserção de micro gestos" ON public.micro_gestures
FOR INSERT TO authenticated WITH CHECK (true);
