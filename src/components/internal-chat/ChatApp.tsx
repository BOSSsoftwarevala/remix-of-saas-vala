import { useState, useEffect, useRef } from "react";
import {
  Search, Bell, MoreVertical, Pin, Check, CheckCheck, Smile, Send, Plus,
  Users, Sparkles, Star, Sticker, ShieldCheck,
  Phone, Video, VolumeX, ChevronRight, Zap, FolderKanban,
  MessagesSquare, Mic, Globe, Volume2, Lock, Settings as SettingsIcon, ScrollText,
  Paperclip, FileText, MapPin, Code2, Calendar, BarChart3, Camera, Film, X, ImagePlay,
  Keyboard, Command,
} from "lucide-react";
import {
  conversations, folders, members, messages,
  type Conversation, type Message, type DeliveryState,
} from "@/data/internal-chat/chat";
import AssetStudio from "@/components/internal-chat/AssetStudio";
import LanguageSettings from "@/components/internal-chat/LanguageSettings";
import { languages } from "@/data/internal-chat/languages";
import { soundAssets } from "@/data/internal-chat/assets";
import { playSound } from "@/lib/internalChatSounds";

const SND = (id: string) => {
  const s = soundAssets.find((x) => x.id === id);
  if (s) playSound(s);
};

const speak = (text: string, langCode: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langCode;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    SND("soft-pop");
  }
};


function Avatar({
  gradient, label, size = 44, online, ring,
}: { gradient: string; label: string; size?: number; online?: boolean; ring?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className={`flex h-full w-full items-center justify-center rounded-full font-display font-semibold text-white ${ring ? "ring-2 ring-white/25 ring-offset-2 ring-offset-transparent" : ""}`}
        style={{ background: gradient, fontSize: size * 0.34, boxShadow: "0 6px 18px -8px rgba(0,0,0,0.5)" }}
      >
        {label}
      </span>
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-graphite bg-online animate-pulse-ring" style={{ borderColor: "var(--graphite)" }} />
      )}
    </span>
  );
}

function Ticks({ state }: { state?: DeliveryState }) {
  if (!state) return null;
  if (state === "sent") return <Check className="h-3.5 w-3.5 opacity-70" />;
  return (
    <CheckCheck className={`h-3.5 w-3.5 ${state === "read" ? "text-cyan-200" : "opacity-70"}`} />
  );
}

