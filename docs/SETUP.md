# Astro + Tailwind + Decap CMS Blog — Setup Guide

This guide documents every step to create, deploy, and publish blog posts on production. Use it to replicate this stack in other projects.

---

## Table of contents

1. [What you are building](#1-what-you-are-building)
2. [Prerequisites](#2-prerequisites)
3. [Create the project locally](#3-create-the-project-locally)
4. [Project structure](#4-project-structure)
5. [Configure Decap CMS](#5-configure-decap-cms)
6. [Run locally](#6-run-locally)
7. [Push to GitHub](#7-push-to-github)
8. [Deploy to Netlify](#8-deploy-to-netlify)
9. [Enable private admin access](#9-enable-private-admin-access)
10. [Publish blog posts on production](#10-publish-blog-posts-on-production)
11. [How the publishing flow works](#11-how-the-publishing-flow-works)
12. [Replicate in other projects](#12-replicate-in-other-projects)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. What you are building

| Layer | Tool | Role |
|-------|------|------|
| Site generator | **Astro** | Static pages + Markdown content collections |
| Styling | **Tailwind CSS v4** | Utility-first CSS |
| CMS | **Decap CMS** | Git-based editor at `/admin` |
| Hosting | **Netlify** | Build, deploy, auth, Git Gateway |
| Package manager | **pnpm** | Install and run scripts |

**Pages:** Home, About, Blog, Contact (with navbar)

**Blog workflow:** You log in at `/admin` → write a post → Decap commits a `.md` file to Git → Netlify rebuilds → post appears on `/blog`.

---

## 2. Prerequisites

Install these before starting:

```bash
# Node.js 22+ (required by Astro 7)
node --version

# pnpm
npm install -g pnpm

# Netlify CLI (optional but recommended for local CMS testing)
pnpm add -g netlify-cli

# Git
git --version
```

You also need:

- A [GitHub](https://github.com) account (or GitLab/Bitbucket — Decap supports all three)
- A [Netlify](https://netlify.com) account

---

## 3. Create the project locally

If starting from scratch (this repo already has these steps done):

```bash
# Create Astro project with pnpm
pnpm create astro@latest my-blog -- --template minimal --install --typescript strict -y
cd my-blog

# Add Tailwind
pnpm astro add tailwind -y

# Add Decap local server for development
pnpm add -D decap-server
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "dev:cms": "decap-server",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

---

## 4. Project structure

```
astro-decap-blog/
├── public/
│   ├── admin/
│   │   ├── index.html      # Loads Decap CMS
│   │   └── config.yml      # CMS collections & backend config
│   └── images/uploads/     # Media uploaded from CMS
├── src/
│   ├── content.config.ts   # Astro content collection schema (Astro 7)
│   ├── components/
│   │   └── Navbar.astro
│   ├── content/
│   │   └── blog/           # Blog posts (Markdown) — edited via CMS
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro     # Home
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   └── blog/
│   │       ├── index.astro
│   │       └── [...slug].astro
│   └── styles/
│       └── global.css
├── netlify.toml              # Netlify build & redirect config
├── package.json
└── pnpm-lock.yaml
```

### Astro content collection schema

File: `src/content.config.ts`

The schema **must match** the fields in `public/admin/config.yml`. Mismatches cause build errors.

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    author: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
```

---

## 5. Configure Decap CMS

File: `public/admin/config.yml`

Key settings:

```yaml
backend:
  name: git-gateway    # Uses Netlify Git Gateway in production
  branch: main         # Must match your Git default branch

local_backend: true    # Allows local editing without Netlify

media_folder: "public/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: blog
    folder: "src/content/blog"
    format: frontmatter
    fields:
      - { label: Title, name: title, widget: string }
      # ... must match Astro schema
      - { label: Body, name: body, widget: markdown }
```

File: `public/admin/index.html`

```html
<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
```

The `/admin` route is **not linked in the navbar** — it is private by obscurity plus Netlify Identity login.

---

## 6. Run locally

### Option A — Site only (no CMS editing)

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321

### Option B — Full CMS locally (recommended before deploying)

Terminal 1 — Astro dev server:

```bash
pnpm dev
```

Terminal 2 — Decap local backend:

```bash
pnpm dev:cms
```

Open http://localhost:4321/admin (redirects to the CMS). If you still see a 404, use http://localhost:4321/admin/index.html directly.

### Option C — Netlify Dev (mirrors production)

```bash
netlify dev
```

This runs Astro and proxies Identity/Git Gateway locally. Use after linking the site to Netlify (step 8).

---

## 7. Push to GitHub

```bash
cd astro-decap-blog
git init
git add .
git commit -m "Initial commit: Astro + Tailwind + Decap CMS blog"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/astro-decap-blog.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 8. Deploy to Netlify

### Step 8.1 — Import the repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and authorize Netlify
4. Select your `astro-decap-blog` repository

### Step 8.2 — Configure build settings

Netlify reads `netlify.toml` automatically. Verify:

| Setting | Value |
|---------|-------|
| Build command | `pnpm build` |
| Publish directory | `dist` |
| Node version | `22` (set in netlify.toml) |

If pnpm is not detected, add an environment variable:

- Key: `NETLIFY_USE_PNPM`
- Value: `true`

### Step 8.3 — Deploy

Click **Deploy site**. Netlify will:

1. Clone your repo
2. Run `pnpm install` + `pnpm build`
3. Publish the `dist/` folder

Your site will be live at `https://random-name.netlify.app`.

---

## 9. Enable private admin access

This is the critical step for a **private** `/admin` page on production.

### Step 9.1 — Enable Netlify Identity

1. Netlify dashboard → your site → **Site configuration → Identity**
2. Click **Enable Identity**
3. Under **Registration preferences**, select **Invite only** (recommended)

This prevents random visitors from creating accounts.

### Step 9.2 — Enable Git Gateway

1. Still in **Identity** → scroll to **Services**
2. Click **Enable Git Gateway**
3. Confirm — this lets Decap commit to your repo on behalf of logged-in users

### Step 9.3 — Invite yourself as admin

1. **Identity → Invite users**
2. Enter your email → send invite
3. Open the invite email → set a password

### Step 9.4 — Test login

1. Visit `https://YOUR-SITE.netlify.app/admin`
2. Click **Login with Netlify Identity**
3. Sign in with your invited account
4. You should see the **Blog Posts** collection

> **Note:** The first deploy after enabling Git Gateway may require a redeploy. If `/admin` shows auth errors, trigger **Deploys → Trigger deploy → Clear cache and deploy site**.

---

## 10. Publish blog posts on production

Once logged in at `/admin`:

1. Click **Blog Posts → New Blog Post**
2. Fill in:
   - **Title** — post headline
   - **Description** — short summary for listings
   - **Publish Date** — when the post was/will be published
   - **Author** — byline
   - **Draft** — check to hide from public site
   - **Body** — Markdown content
3. Click **Publish** (or **Save** for draft)

### What happens next (automatically)

1. Decap creates/updates a file like `src/content/blog/my-post-title.md`
2. Git Gateway commits to your GitHub repo
3. Netlify detects the commit and starts a new build (~1–2 min)
4. After build completes, the post appears at `/blog/my-post-title`

### Upload images

Use the **Media** tab in Decap or insert images in the Markdown editor. Files go to `public/images/uploads/` and are referenced as `/images/uploads/filename.jpg`.

---

## 11. How the publishing flow works

```
You (browser) → /admin (Decap CMS) → Git Gateway (Netlify)
    → GitHub repo → Netlify build → Live site /blog/...
```

**Why Git-based CMS?** Content lives in your repository as Markdown — no separate database. Every post is version-controlled, portable, and rebuilds with your site.

---

## 12. Replicate in other projects

Checklist for any new Astro + Decap + Netlify project:

- [ ] Create Astro project with `pnpm create astro`
- [ ] Add Tailwind with `pnpm astro add tailwind`
- [ ] Define content collection schema in `src/content.config.ts`
- [ ] Create matching Decap collection in `public/admin/config.yml`
- [ ] Add `public/admin/index.html` with Decap script
- [ ] Set `media_folder` and `public_folder` for uploads
- [ ] Add `netlify.toml` with build command and `/admin/*` redirect
- [ ] Add `decap-server` dev dependency for local CMS testing
- [ ] Push to Git provider connected to Netlify
- [ ] Enable Netlify Identity (invite only)
- [ ] Enable Git Gateway
- [ ] Invite admin users
- [ ] Test create/edit/delete post on production

### Common customizations

| Goal | Change |
|------|--------|
| Different branch | Update `branch` in `config.yml` |
| More collections | Add to `src/content.config.ts` + `config.yml` |
| Custom domain | Netlify → Domain management |
| Multiple authors | Add Identity roles (Decap supports `auth_scope`) |
| Preview before publish | Use `draft: true` field |

---

## 13. Troubleshooting

### "Failed to load entry" in /admin

- Confirm Git Gateway is enabled
- Confirm you are logged in via Netlify Identity
- Check `branch` in `config.yml` matches your repo default branch

### Posts save but site doesn't update

- Check Netlify **Deploys** tab for build errors
- Verify Astro schema matches frontmatter fields
- Look at the commit on GitHub — is the `.md` file there?

### Build fails after adding a post

Usually a schema mismatch. Example: missing `description` field. Fix the Markdown frontmatter or update `src/content.config.ts`.

### /admin returns 404

**On Netlify (production):** `/admin` should redirect to `/admin/` and load the CMS. If you get a 404:

- Confirm the latest deploy succeeded (Netlify → Deploys)
- Check that `public/admin/index.html` exists in your repo
- Verify **Publish directory** is `dist` in Netlify site settings
- Try https://YOUR-SITE.netlify.app/admin/ (with trailing slash)

**Locally with `pnpm dev`:** Astro's dev server does not serve directory indexes the same way Netlify does. Use:

- http://localhost:4321/admin (redirects via `astro.config.mjs`), or
- http://localhost:4321/admin/index.html directly

Also run the Decap local backend in a second terminal:

```bash
pnpm dev        # terminal 1
pnpm dev:cms    # terminal 2
```

Ensure `local_backend: true` is in `public/admin/config.yml`.

### pnpm not found on Netlify

Add environment variable `NETLIFY_USE_PNPM=true` or ensure `pnpm-lock.yaml` is committed.

### Contact form submissions

Submissions appear in Netlify → **Forms**. The contact page uses `data-netlify="true"`. Forms are detected at build time from the static HTML output.

---

## Quick reference commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start Astro dev server
pnpm dev:cms          # Start Decap local backend (separate terminal)
pnpm build            # Production build
pnpm preview          # Preview production build locally
netlify dev           # Full Netlify environment locally
```
