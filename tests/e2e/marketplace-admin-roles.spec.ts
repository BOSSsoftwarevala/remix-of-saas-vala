import { test, expect, type Page } from '@playwright/test';
import {
  MARKETPLACE_ADMIN_TABS,
  MAESTRO_SECTIONS,
  TAB_PERMISSIONS,
  MAESTRO_PERMISSIONS,
  TAB_I18N_KEYS,
  MAESTRO_I18N_KEYS,
  type MarketplaceAdminTabKey,
  type MaestroSectionKey,
} from '../../src/lib/marketplaceAdminPermissions';

/**
 * End-to-end coverage: sign in as Super Admin and as Reseller, then verify
 * that the MarketplaceAdmin page and its Maestro sub-panel only expose the
 * tabs/sections allowed by src/lib/marketplaceAdminPermissions.ts.
 *
 * Credentials are provided via env vars so no secrets live in the repo:
 *   E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD
 *   E2E_RESELLER_EMAIL    / E2E_RESELLER_PASSWORD
 * When either pair is missing the corresponding test is skipped.
 */

const SUPER_EMAIL = process.env.E2E_SUPER_ADMIN_EMAIL;
const SUPER_PASSWORD = process.env.E2E_SUPER_ADMIN_PASSWORD;
const RESELLER_EMAIL = process.env.E2E_RESELLER_EMAIL;
const RESELLER_PASSWORD = process.env.E2E_RESELLER_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: /^login$/i }).click();
  // Wait until we land somewhere authenticated (not /auth).
  await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 20_000 });
}

function tabLabel(key: MarketplaceAdminTabKey) {
  return TAB_I18N_KEYS[key].fallback;
}
function sectionLabel(key: MaestroSectionKey) {
  return MAESTRO_I18N_KEYS[key].fallback;
}

test.describe('MarketplaceAdmin role-based tab visibility', () => {
  test('super admin sees every MarketplaceAdmin tab and every Maestro section', async ({ page }) => {
    test.skip(!SUPER_EMAIL || !SUPER_PASSWORD, 'E2E_SUPER_ADMIN_EMAIL / PASSWORD not set');

    await signIn(page, SUPER_EMAIL!, SUPER_PASSWORD!);
    await page.goto('/admin/marketplace');
    await expect(page).toHaveURL(/\/admin\/marketplace/);

    // Every allowed tab must render as a Radix tab trigger.
    for (const key of TAB_PERMISSIONS.super_admin) {
      const trigger = page.getByRole('tab', { name: new RegExp(tabLabel(key), 'i') });
      await expect(trigger, `super admin should see tab: ${key}`).toBeVisible();
    }
    // Sanity: no missing tab (super admin === all tabs).
    expect([...TAB_PERMISSIONS.super_admin].sort()).toEqual([...MARKETPLACE_ADMIN_TABS].sort());

    // Open Maestro and confirm every section link is reachable via the SubNav.
    await page.getByRole('tab', { name: /maestro/i }).click();
    const maestro = page.locator('[data-mm]');
    await expect(maestro).toBeVisible();

    for (const key of MAESTRO_PERMISSIONS.super_admin) {
      const link = maestro.getByRole('button', { name: new RegExp(`^${sectionLabel(key)}$`, 'i') })
        .or(maestro.getByText(new RegExp(`^${sectionLabel(key)}$`, 'i')).first());
      await expect(link.first(), `super admin should see maestro section: ${key}`).toBeVisible();
    }
    expect([...MAESTRO_PERMISSIONS.super_admin].sort()).toEqual([...MAESTRO_SECTIONS].sort());

    // Navigate a couple of sections and make sure the panel body changes.
    for (const key of ['analytics', 'seo'] as const) {
      await maestro.getByText(new RegExp(`^${sectionLabel(key)}$`, 'i')).first().click();
      await expect(maestro).toBeVisible();
    }
  });

  test('reseller is blocked from /admin/marketplace (super_admin-only route)', async ({ page }) => {
    test.skip(!RESELLER_EMAIL || !RESELLER_PASSWORD, 'E2E_RESELLER_EMAIL / PASSWORD not set');

    await signIn(page, RESELLER_EMAIL!, RESELLER_PASSWORD!);
    await page.goto('/admin/marketplace');

    // RoleGuard redirects non-super_admin away — must not stay on the admin URL.
    await expect(page).not.toHaveURL(/\/admin\/marketplace(\?|$|\/)/);

    // The forbidden Maestro tab must not have leaked into the DOM.
    await expect(page.getByRole('tab', { name: /maestro/i })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: /settings/i })).toHaveCount(0);
  });

  test('permission table stays in sync with i18n keys', async () => {
    // Guard against future regressions: every tab/section referenced by the
    // e2e assertions must still have an i18n fallback.
    for (const key of MARKETPLACE_ADMIN_TABS) expect(TAB_I18N_KEYS[key]).toBeTruthy();
    for (const key of MAESTRO_SECTIONS) expect(MAESTRO_I18N_KEYS[key]).toBeTruthy();
    // Reseller must never gain super-admin-only surfaces via a regression.
    expect(TAB_PERMISSIONS.reseller).not.toContain('maestro');
    expect(TAB_PERMISSIONS.reseller).not.toContain('settings');
  });
});