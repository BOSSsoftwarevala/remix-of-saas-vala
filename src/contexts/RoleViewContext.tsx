import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { writeAuditEvent } from '@/observability/auditClient';

export type RoleViewKey =
  | 'product_manager'
  | 'server_manager'
  | 'user_dashboard'
  | 'reseller_manager'
  | 'reseller_user'
  | 'seo_lead_manager'
  | 'author';

export interface RoleConfig {
  key: RoleViewKey;
  label: string;
  /** Short title shown on banner / badge. */
  title: string;
  /** One-line description of the role's responsibility. */
  description: string;
  /** Accent color (HSL triplet, no hsl() wrapper) used for banner / badge. */
  accent: string;
  landing: string;
  /** Sidebar nav hrefs visible to this simulated role. */
  allowedHrefs: string[];
  /** Sidebar section ordering for this role. Sections not listed are hidden. */
  sections: string[];
  /** Whether destructive (delete/admin) actions are allowed in simulation. */
  allowDestructive: boolean;
}

export const ROLE_CONFIGS: Record<RoleViewKey, RoleConfig> = {
  product_manager: {
    key: 'product_manager',
    label: 'Product Manager',
    title: 'Product Operations',
    description: 'Manages catalog, licenses and product downloads.',
    accent: '215 90% 55%',
    landing: '/products',
    allowedHrefs: [
      '/dashboard', '/products', '/keys', '/dashboard/downloads',
      '/favorites', '/recent', '/support', '/feedback', '/announcements',
    ],
    sections: ['core'],
    allowDestructive: false,
  },
  server_manager: {
    key: 'server_manager',
    label: 'Server Manager',
    title: 'Infrastructure',
    description: 'Owns server fleet, deployments and pipelines.',
    accent: '160 75% 42%',
    landing: '/servers',
    allowedHrefs: [
      '/dashboard', '/servers', '/system-health', '/auto-pilot',
      '/auto-pilot/apk-pipeline', '/recent', '/support', '/announcements',
    ],
    sections: ['core', 'admin'],
    allowDestructive: false,
  },
  user_dashboard: {
    key: 'user_dashboard',
    label: 'User',
    title: 'Customer Workspace',
    description: 'End-user view: marketplace, wallet and downloads.',
    accent: '265 75% 60%',
    landing: '/marketplace',
    allowedHrefs: [
      '/dashboard', '/dashboard/downloads', '/favorites', '/recent',
      '/wallet', '/support', '/feedback', '/announcements',
    ],
    sections: ['core'],
    allowDestructive: false,
  },
  reseller_manager: {
    key: 'reseller_manager',
    label: 'Reseller Manager',
    title: 'Channel Operations',
    description: 'Oversees reseller network, credit and audit.',
    accent: '32 95% 55%',
    landing: '/reseller-manager',
    allowedHrefs: [
      '/dashboard', '/reseller-manager', '/keys', '/wallet',
      '/audit-logs', '/support', '/announcements',
    ],
    sections: ['core', 'admin'],
    allowDestructive: false,
  },
  reseller_user: {
    key: 'reseller_user',
    label: 'Reseller',
    title: 'Reseller Workspace',
    description: 'Resells licenses, manages clients and earnings.',
    accent: '340 80% 58%',
    landing: '/reseller-dashboard',
    allowedHrefs: [
      '/dashboard', '/reseller-dashboard', '/keys', '/wallet',
      '/dashboard/downloads', '/support', '/feedback',
    ],
    sections: ['core'],
    allowDestructive: false,
  },
  seo_lead_manager: {
    key: 'seo_lead_manager',
    label: 'SEO & Lead Manager',
    title: 'Growth & SEO',
    description: 'Owns SEO automations, leads and announcements.',
    accent: '190 85% 48%',
    landing: '/seo-leads',
    allowedHrefs: [
      '/dashboard', '/seo-leads', '/announcements', '/recent', '/support',
    ],
    sections: ['marketing', 'core'],
    allowDestructive: false,
  },
  author: {
    key: 'author',
    label: 'Author',
    title: 'Software Author',
    description: 'Create, publish, license and grow software products.',
    accent: '280 80% 60%',
    landing: '/author',
    allowedHrefs: [
      '/author', '/dashboard', '/products', '/keys', '/wallet',
      '/dashboard/downloads', '/support', '/feedback', '/announcements',
      '/admin/achievements',
    ],
    sections: ['author', 'core'],
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
  /** Returns true if the current role view permits a destructive write. */
  canPerform: (action: 'read' | 'write' | 'destructive') => boolean;
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
    canPerform: (action) => {
      if (!override) return true;
      const cfg = ROLE_CONFIGS[override];
      if (action === 'destructive') return cfg.allowDestructive;
      return true;
    },
  }), [override, setOverride, isSuperAdmin]);

  return <RoleViewContext.Provider value={value}>{children}</RoleViewContext.Provider>;
}

export function useRoleView() {
  const ctx = useContext(RoleViewContext);
  if (!ctx) throw new Error('useRoleView must be used within RoleViewProvider');
  return ctx;
}