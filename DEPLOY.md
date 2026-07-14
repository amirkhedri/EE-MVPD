# Deploying CareLink for free

This app is one Node/Express service that serves both the API and the built
React frontend (see `server/index.js`), so you only need **one** free host
and **one** URL — no separate frontend/backend deploys, no CORS setup.

## Important tradeoff — read this first

The current database (`server/db.js`) is a JSON file on disk (via `lowdb`).
That's perfect for local development and demos, but most free hosts
(including Render's free tier) have an **ephemeral filesystem**: any data
written while the app is running gets wiped whenever the service restarts —
and Render's free tier restarts itself after just **15 minutes of
inactivity**. In practice that means signups, requests, contracts, and
wallet balances would periodically reset back to the seed data.

Pick one:

- **Option A — Free, but data resets on idle.** Deploy as-is below. Fine for
  a demo/portfolio link where occasional resets are acceptable.
- **Option B — ~$7/month, data persists, always-on.** Upgrade the Render
  service to the "Starter" instance type and attach a persistent disk. No
  code changes needed.
- **Option C — Free and persistent.** Swap the JSON-file database for a free
  hosted database (e.g. Turso, Neon, or Supabase all have permanent free
  tiers). This needs a small code migration in `server/db.js`. I can do this
  for you if you want a genuinely free *and* durable deployment — just ask.

The steps below use Option A. Everything still works, including signup,
login, and the full request → contract → payment flow — it just resets after
idle periods.

## 1. Push your code to GitHub

If you haven't already:

```
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub (via github.com → New repository), then:

```
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Render (free, no credit card required)

1. Go to https://render.com and sign up (GitHub login is fastest).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub account and select your repo. Render will detect the
   `render.yaml` file already in this project and pre-fill everything
   (build command, start command, a free instance type, and a
   securely auto-generated `JWT_SECRET`).
4. Click **Apply** / **Create**. The first build takes a few minutes.
5. When it's done, Render gives you a free working URL like:
   `https://carelink-mvp.onrender.com`

That URL is live immediately — real signups, real login, the whole app —
with free HTTPS already set up. This alone answers "will a free domain
work": yes, this subdomain is free and fully functional forever (subject to
the idle-reset caveat above).

## 3. (Optional) Attach a real custom domain — still free

If you want something like `carelink.eu.org` instead of the `.onrender.com`
subdomain:

1. Get a free domain from **eu.org** (https://nic.eu.org) — a long-running,
   legitimate free registrar (avoid Freenom-style `.tk/.ml/.ga/.cf` domains;
   they've become unreliable). Fill out their request form; approval usually
   takes a few days.
   - Alternative if you don't want to wait: buy a cheap real domain
     (`.com`/`.dev`/`.xyz`) for a few dollars/year from Cloudflare Registrar
     or Namecheap — more professional and instant.
2. In the Render dashboard, open your service → **Settings** → **Custom
   Domains** → **Add Custom Domain**. Enter your domain.
3. Render shows you a DNS record to add (usually a `CNAME` pointing at your
   `onrender.com` address, or an `A` record if it's a root domain).
4. Add that record in your domain's DNS settings (at eu.org's panel, or your
   registrar's DNS panel if you bought one).
5. Wait for DNS to propagate (a few minutes to a few hours). Render
   automatically issues a free TLS certificate once it verifies the domain —
   your site will be live at `https://yourdomain` with HTTPS.

## 4. Redeploying after future changes

Render auto-deploys on every push to your `main` branch — just
`git push` and it rebuilds automatically.

## Local production test (optional, before deploying)

You can test the exact production mode locally:

```
npm run build
npm run start
```

Then open http://localhost:4000 — this is the single service that will run
on Render.
