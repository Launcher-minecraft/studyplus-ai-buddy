import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    const { subject, level, topic, genType } = await req.json();
    if (!subject || !level || !topic) throw new Error("Missing required fields");

    // Check profile limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, sheets_generated_today, last_generation_date")
      .eq("user_id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    const today = new Date().toISOString().split("T")[0];
    const sheetsToday = profile.last_generation_date === today ? profile.sheets_generated_today : 0;

    if (profile.subscription_status === "free" && sheetsToday >= 3) {
      return new Response(
        JSON.stringify({ error: "Limite de 3 fiches par jour atteinte. Passe en Premium pour des fiches illimitées !" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sheetCount = genType === "pack" ? 5 : genType === "chapter" ? 3 : 1;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI API key not configured");

    const systemPrompt = `Tu es un expert en éducation française. Tu crées des fiches de révision claires, structurées et pédagogiques pour les lycéens.
Chaque fiche doit contenir:
- Un titre clair
- Les points clés à retenir (avec des bullet points)
- Des définitions importantes
- Des exemples concrets
- Un résumé en 2-3 phrases

Format: Utilise du Markdown pour structurer le contenu.
Langue: Français uniquement.`;

    const userPrompt = genType === "chapter"
      ? `Génère un chapitre complet de révision sur "${topic}" en ${subject}, niveau ${level}. Inclus 3 fiches couvrant les aspects principaux du sujet.`
      : `Génère ${sheetCount} fiche(s) de révision sur "${topic}" en ${subject}, niveau ${level}.${sheetCount > 1 ? " Chaque fiche doit couvrir un aspect différent du sujet." : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessaie dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service IA temporairement indisponible." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    // Split content into individual sheets if multiple
    const sheets = [];
    if (sheetCount > 1) {
      // Try to split by "# Fiche" or "## Fiche" patterns
      const parts = content.split(/(?=^#{1,2}\s+(?:Fiche|fiche)\s*\d)/m);
      const validParts = parts.filter((p: string) => p.trim().length > 50);
      if (validParts.length > 1) {
        for (const part of validParts) {
          const titleMatch = part.match(/^#{1,2}\s+(.+)/m);
          sheets.push({
            title: titleMatch ? titleMatch[1].replace(/[*#]/g, "").trim() : `${topic} - Partie`,
            content: part.trim(),
          });
        }
      } else {
        sheets.push({ title: topic, content });
      }
    } else {
      sheets.push({ title: topic, content });
    }

    // Save sheets to DB
    const savedSheets = [];
    for (const sheet of sheets) {
      const { data, error } = await supabase
        .from("sheets")
        .insert({
          user_id: user.id,
          title: sheet.title,
          subject,
          level,
          content: sheet.content,
        })
        .select()
        .single();
      if (error) console.error("Insert error:", error);
      if (data) savedSheets.push(data);
    }

    // Update profile counter
    await supabase
      .from("profiles")
      .update({
        sheets_generated_today: sheetsToday + savedSheets.length,
        last_generation_date: today,
      })
      .eq("user_id", user.id);

    return new Response(JSON.stringify({ sheets: savedSheets }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-sheet error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
