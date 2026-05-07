import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ShieldCheck, LogOut, Briefcase } from 'lucide-react';
import { useRoleView } from '@/contexts/RoleViewContext';
import { Button } from '@/components/ui/button';

export function RoleViewBanner() {
  const { isSimulating, config, setOverride } = useRoleView();
  const navigate = useNavigate();
  const location = useLocation();

  // Route isolation: if simulating and current path not allowed, redirect to landing.
  useEffect(() => {
    if (!isSimulating || !config) return;
    const path = location.pathname;
    const allowed = config.allowedHrefs.some(
      (h) => path === h || path.startsWith(h + '/'),
    );
    if (!allowed) navigate(config.landing, { replace: true });
  }, [isSimulating, config, location.pathname, navigate]);

  if (!isSimulating || !config) return null;

  const accent = config.accent;
  return (
    <div
      className="relative flex items-center justify-between gap-4 px-5 py-2.5 border-b backdrop-blur-md"
      style={{
        background: `linear-gradient(90deg, hsl(${accent} / 0.12) 0%, hsl(${accent} / 0.04) 60%, transparent 100%)`,
        borderColor: `hsl(${accent} / 0.25)`,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `hsl(${accent})`, boxShadow: `0 0 12px hsl(${accent} / 0.6)` }}
      />
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `hsl(${accent} / 0.15)`,
            border: `1px solid hsl(${accent} / 0.4)`,
          }}
        >
          <Briefcase className="h-4 w-4" style={{ color: `hsl(${accent})` }} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 leading-tight">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
              style={{
                background: `hsl(${accent} / 0.18)`,
                color: `hsl(${accent})`,
              }}
            >
              Acting as
            </span>
            <span className="text-sm font-semibold text-foreground truncate">
              {config.label}
            </span>
            <span className="hidden md:inline text-[11px] text-muted-foreground/80">
              · {config.title}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {config.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
          <ShieldCheck className="h-3 w-3" />
          Destructive actions blocked
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 font-semibold"
          style={{
            borderColor: `hsl(${accent} / 0.45)`,
            color: `hsl(${accent})`,
          }}
          onClick={() => { setOverride(null); navigate('/dashboard'); }}
        >
          <LogOut className="h-3.5 w-3.5" />
          Exit role view
        </Button>
      </div>
    </div>
  );
}