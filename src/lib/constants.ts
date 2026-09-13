// App constants

export const APP_NAME = 'NyayaLens';
export const APP_TAGLINE = 'Understand your rights. Know your next step.';
export const APP_DESCRIPTION =
  'Legal documents shouldn\'t require a law degree to understand.';

export const DISCLAIMER =
  'NyayaLens provides AI-assisted legal information and document analysis. It is not a lawyer and does not provide legal advice. Important legal decisions should be discussed with a qualified legal professional.';

export const SHORT_DISCLAIMER =
  'AI-assisted analysis — not legal advice. Consult a qualified professional for important decisions.';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
} as const;

export const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.docx', '.png', '.jpg', '.jpeg', '.webp'];

export const ATTENTION_LEVEL_COLORS = {
  high: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  low: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
} as const;

export const CLAUSE_CATEGORY_LABELS: Record<string, string> = {
  restrictions: 'Restrictions',
  obligations: 'Obligations',
  deadlines: 'Deadlines',
  financial: 'Financial Terms',
  termination: 'Termination',
  privacy: 'Privacy & Confidentiality',
  'intellectual-property': 'Intellectual Property',
  liability: 'Liability',
  'dispute-resolution': 'Dispute Resolution',
  other: 'Other',
};

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
] as const;

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Documents', href: '/documents', icon: 'FileText' },
  { label: 'AI Assistant', href: '/chat', icon: 'MessageSquare' },
  { label: 'Compare', href: '/compare', icon: 'GitCompare' },
  { label: 'Action Center', href: '/action-center', icon: 'CheckSquare' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;
