import { useState } from "react";
const useServerFn = <T,>(fn: T): T => fn;
import {
  Sparkles,
  Globe2,
  Hash,
  Tag,
  Link as LinkIcon,
  FileCode2,
  Languages,
  Map as MapIcon,
  Bot,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Plus,
  X,
  Loader2,
  Search,
} from "lucide-react";
import { Card, EmptyHint, PageHeader, PillButton, StatCard, SubNav } from "../ui";
import { generateSeo } from "@/lib/seo-ai.functions";

type PageType = "homepage" | "category" | "product" | "collection";

const PAGE_TYPES: { id: PageType; label: string }[] = [
  { id: "homepage", label: "Homepage" },
  { id: "category", label: "Category" },
  { id: "product", label: "Product" },
  { id: "collection", label: "Collection" },
];

// Global SEO APIs & extensions (worldwide) – free + freemium
const GLOBAL_SEO_APIS = [
  { name: "Google Search Console", region: "Global", free: true, type: "API" },
  { name: "Bing Webmaster Tools", region: "Global", free: true, type: "API" },
  { name: "Yandex Webmaster", region: "RU / CIS", free: true, type: "API" },
  { name: "Baidu Ziyuan", region: "China", free: true, type: "API" },
  { name: "Naver Search Advisor", region: "Korea", free: true, type: "API" },
  { name: "Seznam Webmaster", region: "Czechia", free: true, type: "API" },
  { name: "DuckDuckGo Index", region: "Global", free: true, type: "Crawler" },
  { name: "Brave Search API", region: "Global", free: true, type: "API" },
  { name: "Google PageSpeed Insights", region: "Global", free: true, type: "API" },
  { name: "Google Rich Results Test", region: "Global", free: true, type: "API" },
  { name: "Schema.org Validator", region: "Global", free: true, type: "API" },
  { name: "Open Graph Debugger", region: "Global", free: true, type: "Tool" },
  { name: "Twitter Card Validator", region: "Global", free: true, type: "Tool" },
  { name: "LinkedIn Post Inspector", region: "Global", free: true, type: "Tool" },
  { name: "Ubersuggest API", region: "Global", free: false, type: "API" },
  { name: "SEMrush API", region: "Global", free: false, type: "API" },
  { name: "Ahrefs API", region: "Global", free: false, type: "API" },
  { name: "Moz API", region: "Global", free: false, type: "API" },
  { name: "Serpstat API", region: "Global", free: false, type: "API" },
  { name: "DataForSEO", region: "Global", free: false, type: "API" },
];

const BROWSER_EXTS = [
  "Yoast SEO",
  "Rank Math",
  "All in One SEO",
  "MozBar",
  "SEO Minion",
  "Ahrefs SEO Toolbar",
  "SEMrush SEO Toolbar",
  "Detailed SEO",
  "Keywords Everywhere",
  "META SEO Inspector",
  "SEO META in 1 CLICK",
  "Screaming Frog",
  "Web Developer",
  "Lighthouse",
  "Wappalyzer",
];

// 20 nano/micro SEO controls every page needs
const SEO_CHECKLIST = [
  "Title Tag",
  "Meta Description",
  "H1 Tag",
  "H2/H3 Outline",
  "Canonical URL",
  "Robots Meta",
  "Open Graph",
  "Twitter Card",
  "JSON-LD Schema",
  "Breadcrumb Schema",
  "FAQ Schema",
  "Product Schema",
  "Image Alt Text",
  "Hreflang Tags",
  "Sitemap.xml",
  "Robots.txt",
  "Internal Links",
  "Hashtags / Social",
  "Favicon / Manifest",
  "Core Web Vitals",
];

