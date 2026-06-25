// ============================================================
// Software Vala — Enterprise Chat Asset Library (210+ assets)
// Role Stickers · Business Reactions · Sound Packs ·
// Animated Stickers · Professional Role Avatars
// ============================================================

export interface RoleSticker {
  id: string;
  glyph: string;
  label: string;
  tone: "approve" | "reject" | "neutral" | "alert" | "success";
}

export interface BusinessReaction {
  id: string;
  glyph: string;
  label: string;
}

export interface SoundAsset {
  id: string;
  label: string;
  group: "Messaging" | "Status" | "Rewards" | "Files" | "Calls" | "System";
  // synth recipe consumed by src/lib/sounds.ts
  freq: number;
  type: OscillatorType;
  dur: number;
  sweep?: number; // target frequency for a glide
}

export interface AnimatedSticker {
  id: string;
  glyph: string;
  label: string;
  anim: "pop" | "bounce" | "spin" | "shake" | "pulse" | "float";
}

export interface RoleAvatar {
  id: string;
  role: string;
  initials: string;
  gradient: string;
  dept: "Leadership" | "Engineering" | "Design" | "Business" | "Operations" | "External";
}

// ── 1. Enterprise Role Stickers (40) ─────────────────────────
export const roleStickers: RoleSticker[] = [
  { id: "boss-approved", glyph: "👑", label: "Boss Approved", tone: "approve" },
  { id: "boss-rejected", glyph: "👑", label: "Boss Rejected", tone: "reject" },
  { id: "boss-reviewing", glyph: "👑", label: "Boss Reviewing", tone: "neutral" },
  { id: "dev-working", glyph: "💻", label: "Developer Working", tone: "neutral" },
  { id: "bug-fixed", glyph: "💻", label: "Bug Fixed", tone: "success" },
  { id: "deploying", glyph: "💻", label: "Deploying", tone: "neutral" },
  { id: "qa-passed", glyph: "🧪", label: "QA Passed", tone: "success" },
  { id: "qa-failed", glyph: "🧪", label: "QA Failed", tone: "reject" },
  { id: "ui-updated", glyph: "🎨", label: "UI Updated", tone: "success" },
  { id: "design-ready", glyph: "🎨", label: "Design Ready", tone: "success" },
  { id: "product-ready", glyph: "📦", label: "Product Ready", tone: "success" },
  { id: "released", glyph: "📦", label: "Released", tone: "success" },
  { id: "sales-closed", glyph: "📈", label: "Sales Closed", tone: "success" },
  { id: "support-online", glyph: "📞", label: "Support Online", tone: "neutral" },
  { id: "ai-thinking", glyph: "🤖", label: "AI Thinking", tone: "neutral" },
  { id: "ai-generated", glyph: "🤖", label: "AI Generated", tone: "success" },
  { id: "urgent", glyph: "⚡", label: "Urgent", tone: "alert" },
  { id: "high-priority", glyph: "🔥", label: "High Priority", tone: "alert" },
  { id: "done", glyph: "✅", label: "Done", tone: "approve" },
  { id: "rejected", glyph: "❌", label: "Rejected", tone: "reject" },
  { id: "pending", glyph: "⏳", label: "Pending", tone: "neutral" },
  { id: "deploy", glyph: "🚀", label: "Deploy", tone: "success" },
  { id: "maintenance", glyph: "🛠", label: "Maintenance", tone: "neutral" },
  { id: "secure", glyph: "🔒", label: "Secure", tone: "approve" },
  { id: "announcement", glyph: "📢", label: "Announcement", tone: "alert" },
  { id: "success", glyph: "🎉", label: "Success", tone: "success" },
  { id: "achievement", glyph: "🏆", label: "Achievement", tone: "success" },
  { id: "top-performer", glyph: "⭐", label: "Top Performer", tone: "success" },
  { id: "payment-received", glyph: "💰", label: "Payment Received", tone: "success" },
  { id: "download-ready", glyph: "📥", label: "Download Ready", tone: "neutral" },
  { id: "document-ready", glyph: "📄", label: "Document Ready", tone: "neutral" },
  { id: "analytics-ready", glyph: "📊", label: "Analytics Ready", tone: "neutral" },
  { id: "syncing", glyph: "🔄", label: "Syncing", tone: "neutral" },
  { id: "online", glyph: "🌐", label: "Online", tone: "success" },
  { id: "silent", glyph: "🔕", label: "Silent", tone: "neutral" },
  { id: "pinned", glyph: "📌", label: "Pinned", tone: "neutral" },
  { id: "invoice-ready", glyph: "🧾", label: "Invoice Ready", tone: "neutral" },
  { id: "package-ready", glyph: "📦", label: "Package Ready", tone: "success" },
  { id: "partnership", glyph: "🤝", label: "Partnership", tone: "approve" },
  { id: "thank-you", glyph: "❤️", label: "Thank You", tone: "approve" },
];

