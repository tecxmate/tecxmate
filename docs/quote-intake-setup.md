# Quote form intake: email + Jira

The `/quote` form posts to `/api/quote`, which delivers to two independent
destinations:

| Destination | Purpose | Fails how |
|---|---|---|
| **Resend email** | Immediate awareness, reply-to set to the enquirer | Logged, other destination still runs |
| **Jira issue** | The pipeline — assignable, statused | Logged, other destination still runs |

Only a **total** failure returns an error to the visitor, so nobody is told
their request arrived when it did not.

---

## Email (Resend)

`RESEND_API_KEY` is configured in `.env.local` and in Vercel.

**Current limitation:** the account has no verified domain, so Resend refuses
to deliver anywhere except the account owner's address. Until that is fixed,
`QUOTE_NOTIFY_EMAIL` points at `tecxmate@gmail.com`.

To send from your own domain:

1. resend.com/domains → add `tecxmate.com`
2. Add the DNS records it gives you
3. Once verified, set `RESEND_FROM_EMAIL=Tecxmate <no-reply@tecxmate.com>`
4. Point `QUOTE_NOTIFY_EMAIL` wherever you actually want leads

Until then any other recipient silently fails — the code now surfaces that as
an error rather than reporting a delivered lead, which is how the limitation
was found.

---

## Jira

Site is `tecxmate.atlassian.net`. Three values are still needed.

### 1. Project key

Open the Jira project that should receive leads. The key is the prefix on its
issues — `LEAD-1`, `SALES-42` — so the key is `LEAD` or `SALES`.

If you want a dedicated one: **Projects → Create project → Team-managed →
Kanban**, name it *Leads*.

### 2. API token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. **Create API token**, label it `tecxmate-website`
3. Copy it — it is shown once

The token inherits the permissions of whoever creates it, and issues will be
filed as that account. A service account is tidier than a personal one, but
your own account is fine to start.

### 3. Account email

The email of the Atlassian account that created the token.

### Set them

```bash
# local
cat >> .env.local <<'ENV'
JIRA_BASE_URL=https://tecxmate.atlassian.net
JIRA_PROJECT_KEY=LEAD
JIRA_EMAIL=you@tecxmate.com
JIRA_API_TOKEN=<the token>
ENV

# production
vercel env add JIRA_PROJECT_KEY production
vercel env add JIRA_EMAIL production
vercel env add JIRA_API_TOKEN production
```

`JIRA_BASE_URL` defaults to `https://tecxmate.atlassian.net`, so it only needs
setting if the site changes. `JIRA_ISSUE_TYPE` defaults to `Task`.

Environment variables only apply to new builds — redeploy afterwards.

---

## Verify

```bash
curl -X POST http://localhost:3000/api/quote \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","details":"Checking the pipe","service":"apps"}'
```

Expect `{"ok":true,"delivered":{"email":true,"jira":true}}`. A `false` means
that destination is not configured or rejected the call — check the server log
for `[quote]`.

## Notes

- Jira REST v3 needs the description in **Atlassian Document Format**, not a
  plain string. A raw string is accepted by the API and then renders as an
  empty description, which is why `toAdf()` exists in `lib/quote.ts`.
- A 400 from Jira almost always means the project key is wrong or the issue
  type does not exist in that project. The error text is logged.
