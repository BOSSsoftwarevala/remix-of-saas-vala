import { useEffect, useRef, useState } from "react";
import { SVLogo } from "./SVLogo";
import { AiChatPanel } from "./AiChatPanel";
import { Bot } from "lucide-react";

import {
  LayoutDashboard,
  Image as ImageIcon,
  FolderTree,
  LayoutGrid,
  Target,
  CreditCard,
  MousePointerClick,
  Tag,
  BellRing,
  Users2,
  ShieldCheck,
  Star,
  HelpCircle,
  Phone,
  Search,
  Sparkles,
  Globe2,
  PinIcon,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  Command,
  MoreHorizontal,
  Menu,
  PanelBottom,
  Filter,
  Clock,
  Layout,
  Rocket,
  Zap,
  ShieldCheck as ShieldCheckIcon,
  Wrench,

} from "lucide-react";

export const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "topbar-manager", label: "Top Bar", icon: Menu },
  { id: "homepage-rows", label: "Homepage Rows", icon: Layout },
  { id: "card-manager", label: "Card Manager", icon: CreditCard },
  { id: "toolkit", label: "Action Toolkit", icon: Wrench },
  { id: "storefront-topbar", label: "Storefront Bar", icon: Menu },
  { id: "hero", label: "Hero Banner", icon: ImageIcon },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "walls", label: "Walls", icon: LayoutGrid },
  { id: "layout-order", label: "Layout Order", icon: Layout },
  { id: "placement", label: "Placement", icon: Target },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "actions", label: "Actions", icon: MousePointerClick },
  { id: "filters", label: "Filters", icon: Filter },
  { id: "offers", label: "Offers", icon: Tag },
  { id: "popups", label: "Popups", icon: BellRing },
  { id: "upcoming", label: "Upcoming", icon: Clock },
  { id: "partners", label: "Partners", icon: Users2 },
  { id: "trust", label: "Trust", icon: ShieldCheck },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "footer", label: "Footer", icon: PanelBottom },
  { id: "search", label: "Search", icon: Search },
  { id: "ai", label: "AI Recs", icon: Sparkles },
  { id: "seo", label: "SEO", icon: Globe2 },
  { id: "sticky", label: "Sticky", icon: PinIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "deployment", label: "Deployment", icon: Rocket },
  { id: "micro", label: "Micro-Features", icon: Zap },
  { id: "integrity", label: "Integrity", icon: ShieldCheckIcon },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function MarketplaceTopBar({
  active,
  onChange,
}: {
  active: SectionId;
  onChange: (id: SectionId) => void;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [overflowIds, setOverflowIds] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Measure which items fit in one row; the rest go into "More"
  useEffect(() => {
    function measure() {
      const nav = navRef.current;
      if (!nav) return;
      const navWidth = nav.clientWidth;
      const reserveForMore = 96; // space for "More" button
      let used = 0;
      const overflow = new Set<string>();
      let overflowing = false;
      for (const s of SECTIONS) {
        const el = itemRefs.current[s.id];
        if (!el) continue;
        const w = el.offsetWidth + 4;
        if (!overflowing && used + w <= navWidth - reserveForMore) {
          used += w;
        } else {
          overflowing = true;
          overflow.add(s.id);
        }
      }
      setOverflowIds(overflow);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // close menu on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest?.("[data-more-menu]")) setMenuOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const overflowSections = SECTIONS.filter((s) => overflowIds.has(s.id));
  const activeOverflowed = overflowIds.has(active);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[oklch(0.16_0.03_240/0.72)] backdrop-blur-2xl backdrop-saturate-150">
      {/* hairline accent glow under header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SVLogo />
          <div className="hidden min-w-0 leading-tight md:block">
            <div className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              Module
            </div>
            <div className="truncate text-sm font-bold text-foreground">
              Marketplace Homepage Manager
            </div>
          </div>
        </div>


        <div className="hidden flex-1 max-w-xl items-center gap-2 rounded-full border border-border bg-white/[0.04] px-4 py-1.5 ring-rim transition-colors focus-within:border-[oklch(0.80_0.13_192/0.45)] lg:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search products, banners, walls, offers, partners…"
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="flex items-center gap-1 rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] tabular text-muted-foreground">
            <Command className="h-3 w-3" /> K
          </kbd>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setChatOpen(true)}
            title="Ask Vala AI"
            className="group relative flex items-center gap-1.5 rounded-full border border-[oklch(0.80_0.13_192/0.30)] bg-[oklch(0.80_0.13_192/0.10)] px-3 py-1.5 text-[12px] font-semibold text-foreground transition-all hover:bg-[oklch(0.80_0.13_192/0.18)] hover:shadow-[0_0_18px_-6px_oklch(0.80_0.13_192/0.55)]"
          >
            <Bot className="h-3.5 w-3.5 text-accent" />
            <span className="hidden md:inline">AI Chat</span>
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
          </button>
          <button className="relative rounded-full border border-border bg-white/[0.04] p-2 text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
          </button>
          <button className="flex items-center gap-2 rounded-full border border-border bg-white/[0.04] p-1 pr-3 transition-colors hover:bg-white/[0.08]">
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent ring-1 ring-white/10" />
            <span className="hidden text-xs font-semibold md:inline">Boss</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Section tab strip with overflow → More dropdown */}
      <div ref={navRef} className="relative flex items-center px-4 pb-3 md:px-8">
        <nav className="flex flex-1 items-center gap-1 overflow-hidden">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === active;
            const hidden = overflowIds.has(s.id);
            return (
              <button
                key={s.id}
                ref={(el) => {
                  itemRefs.current[s.id] = el;
                }}
                onClick={() => onChange(s.id)}
                style={hidden ? { visibility: "hidden", position: "absolute", pointerEvents: "none" } : undefined}
                className={`group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                  isActive
                    ? "border border-[oklch(0.80_0.13_192/0.30)] bg-[oklch(0.80_0.13_192/0.10)] text-foreground shadow-[0_0_18px_-6px_oklch(0.80_0.13_192/0.55),inset_0_1px_0_oklch(1_0_0/0.06)]"
                    : "border border-transparent text-muted-foreground hover:border-border hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_currentColor]" />
                )}
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </nav>

        {overflowSections.length > 0 && (
          <div data-more-menu className="relative ml-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
                activeOverflowed
                  ? "border border-[oklch(0.80_0.13_192/0.30)] bg-[oklch(0.80_0.13_192/0.10)] text-foreground"
                  : "border border-border bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
              }`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              More
              <span className="rounded-full bg-accent/15 px-1.5 font-mono text-[10px] font-bold tabular text-accent">
                {overflowSections.length}
              </span>
            </button>
            {menuOpen && (
              <div className="glass-strong absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl">
                <div className="grid max-h-[60vh] grid-cols-1 gap-0.5 overflow-y-auto p-1.5">
                  {overflowSections.map((s) => {
                    const Icon = s.icon;
                    const isActive = s.id === active;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          onChange(s.id);
                          setMenuOpen(false);
                        }}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold transition-colors ${
                          isActive
                            ? "bg-[oklch(0.80_0.13_192/0.10)] text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-accent" />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <AiChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </header>
  );
}
