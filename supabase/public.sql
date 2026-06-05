-- Supabase public schema migration for Todo app
-- Creates `profiles` and `todos` tables, indexes, RLS policies, and triggers

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table: mirrors auth.users id and stores role
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Todos table: owner references profiles.id
CREATE TABLE IF NOT EXISTS public.todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  owner uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for quick owner queries
CREATE INDEX IF NOT EXISTS todos_owner_idx ON public.todos(owner);

-- Row Level Security (RLS) and policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::uuid = id);
CREATE POLICY "Profiles: select own or admin" ON public.profiles FOR SELECT USING (
  auth.uid()::uuid = id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin')
);
CREATE POLICY "Profiles: update own or admin" ON public.profiles FOR UPDATE
  USING (auth.uid()::uuid = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin'))
  WITH CHECK (auth.uid()::uuid = id OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin'));

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos: insert own" ON public.todos FOR INSERT WITH CHECK (auth.uid()::uuid = owner);
CREATE POLICY "Todos: select own or admin" ON public.todos FOR SELECT USING (
  owner = auth.uid()::uuid OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin')
);
CREATE POLICY "Todos: update own or admin" ON public.todos FOR UPDATE
  USING (owner = auth.uid()::uuid OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin'))
  WITH CHECK (owner = auth.uid()::uuid OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin'));
CREATE POLICY "Todos: delete own or admin" ON public.todos FOR DELETE USING (
  owner = auth.uid()::uuid OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'admin')
);

-- Trigger to update `updated_at` on row updates
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS todos_set_updated_at ON public.todos;
CREATE TRIGGER todos_set_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- End of migration