function ConversationRow({
  c, active, onClick,
}: { c: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 ${
        active ? "bg-white/10 shadow-soft" : "hover:bg-white/5"
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" style={{ background: "var(--gradient-multi)" }} />}
      <Avatar gradient={c.color} label={c.initials} online={c.online} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-foreground">{c.name}</span>
          {c.group && <Users className="h-3 w-3 shrink-0 text-muted-foreground" />}
          {c.muted && <VolumeX className="h-3 w-3 shrink-0 text-muted-foreground" />}
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className={`truncate text-[13px] ${c.typing ? "text-cyan-300" : "text-muted-foreground"}`}>
            {c.typing ? "typing…" : c.last}
          </span>
          {c.pinned && !c.unread && <Pin className="ml-auto h-3 w-3 shrink-0 -rotate-45 text-muted-foreground" />}
          {!!c.unread && (
            <span className="animate-badge-pulse ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold text-white shadow-soft" style={{ background: "var(--gradient-brand)" }}>
              {c.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

const GIF_CATEGORIES = [
  { e: "😀", k: "Happy" }, { e: "😂", k: "Funny" }, { e: "😍", k: "Love" }, { e: "🤝", k: "Respect" },
  { e: "🔥", k: "Amazing" }, { e: "👏", k: "Congrats" }, { e: "😎", k: "Cool" }, { e: "🤔", k: "Thinking" },
  { e: "💪", k: "Motivation" }, { e: "🎉", k: "Celebration" }, { e: "🚀", k: "Launch" }, { e: "🐞", k: "Bug" },
  { e: "⚠️", k: "Warning" }, { e: "☕", k: "Coffee" }, { e: "💻", k: "Coding" }, { e: "📦", k: "Deploy" },
  { e: "🎯", k: "Success" }, { e: "👨‍💻", k: "Dev" }, { e: "😭", k: "Sad" }, { e: "😡", k: "Angry" },
];

const MORE_TOOLS = [
  { icon: Sparkles, k: "AI Assist" }, { icon: FileText, k: "Templates" }, { icon: BarChart3, k: "Poll" },
  { icon: Calendar, k: "Calendar" }, { icon: Code2, k: "Code Block" }, { icon: MapPin, k: "Location" },
  { icon: Film, k: "GIF" }, { icon: Sticker, k: "Sticker" }, { icon: Camera, k: "Camera" }, { icon: ImagePlay, k: "Document" },
];

function Bubble({ m, index, prefName, prefCode }: { m: Message; index: number; prefName: string; prefCode: string }) {
  const [showActions, setShowActions] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const author = members[m.authorId];

  if (m.system) {
    return (
      <div className="my-4 flex justify-center">
        <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {m.system}
        </span>
      </div>
    );
  }

  const out = m.outgoing;
  const canTranslate = !!m.text && !!m.translated;
  const display = showTranslated && m.translated ? m.translated : m.text;

  return (
    <div
      className={`group flex items-end gap-2.5 ${out ? "flex-row-reverse animate-msg-send" : "animate-msg-receive"}`}
      style={{ animationDelay: `${index * 45}ms`, marginBottom: 44 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!out && <Avatar gradient={author.color} label={author.initials} size={32} />}

      <div className={`relative max-w-[80%] sm:max-w-[64%] ${out ? "items-end" : "items-start"} flex flex-col`}>
        {!out && <span className="mb-1 ml-1 text-[12px] font-semibold text-muted-foreground">{author.name}</span>}

        {m.sticker ? (
          <div className="animate-pop text-[72px] leading-none drop-shadow-xl">{m.sticker}</div>
        ) : (
          <div
            className={`relative px-4 py-2.5 text-[14px] leading-relaxed transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 ${
              out
                ? "rounded-[20px] rounded-br-md shadow-float group-hover:shadow-[0_18px_44px_-12px_oklch(0.2_0.012_265/0.5)]"
                : "rounded-[20px] rounded-bl-md border border-border/70 text-card-foreground shadow-soft group-hover:shadow-float"
            }`}
            style={out
              ? { background: "linear-gradient(140deg, oklch(0.27 0.015 265), var(--bubble-out) 90%)", color: "var(--bubble-out-foreground)" }
              : { background: "linear-gradient(140deg, var(--surface), var(--surface-2) 90%)" }}
          >

            <span className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }} />
            {m.replyTo && (
              <div className={`mb-1.5 rounded-lg border-l-2 px-2 py-1 text-[12px] ${out ? "border-white/60 bg-white/15" : "border-primary bg-primary/8"}`}>
                <span className={`block font-semibold ${out ? "text-white" : "text-primary"}`}>{m.replyTo.author}</span>
                <span className="line-clamp-1 opacity-80">{m.replyTo.text}</span>
              </div>
            )}
            <span className="relative">{display}</span>
          </div>
        )}

        {/* Premium timestamp line */}
        {!m.sticker && (
          <span className={`mt-2 flex items-center gap-1.5 px-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground ${out ? "self-end" : "self-start"}`}>
            {m.time}
            {out && <Ticks state={m.state} />}
          </span>
        )}

        {/* Translate / Listen + immutability strip */}
        {canTranslate && (
          <div className={`mt-1.5 flex flex-wrap items-center gap-1.5 ${out ? "self-end" : "self-start"}`}>
            <span className={`inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground`}>
              <Globe className="h-3 w-3" /> {showTranslated ? prefName : (m.lang ?? "Original")}
            </span>
            <button
              onClick={() => { setShowTranslated((v) => !v); SND("soft-pop"); }}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary transition hover:bg-primary/20"
            >
              <Globe className="h-3 w-3" /> {showTranslated ? "Show original" : "Translate"}
            </button>
            {showTranslated && (
              <button
                onClick={() => speak(m.translated!, prefCode)}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-foreground transition hover:bg-secondary"
              >
                <Volume2 className="h-3 w-3" /> Listen
              </button>
            )}
          </div>
        )}


        {m.reactions && (
          <div className={`mt-2 flex gap-1 ${out ? "self-end" : "self-start"}`}>
            {m.reactions.map((r) => (
              <span
                key={r.emoji}
                className={`animate-pop flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] transition ${
                  r.reacted ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground"
                }`}
              >
                {r.emoji} <span className="font-semibold">{r.count}</span>
              </span>
            ))}
          </div>
        )}

        {showActions && !m.sticker && (
          <div className={`absolute -top-11 z-10 flex animate-float-up items-center gap-1 rounded-full border border-border bg-popover px-1.5 py-1 shadow-float ${out ? "right-0" : "left-0"}`}>
            {["❤️", "😂", "🔥"].map((e) => (
              <button key={e} onClick={() => SND("reaction")} className="grid h-7 w-7 place-items-center rounded-full text-[15px] transition hover:scale-125 hover:bg-muted">
                {e}
              </button>
            ))}
            <span className="mx-0.5 h-4 w-px bg-border" />
            <button title="Translate" onClick={() => SND("soft-pop")} className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Globe className="h-4 w-4" />
            </button>
            <button title="Listen" onClick={() => display && speak(display, "en")} className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Volume2 className="h-4 w-4" />
            </button>
            <button title="AI Suggest Reply" onClick={() => SND("ai-thinking")} className="grid h-7 w-7 place-items-center rounded-full text-cyan-500 transition hover:bg-muted">
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <Avatar gradient={members.kabir.color} label={members.kabir.initials} size={32} />
      <div className="flex items-center gap-1 rounded-3xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-soft">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            style={{ animation: `typing-bounce 1.2s ${i * 0.18}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function ContextPanel({ active }: { active: Conversation }) {
  const memberList = Object.values(members).slice(0, 4);
  return (
    <aside className="hidden w-[21%] min-w-[280px] max-w-[360px] shrink-0 flex-col gap-3.5 overflow-y-auto scrollbar-thin p-4 text-foreground xl:flex">
      {/* Profile */}
      <div className="animate-panel-card flex flex-col items-center gap-3 rounded-[18px] border border-border bg-card p-6 text-center shadow-soft" style={{ animationDelay: "40ms" }}>
        <Avatar gradient={active.color} label={active.initials} size={72} online={active.online} ring />
        <div>
          <h3 className="flex items-center justify-center gap-1.5 font-display text-lg font-semibold">
            {active.name}
            <ShieldCheck className="h-4 w-4 text-primary" />
          </h3>
          <p className="text-[12px] text-muted-foreground">{active.group ? "Project channel" : "Direct message"}</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full bg-[color-mix(in_oklab,var(--destructive)_16%,transparent)] px-3 py-1 text-[11px] font-semibold text-destructive">High priority</span>
          <span className="rounded-full bg-[color-mix(in_oklab,var(--primary)_24%,transparent)] px-3 py-1 text-[11px] font-semibold text-primary-foreground" style={{ color: "oklch(0.32 0.06 150)" }}>Active deal</span>
        </div>
      </div>

      {/* AI Summary — premium violet card */}
      <div className="sticky top-0 z-10 overflow-hidden rounded-[18px] p-5 text-white shadow-float" style={{ background: "linear-gradient(150deg, var(--royal), oklch(0.5 0.2 290))" }}>
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="relative mb-2.5 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-white/85">
          <Sparkles className="h-3.5 w-3.5" /> AI Summary
        </div>
        <p className="relative text-[13px] leading-relaxed text-white/95">
          Team finalized the premium bubble tokens and is shipping the chat module to staging. Sentiment is positive 🚀
        </p>
        <div className="relative mt-4 flex items-center gap-3">
          <span className="text-[22px] font-bold leading-none">94%</span>
          <span className="text-[11px] leading-tight text-white/80">Positive<br />sentiment</span>
        </div>
      </div>

      {/* Files */}
      <div className="animate-panel-card rounded-[18px] border border-border bg-card p-4 shadow-soft" style={{ animationDelay: "160ms" }}>
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> Files
        </div>
        <div className="space-y-2">
          {[
            { n: "design-tokens.fig", s: "2.4 MB", c: "var(--royal)" },
            { n: "release-notes.pdf", s: "640 KB", c: "var(--sapphire)" },
            { n: "qa-report.xlsx", s: "1.1 MB", c: "var(--cyan)" },
          ].map((f) => (
            <div key={f.n} className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/60 px-2.5 py-2 transition hover:bg-secondary">
              <span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: f.c }}>
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-foreground">{f.n}</span>
                <span className="text-[11px] text-muted-foreground">{f.s}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Members */}
      <div className="animate-panel-card rounded-[18px] border border-border bg-card p-4 shadow-soft" style={{ animationDelay: "220ms" }}>
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Members
        </div>
        <div className="space-y-1.5">
          {memberList.map((m) => (
            <div key={m.initials} className="flex items-center gap-2.5">
              <Avatar gradient={m.color} label={m.initials} size={30} online />
              <span className="truncate text-[13px] font-medium text-foreground">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks — signature lime card */}
      <div className="animate-panel-card overflow-hidden rounded-[18px] p-5 shadow-float" style={{ background: "linear-gradient(150deg, var(--primary), oklch(0.83 0.16 145))", color: "oklch(0.28 0.05 150)", animationDelay: "280ms" }}>
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider opacity-80">
          <FolderKanban className="h-3.5 w-3.5" /> Tasks
        </div>
        <div className="space-y-2.5">
          {[
            { t: "Ship chat to staging", done: true },
            { t: "Review bubble tokens", done: true },
            { t: "QA pass on translations", done: false },
          ].map((task) => (
            <div key={task.t} className="flex items-center gap-2.5 text-[13px] font-medium">
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-md border ${task.done ? "border-black/40 bg-black/15" : "border-black/30"}`}>
                {task.done && <Check className="h-3 w-3" />}
              </span>
              <span className={task.done ? "line-through opacity-60" : ""}>{task.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-panel-card rounded-[18px] border border-border bg-card p-4 shadow-soft" style={{ animationDelay: "340ms" }}>
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Zap, label: "Create AMS" },
            { icon: Star, label: "Favorite" },
            { icon: Pin, label: "Pin Chat" },
            { icon: Phone, label: "Call" },
          ].map((a) => (
            <button key={a.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-secondary/60 py-3 text-[12px] font-medium text-foreground transition hover:bg-secondary active:scale-95">
              <a.icon className="h-4 w-4 text-primary-foreground" style={{ color: "oklch(0.5 0.15 150)" }} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}


export default function ChatApp() {
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [activeId, setActiveId] = useState<string>("design");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefLang, setPrefLang] = useState("en");
  const [moreOpen, setMoreOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const chatSearchRef = useRef<HTMLInputElement>(null);
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [sendKick, setSendKick] = useState(false);

  const list = conversations.filter((c) => activeFolder === "all" || c.folder === activeFolder);
  const active = conversations.find((c) => c.id === activeId)!;
  const pref = languages.find((l) => l.code === prefLang) ?? languages[0];

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        setShortcutsOpen(false);
        setChatSearchOpen(false);
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (k === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        SND("soft-pop");
      } else if (k === "/") {
        e.preventDefault();
        setShortcutsOpen((o) => !o);
        SND("soft-pop");
      } else if (e.shiftKey && k === "f") {
        e.preventDefault();
        setChatSearchOpen(true);
        setTimeout(() => chatSearchRef.current?.focus(), 60);
        SND("soft-pop");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Enterprise security policy: block copy / cut / paste / context menu inside the chat.
  const blockEvent = (e: React.SyntheticEvent) => e.preventDefault();

  const handleTool = (k: string) => {
    setMoreOpen(false);
    if (k === "GIF") { setGifOpen((o) => !o); setEmojiOpen(false); setStudioOpen(false); }
    else if (k === "Sticker") { setStudioOpen(true); setEmojiOpen(false); setGifOpen(false); }
    else if (k === "AI Assist") { SND("ai-thinking"); }
    else { SND("soft-pop"); }
  };



  return (
    <div className="shell-bg flex h-screen w-full flex-col overflow-hidden p-3 md:p-4 md:gap-4">
      {/* Top header */}
      <header className="dark glass-strong z-20 flex items-center gap-3 rounded-3xl px-4 py-2.5 text-foreground">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl text-primary-foreground shadow-soft animate-glow-pulse" style={{ background: "var(--gradient-multi)" }}>
            <MessagesSquare className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-[15px] font-semibold leading-tight">Software Vala</p>
            <p className="text-[11px] text-muted-foreground">Enterprise Chat</p>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-lg items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2.5 transition-all duration-200 focus-within:border-white/25 focus-within:bg-white/10">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={searchRef}
            placeholder="Search conversations, people, files…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">⌘K</kbd>
        </div>


        <div className="flex items-center gap-1.5">
          <button onClick={() => setSettingsOpen(true)} className="hidden items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-medium text-foreground transition hover:bg-white/10 sm:flex" title="Language Settings">
            <Globe className="h-4 w-4 text-cyan-300" /> {pref.flag} {pref.name}
          </button>
          <button onClick={() => setShortcutsOpen(true)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10" title="Keyboard shortcuts (⌘/)">
            <Keyboard className="h-[18px] w-[18px]" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300 transition hover:bg-white/10" title="AI Assistant">
            <Sparkles className="h-[18px] w-[18px]" />
          </button>
          <button className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10" title="Notifications">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive animate-pulse-ring" />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-foreground transition hover:bg-white/10" title="Settings">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </button>
          <Avatar gradient="var(--gradient-brand)" label="ME" size={40} online ring />
        </div>
      </header>


      {/* Body */}
      <div className="flex min-h-0 flex-1 gap-3 md:gap-4">
        {/* Conversation list */}
        <aside className="dark glass-darker hidden w-[22%] min-w-[256px] max-w-[340px] shrink-0 flex-col rounded-[20px] text-foreground md:flex">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <div>
              <h1 className="font-display text-lg font-semibold tracking-tight">Messages</h1>
              <p className="text-[12px] text-muted-foreground">12 active conversations</p>
            </div>
            <button className="grid h-9 w-9 place-items-center rounded-full text-white shadow-soft transition hover:brightness-110" style={{ background: "var(--gradient-brand)" }}>
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="scrollbar-thin flex gap-2 overflow-x-auto px-5 pb-3">
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  activeFolder === f.id ? "text-white shadow-soft" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                }`}
                style={activeFolder === f.id ? { background: "var(--gradient-brand)" } : undefined}
              >
                {f.label}
                <span className="text-[11px] opacity-70">{f.count}</span>
              </button>
            ))}
          </div>

          <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
            {list.map((c) => (
              <ConversationRow key={c.id} c={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
            ))}
          </div>
        </aside>

        {/* Center conversation — milky white */}
        <section
          className="chat-texture flex min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] border border-border/60"
          style={{ boxShadow: "var(--shadow-card)" }}
          onCopy={blockEvent}
          onCut={blockEvent}
          onPaste={blockEvent}
          onContextMenu={blockEvent}
          onDragStart={blockEvent}
        >
          <header className="flex items-center gap-3.5 border-b border-border bg-card/70 px-6 py-3.5 backdrop-blur-xl">
            <Avatar gradient={active.color} label={active.initials} size={48} online={active.online} ring />
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-2 font-display text-[17px] font-semibold leading-tight">
                {active.name}
                {active.group && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">GROUP</span>}
              </h2>
              <p className="mt-0.5 flex items-center gap-2 text-[12px]">
                <span className={`flex items-center gap-1 font-medium ${active.online ? "text-online" : "text-muted-foreground"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${active.online ? "bg-online" : "bg-muted-foreground"}`} />
                  {active.online ? "Active now" : "last seen recently"}
                </span>
                {active.group && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" /> 8 members
                  </span>
                )}
              </p>
            </div>
            {[Phone, Video, Search, MoreVertical].map((Icon, i) => (
              <button key={i} className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-95">
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </header>


          {/* Compliance banner */}
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-6 py-2 text-[11px] text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">
              Secure &amp; immutable · No copy · No forward · No export · Messages can't be edited or deleted
            </span>
            <span className="ml-auto hidden items-center gap-1 rounded-full bg-card px-2 py-0.5 font-medium text-foreground sm:inline-flex">
              <ScrollText className="h-3 w-3" /> Audit logged
            </span>
          </div>

          {/* In-conversation search (Ctrl+Shift+F) */}
          {chatSearchOpen && (
            <div className="flex animate-popover-in items-center gap-2.5 border-b border-border bg-card px-6 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-primary" />
              <input
                ref={chatSearchRef}
                placeholder="Search in this conversation…"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="shrink-0 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Esc</kbd>
              <button onClick={() => setChatSearchOpen(false)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="scrollbar-thin flex-1 select-none overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-3xl">
              {messages.map((m, i) => (
                <Bubble key={m.id} m={m} index={i} prefName={pref.name} prefCode={pref.code} />
              ))}
              <TypingIndicator />
            </div>
          </div>

          {/* Composer */}
          <footer className="px-4 pb-4 pt-1 md:px-6 md:pb-5">

            <div className="mx-auto max-w-3xl">
              {studioOpen && (
                <AssetStudio
                  onClose={() => setStudioOpen(false)}
                  onPickSticker={(g) => { setDraft((d) => d + g); SND("sticker"); }}
                />
              )}
              {emojiOpen && (
                <div className="mb-2 flex origin-bottom animate-popover-in flex-wrap gap-1.5 rounded-2xl border border-border bg-popover p-3 shadow-float">
                  {["😀","😂","🥹","😍","😎","🤝","🙌","🔥","🚀","✨","💡","🎉","❤️","👏","👍","💯","🦄","🎨","⚡","☕"].map((e, i) => (
                    <button key={e} style={{ animationDelay: `${i * 18}ms` }} onClick={() => { setDraft((d) => d + e); SND("emoji"); }} className="stagger-item grid h-9 w-9 place-items-center rounded-xl text-xl transition-transform hover:scale-125 hover:bg-muted">
                      {e}
                    </button>
                  ))}
                </div>
              )}
              {gifOpen && (
                <div className="mb-2 origin-bottom animate-popover-in rounded-2xl border border-border bg-popover p-3 shadow-float">
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-muted-foreground">
                    <Film className="h-3.5 w-3.5 text-primary" /> Suggested for this chat
                    <button onClick={() => setGifOpen(false)} className="ml-auto grid h-6 w-6 place-items-center rounded-full hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {GIF_CATEGORIES.map((g, i) => (
                      <button key={g.k} style={{ animationDelay: `${i * 22}ms` }} onClick={() => { setDraft((d) => d + g.e); SND("emoji"); setGifOpen(false); }} className="stagger-item flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-2.5 transition-transform hover:scale-105 hover:bg-muted">
                        <span className="text-2xl">{g.e}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{g.k}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {moreOpen && (
                <div className="mb-2 origin-bottom-left animate-popover-in rounded-2xl border border-border bg-popover p-3 shadow-float">
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-muted-foreground">
                    <Plus className="h-3.5 w-3.5 text-primary" /> Tools &amp; Advanced
                    <button onClick={() => setMoreOpen(false)} className="ml-auto grid h-6 w-6 place-items-center rounded-full hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {MORE_TOOLS.map((t, i) => (
                      <button key={t.k} style={{ animationDelay: `${i * 30}ms` }} onClick={() => handleTool(t.k)} className="stagger-item flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-[11px] font-medium text-foreground transition-transform hover:scale-105 hover:bg-muted">
                        <t.icon className="h-5 w-5 text-primary" />
                        {t.k}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-1 rounded-[18px] border border-border bg-surface px-2 py-2 shadow-soft transition-all duration-200 focus-within:border-primary/40 focus-within:shadow-float">
                <button
                  onClick={() => { setMoreOpen((o) => !o); setEmojiOpen(false); setStudioOpen(false); setGifOpen(false); }}
                  title="More tools"
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200 hover:bg-secondary hover:scale-105 active:scale-90 ${moreOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Plus className={`h-5 w-5 transition-transform duration-200 ${moreOpen ? "rotate-45" : ""}`} />
                </button>
                <button
                  onClick={() => { setEmojiOpen((o) => !o); setStudioOpen(false); setGifOpen(false); setMoreOpen(false); }}
                  title="Emoji"
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-200 hover:bg-secondary hover:scale-105 active:scale-90 ${emojiOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button title="Attachment" onClick={() => SND("soft-pop")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-90">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button title="AI Suggest" onClick={() => SND("ai-thinking")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-primary hover:scale-105 active:scale-90">
                  <Sparkles className="h-5 w-5" />
                </button>

                <textarea
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  className="scrollbar-thin max-h-32 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => {
                    if (draft.trim()) { SND("msg-sent"); setDraft(""); } else { SND("voice-start"); }
                    setSendKick(true); setTimeout(() => setSendKick(false), 320);
                  }}
                  title={draft.trim() ? "Send" : "Voice message"}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground shadow-soft transition-all duration-200 hover:brightness-105 hover:scale-105 active:scale-90 ${sendKick ? "animate-send-kick" : ""}`}
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {draft.trim() ? <Send className="h-[18px] w-[18px]" /> : <Mic className="h-[18px] w-[18px]" />}
                </button>
              </div>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Messages are immutable once sent · No edit · No delete · Auto-translates to {pref.flag} {pref.name}
              </p>

            </div>
          </footer>
        </section>

        {/* Right context panel */}
        <ContextPanel active={active} />
      </div>

      {/* Mobile hint */}
      <div className="flex items-center justify-center gap-2 text-center text-[12px] text-muted-foreground md:hidden">
        <ChevronRight className="h-4 w-4" /> Open on a wider screen for the full premium experience.
      </div>

      {settingsOpen && (
        <LanguageSettings
          current={prefLang}
          onClose={() => setSettingsOpen(false)}
          onSelect={(code) => { setPrefLang(code); SND("success"); }}
        />
      )}

      {/* Keyboard shortcuts overlay (Ctrl+/) */}
      {shortcutsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShortcutsOpen(false)}
        >
          <div
            className="dark w-full max-w-md animate-popover-in rounded-[20px] border border-white/10 bg-graphite p-6 text-foreground shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-multi)" }}>
                <Command className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold leading-tight">Keyboard Shortcuts</h3>
                <p className="text-[11px] text-muted-foreground">Work faster across Software Vala</p>
              </div>
              <button onClick={() => setShortcutsOpen(false)} className="ml-auto grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { keys: ["Ctrl", "K"], label: "Search conversations, people & files" },
                { keys: ["Ctrl", "Shift", "F"], label: "Find within this conversation" },
                { keys: ["Ctrl", "/"], label: "Toggle this shortcuts panel" },
                { keys: ["Esc"], label: "Close panels & search" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                  <span className="flex-1 text-[13px] text-foreground/90">{s.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-foreground">{k}</kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

  );
}
