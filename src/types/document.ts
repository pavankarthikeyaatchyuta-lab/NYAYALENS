// Document types for NyayaLens

export type DocumentStatus = 'uploading' | 'processing' | 'analyzed' | 'error';
export type FileType = 'pdf' | 'docx' | 'txt' | 'image';
export type AttentionLevel = 'high' | 'medium' | 'low';
export type ClauseCategory =
  | 'restrictions'
  | 'obligations'
  | 'deadlines'
  | 'financial'
  | 'termination'
  | 'privacy'
  | 'intellectual-property'
  | 'liability'
  | 'dispute-resolution'
  | 'other';

export interface DocumentMeta {
  id: string;
  name: string;
  type: string; // e.g., "Employment Agreement", "Rental Agreement"
  fileType: FileType;
  pageCount: number;
  status: DocumentStatus;
  createdAt: string;
  analyzedAt?: string;
  highAttentionCount: number;
  totalAttentionCount: number;
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  fileType: FileType;
  content: string; // extracted text
  pages: DocumentPage[];
  pageCount: number;
  rawBase64?: string; // for images/scanned docs
  createdAt: string;
}
