/**
 * Automated build check: fails if a Maestro section export is renamed or
 * removed, or if MaestroPanel / MarketplaceAdmin lose their default/named
 * exports. Runs under `bunx vitest run` and `npm run test`.
 */

import { describe, expect, it } from 'vitest';
import * as Sections from '@/components/marketplace-admin/sections';
import * as Maestro from '@/components/marketplace-admin/MaestroPanel';
import * as Admin from '@/pages/MarketplaceAdmin';
import {
  MARKETPLACE_ADMIN_TABS,
  MAESTRO_SECTIONS,
  TAB_I18N_KEYS,
  MAESTRO_I18N_KEYS,
  TAB_PERMISSIONS,
  MAESTRO_PERMISSIONS,
  canSeeTab,
  canSeeMaestroSection,
} from '@/lib/marketplaceAdminPermissions';

const REQUIRED_SECTION_EXPORTS = [
  'HeroBannerSection', 'CategoriesSection', 'WallsSection', 'PlacementSection',
  'CardsSection', 'ActionsSection', 'OffersSection', 'PopupsSection',
  'PartnersSection', 'TrustSection', 'ReviewsSection', 'FaqSection',
  'ContactSection', 'SearchSection', 'AiSection', 'StickySection',
  'AnalyticsSection', 'SettingsSection', 'SeoSection', 'DeploymentSection',
  'IntegritySection', 'MicroFeaturesSection', 'ToolkitSection',
  'TopBarManagerSection', 'HomepageRowsSection', 'CardManagerSection',
  'StorefrontTopBarSection', 'FooterSection', 'FiltersSection',
  'UpcomingSection', 'NotificationsSection', 'LayoutOrderSection',
];

describe('marketplace-admin module exports', () => {
  it('exposes every required section as a function component', () => {
    for (const name of REQUIRED_SECTION_EXPORTS) {
      const exp = (Sections as Record<string, unknown>)[name];
      expect(typeof exp, `missing export: ${name}`).toBe('function');
    }
  });

  it('MaestroPanel has both named and default exports', () => {
    expect(typeof Maestro.MaestroPanel).toBe('function');
    expect(typeof Maestro.default).toBe('function');
  });

  it('MarketplaceAdmin page exports a default component', () => {
    expect(typeof Admin.default).toBe('function');
  });

  it('every tab / section key has an i18n mapping', () => {
    for (const tab of MARKETPLACE_ADMIN_TABS) {
      expect(TAB_I18N_KEYS[tab], `missing i18n key for tab ${tab}`).toBeTruthy();
    }
    for (const section of MAESTRO_SECTIONS) {
      expect(MAESTRO_I18N_KEYS[section], `missing i18n key for section ${section}`).toBeTruthy();
    }
  });

  it('super_admin sees all tabs and all sections', () => {
    for (const tab of MARKETPLACE_ADMIN_TABS) {
      expect(canSeeTab('super_admin', tab)).toBe(true);
    }
    for (const section of MAESTRO_SECTIONS) {
      expect(canSeeMaestroSection('super_admin', section)).toBe(true);
    }
  });

  it('reseller cannot access maestro or destructive settings tab', () => {
    expect(TAB_PERMISSIONS.reseller).not.toContain('settings');
    expect(TAB_PERMISSIONS.reseller).not.toContain('maestro');
    expect(MAESTRO_PERMISSIONS.reseller.length).toBeLessThan(MAESTRO_SECTIONS.length);
  });
});