export function SeoSection() {
  const [tab, setTab] = useState("Page Editor");
  const [pageType, setPageType] = useState<PageType>("homepage");
  const [topic, setTopic] = useState("Software Vala Marketplace");
  const [locale, setLocale] = useState("global / en");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [h1, setH1] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [twitterTitle, setTwitterTitle] = useState("");
  const [twitterDescription, setTwitterDescription] = useState("");
  const [canonical, setCanonical] = useState("");
  const [schema, setSchema] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [hashDraft, setHashDraft] = useState("");

  const run = useServerFn(generateSeo);

  async function aiFill() {
    setLoading(true);
    try {
      const out = await run({ data: { topic, type: pageType, locale } });
      setTitle(out.title);
      setDescription(out.description);
      setH1(out.h1);
      setKeywords(out.keywords ?? []);
      setHashtags(out.hashtags ?? []);
      setOgTitle(out.ogTitle);
      setOgDescription(out.ogDescription);
      setTwitterTitle(out.twitterTitle);
      setTwitterDescription(out.twitterDescription);
      setCanonical(out.canonical);
      setSchema(out.schema);
    } finally {
      setLoading(false);
    }
  }

  async function aiHashtagsOnly() {
    setLoading(true);
    try {
      const out = await run({ data: { topic, type: pageType, locale } });
      setHashtags(out.hashtags ?? []);
      setKeywords(out.keywords ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="SEO Manager · Global"
        title="SEO Console"
        description="End-to-end SEO: titles, meta, H1, hashtags, schema, OG, Twitter, canonical, hreflang, sitemap and worldwide indexing — with AI auto-generation."
        actions={
          <>
            <PillButton variant="ghost">Export robots.txt</PillButton>
            <PillButton variant="ghost">Generate sitemap.xml</PillButton>
            <PillButton variant="primary">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI SEO Assistant
              </span>
            </PillButton>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Indexed Pages" value="—" icon={<Globe2 className="h-4 w-4" />} />
        <StatCard label="Organic Traffic" value="—" tone="success" />
        <StatCard label="Top Keywords" value="—" tone="premium" icon={<Hash className="h-4 w-4" />} />
        <StatCard label="Issues" value="—" tone="warning" />
      </div>

      <SubNav
        items={["Page Editor", "Checklist", "Schema", "Hreflang", "Sitemap & Robots", "Global APIs", "Extensions"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Page Editor" && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT — Editor */}
          <Card>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {PAGE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPageType(t.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    pageType === t.id
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <input
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-32 rounded-md border border-border bg-background/40 px-2 py-1 text-xs focus:outline-none"
                  placeholder="locale"
                />
                <button
                  onClick={aiFill}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI Auto-Fill
                </button>
              </div>
            </div>

            <Field label="Topic / Page focus">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. CRM Software, Hospital Management ERP"
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </Field>

            <Field label="Title Tag" hint={`${title.length}/60`}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </Field>

            <Field label="Meta Description" hint={`${description.length}/158`}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={180}
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </Field>

            <Field label="H1 Heading">
              <input
                value={h1}
                onChange={(e) => setH1(e.target.value)}
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </Field>

            <Field
              label="Keywords"
              hint="Manual + AI"
              right={
                <button
                  onClick={aiHashtagsOnly}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-cyan-glow"
                >
                  <Sparkles className="h-3 w-3" /> AI suggest
                </button>
              }
            >
              <TagInput
                items={keywords}
                draft={tagDraft}
                setDraft={setTagDraft}
                onAdd={(v) => setKeywords([...keywords, v])}
                onRemove={(i) => setKeywords(keywords.filter((_, idx) => idx !== i))}
                placeholder="Type and press Enter…"
              />
            </Field>

            <Field
              label="Hashtags"
              hint="# tags · social + on-page"
              right={
                <button
                  onClick={aiHashtagsOnly}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-cyan-glow"
                >
                  <Sparkles className="h-3 w-3" /> AI generate
                </button>
              }
            >
              <TagInput
                items={hashtags}
                draft={hashDraft}
                setDraft={setHashDraft}
                onAdd={(v) =>
                  setHashtags([...hashtags, v.startsWith("#") ? v : `#${v}`])
                }
                onRemove={(i) => setHashtags(hashtags.filter((_, idx) => idx !== i))}
                placeholder="#keyword"
                accent
              />
            </Field>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="OG Title">
                <input
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </Field>
              <Field label="OG Description">
                <input
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </Field>
              <Field label="Twitter Title">
                <input
                  value={twitterTitle}
                  onChange={(e) => setTwitterTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </Field>
              <Field label="Twitter Description">
                <input
                  value={twitterDescription}
                  onChange={(e) => setTwitterDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </Field>
            </div>

            <Field label="Canonical URL">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <input
                  value={canonical}
                  onChange={(e) => setCanonical(e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </Field>

            <Field label="JSON-LD Schema">
              <textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                rows={6}
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </Field>
          </Card>

          {/* RIGHT — preview */}
          <div className="space-y-4">
            <Card>
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Google preview
              </div>
              <div className="rounded-lg bg-background/40 p-3">
                <div className="truncate text-xs text-success">
                  softwarevala.com{canonical || "/"}
                </div>
                <div className="mt-0.5 truncate text-base font-medium text-accent">
                  {title || "— Title will appear here —"}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {description || "— Meta description will appear here —"}
                </p>
              </div>
            </Card>

            <Card>
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" /> Social card
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="h-28 bg-gradient-to-br from-primary/40 via-surface to-accent/30" />
                <div className="p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">softwarevala.com</div>
                  <div className="text-sm font-bold">{ogTitle || title || "—"}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">
                    {ogDescription || description || "—"}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Hash className="h-3.5 w-3.5" /> Hashtag preview
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.length === 0 && (
                  <EmptyHint text="Add hashtags or generate with AI" />
                )}
                {hashtags.map((h) => (
                  <span key={h} className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                    {h}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "Checklist" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {SEO_CHECKLIST.map((c, i) => (
            <Card key={c}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-[10px] font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="text-sm font-semibold">{c}</div>
                </div>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <EmptyHint text="Auto-audit when live data connects" />
            </Card>
          ))}
        </div>
      )}

      {tab === "Schema" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            "Organization",
            "WebSite + SearchAction",
            "BreadcrumbList",
            "Product",
            "Offer / AggregateOffer",
            "Review / AggregateRating",
            "FAQPage",
            "HowTo",
            "Article",
            "VideoObject",
            "SoftwareApplication",
            "LocalBusiness",
          ].map((s) => (
            <Card key={s}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-accent" />
                  <div className="text-sm font-bold">{s}</div>
                </div>
                <PillButton variant="ghost">Edit JSON-LD</PillButton>
              </div>
              <EmptyHint text="Generates valid schema.org markup" />
            </Card>
          ))}
        </div>
      )}

      {tab === "Hreflang" && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Languages className="h-4 w-4 text-accent" />
            <h3 className="text-base font-bold">Hreflang Matrix</h3>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["en", "Global English"],
              ["en-US", "United States"],
              ["en-GB", "United Kingdom"],
              ["en-IN", "India"],
              ["hi-IN", "Hindi (India)"],
              ["es", "Spanish"],
              ["es-MX", "Spanish (MX)"],
              ["pt-BR", "Portuguese (BR)"],
              ["fr", "French"],
              ["de", "German"],
              ["it", "Italian"],
              ["ru", "Russian"],
              ["zh-CN", "Chinese (CN)"],
              ["zh-TW", "Chinese (TW)"],
              ["ja", "Japanese"],
              ["ko", "Korean"],
              ["ar", "Arabic"],
              ["x-default", "Default fallback"],
            ].map(([code, name]) => (
              <div key={code} className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2">
                <div>
                  <div className="text-sm font-semibold">{code}</div>
                  <div className="text-[11px] text-muted-foreground">{name}</div>
                </div>
                <PillButton variant="ghost">Map URL</PillButton>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Sitemap & Robots" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-accent" />
              <h3 className="text-base font-bold">Sitemap</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {["sitemap-index.xml", "sitemap-pages.xml", "sitemap-categories.xml", "sitemap-products.xml", "sitemap-images.xml", "sitemap-news.xml"].map((s) => (
                <li key={s} className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2">
                  <span className="font-mono text-xs">/{s}</span>
                  <span className="text-[11px] text-muted-foreground">auto</span>
                </li>
              ))}
            </ul>
            <PillButton variant="primary">Regenerate</PillButton>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2">
              <Bot className="h-4 w-4 text-accent" />
              <h3 className="text-base font-bold">robots.txt</h3>
            </div>
            <pre className="overflow-auto rounded-lg border border-border bg-background/40 p-3 font-mono text-xs">{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: /sitemap-index.xml`}</pre>
          </Card>
        </div>
      )}

      {tab === "Global APIs" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {GLOBAL_SEO_APIS.map((api) => (
            <Card key={api.name}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold">{api.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {api.region} · {api.type}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    api.free
                      ? "bg-success/15 text-success"
                      : "bg-premium/15 text-premium"
                  }`}
                >
                  {api.free ? "FREE" : "PAID"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <PillButton variant="ghost">Connect</PillButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "Extensions" && (
        <Card>
          <div className="mb-3 text-sm text-muted-foreground">
            Recommended browser extensions used in the SEO workflow:
          </div>
          <div className="flex flex-wrap gap-2">
            {BROWSER_EXTS.map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-semibold">
                <Tag className="h-3 w-3 text-accent" /> {e}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  right,
  children,
}: {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
          {right}
        </div>
      </div>
      {children}
    </div>
  );
}

function TagInput({
  items,
  draft,
  setDraft,
  onAdd,
  onRemove,
  placeholder,
  accent,
}: {
  items: string[];
  draft: string;
  setDraft: (v: string) => void;
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              accent
                ? "bg-accent/15 text-accent"
                : "bg-secondary text-foreground"
            }`}
          >
            {t}
            <button onClick={() => onRemove(i)} className="opacity-60 hover:opacity-100">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
              e.preventDefault();
              onAdd(draft.trim());
              setDraft("");
            } else if (e.key === "Backspace" && !draft && items.length) {
              onRemove(items.length - 1);
            }
          }}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-xs focus:outline-none"
        />
        {draft && (
          <button
            onClick={() => {
              onAdd(draft.trim());
              setDraft("");
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-1 text-[10px] font-bold text-primary-foreground"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>
    </div>
  );
}
