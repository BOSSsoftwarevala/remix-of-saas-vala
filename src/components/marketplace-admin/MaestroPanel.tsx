import { useState, type ReactNode } from "react";
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

const SECTIONS: { label: string; group: string; el: ReactNode }[] = [
  { label: "Dashboard", group: "Overview", el: <DashboardSection /> },
  { label: "Hero Banners", group: "Storefront", el: <HeroBannerSection /> },
  { label: "Categories", group: "Storefront", el: <CategoriesSection /> },
  { label: "Walls", group: "Storefront", el: <WallsSection /> },
  { label: "Homepage Rows", group: "Storefront", el: <HomepageRowsSection /> },
  { label: "Placement", group: "Storefront", el: <PlacementSection /> },
  { label: "Top Bar", group: "Storefront", el: <StorefrontTopBarSection /> },
  { label: "Top Bar Manager", group: "Storefront", el: <TopBarManagerSection /> },
  { label: "Footer", group: "Storefront", el: <FooterSection /> },
  { label: "Filters", group: "Storefront", el: <FiltersSection /> },
  { label: "Layout Order", group: "Storefront", el: <LayoutOrderSection /> },
  { label: "Card Manager", group: "Cards", el: <CardManagerSection /> },
  { label: "Cards", group: "Cards", el: <CardsSection /> },
  { label: "Actions", group: "Growth", el: <ActionsSection /> },
  { label: "Offers", group: "Growth", el: <OffersSection /> },
  { label: "Popups", group: "Growth", el: <PopupsSection /> },
  { label: "Partners", group: "Trust", el: <PartnersSection /> },
  { label: "Trust", group: "Trust", el: <TrustSection /> },
  { label: "Reviews", group: "Trust", el: <ReviewsSection /> },
  { label: "FAQ", group: "Support", el: <FaqSection /> },
  { label: "Contact", group: "Support", el: <ContactSection /> },
  { label: "Search", group: "Discovery", el: <SearchSection /> },
  { label: "AI Assistant", group: "AI", el: <AiSection /> },
  { label: "Sticky", group: "UX", el: <StickySection /> },
  { label: "Upcoming", group: "UX", el: <UpcomingSection /> },
  { label: "Notifications", group: "UX", el: <NotificationsSection /> },
  { label: "Analytics", group: "Insights", el: <AnalyticsSection /> },
  { label: "SEO", group: "Ops", el: <SeoSection /> },
  { label: "Deployment", group: "Ops", el: <DeploymentSection /> },
  { label: "Integrity", group: "Ops", el: <IntegritySection /> },
  { label: "Micro Features", group: "Ops", el: <MicroFeaturesSection /> },
  { label: "Toolkit", group: "Ops", el: <ToolkitSection /> },
  { label: "Settings", group: "Ops", el: <SettingsSection /> },
];

export function MaestroPanel() {
  const [active, setActive] = useState(SECTIONS[0].label);
  const current = SECTIONS.find((s) => s.label === active) ?? SECTIONS[0];
  return (
    <div data-mm className="rounded-2xl border border-border bg-background/40">
      <div className="border-b border-border px-4 pt-3">
        <SubNav items={SECTIONS.map((s) => s.label)} active={active} onChange={setActive} />
      </div>
      <div className="min-h-[60vh]">{current.el}</div>
    </div>
  );
}

export default MaestroPanel;