// ── 2. Business Reactions (40) ───────────────────────────────
export const businessReactions: BusinessReaction[] = [
  { id: "thumbs-up", glyph: "👍", label: "Approve" },
  { id: "thumbs-down", glyph: "👎", label: "Disapprove" },
  { id: "heart", glyph: "❤️", label: "Love" },
  { id: "fire", glyph: "🔥", label: "Hot" },
  { id: "rocket", glyph: "🚀", label: "Ship It" },
  { id: "clap", glyph: "👏", label: "Bravo" },
  { id: "tada", glyph: "🎉", label: "Celebrate" },
  { id: "smile", glyph: "😄", label: "Happy" },
  { id: "handshake", glyph: "🤝", label: "Deal" },
  { id: "hundred", glyph: "💯", label: "Perfect" },
  { id: "star", glyph: "⭐", label: "Star" },
  { id: "eyes", glyph: "👀", label: "Watching" },
  { id: "cool", glyph: "😎", label: "Cool" },
  { id: "pray", glyph: "🙏", label: "Thanks" },
  { id: "idea", glyph: "💡", label: "Idea" },
  { id: "pin", glyph: "📌", label: "Pin" },
  { id: "bolt", glyph: "⚡", label: "Fast" },
  { id: "tools", glyph: "🛠", label: "Fixing" },
  { id: "approved", glyph: "🔥", label: "Approved" },
  { id: "reviewed", glyph: "✔", label: "Reviewed" },
  { id: "smart", glyph: "🧠", label: "Smart" },
  { id: "business", glyph: "💼", label: "Business" },
  { id: "winner", glyph: "🏆", label: "Winner" },
  { id: "revenue", glyph: "💵", label: "Revenue" },
  { id: "growth", glyph: "📈", label: "Growth" },
  { id: "drop", glyph: "📉", label: "Drop" },
  { id: "wait", glyph: "⏳", label: "Wait" },
  { id: "alert", glyph: "🚨", label: "Alert" },
  { id: "notice", glyph: "📢", label: "Notice" },
  { id: "reminder", glyph: "🔔", label: "Reminder" },
  { id: "received", glyph: "📥", label: "Received" },
  { id: "sent", glyph: "📤", label: "Sent" },
  { id: "reply", glyph: "💬", label: "Reply" },
  { id: "updated", glyph: "🔄", label: "Updated" },
  { id: "invoice", glyph: "🧾", label: "Invoice" },
  { id: "delivered", glyph: "📦", label: "Delivered" },
  { id: "target", glyph: "🎯", label: "Target" },
  { id: "excellent", glyph: "🌟", label: "Excellent" },
  { id: "ai", glyph: "🤖", label: "AI" },
  { id: "support", glyph: "❤️", label: "Support" },
];

