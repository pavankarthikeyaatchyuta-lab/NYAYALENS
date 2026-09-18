import Link from 'next/link';
import { BookOpen, Shield, Rocket, Upload, Brain, Eye, CheckCircle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DISCLAIMER } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">NyayaLens</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-950 dark:bg-background text-slate-50 dark:text-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <Badge variant="outline" className="text-indigo-400 border-indigo-400/30 bg-indigo-400/10 mb-4 inline-flex">
                    Legal AI Assistant
                  </Badge>
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl xl:text-6xl/none">
                    Legal documents shouldn&apos;t require a law degree to understand.
                  </h1>
                  <p className="max-w-[600px] text-slate-400 text-lg md:text-xl">
                    NyayaLens uses advanced AI to help you understand, identify attention areas, compare versions, and prepare actions for any legal document in minutes.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8">
                      Analyze a Document
                    </Button>
                  </Link>
                  <Link href="/documents/demo-doc-1">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 dark:hover:bg-accent dark:border-border dark:text-foreground">
                      Try Demo Document
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Product Preview Mockup */}
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none lg:ml-auto animate-slide-up">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur shadow-2xl dark:bg-card dark:border-border overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/50 p-4 dark:border-border">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500/80" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                      <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="mx-auto rounded-md bg-slate-800/50 px-3 py-1 text-xs text-slate-400 font-mono">
                      NDA_Analysis_Report.pdf
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-1/3 rounded-full bg-slate-800 dark:bg-muted" />
                      <div className="h-3 w-full rounded-full bg-slate-800 dark:bg-muted" />
                      <div className="h-3 w-5/6 rounded-full bg-slate-800 dark:bg-muted" />
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                      <div className="flex items-center gap-2 text-red-400 mb-2 font-medium text-sm">
                        <Shield className="h-4 w-4" /> Attention Required
                      </div>
                      <div className="h-3 w-full rounded-full bg-red-500/20 mb-2" />
                      <div className="h-3 w-4/5 rounded-full bg-red-500/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 rounded-lg bg-slate-800/50 dark:bg-muted" />
                      <div className="h-24 rounded-lg bg-slate-800/50 dark:bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-slate-50 dark:bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to navigate contracts</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Powerful features designed to demystify complex legal jargon and protect your interests.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Understand</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Summarize lengthy documents, simplify complex clauses into plain language, and get clear explanations of legal terms.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Check & Protect</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatically flag unfair clauses, highlight strict obligations, and extract critical deadlines and dates.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-start space-y-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Take Action</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Generate actionable next steps, compliance checklists, and comprehensive briefs for your lawyer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-center mb-12">How it works</h2>
            <div className="grid gap-8 md:grid-cols-4 relative">
              <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-0.5 bg-border -z-10" />
              
              <div className="flex flex-col items-center text-center space-y-4 bg-background">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-4 border-background">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">1. Upload</h3>
                <p className="text-sm text-muted-foreground px-4">Upload your PDF, Word, or text legal document.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 bg-background">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-4 border-background">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">2. Analyze</h3>
                <p className="text-sm text-muted-foreground px-4">Nyaya AI processes the structure and legal nuances.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 bg-background">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-4 border-background">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">3. Review</h3>
                <p className="text-sm text-muted-foreground px-4">Read summaries and review flagged attention areas.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 bg-background">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-4 border-background">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold">4. Act</h3>
                <p className="text-sm text-muted-foreground px-4">Export checklists, draft replies, or brief your lawyer.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsible AI */}
        <section className="w-full py-16 bg-muted/50 border-y">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-background shadow-sm border">
              <div className="bg-amber-500/10 p-4 rounded-full shrink-0">
                <Shield className="h-10 w-10 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Responsible AI Use</h3>
                <p className="text-muted-foreground">
                  {DISCLAIMER}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to understand your legal documents?
            </h2>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="font-semibold px-8 h-12 text-lg">
                Start Analyzing Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-slate-950 text-slate-400 dark:bg-background border-t dark:border-border">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-slate-50 dark:text-foreground">NyayaLens</span>
          </div>
          <p className="text-xs text-center md:text-left max-w-md">
            Built for empowerment. Not a substitute for professional legal counsel.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-slate-50 dark:hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-50 dark:hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
