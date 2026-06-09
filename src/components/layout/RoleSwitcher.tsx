import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, ChevronDown, Loader2, Briefcase } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LIST, useRoleView, type RoleConfig } from '@/contexts/RoleViewContext';

export function getRoleOverride(): string | null {
  try {
    return sessionStorage.getItem('sv_role_override');
  } catch {
    return null;
  }
}

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const { override, setOverride } = useRoleView();
  const queryClient = useQueryClient();
  const [transition, setTransition] = useState<RoleConfig | null>(null);

  if (!isSuperAdmin) return null;

  const switchTo = async (entry: RoleConfig) => {
    if (override === entry.key) return;
    setTransition(entry);
    // Reset all query caches so every component refetches with the new role scope
    queryClient.cancelQueries();
    queryClient.clear();
    // Brief delay so the overlay actually renders + feels like a real session boot
    await new Promise((r) => setTimeout(r, 650));
    setOverride(entry.key);
    navigate(entry.landing, { replace: true });
    // Hold the overlay one more tick so the landing page mounts under it
    await new Promise((r) => setTimeout(r, 250));
    setTransition(null);
    toast.success(`Signed in as ${entry.label}`, {
      description: entry.description,
    });
  };

  const exitOverride = async () => {
    const prev = ROLE_LIST.find((r) => r.key === override);
    queryClient.cancelQueries();
    queryClient.clear();
    setOverride(null);
    navigate('/dashboard', { replace: true });
    if (prev) toast.message(`Exited ${prev.label} view`);
  };

  const current = ROLE_LIST.find((r) => r.key === override);

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs font-semibold border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="inline">
            {current ? `Viewing: ${current.label}` : 'View as Role'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-popover/95 backdrop-blur-xl border-border/40">
        <DropdownMenuLabel className="text-xs">Switch dashboard view</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/30" />
        {ROLE_LIST.map((entry) => (
          <DropdownMenuItem
            key={entry.key}
            className="cursor-pointer text-sm py-2"
            onClick={() => switchTo(entry)}
          >
            <span className="flex-1">{entry.label}</span>
            {override === entry.key && (
              <span className="text-[10px] text-primary font-semibold">ACTIVE</span>
            )}
          </DropdownMenuItem>
        ))}
        {override && (
          <>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              className="cursor-pointer text-sm py-2 text-destructive focus:text-destructive"
              onClick={exitOverride}
            >
              <EyeOff className="mr-2 h-3.5 w-3.5" />
              Exit role view
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    {transition && typeof document !== 'undefined' && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 backdrop-blur-xl animate-in fade-in duration-200">
        <div
          className="flex flex-col items-center gap-5 px-10 py-9 rounded-2xl border shadow-2xl"
          style={{
            background: `linear-gradient(135deg, hsl(${transition.accent} / 0.10), hsl(var(--card)))`,
            borderColor: `hsl(${transition.accent} / 0.35)`,
            boxShadow: `0 30px 80px -20px hsl(${transition.accent} / 0.35)`,
          }}
        >
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center"
            style={{
              background: `hsl(${transition.accent} / 0.18)`,
              border: `1px solid hsl(${transition.accent} / 0.45)`,
            }}
          >
            <Briefcase className="h-6 w-6" style={{ color: `hsl(${transition.accent})` }} />
          </div>
          <div className="text-center">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1"
              style={{ color: `hsl(${transition.accent})` }}
            >
              Entering workspace
            </div>
            <div className="text-lg font-semibold text-foreground">{transition.label}</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-xs">
              {transition.description}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading permissions, sidebar & data scope…
          </div>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}