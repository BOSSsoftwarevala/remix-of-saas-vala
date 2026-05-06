import { useNavigate } from 'react-router-dom';
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

  if (!isSuperAdmin) return null;

  const switchTo = (entry: RoleConfig) => {
    setOverride(entry.key);
    navigate(entry.landing);
  };

  const exitOverride = () => {
    setOverride(null);
    navigate('/dashboard');
  };

  const current = ROLE_LIST.find((r) => r.key === override);

  return (
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
  );
}