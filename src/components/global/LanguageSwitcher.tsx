import { useTranslation } from 'react-i18next';
import { Globe, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const current = i18n.language || 'en';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (l) => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
    );
  }, [query]);

  const change = (code: string) => {
    void i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label={t('language', { defaultValue: 'Language' })}
          title={t('language', { defaultValue: 'Language' })}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0">
        <div className="border-b px-2 py-2 sticky top-0 bg-popover">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {SUPPORTED_LANGUAGES.length}+ languages
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {current}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_language', { defaultValue: 'Search language…' })}
              className="h-8 pl-7 text-xs"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              {t('no_results', { defaultValue: 'No matches' })}
            </p>
          ) : (
            filtered.map((lang) => {
              const active = current === lang.code || current.startsWith(`${lang.code}-`);
              return (
                <button
                  key={lang.code}
                  onClick={() => change(lang.code)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <span className="font-medium">{lang.name}</span>
                  <span className="ml-2 text-[10px] opacity-70 uppercase">{lang.code}</span>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}