// ── 3. Sound Effects (40) — synthesized via Web Audio ────────
export const soundAssets: SoundAsset[] = [
  { id: "msg-sent", label: "Message Sent", group: "Messaging", freq: 660, type: "sine", dur: 0.12, sweep: 880 },
  { id: "msg-received", label: "Message Received", group: "Messaging", freq: 520, type: "sine", dur: 0.14, sweep: 400 },
  { id: "soft-pop", label: "Soft Pop", group: "Messaging", freq: 440, type: "sine", dur: 0.08 },
  { id: "glass-pop", label: "Glass Pop", group: "Messaging", freq: 980, type: "triangle", dur: 0.1 },
  { id: "bubble-pop", label: "Bubble Pop", group: "Messaging", freq: 600, type: "sine", dur: 0.07, sweep: 900 },
  { id: "click", label: "Click", group: "Messaging", freq: 1200, type: "square", dur: 0.04 },
  { id: "success", label: "Success", group: "Status", freq: 523, type: "sine", dur: 0.2, sweep: 784 },
  { id: "error", label: "Error", group: "Status", freq: 200, type: "sawtooth", dur: 0.22, sweep: 120 },
  { id: "warning", label: "Warning", group: "Status", freq: 440, type: "square", dur: 0.18, sweep: 330 },
  { id: "new-ams", label: "New AMS", group: "Status", freq: 700, type: "triangle", dur: 0.16, sweep: 1000 },
  { id: "ams-assigned", label: "AMS Assigned", group: "Status", freq: 560, type: "sine", dur: 0.15, sweep: 740 },
  { id: "ams-closed", label: "AMS Closed", group: "Status", freq: 740, type: "sine", dur: 0.18, sweep: 440 },
  { id: "boss-message", label: "Boss Message", group: "Messaging", freq: 330, type: "triangle", dur: 0.22, sweep: 520 },
  { id: "ai-reply", label: "AI Reply", group: "Messaging", freq: 880, type: "sine", dur: 0.16, sweep: 1320 },
  { id: "mention", label: "Mention", group: "Messaging", freq: 1046, type: "triangle", dur: 0.12, sweep: 784 },
  { id: "reaction", label: "Reaction", group: "Messaging", freq: 784, type: "sine", dur: 0.1, sweep: 1046 },
  { id: "like", label: "Like", group: "Rewards", freq: 880, type: "sine", dur: 0.1, sweep: 1174 },
  { id: "achievement", label: "Achievement", group: "Rewards", freq: 523, type: "triangle", dur: 0.26, sweep: 1046 },
  { id: "trophy", label: "Trophy", group: "Rewards", freq: 659, type: "sine", dur: 0.28, sweep: 1318 },
  { id: "xp", label: "XP", group: "Rewards", freq: 784, type: "square", dur: 0.1, sweep: 1568 },
  { id: "payment", label: "Payment", group: "Rewards", freq: 698, type: "sine", dur: 0.2, sweep: 1046 },
  { id: "order", label: "Order", group: "Rewards", freq: 587, type: "triangle", dur: 0.18, sweep: 880 },
  { id: "notification", label: "Notification", group: "System", freq: 880, type: "sine", dur: 0.12, sweep: 660 },
  { id: "download", label: "Download", group: "Files", freq: 660, type: "sine", dur: 0.18, sweep: 330 },
  { id: "upload", label: "Upload", group: "Files", freq: 330, type: "sine", dur: 0.18, sweep: 660 },
  { id: "file-received", label: "File Received", group: "Files", freq: 520, type: "triangle", dur: 0.14, sweep: 392 },
  { id: "file-sent", label: "File Sent", group: "Files", freq: 392, type: "triangle", dur: 0.14, sweep: 520 },
  { id: "voice-start", label: "Voice Start", group: "Calls", freq: 440, type: "sine", dur: 0.16, sweep: 660 },
  { id: "voice-end", label: "Voice End", group: "Calls", freq: 660, type: "sine", dur: 0.16, sweep: 440 },
  { id: "video-call", label: "Video Call", group: "Calls", freq: 587, type: "triangle", dur: 0.2, sweep: 880 },
  { id: "call-ring", label: "Call Ring", group: "Calls", freq: 480, type: "sine", dur: 0.3, sweep: 620 },
  { id: "incoming-call", label: "Incoming Call", group: "Calls", freq: 523, type: "triangle", dur: 0.28, sweep: 784 },
  { id: "outgoing-call", label: "Outgoing Call", group: "Calls", freq: 392, type: "sine", dur: 0.28, sweep: 523 },
  { id: "sticker", label: "Sticker", group: "Messaging", freq: 740, type: "triangle", dur: 0.12, sweep: 1100 },
  { id: "emoji", label: "Emoji", group: "Messaging", freq: 660, type: "sine", dur: 0.08, sweep: 880 },
  { id: "reminder", label: "Reminder", group: "System", freq: 880, type: "triangle", dur: 0.16, sweep: 1046 },
  { id: "calendar", label: "Calendar", group: "System", freq: 587, type: "sine", dur: 0.16, sweep: 784 },
  { id: "sync-complete", label: "Sync Complete", group: "System", freq: 659, type: "sine", dur: 0.2, sweep: 988 },
  { id: "login", label: "Login", group: "System", freq: 440, type: "sine", dur: 0.18, sweep: 880 },
  { id: "logout", label: "Logout", group: "System", freq: 880, type: "sine", dur: 0.18, sweep: 440 },
];

