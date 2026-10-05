export type DemoEventName =
  | "ad_show"
  | "ad_click"
  | "project_view"
  | "consult_click"
  | "lead_submit"
  | "booking_submit"
  | "event_submit"
  | "phone_auth"
  | "subscribe_prompt";

export type DemoEvent = { name: DemoEventName; detail: string; at: number };

const KEY = "durham-demo-events";

export function loadDemoEvents(): DemoEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]") as DemoEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function trackDemo(name: DemoEventName, detail = "") {
  if (typeof window === "undefined") return;
  const next = [{ name, detail, at: Date.now() }, ...loadDemoEvents()].slice(0, 40);
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("durham-demo-events"));
}
