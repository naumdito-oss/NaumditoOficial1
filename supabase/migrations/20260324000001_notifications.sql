-- Add anniversary_date to couples
ALTER TABLE public.couples ADD COLUMN IF NOT EXISTS anniversary_date DATE;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'event', 'wishlist', 'checkin', 'exchange', 'system'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  link TEXT -- Optional link to navigate to
);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications." ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)." ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System/Partner can insert notifications." ON public.notifications
  FOR INSERT WITH CHECK (true); -- We'll rely on app logic to ensure correct user_id
