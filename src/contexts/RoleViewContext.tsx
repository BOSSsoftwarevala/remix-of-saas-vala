import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { writeAuditEvent } from '@/observability/auditClient';

export type RoleViewKey =
  | 'product_manager'
  | 'server_manager'
  | 'user_dashboard'
  | 'reseller_manager'
  | 'reseller_user'
  | 'seo_lead_manager';

export interface RoleConfig {
  key: RoleViewKey;
  label: string;
  landing: string;
  /** Sidebar nav hrefs visible to this simulated role. */
  allowedHrefs: string[];
  /** Whether destructive (delete/admin) actions are allowed in simulation. */
  allowDestructive: boolean;
}

export const ROLE_CONFIGS: Record<RoleViewKey, RoleConfig> = {
  product_manager: {
    key: 'product_manager',
    label: 'Product Manager',
    landing: '/products',
    allowedHrefs: [
      '/dashboard', '/products', '/keys', '/dashboard/downloads',
      '/favorites', '/recent', '/support', '/feedback', '/announcements',
    ],
    allowDestructive: false,
  },
  server_manager: {
    key: 'server_manager',
    label: 'Server Manager',
    landing: '/servers',
    allowedHrefs: [
      '/dashboard', '/servers', '/system-health', '/auto-pilot',
      '/auto-pilot/apk-pipeline', '/recent', '/support', '/announcements',
    ],
    allowDestructive: false,
  },
  user_dashboard: {
    key: 'user_dashboard',
    label: 'User',
    landing: '/marketplace',
    allowedHrefs: [
      '/dashboard', '/dashboard/downloads', '/favorites', '/recent',
      '/wallet', '/support', '/feedback', '/announcements',
    ],
    allowDestructive: false,
  },
  reseller_manager: {
    key: 'reseller_manager',
    label: 'Reseller Manager',
    landing: '/reseller-manager',
    allowedHrefs: [
      '/dashboard', '/reseller-manager', '/keys', '/wallet',
      '/audit-logs', '/support', '/announcements',
    ],
    allowDestructive: false,
  },
  reseller_user: {
    key: 'reseller_user',
    label: 'Reseller',
    landing: '/reseller-dashboard',
    allowedHrefs: [
      '/dashboard', '/reseller-dashboard', '/keys', '/wallet',
      '/dashboard/downloads', '/support', '/feedback',
    ],
    allowDestructive: false,
  },
  seo_lead_manager: {
    key: 'seo_lead_manager',
    label: 'SEO & Lead Manager',
    landing: '/seo-leads',
    allowedHrefs: [
      '/dashboard', '/seo-leads', '/announcements', '/recent', '/support',
    ],
    allowDestructive: false,
  },
};

export const ROLE_LIST: RoleConfig[] = Object.values(ROLE_CONFIGS);

const STORAGE_KEY = 'sv_role_override';

interface RoleViewContextValue {
  override: RoleViewKey | null;
  config: RoleConfig | null;
  setOverride: (key: RoleViewKey | null) => void;
  isSimulating: boolean;
}

const RoleViewContext = createContext<RoleViewContextValue | undefined>(undefined);

export function RoleViewProvider({ children }: { children: ReactNode }) {
  const { isSuperAdmin, user } = useAuth();
  const [override, setOverrideState] = useState<RoleViewKey | null>(() => {
    try {
      const v = sessionStorage.getItem(STORAGE_KEY);
      return v && v in ROLE_CONFIGS ? (v as RoleViewKey) : null;
    } catch {
      return null;
    }
  });

  // Clear override if user is no longer super admin.
  useEffect(() => {
    if (!isSuperAdmin && override) {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
      setOverrideState(null);
    }
  }, [isSuperAdmin, override]);

  const setOverride = useCallback((key: RoleViewKey | null) => {
    try {
      if (key) sessionStorage.setItem(STORAGE_KEY, key);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setOverrideState(key);
    void writeAuditEvent({
      eventCategory: 'AUTH',
      eventType: key ? 'role_switch' : 'role_switch_exit',
      action: key ? 'login' : 'logout',
      actorId: user?.id ?? null,
      targetTable: 'user_roles',
      targetId: user?.id ?? null,
      metadata: { role: key },
      ingestSource: 'role_view_context',
    });
  }, [user?.id]);

  const value = useMemo<RoleViewContextValue>(() => ({
    override,
    config: override ? ROLE_CONFIGS[override] : null,
    setOverride,
    isSimulating: !!override && isSuperAdmin,
  }), [override, setOverride, isSuperAdmin]);

  return <RoleViewContext.Provider value={value}>{children}</RoleViewContext.Provider>;
}

export function useRoleView() {
  const ctx = useContext(RoleViewContext);
  if (!ctx) throw new Error('useRoleView must be used within RoleViewProvider');
  return ctx;
}