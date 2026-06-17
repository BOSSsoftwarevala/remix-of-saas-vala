import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, ArrowRight, Play, Rocket, Clock, ShieldCheck,
  BadgeCheck, Sparkles, Cpu, Building2, Layers, Tag, Briefcase, Handshake, Megaphone,
  GraduationCap, Zap, Globe2, Lock, Boxes, Crown,
} from 'lucide-react';

// ============================================================
// PROMO HERO BANNER — ported from Command Center marketplace.
// Translation-ready (i18n keys with English defaults). All CTAs
// route to verified Software Vala routes.
// ============================================================

type Banner = {
  id: string;
  kickerKey: string;
  kickerDefault: string;
  headlineKey: string;
  headlineDefault: string;
  subKey: string;
  subDefault: string;
  cta: { labelKey: string; labelDefault: string; href: string };
  secondary?: { labelKey: string; labelDefault: string; href: string };
  icon: typeof Rocket;
  bg: string;
  accent: string;
  ring: string;
  badge: string;
};

const BANNERS: Banner[] = [
  { id: 'catalog-12k', kickerKey: 'banner.catalog.kicker', kickerDefault: 'Mega Catalog', headlineKey: 'banner.catalog.headline', headlineDefault: '12,000+ Software Solutions Available', subKey: 'banner.catalog.sub', subDefault: 'Every category. Every industry. One marketplace built for scale.', cta: { labelKey: 'banner.catalog.cta', labelDefault: 'Browse Catalog', href: '/' }, secondary: { labelKey: 'banner.catalog.cta2', labelDefault: 'View Categories', href: '/' }, icon: Boxes, bg: 'from-[hsl(220_60%_8%)] via-[hsl(225_55%_12%)] to-[hsl(230_65%_16%)]', accent: 'text-cyan-300', ring: 'border-cyan-400/40', badge: 'bg-cyan-500/15 text-cyan-200' },
  { id: 'lifetime-249', kickerKey: 'banner.lifetime.kicker', kickerDefault: 'Limited Offer', headlineKey: 'banner.lifetime.headline', headlineDefault: 'Lifetime Access Starting $249', subKey: 'banner.lifetime.sub', subDefault: 'Pay once. Own forever. No subscriptions. No renewals.', cta: { labelKey: 'banner.lifetime.cta', labelDefault: 'Claim Lifetime Deal', href: '/subscription' }, secondary: { labelKey: 'banner.lifetime.cta2', labelDefault: 'See Pricing', href: '/subscription' }, icon: Crown, bg: 'from-[hsl(35_80%_10%)] via-[hsl(28_75%_14%)] to-[hsl(15_80%_18%)]', accent: 'text-amber-300', ring: 'border-amber-400/40', badge: 'bg-amber-500/15 text-amber-200' },
  { id: 'delivery-2h', kickerKey: 'banner.delivery.kicker', kickerDefault: 'Fast Delivery', headlineKey: 'banner.delivery.headline', headlineDefault: 'Delivery Within 2 Hours', subKey: 'banner.delivery.sub', subDefault: 'Instant provisioning. Live credentials within 120 minutes of purchase.', cta: { labelKey: 'banner.delivery.cta', labelDefault: 'Buy & Deploy', href: '/' }, icon: Clock, bg: 'from-[hsl(160_70%_8%)] via-[hsl(165_65%_12%)] to-[hsl(170_75%_16%)]', accent: 'text-emerald-300', ring: 'border-emerald-400/40', badge: 'bg-emerald-500/15 text-emerald-200' },
  { id: 'no-advance', kickerKey: 'banner.noadvance.kicker', kickerDefault: 'Risk Free', headlineKey: 'banner.noadvance.headline', headlineDefault: 'No Advance Payment Required', subKey: 'banner.noadvance.sub', subDefault: 'Try first. Pay after demo approval. Zero upfront commitment.', cta: { labelKey: 'banner.noadvance.cta', labelDefault: 'Request Demo', href: '/support' }, icon: ShieldCheck, bg: 'from-[hsl(210_60%_8%)] via-[hsl(215_55%_12%)] to-[hsl(220_60%_16%)]', accent: 'text-sky-300', ring: 'border-sky-400/40', badge: 'bg-sky-500/15 text-sky-200' },
  { id: 'no-hidden', kickerKey: 'banner.transparent.kicker', kickerDefault: 'Transparent Pricing', headlineKey: 'banner.transparent.headline', headlineDefault: 'No Hidden Charges. Ever.', subKey: 'banner.transparent.sub', subDefault: 'One price. Full features. Lifetime support included.', cta: { labelKey: 'banner.transparent.cta', labelDefault: 'See Full Pricing', href: '/subscription' }, icon: BadgeCheck, bg: 'from-[hsl(260_50%_10%)] via-[hsl(265_55%_14%)] to-[hsl(270_60%_18%)]', accent: 'text-violet-300', ring: 'border-violet-400/40', badge: 'bg-violet-500/15 text-violet-200' },
  { id: 'trademark', kickerKey: 'banner.brand.kicker', kickerDefault: 'Verified Brand', headlineKey: 'banner.brand.headline', headlineDefault: 'Trademark Protected — Software Vala™', subKey: 'banner.brand.sub', subDefault: 'Registered IP. Original code. Authentic enterprise-grade products.', cta: { labelKey: 'banner.brand.cta', labelDefault: 'Verify Authenticity', href: '/' }, icon: Lock, bg: 'from-[hsl(0_60%_10%)] via-[hsl(350_55%_14%)] to-[hsl(340_60%_18%)]', accent: 'text-rose-300', ring: 'border-rose-400/40', badge: 'bg-rose-500/15 text-rose-200' },
  { id: 'ai-powered', kickerKey: 'banner.ai.kicker', kickerDefault: 'Next-Gen AI', headlineKey: 'banner.ai.headline', headlineDefault: 'AI-Powered Software Solutions', subKey: 'banner.ai.sub', subDefault: 'Built-in automation, copilots, and predictive intelligence in every product.', cta: { labelKey: 'banner.ai.cta', labelDefault: 'Explore AI Suite', href: '/ai-chat' }, icon: Sparkles, bg: 'from-[hsl(280_60%_10%)] via-[hsl(290_60%_14%)] to-[hsl(300_65%_18%)]', accent: 'text-fuchsia-300', ring: 'border-fuchsia-400/40', badge: 'bg-fuchsia-500/15 text-fuchsia-200' },
  { id: 'erp-crm', kickerKey: 'banner.stack.kicker', kickerDefault: 'Business Stack', headlineKey: 'banner.stack.headline', headlineDefault: 'ERP • CRM • HRM • Billing Systems', subKey: 'banner.stack.sub', subDefault: 'Run your entire company on one unified, modular platform.', cta: { labelKey: 'banner.stack.cta', labelDefault: 'Browse Business Apps', href: '/' }, icon: Layers, bg: 'from-[hsl(195_70%_8%)] via-[hsl(200_65%_12%)] to-[hsl(210_70%_16%)]', accent: 'text-cyan-300', ring: 'border-cyan-400/40', badge: 'bg-cyan-500/15 text-cyan-200' },
  { id: 'custom-dev', kickerKey: 'banner.custom.kicker', kickerDefault: 'Build To Order', headlineKey: 'banner.custom.headline', headlineDefault: 'Custom Software Development', subKey: 'banner.custom.sub', subDefault: 'Tailored to your workflow. Delivered by our in-house engineering team.', cta: { labelKey: 'banner.custom.cta', labelDefault: 'Get Custom Quote', href: '/support' }, icon: Cpu, bg: 'from-[hsl(240_55%_10%)] via-[hsl(245_55%_14%)] to-[hsl(250_60%_18%)]', accent: 'text-indigo-300', ring: 'border-indigo-400/40', badge: 'bg-indigo-500/15 text-indigo-200' },
  { id: 'white-label', kickerKey: 'banner.whitelabel.kicker', kickerDefault: 'Your Brand', headlineKey: 'banner.whitelabel.headline', headlineDefault: 'White-Label Software Available', subKey: 'banner.whitelabel.sub', subDefault: 'Resell our products under your own brand, logo, and domain.', cta: { labelKey: 'banner.whitelabel.cta', labelDefault: 'Start White Label', href: '/reseller-dashboard' }, icon: Tag, bg: 'from-[hsl(180_60%_8%)] via-[hsl(185_60%_12%)] to-[hsl(190_65%_16%)]', accent: 'text-teal-300', ring: 'border-teal-400/40', badge: 'bg-teal-500/15 text-teal-200' },
  { id: 'reseller', kickerKey: 'banner.reseller.kicker', kickerDefault: 'Earn Recurring', headlineKey: 'banner.reseller.headline', headlineDefault: 'Become a Reseller — Up to 40% Commission', subKey: 'banner.reseller.sub', subDefault: 'Sell premium software. Keep majority margin. Launch in 24 hours.', cta: { labelKey: 'banner.reseller.cta', labelDefault: 'Join Reseller Program', href: '/reseller-dashboard' }, secondary: { labelKey: 'banner.reseller.cta2', labelDefault: 'See Commissions', href: '/reseller-dashboard' }, icon: Briefcase, bg: 'from-[hsl(25_80%_10%)] via-[hsl(20_75%_14%)] to-[hsl(15_80%_18%)]', accent: 'text-orange-300', ring: 'border-orange-400/40', badge: 'bg-orange-500/15 text-orange-200' },
  { id: 'franchise', kickerKey: 'banner.franchise.kicker', kickerDefault: 'Territory Rights', headlineKey: 'banner.franchise.headline', headlineDefault: 'Become a Franchise Partner', subKey: 'banner.franchise.sub', subDefault: 'Exclusive city/region rights. Full training. Marketing support included.', cta: { labelKey: 'banner.franchise.cta', labelDefault: 'Apply for Franchise', href: '/support' }, icon: Building2, bg: 'from-[hsl(45_75%_10%)] via-[hsl(40_75%_14%)] to-[hsl(35_80%_18%)]', accent: 'text-yellow-300', ring: 'border-yellow-400/40', badge: 'bg-yellow-500/15 text-yellow-200' },
  { id: 'vendor', kickerKey: 'banner.vendor.kicker', kickerDefault: 'Sell On Vala', headlineKey: 'banner.vendor.headline', headlineDefault: 'Become a Vendor & List Your Products', subKey: 'banner.vendor.sub', subDefault: 'Reach 50,000+ buyers. Zero listing fee. Fast payouts.', cta: { labelKey: 'banner.vendor.cta', labelDefault: 'Become a Vendor', href: '/author' }, icon: Handshake, bg: 'from-[hsl(150_60%_8%)] via-[hsl(155_60%_12%)] to-[hsl(160_65%_16%)]', accent: 'text-green-300', ring: 'border-green-400/40', badge: 'bg-green-500/15 text-green-200' },
  { id: 'influencer', kickerKey: 'banner.creator.kicker', kickerDefault: 'Creator Program', headlineKey: 'banner.creator.headline', headlineDefault: 'Become an Influencer Partner', subKey: 'banner.creator.sub', subDefault: 'Promote, earn, and grow. Track every click, sale, and payout live.', cta: { labelKey: 'banner.creator.cta', labelDefault: 'Join Creator Program', href: '/support' }, icon: Megaphone, bg: 'from-[hsl(320_60%_10%)] via-[hsl(325_60%_14%)] to-[hsl(330_65%_18%)]', accent: 'text-pink-300', ring: 'border-pink-400/40', badge: 'bg-pink-500/15 text-pink-200' },
  { id: 'launch-business', kickerKey: 'banner.launch.kicker', kickerDefault: 'Zero To Launch', headlineKey: 'banner.launch.headline', headlineDefault: 'Start Your Own Software Business', subKey: 'banner.launch.sub', subDefault: 'Complete starter kit: products + branding + training + support.', cta: { labelKey: 'banner.launch.cta', labelDefault: 'Start My Business', href: '/reseller-dashboard' }, icon: Rocket, bg: 'from-[hsl(255_60%_10%)] via-[hsl(260_60%_14%)] to-[hsl(265_65%_18%)]', accent: 'text-violet-300', ring: 'border-violet-400/40', badge: 'bg-violet-500/15 text-violet-200' },
  { id: 'demo', kickerKey: 'banner.demo.kicker', kickerDefault: 'See It Live', headlineKey: 'banner.demo.headline', headlineDefault: 'Instant Demo Available — No Signup', subKey: 'banner.demo.sub', subDefault: 'Click. Watch. Decide. Live sandbox for every product.', cta: { labelKey: 'banner.demo.cta', labelDefault: 'Launch Live Demo', href: '/' }, icon: Play, bg: 'from-[hsl(190_70%_8%)] via-[hsl(195_65%_12%)] to-[hsl(200_70%_16%)]', accent: 'text-cyan-300', ring: 'border-cyan-400/40', badge: 'bg-cyan-500/15 text-cyan-200' },
  { id: 'enterprise', kickerKey: 'banner.enterprise.kicker', kickerDefault: 'Fortune Grade', headlineKey: 'banner.enterprise.headline', headlineDefault: 'Enterprise-Grade Solutions', subKey: 'banner.enterprise.sub', subDefault: 'ISO-aligned. SOC-ready. Built for teams of 10 to 10,000+.', cta: { labelKey: 'banner.enterprise.cta', labelDefault: 'Talk to Enterprise', href: '/support' }, icon: ShieldCheck, bg: 'from-[hsl(215_55%_8%)] via-[hsl(220_55%_12%)] to-[hsl(225_60%_16%)]', accent: 'text-blue-300', ring: 'border-blue-400/40', badge: 'bg-blue-500/15 text-blue-200' },
  { id: 'secure', kickerKey: 'banner.secure.kicker', kickerDefault: 'Hardened Stack', headlineKey: 'banner.secure.headline', headlineDefault: 'Secure & Scalable Systems', subKey: 'banner.secure.sub', subDefault: 'End-to-end encryption. 99.99% uptime. Auto-scaling infrastructure.', cta: { labelKey: 'banner.secure.cta', labelDefault: 'Security Overview', href: '/system-health' }, icon: Lock, bg: 'from-[hsl(170_55%_8%)] via-[hsl(175_55%_12%)] to-[hsl(180_60%_16%)]', accent: 'text-emerald-300', ring: 'border-emerald-400/40', badge: 'bg-emerald-500/15 text-emerald-200' },
  { id: 'multi-industry', kickerKey: 'banner.industry.kicker', kickerDefault: 'Built For Every Sector', headlineKey: 'banner.industry.headline', headlineDefault: 'Multi-Industry Software Solutions', subKey: 'banner.industry.sub', subDefault: 'Retail, Healthcare, Education, Manufacturing, Logistics, Finance & more.', cta: { labelKey: 'banner.industry.cta', labelDefault: 'Explore by Industry', href: '/' }, icon: Globe2, bg: 'from-[hsl(205_60%_8%)] via-[hsl(210_60%_12%)] to-[hsl(215_65%_16%)]', accent: 'text-sky-300', ring: 'border-sky-400/40', badge: 'bg-sky-500/15 text-sky-200' },
  { id: 'powered-by', kickerKey: 'banner.poweredby.kicker', kickerDefault: 'Trusted Worldwide', headlineKey: 'banner.poweredby.headline', headlineDefault: 'Powered by Software Vala™', subKey: 'banner.poweredby.sub', subDefault: 'Joining 50,000+ businesses scaling smarter, faster, safer.', cta: { labelKey: 'banner.poweredby.cta', labelDefault: 'Get Started Free', href: '/auth' }, secondary: { labelKey: 'banner.poweredby.cta2', labelDefault: 'Why Software Vala', href: '/' }, icon: Zap, bg: 'from-[hsl(230_60%_8%)] via-[hsl(245_55%_12%)] to-[hsl(265_60%_16%)]', accent: 'text-fuchsia-300', ring: 'border-fuchsia-400/40', badge: 'bg-fuchsia-500/15 text-fuchsia-200' },
];

