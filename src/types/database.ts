// Database types for Supabase tables

export interface DbProfile {
  id: string;
  display_name: string | null;
  language: string;
  created_at: string;
}

export interface DbDocument {
  id: string;
  user_id: string | null;
  name: string;
  document_type: string;
  file_type: string;
  content: string;
  page_count: number;
  status: string;
  created_at: string;
  analyzed_at: string | null;
}

export interface DbDocumentAnalysis {
  id: string;
  document_id: string;
  analysis_json: Record<string, unknown>;
  created_at: string;
}

export interface DbChatSession {
  id: string;
  document_id: string;
  user_id: string | null;
  created_at: string;
}

export interface DbChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources_json: Record<string, unknown> | null;
  created_at: string;
}

export interface DbChecklist {
  id: string;
  document_id: string;
  items_json: Record<string, unknown>;
  created_at: string;
}

export interface DbLawyerBrief {
  id: string;
  document_id: string;
  brief_json: Record<string, unknown>;
  created_at: string;
}
