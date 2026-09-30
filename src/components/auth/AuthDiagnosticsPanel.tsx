import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Loader2,
  RefreshCw,
  ShieldOff,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatAuthHealthReport,
  getAuthHealthReport,
  type AuthCheckName,
  type FailureMode,
  type HealthResult,
} from '@/lib/authHealth';

export type AuthDiagnostics = {
  endpoint: string;
  message: string;
  kind: 'network' | 'adblock' | 'cors' | 'credentials' | 'unknown';
  healthBlocked?: boolean;
  /** Which check produced this — shown in the detail line. */
  check?: AuthCheckName;
  failureMode?: FailureMode;
  durationMs?: number;
};

export type AuthConnectionState = 'checking' | 'ok' | 'blocked';

const FIXES: Record<AuthDiagnostics['kind'], string[]> = {
  network: [
    'Check your internet connection and try again.',
    'Disable any VPN or proxy that may be routing traffic.',
    'Retry in an incognito window with all extensions disabled.',
  ],
  adblock: [
    'Disable ad-blockers (uBlock Origin, Brave Shields, AdGuard) for this site.',
    'Whitelist *.supabase.co in your blocker filter lists.',
    'Try a different browser or incognito mode without extensions.',
  ],
  cors: [
    'Corporate firewall or SSL inspection may be stripping CORS headers.',
    'Switch to a different network (mobile hotspot) to confirm.',
    'Ask IT to allow requests to *.supabase.co.',
  ],
  credentials: [
    'Double-check the email and password (case-sensitive).',
    'Use "Forgot Password?" to reset if you\'re unsure.',
  ],
  unknown: [
    'Refresh the page and try again.',
    'Clear site data (Application → Storage → Clear).',
    'Unregister service workers (DevTools → Application → Service Workers).',
  ],
};

const ICONS = {
  network: Wifi,
  adblock: ShieldOff,
  cors: ShieldOff,
  credentials: AlertTriangle,
  unknown: AlertTriangle,
};

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * One place to read connection status before submitting credentials:
 * a single status summary, the failing check/endpoint with timing, and a
 * "Retry health check" action that re-runs the probe.
 */
export function AuthDiagnosticsPanel({
  state,
  summary,
  diagnostics,
  lastCheck,
  checking,
  onRetryHealth,
  onUseProxy,
  proxying,
}: {
  state: AuthConnectionState;
  summary: string;
  diagnostics: AuthDiagnostics | null;
  lastCheck: HealthResult | null;
  checking: boolean;
  onRetryHealth: () => void;
  onUseProxy?: () => void;
  proxying?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const blocked = state === 'blocked';
  const ok = state === 'ok';

  const detail = (() => {
    const check = diagnostics?.check ?? lastCheck?.check;
    const endpoint = diagnostics?.endpoint ?? lastCheck?.endpoint;
    const mode = diagnostics?.failureMode ?? lastCheck?.failureMode;
    const status = lastCheck?.status;
    const parts = [
      check ? `check: ${check}` : '',
      endpoint ? `endpoint: ${endpoint}` : '',
      mode && mode !== 'ok' ? `reason: ${mode}` : '',
      status ? `http: ${status}` : '',
    ].filter(Boolean);
    return parts.join('  ·  ');
  })();

  const durationMs = diagnostics?.durationMs ?? lastCheck?.durationMs;
  const ttfb = lastCheck?.timings?.ttfbMs;
  const failures = getAuthHealthReport().filter((e) => !e.ok).length;
  const showProxy = blocked && diagnostics?.kind !== 'credentials' && !!onUseProxy;
  const fixes = blocked && diagnostics ? FIXES[diagnostics.kind] : [];
  const HeadlineIcon = checking ? Loader2 : ok ? CheckCircle2 : blocked ? WifiOff : AlertTriangle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'rounded-xl border p-4 space-y-3 text-left transition-colors',
        ok && 'border-primary/30 bg-primary/5',
        blocked && 'border-destructive/40 bg-destructive/10',
        state === 'checking' && 'border-border/60 bg-muted/30',
      )}
    >
      <div className="flex items-start gap-3">
        <HeadlineIcon
          className={cn(
            'h-5 w-5 shrink-0 mt-0.5',
            ok && 'text-primary',
            blocked && 'text-destructive',
            state === 'checking' && 'animate-spin text-muted-foreground',
          )}
        />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', ok ? 'text-foreground' : blocked ? 'text-destructive' : 'text-muted-foreground')}>
            {summary}
          </p>
          {detail && (
            <p className="text-[11px] font-mono text-muted-foreground mt-1 break-words leading-relaxed">{detail}</p>
          )}
        </div>
        {durationMs !== undefined && !checking && (
          <span className="shrink-0 rounded-md border border-border/50 bg-background/60 px-2 py-1 text-[11px] font-mono text-muted-foreground">
            {Math.round(durationMs)} ms{ttfb !== undefined ? ` · ttfb ${Math.round(ttfb)} ms` : ''}
          </span>
        )}
      </div>

      {fixes.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-1 pl-8 list-disc marker:text-destructive/60">
          {fixes.map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant={ok ? 'ghost' : 'outline'}
          onClick={onRetryHealth}
          disabled={checking}
          className="h-8 gap-1.5"
        >
          {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {checking ? 'Checking…' : 'Retry health check'}
        </Button>
        {showProxy && (
          <Button type="button" size="sm" onClick={onUseProxy} disabled={proxying} className="h-8">
            {proxying ? 'Trying secure proxy…' : 'Try via secure proxy'}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => {
            copyText(formatAuthHealthReport())
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              })
              .catch(() => undefined);
          }}
        >
          <ClipboardCopy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy diagnostics'}
        </Button>
        {!ok && failures > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {failures} failed attempt{failures > 1 ? 's' : ''} captured this session
          </span>
        )}
      </div>
    </div>
  );
}
