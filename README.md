# Astro Decap Blog

A learning project: static blog with **Astro**, **Tailwind CSS**, and **Decap CMS**, deployed to **Netlify** with **pnpm**.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/about` | About the stack |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual post |
| `/contact` | Contact form (Netlify Forms) |
| `/admin` | Private CMS (not in navbar) |

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:4321

### Local CMS editing

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm dev:cms
```

Open http://localhost:4321/admin

## Full setup & deployment guide

See **[docs/SETUP.md](./docs/SETUP.md)** for step-by-step instructions covering:

- Project creation
- Decap CMS configuration
- GitHub setup
- Netlify deployment
- Enabling private admin access (Identity + Git Gateway)
- Publishing posts on production
- Replicating in other projects
- Troubleshooting

## Tech stack

- [Astro 7](https://astro.build)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Decap CMS](https://decapcms.org)
- [Netlify](https://netlify.com)
- [pnpm](https://pnpm.io)
