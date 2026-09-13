'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle, Clock, Loader2, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DocItem {
  id: string;
  name: string;
  documentType: string;
  fileType: string;
  pageCount: number;
  status: string;
  createdAt: string;
  highAttentionCount: number;
  totalAttentionCount: number;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Analyzing your document...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  const stages = [
    'Reading document',
    'Identifying sections',
    'Finding important clauses',
    'Extracting obligations',
    'Finding dates',
    'Preparing AI analysis'
  ];

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('File exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !SUPPORTED_EXTENSIONS.includes(`.${ext}`)) {
      setErrorMessage(`Unsupported format .${ext}. Please upload a PDF, DOCX, TXT, or image.`);
      return;
    }

    setIsProcessing(true);
    setUploadProgress(15);
    setProcessingStage(0);
    setStatusMessage('Reading document...');

    try {
      // 1. Upload file
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(40);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload and parse file.');
      }

      const uploadedDoc = await uploadRes.json();
      setUploadProgress(100);

      // 2. Animate stages while calling Gemini
      const stageInterval = setInterval(() => {
        setProcessingStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 1400);

      setStatusMessage('Extracting structured legal intelligence with Gemini...');

      // 3. Call real Gemini AI analysis endpoint
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: uploadedDoc.id }),
      });

      clearInterval(stageInterval);

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json().catch(() => ({}));
        throw new Error(err.error || 'AI analysis failed.');
      }

      setProcessingStage(stages.length);
      setStatusMessage('Analysis complete! Redirecting...');
      
      await new Promise(r => setTimeout(r, 600));
      router.push(`/documents/${uploadedDoc.id}`);
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Documents
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Upload, analyze, and manage your legal documents.
          </p>
        </div>
        <Link href="/documents/demo-doc-1">
          <Button variant="outline" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
            Open Sample Employment Agreement
          </Button>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Upload Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Upload Drop Zone Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardContent className="p-6 md:p-8">
          {!isProcessing ? (
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all cursor-pointer",
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-2xs">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                    Drag & drop your legal document here
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4">
                    Supports PDF, DOCX, TXT, and scanned image formats up to 10MB
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="default"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      Browse Files
                    </Button>
                    <input 
                      id="file-upload" 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" 
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs sm:text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/documents/demo-doc-1');
                      }}
                    >
                      Try Demo Document
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 max-w-md mx-auto space-y-6">
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                  Analyzing Your Document...
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {statusMessage}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              <div className="space-y-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm">
                    {idx < processingStage ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : idx === processingStage ? (
                      <Loader2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                    )}
                    <span className={cn(
                      idx > processingStage ? "text-slate-400 dark:text-slate-600" : "text-slate-900 dark:text-slate-100",
                      idx === processingStage && "font-medium text-indigo-600 dark:text-indigo-400"
                    )}>
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Document Library
          </h2>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
            <FileText className="h-10 w-10 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                No user documents uploaded yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a real contract or agreement above, or explore the pre-analyzed sample contract.
              </p>
            </div>
            <Link href="/documents/demo-doc-1">
              <Button variant="outline" size="sm" className="mt-2 text-xs">
                Explore Demo Employment Agreement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`}>
                <Card className="hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:shadow-xs cursor-pointer h-full flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {doc.documentType || 'Legal Document'}
                      </Badge>
                      <Badge variant="outline" className={doc.status === 'analyzed' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'} · {doc.fileType.toUpperCase()}
                      </p>
                    </div>
                    {doc.totalAttentionCount > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {doc.highAttentionCount} high attention
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          {doc.totalAttentionCount} total
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>View Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
