import { createFileRoute } from "@tanstack/react-router";
import { departmentSources } from "@/data/durham-departments";

const MAX_PROFILES_PER_RUN = 60;
const MAX_TRANSLATIONS_PER_RUN = 20;
const DISCOVERY_EVERY_MS = 20 * 60 * 60 * 1000;
const CONCURRENCY = 4;

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]!); }));
}

export const Route = createFileRoute("/api/public/hooks/sync-staff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-sync-token") ?? "";
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        const { data: valid } = await db.rpc("verify_staff_sync_token", { _token: token });
        if (!valid) return new Response("Unauthorized", { status: 401 });
        const { data: gotLease } = await db.rpc("acquire_staff_sync_lease");
        if (!gotLease) return Response.json({ skipped: "already running" });

        const lib = await import("@/lib/staff-sync.server");
        const summary = { discovered: 0, removed: 0, synced: 0, inactive: 0, failed: 0, translated: 0 };
        try {
          const { data: state } = await db.from("staff_sync_state").select("paused_reason, last_discovery_at").eq("id", 1).single();

          // 1) Discover the current academic staff list from each department's official page.
          const force = new URL(request.url).searchParams.get("discover") === "1";
          if (force || !state?.last_discovery_at || Date.now() - new Date(state.last_discovery_at).getTime() > DISCOVERY_EVERY_MS) {
            const startedAt = new Date().toISOString();
            const okDepartments: string[] = [];
            await pool(departmentSources, CONCURRENCY, async (dept) => {
              const found = new Map<string, { name: string; role: string | null }>();
              let ok = dept.sources.length > 0;
              for (const src of dept.sources) {
                const html = await lib.fetchHtml(src.startsWith("http") ? src : `https://www.durham.ac.uk${src}`).catch(() => null);
                if (!html) { ok = false; continue; }
                for (const s of lib.parseStaffList(html)) found.set(s.profile_url, s);
              }
              if (found.size === 0) return;
              const rows = [...found].map(([profile_url, s]) => ({ profile_url, display_name: s.name, listed_role: s.role, department_slug: dept.slug }));
              // New people: insert with list name; existing: keep their profile name.
              await db.from("staff_profiles").upsert(rows, { onConflict: "profile_url", ignoreDuplicates: true });
              await db.from("staff_profiles").upsert(
                rows.map((r) => ({ profile_url: r.profile_url, listed_role: r.listed_role, department_slug: r.department_slug, last_seen_at: startedAt, is_active: true })),
                { onConflict: "profile_url" },
              );
              summary.discovered += rows.length;
              if (ok) okDepartments.push(dept.slug);
            });
            // People no longer listed by a department whose list loaded fully are treated as departed.
            if (okDepartments.length) {
              const { count } = await db.from("staff_profiles").update({ is_active: false }, { count: "exact" })
                .in("department_slug", okDepartments).lt("last_seen_at", startedAt).eq("is_active", true);
              summary.removed = count ?? 0;
            }
            await db.from("staff_sync_state").update({ last_discovery_at: startedAt }).eq("id", 1);
          }

          // 2) Refresh the full profile of the least recently synced active staff.
          let aiPaused = Boolean(state?.paused_reason);
          let translationsLeft = aiPaused ? 1 : MAX_TRANSLATIONS_PER_RUN;
          const { data: batch } = await db.from("staff_profiles")
            .select("profile_url, biography_hash, biography_zh")
            .eq("is_active", true)
            .order("last_synced_at", { ascending: true, nullsFirst: true })
            .limit(MAX_PROFILES_PER_RUN);
          const apiKey = process.env["LOVABLE_API_KEY"];

          await pool(batch ?? [], CONCURRENCY, async (prev) => {
            const url = prev.profile_url;
            const now = new Date().toISOString();
            try {
              const { status, html } = await lib.fetchProfile(url);
              if (status === 404 || status === 410) {
                await db.from("staff_profiles").update({ is_active: false, last_synced_at: now, last_error: null }).eq("profile_url", url);
                summary.inactive++;
                return;
              }
              if (!html) {
                await db.from("staff_profiles").update({ last_error: `HTTP ${status}`, last_synced_at: now }).eq("profile_url", url);
                summary.failed++;
                return;
              }
              const p = lib.parseProfile(html);
              const hash = p.biography ? lib.hashText(p.biography) : null;
              let biography_zh = prev.biography_hash === hash ? prev.biography_zh : null;
              if (p.biography && !biography_zh && apiKey && translationsLeft > 0) {
                translationsLeft--;
                try {
                  biography_zh = await lib.translateBio(p.biography, apiKey);
                  if (biography_zh) summary.translated++;
                  if (aiPaused) {
                    aiPaused = false;
                    translationsLeft = MAX_TRANSLATIONS_PER_RUN;
                    await db.from("staff_sync_state").update({ paused_reason: null }).eq("id", 1);
                  }
                } catch (e) {
                  if (e instanceof lib.AiBlocked) {
                    aiPaused = true;
                    translationsLeft = 0;
                    await db.from("staff_sync_state").update({ paused_reason: `AI ${e.status}` }).eq("id", 1);
                  }
                }
              }
              const { display_name, ...rest } = p;
              await db.from("staff_profiles").update({
                ...rest,
                ...(display_name ? { display_name } : {}),
                biography_hash: biography_zh ? hash : null,
                biography_zh,
                last_synced_at: now,
                last_error: null,
              }).eq("profile_url", url);
              summary.synced++;
            } catch (e) {
              summary.failed++;
              await db.from("staff_profiles").update({ last_error: String(e).slice(0, 300), last_synced_at: now }).eq("profile_url", url);
            }
          });
        } finally {
          await db.from("staff_sync_state").update({ locked_until: null, last_status: JSON.stringify(summary) }).eq("id", 1);
        }
        return Response.json(summary);
      },
    },
  },
});
