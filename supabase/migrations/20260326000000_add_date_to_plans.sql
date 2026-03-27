-- Add date column to next_date_plans
ALTER TABLE public.next_date_plans ADD COLUMN IF NOT EXISTS date date;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_next_date_plans_date ON public.next_date_plans(date);
