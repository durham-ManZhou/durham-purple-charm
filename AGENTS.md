<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history.
<!-- LOVABLE:END -->

- Keep the public admissions experience as one mobile-first application route with stateful in-app sections, because it mirrors a WeChat mini-program rather than a multi-page website.
- Persist public lead and campus-booking submissions directly through the generated browser database client; RLS permits inserts only and blocks public reads.
- Keep the in-app staff directory limited to publicly verifiable current Durham staff, with concise factual summaries and official profile links for source verification.
- The staff directory is the full academic staff list discovered daily from each department's official staff pages (sources in the departments data file) and stored in the database; full profiles refresh hourly in bounded batches via a token-protected public cron route, and search/ranking runs in the database search function (name matches first).
