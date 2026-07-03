/**
 * Type-safe permission map for the MarketplaceAdmin page and the nested
 * Maestro panel. Every tab/section key is exported as a string-literal union
 * so a missing entry becomes a TypeScript build error instead of a silent
 * runtime hole.
 */

import type { RoleViewKey } from '@/contexts/RoleViewContext';

export const MARKETPLACE_ADMIN_TABS = [
  'settings',
  'products',
  'apk',
  'payments',
  'offers',
  'bulk',
  'maestro',
] as const;

export type MarketplaceAdminTabKey = (typeof MARKETPLACE_ADMIN_TABS)[number];

export const MAESTRO_SECTIONS = [
  'dashboard',
  'hero_banners',
  'categories',
  'walls',
  'homepage_rows',
  'placement',
  'top_bar',
  'top_bar_manager',
  'footer',
  'filters',
  'layout_order',
  'card_manager',
  'cards',
  'actions',
  'offers',
  'popups',
  'partners',
  'trust',
  'reviews',
  'faq',
  'contact',
  'search',
  'ai',
  'sticky',
  'upcoming',
  'notifications',
  'analytics',
  'seo',
  'deployment',
  'integrity',
  'micro_features',
  'toolkit',
  'settings',
] as const;

export type MaestroSectionKey = (typeof MAESTRO_SECTIONS)[number];

/** Roles considered by MarketplaceAdmin permission checks. */
export type EffectiveRole =
  | 'super_admin'
  | 'reseller'
  | RoleViewKey;

/**
 * Which MarketplaceAdmin tabs each role may see.
 * A missing entry === deny-all.
 */
export const TAB_PERMISSIONS: Record<EffectiveRole, readonly MarketplaceAdminTabKey[]> = {
  super_admin: MARKETPLACE_ADMIN_TABS,
  reseller: ['products', 'offers', 'bulk'],
  product_manager: ['products', 'apk', 'offers', 'bulk'],
  server_manager: ['apk', 'settings'],
  user_dashboard: [],
  reseller_manager: ['products', 'payments', 'offers'],
  reseller_user: ['products', 'offers'],
  seo_lead_manager: ['maestro'],
  author: ['products', 'apk', 'offers'],
};

/**
 * Which Maestro sub-sections each role may see.
 */
export const MAESTRO_PERMISSIONS: Record<EffectiveRole, readonly MaestroSectionKey[]> = {
  super_admin: MAESTRO_SECTIONS,
  reseller: ['dashboard', 'analytics'],
  product_manager: [
    'dashboard', 'card_manager', 'cards', 'categories', 'walls',
    'homepage_rows', 'placement', 'layout_order', 'filters', 'analytics',
  ],
  server_manager: ['dashboard', 'deployment', 'integrity', 'toolkit', 'settings'],
  user_dashboard: [],
  reseller_manager: ['dashboard', 'analytics', 'partners', 'offers'],
  reseller_user: ['dashboard', 'offers'],
  seo_lead_manager: [
    'dashboard', 'seo', 'analytics', 'search', 'notifications', 'popups', 'offers',
  ],
  author: ['dashboard', 'cards', 'card_manager', 'reviews', 'faq', 'analytics'],
};

export function resolveEffectiveRole(
  baseRole: 'super_admin' | 'reseller' | null,
  simulated: RoleViewKey | null,
): EffectiveRole {
  if (simulated) return simulated;
  return baseRole ?? 'reseller';
}

export function canSeeTab(role: EffectiveRole, tab: MarketplaceAdminTabKey): boolean {
  return (TAB_PERMISSIONS[role] ?? []).includes(tab);
}

export function canSeeMaestroSection(role: EffectiveRole, section: MaestroSectionKey): boolean {
  return (MAESTRO_PERMISSIONS[role] ?? []).includes(section);
}

/** i18n keys colocated with permission keys so translations stay in sync. */
export const TAB_I18N_KEYS: Record<MarketplaceAdminTabKey, { key: string; fallback: string }> = {
  settings: { key: 'ma_tab_settings', fallback: 'Settings' },
  products: { key: 'ma_tab_products', fallback: 'Products' },
  apk:      { key: 'ma_tab_apk',      fallback: 'APK' },
  payments: { key: 'ma_tab_payments', fallback: 'Payments' },
  offers:   { key: 'ma_tab_offers',   fallback: 'Offers' },
  bulk:     { key: 'ma_tab_bulk',     fallback: 'Bulk' },
  maestro:  { key: 'ma_tab_maestro',  fallback: 'Maestro' },
};

export const MAESTRO_I18N_KEYS: Record<MaestroSectionKey, { key: string; fallback: string }> = {
  dashboard:      { key: 'ms_dashboard',      fallback: 'Dashboard' },
  hero_banners:   { key: 'ms_hero_banners',   fallback: 'Hero Banners' },
  categories:     { key: 'ms_categories',     fallback: 'Categories' },
  walls:          { key: 'ms_walls',          fallback: 'Walls' },
  homepage_rows:  { key: 'ms_homepage_rows',  fallback: 'Homepage Rows' },
  placement:      { key: 'ms_placement',      fallback: 'Placement' },
  top_bar:        { key: 'ms_top_bar',        fallback: 'Top Bar' },
  top_bar_manager:{ key: 'ms_top_bar_manager',fallback: 'Top Bar Manager' },
  footer:         { key: 'ms_footer',         fallback: 'Footer' },
  filters:        { key: 'ms_filters',        fallback: 'Filters' },
  layout_order:   { key: 'ms_layout_order',   fallback: 'Layout Order' },
  card_manager:   { key: 'ms_card_manager',   fallback: 'Card Manager' },
  cards:          { key: 'ms_cards',          fallback: 'Cards' },
  actions:        { key: 'ms_actions',        fallback: 'Actions' },
  offers:         { key: 'ms_offers',         fallback: 'Offers' },
  popups:         { key: 'ms_popups',         fallback: 'Popups' },
  partners:       { key: 'ms_partners',       fallback: 'Partners' },
  trust:          { key: 'ms_trust',          fallback: 'Trust' },
  reviews:        { key: 'ms_reviews',        fallback: 'Reviews' },
  faq:            { key: 'ms_faq',            fallback: 'FAQ' },
  contact:        { key: 'ms_contact',        fallback: 'Contact' },
  search:         { key: 'ms_search',         fallback: 'Search' },
  ai:             { key: 'ms_ai',             fallback: 'AI Assistant' },
  sticky:         { key: 'ms_sticky',         fallback: 'Sticky' },
  upcoming:       { key: 'ms_upcoming',       fallback: 'Upcoming' },
  notifications:  { key: 'ms_notifications',  fallback: 'Notifications' },
  analytics:      { key: 'ms_analytics',      fallback: 'Analytics' },
  seo:            { key: 'ms_seo',            fallback: 'SEO' },
  deployment:     { key: 'ms_deployment',     fallback: 'Deployment' },
  integrity:      { key: 'ms_integrity',      fallback: 'Integrity' },
  micro_features: { key: 'ms_micro_features', fallback: 'Micro Features' },
  toolkit:        { key: 'ms_toolkit',        fallback: 'Toolkit' },
  settings:       { key: 'ms_settings',       fallback: 'Settings' },
};