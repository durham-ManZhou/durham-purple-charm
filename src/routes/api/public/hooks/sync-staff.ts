import { createFileRoute } from "@tanstack/react-router";
import { durhamStaff } from "@/data/durham-staff";

const MAX_PROFILES_PER_RUN = 40;
const MAX_TRANSLATIONS_PER_RUN = 12;

export const Route = createFileRoute("/api/public/hooks/sync-staff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-sync-token") ?? "";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: valid } = await supabaseAdmin.rpc("verify_staff_sync_token", { _token: token });
        if (!valid) return new Response("Unauthorized", { status: 401 });

        const { data: gotLease } = await supabaseAdmin.rpc("acquire_staff_sync_lease");
        if (!gotLease) return Response.json({ skipped: "already running" });

        const { fetchProfile, parseProfile, hashText, translateBio, AiBlocked } = await import(
          "@/lib/staff-sync.server"
        );
        const { data: state } = await supabaseAdmin.from("staff_sync_state").select("paused_reason").eq("id", 1).single();
        let aiPaused = Boolean(state?.paused_reason);
        let translationsLeft = aiPaused ? 1 : MAX_TRANSLATIONS_PER_RUN; // one probe when paused

        const { data: existing } = await supabaseAdmin
          .from("staff_profiles")
          .select("profile_url, biography_hash, biography_zh, last_synced_at");
        const byUrl = new Map((existing ?? []).map((r) => [r.profile_url, r]));
        const urls = durhamStaff
          .map((s) => s.profileUrl)
          .sort((a, b) => (byUrl.get(a)?.last_synced_at ?? "").localeCompare(byUrl.get(b)?.last_synced_at ?? ""))
          .slice(0, MAX_PROFILES_PER_RUN);

        const summary = { synced: 0, inactive: 0, failed: 0, translated: 0 };
        const apiKey = process.env["LOVABLE_API_KEY"];
        for (const url of urls) {
          const now = new Date().toISOString();
          try {
            const { status, html } = await fetchProfile(url);
            if (status === 404 || status === 410) {
              await supabaseAdmin.from("staff_profiles").upsert({ profile_url: url, is_active: false, last_synced_at: now, last_error: null });
              summary.inactive++;
              continue;
            }
            if (!html) {
              await supabaseAdmin.from("staff_profiles").upsert({ profile_url: url, last_error: `HTTP ${status}` });
              summary.failed++;
              continue;
            }
            const p = parseProfile(html);
            const prev = byUrl.get(url);
            const hash = p.biography ? hashText(p.biography) : null;
            let biography_zh = prev?.biography_hash === hash ? prev?.biography_zh ?? null : null;
            if (p.biography && !biography_zh && apiKey && translationsLeft > 0) {
              translationsLeft--;
              try {
                biography_zh = await translateBio(p.biography, apiKey);
                if (biography_zh) summary.translated++;
                if (aiPaused) {
                  aiPaused = false;
                  translationsLeft = MAX_TRANSLATIONS_PER_RUN;
                  await supabaseAdmin.from("staff_sync_state").update({ paused_reason: null }).eq("id", 1);
                }
              } catch (e) {
                if (e instanceof AiBlocked) {
                  aiPaused = true;
                  translationsLeft = 0;
                  await supabaseAdmin.from("staff_sync_state").update({ paused_reason: `AI ${e.status}` }).eq("id", 1);
                }
              }
            }
            await supabaseAdmin.from("staff_profiles").upsert({
              profile_url: url,
              ...p,
              biography_hash: biography_zh ? hash : null,
              biography_zh,
              is_active: true,
              last_synced_at: now,
              last_error: null,
            });
            summary.synced++;
          } catch (e) {
            summary.failed++;
            await supabaseAdmin.from("staff_profiles").upsert({ profile_url: url, last_error: String(e).slice(0, 300) });
          }
        }

        await supabaseAdmin
          .from("staff_sync_state")
          .update({ locked_until: null, last_status: JSON.stringify(summary) })
          .eq("id", 1);
        return Response.json(summary);
      },
    },
  },
});
