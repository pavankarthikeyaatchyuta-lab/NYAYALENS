-- NyayaLens Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up the database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  document_type TEXT DEFAULT 'Unknown',
  file_type TEXT NOT NULL,
  content TEXT NOT NULL,
  page_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'analyzed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  analyzed_at TIMESTAMPTZ
);

-- Document analyses (stores full structured analysis JSON)
CREATE TABLE IF NOT EXISTS public.document_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  analysis_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Individual clauses (for quick lookup)
CREATE TABLE IF NOT EXISTS public.clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  section TEXT,
  page INTEGER,
  original_text TEXT,
  simplified_explanation TEXT,
  attention_level TEXT CHECK (attention_level IN ('high', 'medium', 'low')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Obligations
CREATE TABLE IF NOT EXISTS public.obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  responsible_party TEXT,
  timing TEXT,
  page INTEGER,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Important dates
CREATE TABLE IF NOT EXISTS public.important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.document_analyses(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  date_value TEXT,
  source_text TEXT,
  page INTEGER,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Checklists
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  items_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lawyer briefs
CREATE TABLE IF NOT EXISTS public.lawyer_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  brief_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_document_analyses_document_id ON public.document_analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_clauses_analysis_id ON public.clauses(analysis_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- Allow anonymous access for hackathon demo (no auth required)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_briefs ENABLE ROW LEVEL SECURITY;

-- Open access policies for hackathon demo
-- In production, replace with proper auth-based policies
CREATE POLICY "Allow all for demo" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.document_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.clauses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.obligations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.important_dates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON public.lawyer_briefs FOR ALL USING (true) WITH CHECK (true);
