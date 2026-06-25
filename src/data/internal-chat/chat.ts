export type DeliveryState = "sent" | "delivered" | "read";

export interface Reaction {
  emoji: string;
  count: number;
  reacted?: boolean;
}

export interface Message {
  id: string;
  authorId: string;
  text?: string;
  time: string;
  outgoing?: boolean;
  state?: DeliveryState;
  reactions?: Reaction[];
  replyTo?: { author: string; text: string };
  sticker?: string;
  system?: string;
  /** Original language the sender wrote in (display label) */
  lang?: string;
  /** Pre-translated copy into the viewer's preferred language (demo) */
  translated?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  color: string;
  initials: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  color: string;
  last: string;
  time: string;
  unread?: number;
  online?: boolean;
  pinned?: boolean;
  muted?: boolean;
  typing?: boolean;
  group?: boolean;
  folder: "all" | "team" | "direct" | "projects";
}

export const folders = [
  { id: "all", label: "All Chats", count: 12 },
  { id: "direct", label: "Direct", count: 5 },
  { id: "team", label: "Teams", count: 4 },
  { id: "projects", label: "Projects", count: 3 },
] as const;

export const members: Record<string, Member> = {
  me: { id: "me", name: "You", role: "Owner", color: "var(--gradient-brand)", initials: "ME" },
  aanya: { id: "aanya", name: "Aanya Mehta", role: "Product Lead", color: "linear-gradient(135deg,#f472b6,#db2777)", initials: "AM" },
  rohan: { id: "rohan", name: "Rohan Verma", role: "Engineering", color: "linear-gradient(135deg,#34d399,#0d9488)", initials: "RV" },
  kabir: { id: "kabir", name: "Kabir Shah", role: "Design", color: "linear-gradient(135deg,#fbbf24,#d97706)", initials: "KS" },
};

export const conversations: Conversation[] = [
  { id: "design", name: "Design System", initials: "DS", color: "linear-gradient(135deg,#a78bfa,#6d28d9)", last: "Kabir: pushed the new bubble tokens ✨", time: "now", unread: 3, online: true, pinned: true, group: true, folder: "projects", typing: true },
  { id: "aanya", name: "Aanya Mehta", initials: "AM", color: "linear-gradient(135deg,#f472b6,#db2777)", last: "Looks premium. Ship it 🚀", time: "9:42", unread: 2, online: true, pinned: true, folder: "direct" },
  { id: "rohan", name: "Rohan Verma", initials: "RV", color: "linear-gradient(135deg,#34d399,#0d9488)", last: "You: deploying to staging now", time: "9:30", online: true, folder: "direct" },
  { id: "leadership", name: "Leadership", initials: "LD", color: "linear-gradient(135deg,#60a5fa,#2563eb)", last: "Quarterly sync moved to 4 PM", time: "8:58", group: true, folder: "team" },
  { id: "kabir", name: "Kabir Shah", initials: "KS", color: "linear-gradient(135deg,#fbbf24,#d97706)", last: "Sticker 🎨", time: "Yest", muted: true, folder: "direct" },
  { id: "frontend", name: "Frontend Guild", initials: "FG", color: "linear-gradient(135deg,#22d3ee,#0891b2)", last: "Rohan: review when free", time: "Yest", unread: 8, group: true, folder: "team" },
  { id: "marketing", name: "Marketing", initials: "MK", color: "linear-gradient(135deg,#fb7185,#e11d48)", last: "Campaign assets ready", time: "Mon", group: true, folder: "team" },
];

export const messages: Message[] = [
  { id: "s0", authorId: "system", time: "", system: "Today" },
  { id: "m1", authorId: "kabir", lang: "Hindi", text: "सुप्रभात टीम! मैंने अभी डिज़ाइन सिस्टम में नए मैसेज बबल टोकन पुश किए हैं।", translated: "Morning team! I just pushed the refreshed message bubble tokens to the design system.", time: "9:31" },
  { id: "m2", authorId: "kabir", lang: "Hindi", text: "गोल किनारे, नया आउटगोइंग ग्रेडिएंट, और हल्की शैडो। अब यह काफ़ी प्रीमियम लगता है।", translated: "Rounded corners, the new outgoing gradient, and softer shadows. Feels way more premium now.", time: "9:31", reactions: [{ emoji: "🔥", count: 4, reacted: true }, { emoji: "👏", count: 2 }] },
  { id: "m3", authorId: "aanya", lang: "Spanish", text: "Esto es precioso. La animación de los ticks de entrega es un detalle muy bonito.", translated: "Oh this is gorgeous. The delivery ticks animation is such a nice touch.", time: "9:33", replyTo: { author: "Kabir Shah", text: "Rounded corners, the new outgoing gradient…" } },
  { id: "m4", authorId: "me", outgoing: true, lang: "English", text: "Agreed — pulling these into the chat module right now. Reactions and reply previews included.", time: "9:38", state: "read", reactions: [{ emoji: "🚀", count: 3 }] },
  { id: "m5", authorId: "rohan", sticker: "🦄", time: "9:40", reactions: [{ emoji: "😂", count: 5, reacted: true }] },
  { id: "m6", authorId: "aanya", lang: "Spanish", text: "Se ve premium. ¡A producción! 🚀", translated: "Looks premium. Ship it 🚀", time: "9:42" },
  { id: "m7", authorId: "me", outgoing: true, lang: "English", text: "On it. Pushing to staging in a few minutes.", time: "9:43", state: "delivered" },
];
