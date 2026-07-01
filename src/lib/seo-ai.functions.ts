import { supabase } from "@/integrations/supabase/client";

export async function generateSeo({ data }: { data: { topic: string; type: string; locale: string } }): Promise<Record<string, any>> {
  try {
    const { data: res, error } = await supabase.functions.invoke("seo-generate", { body: data });
    if (error) return { error: error.message };
    return (res as any) ?? {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "SEO AI unavailable" };
  }
}