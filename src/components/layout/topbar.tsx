'use client';

import { Menu, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LANGUAGES } from '@/lib/constants';

interface TopbarProps {
  onMobileMenuOpen?: () => void;
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMobileMenuOpen}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <form className="hidden flex-1 md:flex max-w-sm" onSubmit={(e) => e.preventDefault()}>
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents, clauses, insights..."
              className="w-full bg-background pl-9 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>Language</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem key={lang.code}>
                {lang.label} ({lang.nativeLabel})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="h-8 w-8 cursor-pointer border border-border">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">NL</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
