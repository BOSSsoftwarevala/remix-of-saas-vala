import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function chatWithAi({ data }: { data: { messages: ChatMessage[] } }): Promise<{ reply: string; error?: string }> {
  try {
    const { data: res, error } = await supabase.functions.invoke("ai-chat", { body: { messages: data.messages } });
    if (error) return { reply: "", error: error.message };
    return { reply: (res as any)?.reply ?? (res as any)?.content ?? "", error: (res as any)?.error };
  } catch (e) {
    return { reply: "", error: e instanceof Error ? e.message : "AI unavailable" };
  }
}