// ── 4. Animated Business Stickers (40) ───────────────────────
export const animatedStickers: AnimatedSticker[] = [
  { id: "boss-clap", glyph: "👏", label: "Boss Clap", anim: "bounce" },
  { id: "boss-angry", glyph: "😠", label: "Boss Angry", anim: "shake" },
  { id: "boss-happy", glyph: "😀", label: "Boss Happy", anim: "bounce" },
  { id: "dev-coding", glyph: "👨‍💻", label: "Developer Coding", anim: "pulse" },
  { id: "qa-testing", glyph: "🧪", label: "QA Testing", anim: "shake" },
  { id: "ai-thinking", glyph: "🤖", label: "AI Robot Thinking", anim: "pulse" },
  { id: "ai-typing", glyph: "🤖", label: "AI Robot Typing", anim: "bounce" },
  { id: "rocket-launch", glyph: "🚀", label: "Rocket Launch", anim: "float" },
  { id: "deploy-anim", glyph: "📡", label: "Deploy Animation", anim: "pulse" },
  { id: "server-online", glyph: "🟢", label: "Server Online", anim: "pulse" },
  { id: "server-offline", glyph: "🔴", label: "Server Offline", anim: "shake" },
  { id: "security-shield", glyph: "🛡", label: "Security Shield", anim: "pulse" },
  { id: "lock", glyph: "🔒", label: "Lock", anim: "pop" },
  { id: "unlock", glyph: "🔓", label: "Unlock", anim: "pop" },
  { id: "payment-success", glyph: "💸", label: "Payment Success", anim: "float" },
  { id: "invoice", glyph: "🧾", label: "Invoice", anim: "pop" },
  { id: "analytics-graph", glyph: "📊", label: "Analytics Graph", anim: "bounce" },
  { id: "trophy", glyph: "🏆", label: "Trophy", anim: "bounce" },
  { id: "medal", glyph: "🏅", label: "Medal", anim: "spin" },
  { id: "fire", glyph: "🔥", label: "Fire", anim: "pulse" },
  { id: "lightning", glyph: "⚡", label: "Lightning", anim: "shake" },
  { id: "success-tick", glyph: "✅", label: "Success Tick", anim: "pop" },
  { id: "error-cross", glyph: "❌", label: "Error Cross", anim: "shake" },
  { id: "clock", glyph: "⏰", label: "Clock", anim: "spin" },
  { id: "alarm", glyph: "🚨", label: "Alarm", anim: "pulse" },
  { id: "bell", glyph: "🔔", label: "Bell", anim: "shake" },
  { id: "celebration", glyph: "🎉", label: "Celebration", anim: "bounce" },
  { id: "gift", glyph: "🎁", label: "Gift", anim: "pop" },
  { id: "party", glyph: "🥳", label: "Party", anim: "bounce" },
  { id: "coffee-break", glyph: "☕", label: "Coffee Break", anim: "float" },
  { id: "meeting", glyph: "📅", label: "Meeting", anim: "pop" },
  { id: "handshake", glyph: "🤝", label: "Handshake", anim: "bounce" },
  { id: "review", glyph: "🔍", label: "Review", anim: "spin" },
  { id: "bug", glyph: "🐛", label: "Bug", anim: "shake" },
  { id: "fix", glyph: "🩹", label: "Fix", anim: "pop" },
  { id: "patch", glyph: "🧩", label: "Patch", anim: "pop" },
  { id: "update", glyph: "🔄", label: "Update", anim: "spin" },
  { id: "cloud-sync", glyph: "☁️", label: "Cloud Sync", anim: "float" },
  { id: "backup", glyph: "💾", label: "Backup", anim: "pulse" },
  { id: "restore", glyph: "♻️", label: "Restore", anim: "spin" },
];

