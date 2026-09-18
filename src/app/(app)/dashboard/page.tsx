'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Upload, GitCompare, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface RecentDoc {
  id: string;
  name: string;
  documentType: string;
  fileType: string;
  pageCount: number;
  status: string;
  highAttentionCount?: number;
  totalAttentionCount?: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [greeting] = useState(getGreeting);
  const [loading, setLoading] = useState(true);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/documents')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (!isMounted) return;
        setRecentDocs(data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting} 👋</h1>
        <p className="text-muted-foreground mt-1">Welcome to your legal workspace.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/documents" className="group">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Upload Document</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <CardDescription>Analyze a new NDA, lease, or contract.</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/compare" className="group">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Compare Versions</CardTitle>
              <GitCompare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <CardDescription>Find differences between two document versions.</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/chat" className="group">
          <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">Ask Nyaya AI</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <CardDescription>Get answers about legal concepts or your docs.</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
          <Link href="/documents">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5 flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentDocs.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentDocs.map((doc) => (
              <Link key={doc.id} href={`/documents/${doc.id}`} className="group">
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-sm">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {doc.documentType || 'Document'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={doc.status === 'analyzed' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'} · {doc.fileType?.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t text-xs text-primary font-medium">
                      <span>View analysis</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-dashed shadow-none bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">No documents yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Upload your first legal document to get an AI-powered summary, risk analysis, and actionable insights.
                </p>
              </div>
              <Link href="/documents">
                <Button className="mt-4">Upload Document</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
