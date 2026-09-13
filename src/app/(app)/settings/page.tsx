'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Globe, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DISCLAIMER, LANGUAGES } from '@/lib/constants';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and app settings.</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="h-5 w-5 hidden dark:block" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how NyayaLens looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex-1 sm:flex-none"
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex-1 sm:flex-none"
            >
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="flex-1 sm:flex-none"
            >
              System
            </Button>
          </CardContent>
        </Card>

        {/* Language Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language & Region
            </CardTitle>
            <CardDescription>Set your preferred language for insights and UI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((lang) => (
                <Button key={lang.code} variant={lang.code === 'en' ? 'default' : 'outline'}>
                  {lang.label} ({lang.nativeLabel})
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              More languages and regional legal nuances coming soon.
            </p>
          </CardContent>
        </Card>

        {/* About & Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              About NyayaLens
            </CardTitle>
            <CardDescription>Version 1.0.0-beta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground border">
              <p className="font-medium text-foreground mb-1">Important Disclaimer</p>
              <p>{DISCLAIMER}</p>
            </div>
            <div className="flex gap-4 text-sm">
              <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
              <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
