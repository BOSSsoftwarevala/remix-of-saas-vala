import { useEffect, useMemo, useRef, useState } from "react";
const useServerFn = <T,>(fn: T): T => fn;
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  X,
  User2,
  AlertTriangle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Download,
  FileJson,
  FileText,
  Search,
  Calendar,
  MessageSquare,
  History,
  Copy,
  Check,
} from "lucide-react";
import { chatWithAi, type ChatMessage } from "@/lib/chat-ai.functions";

const STORAGE_KEY = "vala-ai-chat-history-v3";
const LEGACY_STORAGE_KEY = "vala-ai-chat-history-v2";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type Reaction = "up" | "down" | null;
type StoredMessage = ChatMessage & { id: string; ts: number; reaction?: Reaction };

const SUGGESTIONS = [
  "What can I manage from this panel?",
  "How do I add a Hero Banner campaign?",
  "Checklist before publishing the homepage",
  "Best practice for SEO meta + hashtags",
  "How to A/B test a Wall layout",
  "Where do I approve vendor submissions?",
];

export function AiChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const callChat = useServerFn(chatWithAi);
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredMessage[];
        setMessages(parsed.map((m) => (m.id ? m : { ...m, id: generateId() })));
        return;
      }
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsed = JSON.parse(legacy) as Omit<StoredMessage, "id">[];
        const migrated = parsed.map((m) => ({ ...m, id: generateId() }));
        setMessages(migrated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : 0;
    const to = dateTo ? new Date(dateTo).getTime() + 86_400_000 : Infinity;
    if (!q && !dateFrom && !dateTo) return messages;
    return messages.filter(
      (m) =>
        (!q || m.content.toLowerCase().includes(q)) && m.ts >= from && m.ts <= to,
    );
  }, [messages, query, dateFrom, dateTo]);

  const ratedMessages = useMemo(
    () => messages.filter((m) => m.role === "assistant" && m.reaction),
    [messages],
  );

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next: StoredMessage[] = [
      ...messages,
      { id: generateId(), role: "user", content, ts: Date.now() },
    ];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const out = await callChat({
        data: { messages: next.map(({ role, content }) => ({ role, content })) },
      });
      if (out.error) {
        setError(out.error);
      } else {
        setMessages([
          ...next,
          { id: generateId(), role: "assistant", content: out.reply, ts: Date.now(), reaction: null },
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reach AI");
    } finally {
      setLoading(false);
    }
  }

  function setReaction(id: string, reaction: Reaction) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, reaction: m.reaction === reaction ? null : reaction } : m,
      ),
    );
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    });
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vala-chat-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  }

  function exportPDF() {
    const rows = messages
      .map((m) => {
        const when = new Date(m.ts).toLocaleString();
        const who = m.role === "user" ? "You" : "Vala AI";
        const reaction =
          m.reaction === "up" ? " 👍" : m.reaction === "down" ? " 👎" : "";
        const safe = escapeHtml(m.content);
        return `<div class="msg ${m.role}"><div class="meta">${who} · ${when}${reaction}</div><div class="body">${safe}</div></div>`;
      })
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Vala AI Chat Export</title>
<style>
  body{font:14px/1.5 -apple-system,Segoe UI,sans-serif;color:#111;padding:32px;max-width:780px;margin:auto}
  h1{font-size:20px;margin:0 0 4px}
  .sub{color:#666;margin-bottom:24px;font-size:12px}
  .msg{padding:10px 14px;border-radius:10px;margin:8px 0;page-break-inside:avoid}
  .msg.user{background:#eef4ff}
  .msg.assistant{background:#f6f6f6}
  .meta{font-size:11px;color:#666;margin-bottom:4px;font-weight:600}
  .body{white-space:pre-wrap}
</style></head><body>
<h1>Vala AI — Chat Export</h1>
<div class="sub">Generated ${new Date().toLocaleString()} · ${messages.length} messages</div>
${rows || "<p>No messages.</p>"}
<script>window.onload=()=>{setTimeout(()=>window.print(),200)}</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
    setShowExport(false);
  }

  function closePanels() {
    setShowSearch(false);
    setShowExport(false);
    setShowFeedback(false);
  }

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-label="Vala AI Chat"
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-[oklch(0.16_0.03_240/0.95)] shadow-[0_0_60px_-10px_oklch(0.80_0.13_192/0.35)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent ring-1 ring-white/10">
              <Bot className="h-4.5 w-4.5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                Vala AI
              </div>
              <div className="text-sm font-bold text-foreground">Marketplace Assistant</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconBtn
              title="Feedback history"
              active={showFeedback}
              onClick={() => {
                setShowFeedback((s) => !s);
                setShowSearch(false);
                setShowExport(false);
              }}
            >
              <History className="h-3.5 w-3.5" />
              {ratedMessages.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-3.5 min-w-[14px] place-items-center rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                  {ratedMessages.length}
                </span>
              )}
            </IconBtn>
            <IconBtn
              title="Search"
              active={showSearch}
              onClick={() => {
                setShowSearch((s) => !s);
                setShowFeedback(false);
                setShowExport(false);
              }}
            >
              <Search className="h-3.5 w-3.5" />
            </IconBtn>
            <div className="relative">
              <IconBtn
                title="Export"
                active={showExport}
                onClick={() => {
                  setShowExport((s) => !s);
                  setShowSearch(false);
                  setShowFeedback(false);
                }}
              >
                <Download className="h-3.5 w-3.5" />
              </IconBtn>
              {showExport && (
                <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-[oklch(0.18_0.03_240)] shadow-xl">
                  <button
                    onClick={exportJSON}
                    disabled={!messages.length}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-foreground hover:bg-white/[0.06] disabled:opacity-40"
                  >
                    <FileJson className="h-3.5 w-3.5 text-accent" /> Export as JSON
                  </button>
                  <button
                    onClick={exportPDF}
                    disabled={!messages.length}
                    className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-xs text-foreground hover:bg-white/[0.06] disabled:opacity-40"
                  >
                    <FileText className="h-3.5 w-3.5 text-accent" /> Export as PDF
                  </button>
                </div>
              )}
            </div>
            <IconBtn
              title="Clear history"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn title="Close" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="space-y-2 border-b border-border bg-white/[0.02] px-3 py-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-white/[0.04] px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages…"
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[11px] text-foreground focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-white/[0.04] px-2 py-1 text-[11px] text-foreground focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>
                {filtered.length} of {messages.length} match
              </span>
              {(query || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-accent hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Feedback history */}
        {showFeedback && (
          <div className="flex flex-1 flex-col border-b border-border bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <History className="h-3.5 w-3.5 text-accent" />
                Feedback History
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
              {ratedMessages.length === 0 ? (
                <div className="rounded-xl border border-border bg-white/[0.03] px-3 py-8 text-center text-xs text-muted-foreground">
                  No reactions yet. Rate AI replies with thumbs up/down to build your feedback history.
                </div>
              ) : (
                ratedMessages.map((m) => {
                  const pairIndex = messages.findIndex((x) => x.id === m.id);
                  const userPrompt = messages[pairIndex - 1]?.content ?? "—";
                  return (
                    <div
                      key={m.id}
                      className="rounded-xl border border-border bg-white/[0.03] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                          {m.reaction === "up" ? (
                            <ThumbsUp className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <ThumbsDown className="h-3 w-3 text-rose-400" />
                          )}
                          <span className="text-foreground">
                            {m.reaction === "up" ? "Helpful" : "Not helpful"}
                          </span>
                          <span className="text-muted-foreground">
                            · {new Date(m.ts).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyText(m.content, m.id)}
                            title="Copy response"
                            className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                          >
                            {copiedId === m.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowFeedback(false);
                              send(userPrompt);
                            }}
                            title="Reuse prompt"
                            className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                          >
                            <MessageSquare className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Prompt
                        </div>
                        <div className="rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-foreground">
                          {userPrompt}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Response
                        </div>
                        <div className="whitespace-pre-wrap rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[11px] text-foreground">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {!showFeedback && (
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-border bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-accent" /> Ask Vala AI anything
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  I help you run the marketplace homepage — banners, walls, offers, SEO, analytics, integrity and more.
                </p>
                <div className="mt-3 grid gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-lg border border-border bg-white/[0.03] px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:border-[oklch(0.80_0.13_192/0.35)] hover:bg-white/[0.06] hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && messages.length > 0 && (
              <div className="rounded-xl border border-border bg-white/[0.03] px-3 py-6 text-center text-xs text-muted-foreground">
                No messages match your search.
              </div>
            )}

            {filtered.map((m) => (
              <MessageBubble
                key={m.id}
                msg={m}
                highlight={query.trim()}
                onReact={(r) => setReaction(m.id, r)}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Vala AI is thinking…
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {messages.length > 0 && !showSearch && !showFeedback && (
          <div className="flex gap-1.5 overflow-x-auto border-t border-border px-4 py-2">
            {SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 rounded-full border border-border bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-white/[0.04] p-2 focus-within:border-[oklch(0.80_0.13_192/0.45)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about banners, SEO, vendors, analytics…"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-[0_0_18px_-6px_oklch(0.80_0.13_192/0.6)] transition-opacity disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-1.5 px-1 text-[10px] text-muted-foreground">
            Enter to send • Shift+Enter for newline • Powered by Lovable AI
          </div>
        </form>
      </aside>
    </>
  );
}

function IconBtn({
  children,
  active,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; className?: string }) {
  return (
    <button
      {...rest}
      className={`relative rounded-full border p-2 transition-colors ${
        active
          ? "border-[oklch(0.80_0.13_192/0.45)] bg-[oklch(0.80_0.13_192/0.14)] text-foreground"
          : "border-border bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function MessageBubble({
  msg,
  highlight,
  onReact,
}: {
  msg: StoredMessage;
  highlight: string;
  onReact: (r: Reaction) => void;
}) {
  if (msg.role === "system") return null;
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1 ring-white/10 ${
          isUser
            ? "bg-white/[0.08] text-foreground"
            : "bg-gradient-to-br from-primary to-accent text-white"
        }`}
      >
        {isUser ? <User2 className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
            isUser
              ? "bg-[oklch(0.80_0.13_192/0.14)] text-foreground"
              : "border border-border bg-white/[0.03] text-foreground"
          }`}
        >
          {highlight ? highlightText(msg.content, highlight) : msg.content}
        </div>
        <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
          <span>{new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {!isUser && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onReact("up")}
                title="Helpful"
                className={`grid h-5 w-5 place-items-center rounded transition-colors ${
                  msg.reaction === "up"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "hover:bg-white/[0.08] hover:text-foreground"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => onReact("down")}
                title="Not helpful"
                className={`grid h-5 w-5 place-items-center rounded transition-colors ${
                  msg.reaction === "down"
                    ? "bg-rose-500/20 text-rose-300"
                    : "hover:bg-white/[0.08] hover:text-foreground"
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightText(text: string, q: string) {
  const needle = q.trim();
  if (!needle) return text;
  const parts = text.split(new RegExp(`(${escapeRegex(needle)})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === needle.toLowerCase() ? (
      <mark key={i} className="rounded bg-[oklch(0.80_0.13_192/0.35)] px-0.5 text-foreground">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
