import { useState } from "react";
import { X, Search, Check, Globe, RotateCcw, Eye, Languages as LangIcon, Bell, MessageSquare, Sparkles, Menu } from "lucide-react";
import { languages, type Language } from "@/data/internal-chat/languages";

const APPLIES_TO = [
  { icon: MessageSquare, label: "Enterprise Chat" },
  { icon: Sparkles, label: "AI Assistant" },
  { icon: LangIcon, label: "AMS" },
  { icon: Bell, label: "Notifications" },
  { icon: MessageSquare, label: "System Messages" },
  { icon: Menu, label: "Menus & Tooltips" },
];

export default function LanguageSettings({
  current,
  onClose,
  onSelect,
}: {
  current: string;
  onClose: () => void;
  onSelect: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(current);

  const filtered = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.native.toLowerCase().includes(query.toLowerCase()) ||
      l.code.toLowerCase().includes(query.toLowerCase()),
  );
  const preview: Language = languages.find((l) => l.code === selected) ?? languages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-float-up" onClick={onClose} />
      <div className="dark glass-strong relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl text-foreground animate-float-up">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow-soft" style={{ background: "var(--gradient-multi)" }}>
            <Globe className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold leading-tight">Settings → Language</h2>
            <p className="text-[12px] text-muted-foreground">{languages.length}+ languages · applies across your entire workspace</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-white/10 hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-0 md:flex-row">
          {/* List */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search language…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="scrollbar-thin mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
              {filtered.map((l) => {
                const active = l.code === selected;
                return (
                  <button
                    key={l.code}
                    onClick={() => setSelected(l.code)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${active ? "bg-white/10 shadow-soft" : "hover:bg-white/5"}`}
                  >
                    <span className="text-xl">{l.flag}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.name}</span>
                      <span className="block truncate text-[12px] text-muted-foreground">{l.native}</span>
                    </span>
                    {active && <Check className="h-4 w-4 text-cyan-300" />}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No language matches “{query}”.</p>
              )}
            </div>
          </div>

          {/* Preview / applies-to */}
          <div className="w-full shrink-0 border-t border-white/10 p-5 md:w-[260px] md:border-l md:border-t-0">
            <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Eye className="h-3.5 w-3.5" /> Preview
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-3xl">{preview.flag}</div>
              <p className="mt-1.5 font-display text-base font-semibold">{preview.native}</p>
              <p className="text-[12px] text-muted-foreground">{preview.name}</p>
            </div>

            <div className="mb-2 mt-5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Auto-applies to</div>
            <div className="space-y-1.5">
              {APPLIES_TO.map((a) => (
                <div key={a.label} className="flex items-center gap-2 text-[13px] text-foreground/85">
                  <a.icon className="h-3.5 w-3.5 text-cyan-300" /> {a.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
          <button
            onClick={() => setSelected("en")}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to system default
          </button>
          <button
            onClick={() => { onSelect(selected); onClose(); }}
            className="rounded-full px-5 py-2 text-[13px] font-semibold text-white shadow-soft transition hover:brightness-110"
            style={{ background: "var(--gradient-brand)" }}
          >
            Set preferred language
          </button>
        </div>
      </div>
    </div>
  );
}
