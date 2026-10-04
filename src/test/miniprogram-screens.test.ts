import { describe, expect, it } from "vitest";

import {
  navForScreen,
  navShowsBack,
  navTitle,
  parseScreenParam,
  SCREEN_CATALOG,
  SCREEN_GROUPS,
} from "@/lib/miniprogram-screens";

describe("miniprogram screen catalog", () => {
  it("covers every PRD entry used by the visual demo", () => {
    expect(SCREEN_CATALOG.map((item) => item.id)).toEqual([
      "ad",
      "school-home",
      "school-about",
      "school-faculty",
      "school-staff",
      "school-campus",
      "school-interviews",
      "school-story",
      "overseas-undergrad",
      "overseas-master",
      "overseas-phd",
      "project-detail",
      "contact-lead",
      "contact-info",
      "contact-studio",
      "contact-booking",
      "contact-event",
      "consult",
      "privacy",
      "deploy",
    ]);
    expect(SCREEN_GROUPS).toEqual(["启动", "学校相关", "海外留学", "联系我们", "全局", "部署"]);
  });

  it("maps screens to WeChat navigation titles and back rules", () => {
    expect(navTitle(navForScreen("school-home"))).toBe("学校相关");
    expect(navShowsBack(navForScreen("school-home"))).toBe(false);
    expect(navTitle(navForScreen("school-about"))).toBe("学校介绍");
    expect(navShowsBack(navForScreen("school-about"))).toBe(true);
    expect(navTitle(navForScreen("project-detail"))).toBe("项目详情");
    expect(navForScreen("overseas-master").overseasType).toBe("硕士项目");
    expect(navForScreen("contact-booking").contactMode).toBe("booking");
    expect(parseScreenParam("school-campus")).toBe("school-campus");
    expect(parseScreenParam("not-a-page")).toBeNull();
  });
});
