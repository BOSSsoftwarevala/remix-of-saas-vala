import { useMemo, useState } from "react";
import { Search, Volume2, Crown, Smile, Zap, UserRound, X } from "lucide-react";
import {
  roleStickers, businessReactions, soundAssets, animatedStickers, roleAvatars,
  assetCounts,
} from "@/data/internal-chat/assets";
import { playSound } from "@/lib/internalChatSounds";

type Tab = "stickers" | "reactions" | "sounds" | "animated" | "avatars";

const TABS: { id: Tab; label: string; icon: typeof Crown; count: number }[] = [
  { id: "stickers", label: "Role Stickers", icon: Crown, count: assetCounts.stickers },
  { id: "reactions", label: "Reactions", icon: Smile, count: assetCounts.reactions },
  { id: "sounds", label: "Sound Packs", icon: Volume2, count: assetCounts.sounds },
  { id: "animated", label: "Animated", icon: Zap, count: assetCounts.animated },
  { id: "avatars", label: "Avatars", icon: UserRound, count: assetCounts.avatars },
];

const toneRing: Record<string, string> = {
  approve: "border-online/40 bg-online/8",
  reject: "border-destructive/40 bg-destructive/8",
  success: "border-primary/40 bg-primary/8",
  alert: "border-amber-400/40 bg-amber-400/10",
  neutral: "border-border bg-surface",
};

export default function AssetStudio({
  onPickSticker, onClose,
}: { onPickSticker: (glyph: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("stickers");
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    const f = <T extends { label?: string; role?: string }>(arr: T[]) =>
      !term ? arr : arr.filter((a) => (a.label ?? a.role ?? "").toLowerCase().includes(term));
    return {
      stickers: f(roleStickers),
      reactions: f(businessReactions),
      sounds: f(soundAssets),
      animated: f(animatedStickers),
      avatars: f(roleAvatars),
    };
  }, [term]);

  return (
    <div className="mb-2 flex animate-bubble-in flex-col rounded-3xl border border-border bg-popover shadow-float">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-2xl text-primary-foreground shadow-soft" style={{ background: "var(--gradient-brand)" }}>
          <Zap className="h-[18px] w-[18px]" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-sm font-semibold leading-tight">Asset Studio</h3>
          <p className="text-[11px] text-muted-foreground">{assetCounts.total}+ premium enterprise assets</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets…"
            className="w-28 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground sm:w-40"
          />
        </div>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="scrollbar-thin flex gap-1.5 overflow-x-auto px-4 py-2.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
              tab === t.id ? "bg-foreground text-background shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            <span className="opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="scrollbar-thin max-h-72 overflow-y-auto px-4 pb-4 pt-1">
        {tab === "stickers" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.stickers.map((s) => (
              <button
                key={s.id}
                onClick={() => onPickSticker(s.glyph)}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition hover:scale-[1.03] hover:shadow-soft ${toneRing[s.tone]}`}
              >
                <span className="text-2xl leading-none">{s.glyph}</span>
                <span className="truncate text-[12px] font-medium text-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "reactions" && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {filtered.reactions.map((r) => (
              <button
                key={r.id}
                onClick={() => onPickSticker(r.glyph)}
                title={r.label}
                className="group flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-1 py-2.5 transition hover:scale-110 hover:border-primary/40 hover:bg-primary/8"
              >
                <span className="text-xl leading-none">{r.glyph}</span>
                <span className="w-full truncate text-center text-[9px] text-muted-foreground">{r.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "sounds" && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.sounds.map((s) => (
              <button
                key={s.id}
                onClick={() => playSound(s)}
                className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-primary/8 active:scale-95"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                  <Volume2 className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-foreground">{s.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{s.group}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "animated" && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {filtered.animated.map((a) => (
              <button
                key={a.id}
                onClick={() => onPickSticker(a.glyph)}
                title={a.label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface px-1 py-3 transition hover:border-primary/40 hover:bg-primary/8"
              >
                <span className={`text-3xl leading-none anim-${a.anim}`}>{a.glyph}</span>
                <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground">{a.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "avatars" && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {filtered.avatars.map((a) => (
              <button
                key={a.id}
                title={`${a.role} · ${a.dept}`}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface px-1 py-3 transition hover:scale-105 hover:border-primary/40"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-full font-display text-[13px] font-semibold text-white shadow-soft"
                  style={{ background: a.gradient }}
                >
                  {a.initials}
                </span>
                <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground">{a.role}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
