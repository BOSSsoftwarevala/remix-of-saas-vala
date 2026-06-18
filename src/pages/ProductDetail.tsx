import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, CreditCard, ExternalLink, Download, PlayCircle } from 'lucide-react';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { useMarketplaceActions } from '@/hooks/useMarketplaceActions';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { apkApi, type ApkDownloadResponse } from '@/lib/api';
import { formatLocalizedPrice } from '@/lib/locale';
import { isExpiredSignedUrl } from '@/lib/edgeGuards';
import { toast } from 'sonner';
import { createPressHandlers, executeButtonAction, getButtonInteractionClassName } from '@/lib/buttonEngine';
import { resolveSafeRoute } from '@/lib/routeRegistry';


function hasScreenshots(value: unknown): value is { screenshots?: unknown[] } {
  return typeof value === 'object' && value !== null && 'screenshots' in value;
}

function hasProductMeta(value: unknown): value is { deleted_at?: string | null; expires_at?: string | null; status?: string } {
  return typeof value === 'object' && value !== null;
}

export default function ProductDetail() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, loading } = useMarketplaceProducts();
  const { toggleItem, isInCart } = useCart();
  const { user } = useAuth();
  const { trackPromoClick, addToCart: addToCartServer } = useMarketplaceActions();
  const [previewMode, setPreviewMode] = useState(false);

  const product = useMemo(() => products.find((item) => item.id === id), [products, id]);
  const productMeta = hasProductMeta(product) ? (product as unknown as { deleted_at?: string | null; expires_at?: string | null; status?: string }) : undefined;
  const isDeleted = Boolean(productMeta?.deleted_at) || String(productMeta?.status || '').toLowerCase() === 'deleted';
  const isExpired = Boolean(productMeta?.expires_at) && new Date(String(productMeta?.expires_at)) <= new Date();
  const needsSubscriptionRedirect = !isDeleted && (product?.isAvailable === false || isExpired);
  const refCode = useMemo(() => new URLSearchParams(window.location.search).get('ref') || '', []);
  const trackedPromoRef = useRef('');

  useEffect(() => {
    if (!refCode) return;
    if (trackedPromoRef.current === refCode) return;
    trackedPromoRef.current = refCode;
    void trackPromoClick(refCode).catch(() => undefined);
    try { localStorage.setItem('sv_last_promo_ref', refCode); } catch {}
  }, [refCode, trackPromoClick]);



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <main className="pt-20 px-4 md:px-8">
          <p className="text-sm text-muted-foreground">{t('pd_loading')}</p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <main className="pt-20 px-4 md:px-8 space-y-4">
          <p className="text-sm text-muted-foreground">{t('pd_not_found')}</p>
          <Button onClick={() => navigate('/')}>{t('pd_go_marketplace')}</Button>
        </main>
      </div>
    );
  }

  if (isDeleted || product.status === 'draft') {
    return (
      <div className="min-h-screen bg-background">
        <MarketplaceHeader />
        <main className="pt-20 px-4 md:px-8 space-y-4">
          <p className="text-sm text-muted-foreground">{t('pd_unavailable')}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/marketplace')}>{t('pd_go_marketplace')}</Button>
            <Button variant="outline" onClick={() => navigate('/subscription')}>{t('pd_view_subscription')}</Button>
          </div>
        </main>
      </div>
    );
  }

  if (needsSubscriptionRedirect) {
    return <Navigate to="/subscription" replace />;
  }


  const handleBuyNow = () => {
    if (!user) {
      toast.error(t('pd_sign_in_continue'));
      navigate('/auth');
      return;
    }
    void executeButtonAction<void>({
      config: { action: 'BUY_NOW', route: '/checkout', api: '/payment/intent', debounceMs: 150, throttleMs: 200, idempotent: true, retries: 1, retryBackoffMs: 1000 },
      run: () => navigate(`${resolveSafeRoute('/checkout', '/')}?product_id=${encodeURIComponent(product.id)}`),
      validateResponse: false,
    });
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error(t('pd_sign_in_download'));
      navigate('/auth');
      return;
    }
    if (!product.apk_enabled) {
      toast.info(t('pd_coming_soon'));
      return;
    }
    try {
      const res = await executeButtonAction<ApkDownloadResponse>({
        config: { action: 'DOWNLOAD_APK', route: '/product/:id', api: `/apk/download/${product.id}`, debounceMs: 150, throttleMs: 200, idempotent: true, retries: 1, retryBackoffMs: 1000 },
        run: async () => apkApi.download(product.id),
      });
      if (!res) {
        toast.error(t('pd_download_failed'));
        return;
      }
      if (res?.allowed && (res?.download_url || res?.url)) {
        const link = String(res.download_url || res.url || '');
        if (!link || isExpiredSignedUrl(link)) {
          toast.error(t('pd_link_expired'));
          return;
        }
        window.open(link, '_blank');
        return;
      }
      toast.error(res?.message || t('pd_purchase_first'));
    } catch (_e) {
      toast.error(t('pd_download_failed'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <main className="pt-20 pb-10 px-4 md:px-8 max-w-4xl mx-auto space-y-6">
        <Button variant="outline" className={getButtonInteractionClassName()} {...createPressHandlers('product-detail-back', () => navigate(-1))}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('pd_back')}
        </Button>

        <section className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black text-foreground">{product.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{product.subtitle}</p>
            </div>
            <Badge variant="outline" className="text-base font-black">${Number(product.price || 0).toFixed(2)}</Badge>
          </div>

          {hasScreenshots(product) && Array.isArray((product as any).screenshots) && (product as any).screenshots.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {((product as any).screenshots as string[]).map((shot, idx) => (
                <div key={`screenshot-${idx}`} className="overflow-hidden rounded-lg border border-border/40">
                  <img src={shot} alt={t('pd_screenshot_alt', { n: idx + 1 })} className="w-full h-40 object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(product.features || []).map((feature, index) => (
              <Badge key={index} variant="secondary">{feature.text}</Badge>
            ))}
            {Array.isArray(product.tags) && product.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant={isInCart(product.id) ? 'secondary' : 'outline'}
              className={getButtonInteractionClassName()}
              {...createPressHandlers(`product-detail-cart-${product.id}`, () => {
                void executeButtonAction<void>({
                  config: { action: 'ADD_TO_CART', route: '/cart', api: '/marketplace/cart/add', debounceMs: 150, throttleMs: 200, idempotent: true, retries: 1, retryBackoffMs: 1000 },
                  run: async () => {
                    toggleItem({
                      id: product.id,
                      title: product.title,
                      subtitle: product.subtitle || '',
                      image: product.image || '',
                      price: product.price,
                      category: product.category || 'Software',
                    });
                    if (!isInCart(product.id) && user) {
                      await addToCartServer(product.id, 1);
                    }
                  },
                }).catch(() => {
                  toast.error(t('pd_cart_failed'));
                });
              })}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isInCart(product.id) ? t('pd_remove_from_cart') : t('pd_add_to_cart')}
            </Button>
            <Button className={getButtonInteractionClassName()} {...createPressHandlers(`product-detail-buy-${product.id}`, handleBuyNow)}>
              <CreditCard className="h-4 w-4 mr-2" /> {t('pd_buy_now')}
            </Button>
            <Button variant="secondary" className={getButtonInteractionClassName()} {...createPressHandlers(`product-detail-download-${product.id}`, () => { void handleDownload(); })} disabled={!product.apk_enabled}>
              <Download className="h-4 w-4 mr-2" /> {t('mp_download_apk')}
            </Button>
            {!!product.demoUrl && (
              <Button variant="outline" className={getButtonInteractionClassName()} {...createPressHandlers(`product-detail-demo-${product.id}`, () => {
                if (!product.demoUrl) return;
                window.open(product.demoUrl, '_blank', 'noopener,noreferrer');
              })}>
                <PlayCircle className="h-4 w-4 mr-2" /> {t('pd_live_demo')}
              </Button>
            )}
            <Button variant="outline" className={getButtonInteractionClassName()} {...createPressHandlers(`product-detail-preview-${product.id}`, () => setPreviewMode((v) => !v))}>
              {previewMode ? t('pd_preview_on') : t('pd_preview_off')}
            </Button>
            <Button variant="ghost" className={getButtonInteractionClassName()} {...createPressHandlers(`product-detail-access-${product.id}`, () => navigate(resolveSafeRoute(`/app/${product.id}`, '/')))}>
              <ExternalLink className="h-4 w-4 mr-2" /> {t('pd_access')}
            </Button>
          </div>
          {previewMode && (
            <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
              {t('pd_preview_hint')}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