function trackBanner(event: 'impression' | 'click' | 'secondary', banner: Banner) {
  try {
    const key = 'sv_promo_banner_analytics';
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    const b = (data[banner.id] ||= { impressions: 0, clicks: 0, secondary: 0, id: banner.id });
    if (event === 'impression') b.impressions += 1;
    if (event === 'click') b.clicks += 1;
    if (event === 'secondary') b.secondary += 1;
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent('sv:promo-banner', { detail: { event, id: banner.id } }));
  } catch {}
}

export function PromoHeroBanner() {
  const { t } = useTranslation('common');
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const banners = useMemo(() => BANNERS, []);
  const slide = banners[current];

  useEffect(() => {
    if (paused) return;
    const tm = setInterval(() => setCurrent((p) => (p + 1) % banners.length), 6500);
    return () => clearInterval(tm);
  }, [paused, banners.length]);

  useEffect(() => {
    trackBanner('impression', slide);
  }, [slide]);

  const Icon = slide.icon;
  const accentBg = slide.accent.replace('text-', 'bg-');

  return (
    <div
      className="relative h-[380px] w-full overflow-hidden lg:h-[440px] rounded-2xl bg-[hsl(230_45%_3%)] border border-white/[0.06]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(230_60%_10%)_0%,hsl(235_55%_6%)_40%,hsl(240_50%_3%)_100%)]" />
      <div
        key={`tint-${slide.id}`}
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${slide.bg} opacity-60 mix-blend-screen transition-opacity duration-1000`}
      />
      <div className={`pointer-events-none absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full opacity-40 blur-[120px] animate-pulse ${accentBg}`} style={{ animationDuration: '6s' }} />
      <div className={`pointer-events-none absolute -bottom-44 right-1/4 h-[420px] w-[420px] rounded-full opacity-25 blur-[120px] animate-pulse ${accentBg}`} style={{ animationDuration: '8s', animationDelay: '1s' }} />
      <div className="pointer-events-none absolute top-1/3 -right-32 h-[380px] w-[380px] rounded-full bg-fuchsia-500/15 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, hsl(0 0% 100% / 0.5) 1px, transparent 1px), linear-gradient(to bottom, hsl(0 0% 100% / 0.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(230_50%_3%/0.7)_100%)]" />

      <div className="relative z-10 hidden border-b border-white/[0.06] bg-black/20 px-6 py-2 backdrop-blur-md md:flex">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-foreground/70">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-emerald-300" /> {t('promo.pill.noAdvance', { defaultValue: 'No Advance Payment' })}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-cyan-300" /> {t('promo.pill.fastDelivery', { defaultValue: '2-Hour Delivery' })}</span>
          <span className="flex items-center gap-1.5"><BadgeCheck className="h-3 w-3 text-amber-300" /> {t('promo.pill.transparent', { defaultValue: 'No Hidden Charges' })}</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3 w-3 text-rose-300" /> {t('promo.pill.trademark', { defaultValue: 'Trademark Protected' })}</span>
          <span className="flex items-center gap-1.5"><Boxes className="h-3 w-3 text-violet-300" /> {t('promo.pill.catalog', { defaultValue: '12,000+ Solutions' })}</span>
        </div>
      </div>

      <div className="relative z-10 grid h-[calc(100%-36px)] grid-cols-1 items-center gap-6 px-6 lg:grid-cols-[1.2fr_1fr] lg:px-10">
        <div key={slide.id} className="max-w-2xl animate-fade-in">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-sm ${slide.ring} ${slide.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${accentBg} animate-pulse`} />
              {t(slide.kickerKey, { defaultValue: slide.kickerDefault })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-foreground/70 backdrop-blur-sm">
              <GraduationCap className="h-3 w-3" /> Software Vala™
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-black leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {t(slide.headlineKey, { defaultValue: slide.headlineDefault })}
          </h1>
          <p className="mb-6 max-w-xl text-sm text-foreground/75 leading-relaxed lg:text-base">
            {t(slide.subKey, { defaultValue: slide.subDefault })}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={slide.cta.href}
              onClick={() => trackBanner('click', slide)}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-bold text-background shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] transition-all hover:scale-[1.03]"
            >
              {t(slide.cta.labelKey, { defaultValue: slide.cta.labelDefault })}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            {slide.secondary && (
              <Link
                to={slide.secondary.href}
                onClick={() => trackBanner('secondary', slide)}
                className={`flex items-center gap-2 rounded-xl border ${slide.ring} bg-white/5 px-6 py-3 text-sm font-semibold ${slide.accent} backdrop-blur-md transition-colors hover:bg-white/10`}
              >
                {t(slide.secondary.labelKey, { defaultValue: slide.secondary.labelDefault })}
              </Link>
            )}
            <Link
              to="/support"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-foreground/80 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/10"
            >
              <Play className="h-4 w-4" /> {t('promo.demo', { defaultValue: 'Instant Demo' })}
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === current ? `w-10 ${accentBg}` : 'w-3 bg-white/15 hover:bg-white/30'}`}
              />
            ))}
            <span className="ml-3 text-[10px] uppercase tracking-[0.2em] text-foreground/50">
              {String(current + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="relative hidden h-full items-center justify-center lg:flex">
          <div className={`relative w-full max-w-[440px] overflow-hidden rounded-2xl border ${slide.ring} bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.01] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl animate-fade-in`}>
            <div className={`pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-30 blur-3xl ${accentBg}`} />
            <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${slide.badge}`}>
              <Icon className={`h-7 w-7 ${slide.accent}`} />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">
              {t(slide.kickerKey, { defaultValue: slide.kickerDefault })}
            </div>
            <div className="mt-1 text-lg font-bold text-foreground leading-snug">
              {t(slide.headlineKey, { defaultValue: slide.headlineDefault })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div>
                <div className="text-base font-bold text-foreground">12K+</div>
                <div className="text-[10px] uppercase tracking-wider text-foreground/55">{t('promo.stat.solutions', { defaultValue: 'Solutions' })}</div>
              </div>
              <div>
                <div className="text-base font-bold text-foreground">50K+</div>
                <div className="text-[10px] uppercase tracking-wider text-foreground/55">{t('promo.stat.businesses', { defaultValue: 'Businesses' })}</div>
              </div>
              <div>
                <div className="text-base font-bold text-foreground">2 Hr</div>
                <div className="text-[10px] uppercase tracking-wider text-foreground/55">{t('promo.stat.delivery', { defaultValue: 'Delivery' })}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrent((p) => (p - 1 + banners.length) % banners.length)}
        aria-label="Previous"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-foreground backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setCurrent((p) => (p + 1) % banners.length)}
        aria-label="Next"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-foreground backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div
          key={slide.id + (paused ? '-p' : '')}
          className={`h-full ${accentBg}`}
          style={{ animation: paused ? 'none' : 'sv-promo-progress 6.5s linear forwards' }}
        />
      </div>
      <style>{`@keyframes sv-promo-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}

export default PromoHeroBanner;