// ── 5. Professional Role Avatars (50) ────────────────────────
const G = {
  lead: "linear-gradient(135deg,#60a5fa,#2563eb)",
  eng: "linear-gradient(135deg,#34d399,#0d9488)",
  design: "linear-gradient(135deg,#fbbf24,#d97706)",
  biz: "linear-gradient(135deg,#f472b6,#db2777)",
  ops: "linear-gradient(135deg,#a78bfa,#6d28d9)",
  ext: "linear-gradient(135deg,#22d3ee,#0891b2)",
};

const ini = (s: string) =>
  s.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const mk = (role: string, gradient: string, dept: RoleAvatar["dept"]): RoleAvatar => ({
  id: role.toLowerCase().replace(/\s+/g, "-"),
  role,
  initials: ini(role),
  gradient,
  dept,
});

export const roleAvatars: RoleAvatar[] = [
  mk("Boss", G.lead, "Leadership"),
  mk("CEO", G.lead, "Leadership"),
  mk("Founder", G.lead, "Leadership"),
  mk("CTO", G.lead, "Leadership"),
  mk("COO", G.lead, "Leadership"),
  mk("HR", G.ops, "Operations"),
  mk("Finance", G.biz, "Business"),
  mk("Accounts", G.biz, "Business"),
  mk("Developer", G.eng, "Engineering"),
  mk("Senior Developer", G.eng, "Engineering"),
  mk("Frontend", G.eng, "Engineering"),
  mk("Backend", G.eng, "Engineering"),
  mk("Full Stack", G.eng, "Engineering"),
  mk("DevOps", G.eng, "Engineering"),
  mk("QA", G.eng, "Engineering"),
  mk("Tester", G.eng, "Engineering"),
  mk("UI Designer", G.design, "Design"),
  mk("UX Designer", G.design, "Design"),
  mk("AI Engineer", G.eng, "Engineering"),
  mk("ML Engineer", G.eng, "Engineering"),
  mk("Support", G.ops, "Operations"),
  mk("Sales", G.biz, "Business"),
  mk("Marketing", G.biz, "Business"),
  mk("Content Writer", G.design, "Design"),
  mk("Author", G.design, "Design"),
  mk("Publisher", G.design, "Design"),
  mk("Vendor", G.ext, "External"),
  mk("Reseller", G.ext, "External"),
  mk("Franchise", G.ext, "External"),
  mk("Affiliate", G.ext, "External"),
  mk("Influencer", G.ext, "External"),
  mk("Customer", G.ext, "External"),
  mk("Enterprise Client", G.ext, "External"),
  mk("Moderator", G.ops, "Operations"),
  mk("Super Admin", G.lead, "Leadership"),
  mk("Product Manager", G.biz, "Business"),
  mk("Project Manager", G.biz, "Business"),
  mk("Team Lead", G.lead, "Leadership"),
  mk("Security", G.eng, "Engineering"),
  mk("Legal", G.ops, "Operations"),
  mk("Operations", G.ops, "Operations"),
  mk("Data Analyst", G.eng, "Engineering"),
  mk("Business Analyst", G.biz, "Business"),
  mk("Consultant", G.biz, "Business"),
  mk("Trainer", G.ops, "Operations"),
  mk("Community Manager", G.ops, "Operations"),
  mk("Reviewer", G.design, "Design"),
  mk("Auditor", G.ops, "Operations"),
  mk("Guest", G.ext, "External"),
  mk("Verified User", G.ext, "External"),
];

export const assetCounts = {
  stickers: roleStickers.length,
  reactions: businessReactions.length,
  sounds: soundAssets.length,
  animated: animatedStickers.length,
  avatars: roleAvatars.length,
  total:
    roleStickers.length +
    businessReactions.length +
    soundAssets.length +
    animatedStickers.length +
    roleAvatars.length,
};
