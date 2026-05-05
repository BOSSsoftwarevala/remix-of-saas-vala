import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { writeAuditEvent } from '@/observability/auditClient';

const ROLE_OVERRIDE_KEY = 'sv_role_override';

type RoleEntry = { value: string; label: string; route: string };

const ROLE_MAP: RoleEntry[] = [
  { value: 'super_admin', label: 'Super Admin', route: '/dashboard' },
  { value: 'admin', label: 'Admin (Manager)', route: '/dashboard' },
  { value: 'reseller', label: 'Reseller', route: '/reseller-dashboard' },
  { value: 'user', label: 'User / Customer', route: '/marketplace' },
];

export function getRoleOverride(): string | null {
  try {
    return sessionStorage.getItem(ROLE_OVERRIDE_KEY);
  } catch {
    return null;
  }
}

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [override, setOverride] = useState<string | null>(getRoleOverride());

  useEffect(() => {
    const onStorage = () => setOverride(getRoleOverride());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!isSuperAdmin) return null;

  const switchTo = (entry: RoleEntry) => {
    try {
      sessionStorage.setItem(ROLE_OVERRIDE_KEY, entry.value);
    } catch {}
    setOverride(entry.value);
    void writeAuditEvent({
      eventCategory: 'AUTH',
      eventType: 'role_switch',
      action: 'view_as',
      actorId: user?.id ?? null,
      targetTable: 'user_roles',
      targetId: user?.id ?? null,
      metadata: { role: entry.value, route: entry.route },
      ingestSource: 'role_switcher',
    });
    navigate(entry.route);
  };

  const exitOverride = () => {
    try {
      sessionStorage.removeItem(ROLE_OVERRIDE_KEY);
    } catch {}
    setOverride(null);
    void writeAuditEvent({
      eventCategory: 'AUTH',
      eventType: 'role_switch_exit',
      action: 'view_as_exit',
      actorId: user?.id ?? null,
      targetTable: 'user_roles',
      targetId: user?.id ?? null,
      metadata: {},
      ingestSource: 'role_switcher',
    });
    navigate('/dashboard');
  };

  const current = ROLE_MAP.find((r) => r.value === override);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {current ? `Viewing: ${current.label}` : 'View as Role'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56 bg-popover/95 backdrop-blur-xl border-border/40">
        <DropdownMenuLabel className="text-xs">Switch dashboard view</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/30" />
        {ROLE_MAP.map((entry) => (
          <DropdownMenuItem
            key={entry.value}
            className="cursor-pointer text-sm py-2"
            onClick={() => switchTo(entry)}
          >
            <span className="flex-1">{entry.label}</span>
            {override === entry.value && (
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
  );
}