-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS checkin_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS micro_gesture_completed BOOLEAN DEFAULT false;

-- Create weekly_history table
CREATE TABLE IF NOT EXISTS public.weekly_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_id uuid REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  week_starting DATE NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for weekly_history
ALTER TABLE public.weekly_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their couple's weekly history." ON public.weekly_history
  FOR SELECT USING (couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert weekly history for their couple." ON public.weekly_history
  FOR INSERT WITH CHECK (couple_id = (SELECT couple_id FROM public.profiles WHERE id = auth.uid()));
