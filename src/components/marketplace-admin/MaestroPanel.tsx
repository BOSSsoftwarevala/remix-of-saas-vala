import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { SubNav } from "./ui";
import { DashboardSection } from "./sections/DashboardSection";
import {
  HeroBannerSection,
  CategoriesSection,
  WallsSection,
  PlacementSection,
  CardsSection,
  ActionsSection,
  OffersSection,
  PopupsSection,
  PartnersSection,
  TrustSection,
  ReviewsSection,
  FaqSection,
  ContactSection,
  SearchSection,
  AiSection,
  StickySection,
  AnalyticsSection,
  SettingsSection,
  SeoSection,
  DeploymentSection,
  IntegritySection,
  MicroFeaturesSection,
  ToolkitSection,
  TopBarManagerSection,
  HomepageRowsSection,
  CardManagerSection,
  StorefrontTopBarSection,
  FooterSection,
  FiltersSection,
  UpcomingSection,
  NotificationsSection,
  LayoutOrderSection,
} from "./sections";
import { useAuth } from "@/hooks/useAuth";
import { useRoleView } from "@/contexts/RoleViewContext";
import {
  MAESTRO_I18N_KEYS,
  canSeeMaestroSection,
  resolveEffectiveRole,
  type MaestroSectionKey,
} from "@/lib/marketplaceAdminPermissions";

const SECTION_MAP: Record<MaestroSectionKey, ReactNode> = {
  dashboard: <DashboardSection />,
  hero_banners: <HeroBannerSection />,
  categories: <CategoriesSection />,
  walls: <WallsSection />,
  homepage_rows: <HomepageRowsSection />,
  placement: <PlacementSection />,
  top_bar: <StorefrontTopBarSection />,
  top_bar_manager: <TopBarManagerSection />,
  footer: <FooterSection />,
  filters: <FiltersSection />,
  layout_order: <LayoutOrderSection />,
  card_manager: <CardManagerSection />,
  cards: <CardsSection />,
  actions: <ActionsSection />,
  offers: <OffersSection />,
  popups: <PopupsSection />,
  partners: <PartnersSection />,
  trust: <TrustSection />,
  reviews: <ReviewsSection />,
  faq: <FaqSection />,
  contact: <ContactSection />,
  search: <SearchSection />,
  ai: <AiSection />,
  sticky: <StickySection />,
  upcoming: <UpcomingSection />,
  notifications: <NotificationsSection />,
  analytics: <AnalyticsSection />,
  seo: <SeoSection />,
  deployment: <DeploymentSection />,
  integrity: <IntegritySection />,
  micro_features: <MicroFeaturesSection />,
  toolkit: <ToolkitSection />,
  settings: <SettingsSection />,
};

const SECTION_ORDER: MaestroSectionKey[] = [
  'dashboard', 'hero_banners', 'categories', 'walls', 'homepage_rows',
  'placement', 'top_bar', 'top_bar_manager', 'footer', 'filters',
  'layout_order', 'card_manager', 'cards', 'actions', 'offers', 'popups',
  'partners', 'trust', 'reviews', 'faq', 'contact', 'search', 'ai',
  'sticky', 'upcoming', 'notifications', 'analytics', 'seo', 'deployment',
  'integrity', 'micro_features', 'toolkit', 'settings',
];

export function MaestroPanel() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { override } = useRoleView();
  const effective = resolveEffectiveRole(role, override);

  const visible = useMemo(
    () => SECTION_ORDER.filter((k) => canSeeMaestroSection(effective, k)),
    [effective],
  );

  const labelFor = (k: MaestroSectionKey) => {
    const meta = MAESTRO_I18N_KEYS[k];
    return t(meta.key, { defaultValue: meta.fallback });
  };

  const [active, setActive] = useState<MaestroSectionKey>(visible[0] ?? 'dashboard');
  const current: MaestroSectionKey = visible.includes(active) ? active : (visible[0] ?? 'dashboard');

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-background/40 p-8 text-center text-sm text-muted-foreground">
        {t('ma_no_access', { defaultValue: 'You do not have access to any Maestro section for this role.' })}
      </div>
    );
  }

  const labelToKey = new Map(visible.map((k) => [labelFor(k), k] as const));

  return (
    <div data-mm className="rounded-2xl border border-border bg-background/40">
      <div className="border-b border-border px-4 pt-3">
        <SubNav
          items={visible.map(labelFor)}
          active={labelFor(current)}
          onChange={(label) => {
            const key = labelToKey.get(label);
            if (key) setActive(key);
          }}
        />
      </div>
      <div className="min-h-[60vh]">{SECTION_MAP[current]}</div>
    </div>
  );
}

export default MaestroPanel;