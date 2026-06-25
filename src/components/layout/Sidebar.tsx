import { NavLink, useLocation } from 'react-router-dom';
import { useSidebarState } from '@/hooks/useSidebarState';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRoleView } from '@/contexts/RoleViewContext';
import {
  LayoutDashboard,
  Package,
  KeyRound,
  Server,
  MessageSquareText,
  BrainCircuit,
  Wallet,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UsersRound,
  Store,
  ScrollText,
  HeartPulse,
  BotMessageSquare,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Headset,
  Download,
  MessageCircle,
  BellRing,
  Mail,
  RefreshCw,
  Archive,
  Tags,
  ListChecks,
  Heart,
  History,
  Trophy,
  Briefcase,
  MessagesSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import saasValaLogo from '@/assets/saas-vala-logo.jpg';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface NavItem {
  title: string;
  i18nKey?: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  activePaths?: string[];
  adminOnly?: boolean;
  section?: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', i18nKey: 'nav_dashboard', icon: LayoutDashboard, href: '/dashboard', section: 'core' },
  { title: 'Products', i18nKey: 'nav_products', icon: Package, href: '/products', section: 'core' },
  { title: 'License Keys', i18nKey: 'nav_license_keys', icon: KeyRound, href: '/keys', section: 'core' },
  { title: 'Servers', i18nKey: 'nav_servers', icon: Server, href: '/servers', section: 'core' },
  { title: 'Wallet', i18nKey: 'nav_wallet', icon: Wallet, href: '/wallet', section: 'core' },
  { title: 'Downloads', i18nKey: 'nav_downloads', icon: Download, href: '/dashboard/downloads', section: 'core' },
  { title: 'Favorites', i18nKey: 'nav_favorites', icon: Heart, href: '/favorites', section: 'core' },
  { title: 'Recent', i18nKey: 'nav_recent', icon: History, href: '/recent', section: 'core' },
  { title: 'Support', i18nKey: 'nav_support', icon: Headset, href: '/support', section: 'core' },
  { title: 'Feedback', i18nKey: 'nav_feedback', icon: MessageCircle, href: '/feedback', section: 'core' },
  { title: 'Announcements', i18nKey: 'nav_announcements', icon: BellRing, href: '/announcements', section: 'core' },
  { title: 'Internal Chat', i18nKey: 'nav_internal_chat', icon: MessagesSquare, href: '/internal-chat', section: 'core' },

  { title: 'Resellers', i18nKey: 'nav_resellers', icon: UsersRound, href: '/reseller-manager', activePaths: ['/reseller-manager', '/resellers'], adminOnly: true, section: 'admin' },
  { title: 'Marketplace', i18nKey: 'nav_marketplace', icon: Store, href: '/admin/marketplace', adminOnly: true, section: 'admin' },
  { title: 'Auto-Pilot', i18nKey: 'nav_auto_pilot', icon: BotMessageSquare, href: '/auto-pilot', activePaths: ['/auto-pilot', '/auto-pilot/apk-pipeline', '/auto-pilot/system-monitor'], adminOnly: true, section: 'admin' },
  { title: 'APK Pipeline', i18nKey: 'nav_apk_pipeline', icon: Smartphone, href: '/auto-pilot/apk-pipeline', activePaths: ['/auto-pilot/apk-pipeline'], adminOnly: true, section: 'admin' },
  { title: 'Audit Logs', i18nKey: 'nav_audit_logs', icon: ScrollText, href: '/audit-logs', adminOnly: true, section: 'admin' },
  { title: 'System Health', i18nKey: 'nav_system_health', icon: HeartPulse, href: '/system-health', adminOnly: true, section: 'admin' },
  { title: 'Email Logs', i18nKey: 'nav_email_logs', icon: Mail, href: '/email-logs', adminOnly: true, section: 'admin' },
  { title: 'Retry Actions', i18nKey: 'nav_retry_actions', icon: RefreshCw, href: '/retry-actions', adminOnly: true, section: 'admin' },
  { title: 'Archive', i18nKey: 'nav_archive', icon: Archive, href: '/archive', adminOnly: true, section: 'admin' },
  { title: 'Bulk Actions', i18nKey: 'nav_bulk_actions', icon: ListChecks, href: '/bulk-actions', adminOnly: true, section: 'admin' },
  { title: 'Tagging', i18nKey: 'nav_tagging', icon: Tags, href: '/tags', adminOnly: true, section: 'admin' },
  { title: 'Achievements', i18nKey: 'nav_achievements', icon: Trophy, href: '/admin/achievements', adminOnly: true, section: 'admin' },
  { title: 'Settings', i18nKey: 'nav_settings', icon: Settings, href: '/settings', adminOnly: true, section: 'admin' },

  { title: 'SaaS AI', i18nKey: 'nav_saas_ai', icon: BrainCircuit, href: '/saas-ai-dashboard', section: 'ai' },
  { title: 'VALA Builder', i18nKey: 'nav_vala_builder', icon: Sparkles, href: '/vala-builder', section: 'ai' },
  { title: 'AI Chat', i18nKey: 'nav_ai_chat', icon: MessageSquareText, href: '/ai-chat', section: 'ai' },
  { title: 'AI APIs', i18nKey: 'nav_ai_apis', icon: ShieldCheck, href: '/ai-apis', adminOnly: true, section: 'ai' },

  { title: 'SEO & Leads', i18nKey: 'nav_seo_leads', icon: TrendingUp, href: '/seo-leads', section: 'marketing' },

  { title: 'Author Hub', i18nKey: 'nav_author_hub', icon: Briefcase, href: '/author', section: 'author' },
];

const sectionLabelKeys: Record<string, string> = {
  core: 'section_main',
  admin: 'section_admin',
  ai: 'section_ai_suite',
  marketing: 'section_marketing',
  author: 'section_author',
};

export function Sidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const { isSuperAdmin, signOut } = useAuth();
  const { config: roleConfig, isSimulating } = useRoleView();
  const { t } = useTranslation('common');

  const isItemActive = (item: NavItem) => {
    const paths = item.activePaths ?? [item.href];
    return paths.includes(location.pathname);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (isSimulating && roleConfig) {
      return roleConfig.allowedHrefs.includes(item.href);
    }
    return !item.adminOnly || isSuperAdmin;
  });

  // Group by section
  const grouped = filteredNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || 'core';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  // Apply role-specific section ordering when simulating.
  const sectionOrder =
    isSimulating && roleConfig
      ? roleConfig.sections.filter((s) => grouped[s]?.length)
      : Object.keys(grouped);
  const sections: Array<[string, NavItem[]]> = sectionOrder.map((s) => [s, grouped[s] || []]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-white/[0.06] transition-all duration-300 overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        background: 'linear-gradient(180deg, hsl(220, 65%, 10%) 0%, hsl(225, 70%, 6%) 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 w-full h-48 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 0%, hsl(215, 80%, 50%, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="flex h-full flex-col relative z-10">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <img src={saasValaLogo} alt="SaaS VALA" className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/10 shadow-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[hsl(225,70%,6%)] shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div>
                  <span className="font-display text-[15px] font-bold text-white tracking-tight leading-none">
                    SaaS VALA
                  </span>
                  <p className="text-[10px] text-white/40 font-medium mt-0.5">{t('nav_admin_panel')}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mx-auto"
              >
                <img src={saasValaLogo} alt="SaaS VALA" className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/10" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[hsl(225,70%,6%)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-none">
          {sections.map(([section, items]) => (
            <div key={section}>
              {/* Section label */}
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
                  {sectionLabelKeys[section] ? t(sectionLabelKeys[section]) : section}
                </p>
              )}
              {collapsed && <div className="h-px bg-white/[0.06] mx-2 mb-2" />}

              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive = isItemActive(item);
                  const Icon = item.icon;
                  const label = item.i18nKey ? t(item.i18nKey) : item.title;

                  const linkContent = (
                    <NavLink
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 relative group',
                        isActive
                          ? 'text-white'
                          : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, hsl(215, 60%, 28%, 0.8) 0%, hsl(215, 55%, 22%, 0.6) 100%)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.08)',
                      } : undefined}
                    >
                      {/* Active bar */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-[20%] bottom-[20%] w-[2.5px] rounded-r-full"
                          style={{
                            background: 'linear-gradient(180deg, hsl(215, 90%, 65%), hsl(215, 80%, 50%))',
                            boxShadow: '0 0 10px rgba(96, 165, 250, 0.6)',
                          }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-all duration-200',
                          isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/70'
                        )}
                      />

                      {!collapsed && (
                        <span className="truncate">{label}</span>
                      )}

                      {/* Hover glow */}
                      {isActive && !collapsed && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                      )}
                    </NavLink>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={`${item.href}-${item.title}`} delayDuration={0}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8} className="bg-[hsl(220,50%,15%)] text-white border-white/10 text-xs font-medium shadow-xl">
                          {label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={`${item.href}-${item.title}`}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] p-2 space-y-1">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                  'text-white/40 hover:bg-red-500/10 hover:text-red-400'
                )}
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{t('nav_sign_out')}</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" sideOffset={8} className="bg-[hsl(220,50%,15%)] text-white border-white/10 text-xs">
                {t('nav_sign_out')}
              </TooltipContent>
            )}
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className={cn(
              'w-full justify-center text-white/30 hover:bg-white/[0.05] hover:text-white/60 h-8',
              collapsed && 'px-0'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-xs">{t('nav_collapse')}</span>
              </>
            )}
          </Button>

          {!collapsed && (
            <p className="mt-2 pb-1 text-center text-[10px] text-white/20 font-medium">
              {t('nav_copyright')}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
