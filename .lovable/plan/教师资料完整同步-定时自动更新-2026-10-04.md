# 教师资料完整同步 + 定时自动更新

## 目标
- 小程序里每位老师的详情页展示官网 Profile 上的公开信息：照片、姓名、职称、院系、联系方式（官网公开的邮箱/电话/办公室）、个人简介（Biography）、研究方向、研究小组、承担课程、代表性论文、所带研究生方向等，官网有什么就显示什么，没有就不显示。
- 所有教师信息定时从官网自动更新：新入职老师自动加入，离职老师（官网 Profile 不再存在）自动下线，确保“不在学校的老师查不到”。
- 简介等长文保留英文原文，并附中文摘要；详情页底部注明“信息来源：杜伦大学官网，最后同步时间 XXX”，并保留官网链接。

## 用户能看到的变化
- 老师详情页变成分区信息页：简介 / 研究方向 / 课程 / 论文 / 联系方式，可折叠展开。
- 搜索范围扩展到简介、论文标题、课程等全部内容，任意关键词都能查。
- 每日凌晨（伦敦时间）自动同步一次；页面显示最近更新时间。

## 需要注意
- 官网文字与照片版权归杜伦大学所有。正式上线前，建议校方确认授权（作为官方小程序通常没有问题）。
- 官网偶尔会拦截自动访问；如某天同步失败，小程序继续显示上一次的数据，不会出现空白。
- 第一阶段先覆盖目前的 31 位老师，同步机制跑通后再扩大到更多院系教师。

## Technical details
- New tables `staff_profiles` (all profile fields as columns + jsonb sections, `source_url`, `is_active`, `last_synced_at`) and `sync_runs` (lease lock, status, error). Public SELECT on active rows only; writes via service role.
- Server route `src/routes/api/public/hooks/sync-staff.ts`: verify a shared secret header, acquire lease, fetch each profile page (bounded batch), parse with a Worker-safe HTML parser, upsert; mark profiles returning 404 as inactive. Chinese summaries generated via Lovable AI for changed bios only (cached by content hash); pause on 402/403.
- Daily pg_cron job calling the route; initial backfill run once manually.
- Frontend reads from the database via route loader + query; `src/data/durham-staff.ts` becomes the seed list of profile URLs.
