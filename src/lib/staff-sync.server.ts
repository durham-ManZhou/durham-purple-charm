import { parse, type HTMLElement } from "node-html-parser";
import { createHash } from "crypto";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export type ParsedProfile = {
  display_name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  orcid_url: string | null;
  image_url: string | null;
  biography: string | null;
  research_interests: string[];
  publications: { category: string; title: string; url: string | null; citation: string }[];
  supervision: { name: string; url: string | null }[];
  other_sections: { heading: string; text: string }[];
};

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();

function blockText(el: HTMLElement): string {
  const parts: string[] = [];
  const blocks = el.querySelectorAll("p, li");
  if (blocks.length === 0) return clean(el.text);
  for (const b of blocks) {
    if (b.tagName === "P" && b.closest("li")) continue;
    const t = clean(b.text);
    if (t) parts.push(b.tagName === "LI" ? `• ${t}` : t);
  }
  return parts.join("\n\n");
}

export function parseProfile(html: string): ParsedProfile {
  const root = parse(html);
  const main = root.querySelector("main") ?? root;
  const header = main.querySelectorAll("h2").find((h) => h.closest(".u-bg-grey-25") && !h.closest(".scroll-spy-nav"));
  const card = header?.closest(".u-bg-grey-25") ?? null;
  const out: ParsedProfile = {
    display_name: header ? clean(header.text) : null,
    role: card ? clean(card.querySelector("p.u-font-bold")?.text) || null : null,
    phone: null,
    email: null,
    orcid_url: null,
    image_url: null,
    biography: null,
    research_interests: [],
    publications: [],
    supervision: [],
    other_sections: [],
  };
  if (card) {
    for (const a of card.querySelectorAll("a")) {
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) out.phone = clean(a.text);
      else if (href.startsWith("mailto:")) out.email = href.slice(7);
      else if (href.includes("orcid.org")) out.orcid_url = href;
    }
    const img = card.querySelector("img");
    const src = img?.getAttribute("data-src") ?? img?.getAttribute("src");
    if (src && src.startsWith("https://")) out.image_url = src;
  }

  for (const h3 of main.querySelectorAll("h3[id]")) {
    const heading = clean(h3.text);
    const id = h3.getAttribute("id") ?? "";
    const box = h3.parentNode as HTMLElement;
    const body = box.childNodes.filter((n) => n !== h3 && n instanceof Object && (n as HTMLElement).tagName) as HTMLElement[];
    const content = body[0];
    if (!content) continue;
    if (id === "biography") out.biography = blockText(content) || null;
    else if (id === "research-interests")
      out.research_interests = content.querySelectorAll("li").map((l) => clean(l.text)).filter(Boolean);
    else if (id === "publications") {
      let category = "Publications";
      for (const node of content.childNodes as HTMLElement[]) {
        if (node.tagName === "P") category = clean(node.text) || category;
        if (node.tagName === "UL")
          for (const li of node.querySelectorAll("li")) {
            const a = li.querySelector("a");
            const citation = clean(li.querySelector("div")?.text);
            const title = clean(a?.text);
            if (title) out.publications.push({ category, title, url: a?.getAttribute("href") ?? null, citation });
          }
      }
    } else if (id.startsWith("supervision")) {
      for (const p of content.querySelectorAll(".profile-link")) {
        const name = clean(p.querySelector("h3")?.text);
        const href = p.querySelector("a")?.getAttribute("href");
        if (name) out.supervision.push({ name, url: href ? new URL(href, "https://www.durham.ac.uk").href : null });
      }
    } else {
      const text = blockText(content);
      if (text) out.other_sections.push({ heading, text: text.slice(0, 6000) });
    }
  }
  return out;
}

export async function fetchProfile(url: string): Promise<{ status: number; html?: string }> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow" });
  if (!res.ok) return { status: res.status };
  return { status: res.status, html: await res.text() };
}

export const hashText = (s: string) => createHash("sha256").update(s).digest("hex");

export class AiBlocked extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

export async function translateBio(text: string, apiKey: string): Promise<string | null> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions:
        "你是杜伦大学官方中文招生小程序的编辑。把下面的英文教师简介忠实翻译为简洁、正式的简体中文，保留人名与机构英文原名，不添加原文没有的信息，只输出译文，不超过600字。",
      input: text.slice(0, 8000),
    }),
  });
  if (res.status === 402 || res.status === 403) throw new AiBlocked(res.status, await res.text());
  if (!res.ok) return null;
  const json = (await res.json()) as { output?: { content?: { type: string; text?: string }[] }[] };
  const t = json.output?.flatMap((o) => o.content ?? []).find((c) => c.type === "output_text")?.text;
  return t?.trim() || null;
}
