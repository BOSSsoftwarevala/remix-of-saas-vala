import { AlertTriangle, Wifi, ShieldOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type AuthDiagnostics = {
  endpoint: string;
  message: string;
  kind: 'network' | 'adblock' | 'cors' | 'credentials' | 'unknown';
  healthBlocked?: boolean;
};

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

export function AuthDiagnosticsPanel({
  diagnostics,
  onRetry,
  onUseProxy,
  proxying,
}: {
  diagnostics: AuthDiagnostics;
  onRetry: () => void;
  onUseProxy?: () => void;
  proxying?: boolean;
}) {
  const Icon = ICONS[diagnostics.kind];
  const showProxy = diagnostics.kind !== 'credentials' && !!onUseProxy;
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 space-y-3 text-left">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">Login couldn't reach the server</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-mono">{diagnostics.endpoint}</span>
            {' — '}
            {diagnostics.message}
          </p>
        </div>
      </div>

      <ul className="text-xs text-muted-foreground space-y-1 pl-8 list-disc marker:text-destructive/60">
        {FIXES[diagnostics.kind].map((fix) => (
          <li key={fix}>{fix}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="button" size="sm" variant="outline" onClick={onRetry} className="h-8 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
        {showProxy && (
          <Button type="button" size="sm" onClick={onUseProxy} disabled={proxying} className="h-8">
            {proxying ? 'Trying secure proxy…' : 'Try via secure proxy'}
          </Button>
        )}
      </div>
    </div>
  );
}