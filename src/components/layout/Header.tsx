import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Search, Bell, User, Settings, LogOut, ShoppingCart, Sparkles, Moon, Sun, Monitor } from 'lucide-react';
import { WalletHeaderButton } from '@/components/wallet/WalletHeaderButton';
import { useCart } from '@/hooks/useCart';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { RoleSwitcher } from '@/components/layout/RoleSwitcher';
import { LanguageSwitcher } from '@/components/global/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const pageTitleKeys: Record<string, string> = {
  '/': 'page_marketplace',
  '/dashboard': 'page_dashboard',
  '/products': 'page_products',
  '/admin/marketplace': 'page_admin_marketplace',
  '/keys': 'page_keys',
  '/servers': 'page_servers',
  '/ai-chat': 'page_ai_chat',
  '/saas-ai-dashboard': 'page_saas_ai',
  '/ai-apis': 'page_ai_apis',
  '/wallet': 'page_wallet',
  '/seo-leads': 'page_seo_leads',
  '/reseller-manager': 'page_resellers',
  '/resellers': 'page_resellers',
  '/audit-logs': 'page_audit_logs',
  '/system-health': 'page_system_health',
  '/settings': 'page_settings',
  '/support': 'page_support',
  '/support/ticket': 'page_support_ticket',
  '/feedback': 'page_feedback',
  '/announcements': 'page_announcements',
  '/dashboard/downloads': 'page_downloads',
  '/favorites': 'page_favorites',
  '/recent': 'page_recent',
  '/onboarding': 'page_onboarding',
  '/email-logs': 'page_email_logs',
  '/retry-actions': 'page_retry_actions',
  '/archive': 'page_archive',
  '/bulk-actions': 'page_bulk_actions',
  '/tags': 'page_tags',
  '/education': 'page_education',
  '/role-detail': 'page_role_detail',
  '/automation': 'page_auto_pilot',
  '/auto-pilot': 'page_auto_pilot',
  '/auto-pilot/apk-pipeline': 'page_apk_pipeline',
  '/auto-pilot/system-monitor': 'page_system_monitor',
  '/apk-pipeline': 'page_apk_pipeline',
  '/vala-builder': 'page_vala_builder',
};

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, signOut, isSuperAdmin } = useAuth();
  const { count: cartCount } = useCart();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('common');

  const titleKey = pageTitleKeys[location.pathname];
  const pageTitle = titleKey ? t(titleKey) : 'SaaS VALA';
  const canGoBack = location.pathname !== '/';
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';
  const broadcast = localStorage.getItem('sv_admin_broadcast') || '';

  return (
    <header className="sticky top-0 z-30 border-b border-border/30 bg-background/80 backdrop-blur-2xl">
      {broadcast && (
        <div className="h-7 px-5 flex items-center bg-primary/10 text-primary text-xs border-b border-primary/20">
          {broadcast}
        </div>
      )}
      <div className="flex h-14 items-center justify-between px-5">
      <div className="flex items-center gap-3">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
            {pageTitle}
          </h1>
          {isSuperAdmin && (
            <Badge className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              {t('header_admin')}
            </Badge>
          )}
          {role === 'reseller' && (
            <Badge variant="outline" className="text-[10px] border-secondary/30 text-secondary bg-secondary/5 px-1.5 py-0">
              {t('header_reseller')}
            </Badge>
          )}
        </div>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder={t('header_search_placeholder')}
            className="pl-9 h-8 text-sm bg-muted/20 border-border/30 focus:border-primary/40 focus:bg-muted/40 rounded-lg transition-all duration-200"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Cart */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={() => navigate('/cart')}
        >
          <ShoppingCart className="h-4 w-4" />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center shadow-sm"
            >
              {cartCount > 9 ? '9+' : cartCount}
            </motion.span>
          )}
        </Button>

        <WalletHeaderButton />

        {/* 125+ language switcher */}
        <LanguageSwitcher />

        {/* Super Admin: switch dashboard role view */}
        <RoleSwitcher />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground h-8 w-8"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
            3
          </span>
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-border/40 mx-1.5" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8 ring-2 ring-primary/10 hover:ring-primary/25 transition-all duration-200">
                <AvatarImage src="" alt={user?.email || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 bg-popover/95 backdrop-blur-xl border-border/40 shadow-xl" align="end" sideOffset={8}>
            <DropdownMenuLabel className="font-normal py-2">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.email}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                {role?.replace('_', ' ')}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem className="cursor-pointer text-sm py-2" onClick={() => navigate('/settings')}>
              <User className="mr-2 h-3.5 w-3.5" />
              {t('header_profile')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-sm py-2" onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-3.5 w-3.5" />
              {t('header_settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem className="cursor-pointer text-sm py-2" onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-3.5 w-3.5" />
              {theme === 'light' ? t('header_theme_light_active') : t('header_theme_light_switch')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-sm py-2" onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-3.5 w-3.5" />
              {theme === 'dark' ? t('header_theme_dark_active') : t('header_theme_dark_switch')}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-sm py-2" onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-3.5 w-3.5" />
              {theme === 'system' ? t('header_theme_system_active') : t('header_theme_system_use')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive text-sm py-2"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              {t('header_signout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </header>
  );
}
