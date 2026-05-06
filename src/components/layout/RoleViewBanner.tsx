import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Eye, X } from 'lucide-react';
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

  return (
    <div className="flex items-center justify-between gap-3 px-5 h-9 bg-amber-500/10 border-b border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-medium">
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5" />
        <span>Simulation Mode — Viewing as <strong>{config.label}</strong>. Destructive actions are restricted.</span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs gap-1.5 text-amber-700 dark:text-amber-200 hover:bg-amber-500/20"
        onClick={() => { setOverride(null); navigate('/dashboard'); }}
      >
        <X className="h-3.5 w-3.5" />
        Exit Role View
      </Button>
    </div>
  );
}