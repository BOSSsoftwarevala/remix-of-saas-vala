import { test, expect, type Page } from '@playwright/test';

/**
 * Covers the "browser can't reach Supabase auth directly" path: ad-blocker
 * rules, ISP DNS blocks or SSL inspection that kill fetch() to /auth/v1/*
 * before the request leaves the machine. Every direct auth call is aborted at
 * the network layer, so the only way in is the server-side auth-proxy edge
 * function ("Try via secure proxy").
 *
 * Needs a real backend, so credentials come from the environment:
 *   E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD  -> login
 *   E2E_RECOVER_EMAIL                                 -> recover (defaults to the above)
 *   E2E_BASE_URL / E2E_START_WEB_SERVER               -> see playwright.config.ts
 */

const email = process.env.E2E_SUPER_ADMIN_EMAIL;
const password = process.env.E2E_SUPER_ADMIN_PASSWORD;
const recoverEmail = process.env.E2E_RECOVER_EMAIL || email;

/** Direct auth endpoints the browser is assumed to be blocked from. */
function isBlockedAuthCall(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!/\/auth\/v1\//.test(url.pathname)) return false;
  // Only the password grant is blocked — refreshes keep working so the
  // session the proxy hands back can still be applied locally.
  if (url.pathname.endsWith('/token')) {
    return url.searchParams.get('grant_type') === 'password';
  }
  return url.pathname.endsWith('/health') || url.pathname.endsWith('/recover');
}

async function blockDirectAuth(page: Page) {
  await page.route('**/*', (route) =>
    isBlockedAuthCall(route.request().url()) ? route.abort('failed') : route.continue(),
  );
}

function track(page: Page, pattern: RegExp) {
  const seen: string[] = [];
  page.on('request', (req) => {
    if (pattern.test(req.url())) seen.push(req.url());
  });
  return seen;
}

test.describe('auth-proxy fallback when direct Supabase auth is blocked', () => {
  test.skip(
    !email || !password,
    'Set E2E_SUPER_ADMIN_EMAIL and E2E_SUPER_ADMIN_PASSWORD to run this suite',
  );

  test('reports a blocked connection before any credentials are typed', async ({ page }) => {
    await blockDirectAuth(page);
    await page.goto('/auth');

    const panel = page.getByTestId('auth-panel');
    await expect(panel).toBeVisible();
    await expect(page.getByTestId('auth-panel-status')).toContainText(/blocked|blocking/i);
    await expect(page.getByRole('button', { name: /retry health check/i })).toBeVisible();
    // No credential-specific advice while nothing has been submitted yet.
    await expect(panel).not.toContainText(/incorrect/i);
  });

  test('signs in through the secure proxy after direct token calls fail', async ({ page }) => {
    const failedDirect = track(page, /\/auth\/v1\/token/);
    const proxied = track(page, /\/functions\/v1\/auth-proxy\/token/);

    await blockDirectAuth(page);
    await page.goto('/auth');
    await expect(page.getByTestId('auth-panel-status')).toContainText(/blocked|blocking/i);

    await page.fill('#login-email', email!);
    await page.fill('#login-password', password!);
    await page.press('#login-password', 'Enter');

    const proxyButton = page.getByRole('button', { name: /try via secure proxy/i });
    await expect(proxyButton).toBeVisible({ timeout: 20_000 });
    await proxyButton.click();

    await expect(page.getByText(/signed in via proxy/i).first()).toBeVisible({ timeout: 25_000 });
    expect(failedDirect.length, 'direct /auth/v1/token should have been attempted').toBeGreaterThan(0);
    expect(proxied.length, 'auth-proxy token call should have been made').toBeGreaterThan(0);

    // The session is really applied: a protected route no longer bounces back to /auth.
    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/auth$/, { timeout: 20_000 });
  });

  test('sends the password-reset email through the secure proxy', async ({ page }) => {
    const failedDirect = track(page, /\/auth\/v1\/recover/);
    const proxied = track(page, /\/functions\/v1\/auth-proxy\/recover/);

    await blockDirectAuth(page);
    await page.goto('/auth');

    await page.getByRole('button', { name: /forgot password\?/i }).click();
    await page.fill('#forgot-email', recoverEmail!);
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(page.getByText(/email sent/i).first()).toBeVisible({ timeout: 25_000 });
    expect(failedDirect.length, 'direct /auth/v1/recover should have been attempted').toBeGreaterThan(0);
    expect(proxied.length, 'auth-proxy recover call should have been made').toBeGreaterThan(0);
  });
});
