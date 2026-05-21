# AGENTS.md

This file is for LLMs, coding agents, and future automated contributors working inside this repo.

## Mission

Keep the site visually stable while making content, data, and SEO changes safe. Most pages are presentation-heavy, but the project has a few important backend/content dependencies:

- PocketBase powers nearly all dynamic content.
- Static route metadata comes from the `SEO_pages` collection.
- Dynamic blog/project detail pages build metadata directly from the fetched record.
- Lead capture uses the local `/api/lead` route, then writes to PocketBase and emails via Resend.

## Fast Orientation

### What lives where

- `app/`: route entrypoints, metadata wrappers, sitemap, robots, API routes.
- `components/`: page implementations and reusable sections.
- `components/sections/`: most client-side PocketBase fetches live here.
- `lib/seo-pages.ts`: shared metadata loader for static pages.
- `lib/project-types.ts`: common project type used by the design detail route.
- `public/`: local assets and local fonts.
- `next.config.ts`: CSP, image host allowlist, and public PocketBase env passthrough.

### The biggest architectural pattern

Do not assume there is a centralized API layer. There is not.

This repo mixes:

- server route wrappers for metadata and SSR detail pages
- client components that fetch PocketBase directly with `fetch`
- a single internal API route for lead capture

If you are changing behavior, search the codebase first instead of expecting one shared helper.

## Route Ownership

### Mostly static wrappers with shared SEO

- `/` -> `app/page.tsx` -> `components/home-page.tsx`
- `/about` -> `app/about/page.tsx` -> `components/about-page.tsx`
- `/design` -> `app/design/page.tsx` -> `components/design-page.tsx`
- `/blog` -> `app/blog/page.tsx` -> `components/blog-page.tsx`
- `/contact-us` -> `app/contact-us/page.tsx` -> `components/contact-us-page.tsx`
- `/terms` -> `app/terms/page.tsx` -> `components/terms-page.tsx`
- `/privacy` -> `app/privacy/page.tsx` -> `components/privacy-page.tsx`

These wrappers usually:

- call `getSeoMetadata(route)`
- call `getSeoJsonLd(route)`
- render a page component

### Dynamic routes with inline data logic

- `/design/[slug]` -> `app/design/[slug]/page.tsx`
- `/blog/[slug]` -> `app/blog/[slug]/page.tsx`

These routes own their own data fetching and metadata generation. They do not use `SEO_pages`.

## PocketBase Collections In Use

| Collection | Owner files | Notes |
| --- | --- | --- |
| `homepage` | `components/home-page.tsx` | Single-record fetch by env-configured ID. |
| `homepage_projects` | `components/home-page.tsx` | Expanded relation fetch for featured project blocks. |
| `numbers_and_testimonials` | `components/sections/results-vision-section.tsx` | Single-record fetch with localStorage cache and polling. |
| `project` | `components/sections/our-works-section.tsx`, `components/sections/project-display-section.tsx`, `app/design/[slug]/page.tsx`, `app/sitemap.ts` | Core design/project content collection. |
| `blog` | `components/sections/publication-section.tsx`, `components/sections/blog-publications-section.tsx`, `app/blog/[slug]/page.tsx`, `app/sitemap.ts` | Publications/blog content. |
| `SEO_pages` | `lib/seo-pages.ts` | Static route SEO metadata and JSON-LD source. |
| `leads` | `app/api/lead/route.ts` | Written by the lead API. |
| `api_clients` or `PB_AUTH_COLLECTION` | `app/api/lead/route.ts` | Auth collection used to obtain a PocketBase token. |

## Design Pages: Exact Request Flow

This is the highest-priority area to understand.

### `/design`

Wrapper:

- `app/design/page.tsx`

UI:

- `components/design-page.tsx`

Data-fetching sections:

- `components/sections/our-works-section.tsx`
- `components/sections/publication-section.tsx`

#### 1. Project listing fetch

`components/sections/our-works-section.tsx` calls:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/project/records?filter=featured=true&perPage=200&sort=-created
```

Behavior:

- fetch runs in `useEffect`
- `cache: "no-store"`
- response is filtered again to `item.featured`
- `ProjectType` values are extracted to build the tab UI
- search params `projectType` and `scope` auto-select a tab

If you are changing design filters, this is the file to edit first.

#### 2. Blog/publication fetch on the design page

`components/sections/publication-section.tsx` calls:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/blog/records?filter=published=true && homepage=true&perPage=30
```

Behavior:

- fetch runs client-side
- `cache: "no-store"`
- only the first 3 posts are rendered

### `/design/[slug]`

Owner:

- `app/design/[slug]/page.tsx`

Rendered UI:

- `components/design-project-page.tsx`

#### Primary detail query

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/project/records?filter=(slug='{slug}')&perPage=1
```

Caching:

- development -> `cache: "no-store"`
- production -> `revalidate: 21600`

This means the route depends on the PocketBase `slug` field being present and correct.

#### Previous/next navigation query

After the project is loaded, the route calls:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/project/records?filter=(ProjectType='{project.ProjectType}')&perPage=200&sort=created
```

That list is used to compute previous/next links within the same `ProjectType`.

#### Image handling

The route resolves:

- `seo_image`
- `Image_1`
- `Image_2`
- `image_1_alt`
- `image_2_alt`

The detail component expects the route to hand it already-resolved image URL arrays plus alt arrays.

#### If you need to change project detail content

Start in `app/design/[slug]/page.tsx` if the issue is:

- fetch logic
- SEO metadata
- JSON-LD
- previous/next project selection
- PocketBase field normalization

Start in `components/design-project-page.tsx` if the issue is:

- layout
- animation
- carousel/marquee behavior
- CTA and interaction details

## Lead API: Exact Flow

Files:

- `components/lead-form.tsx`
- `app/api/lead/route.ts`

### Browser payload

The form submits:

- `name`
- `purpose`
- `email`
- `phone_number`
- `message`
- `pageUrl`
- `company`
- `consent`

### Server behavior

`app/api/lead/route.ts` performs, in order:

1. origin validation
2. IP-based in-memory rate limiting
3. JSON body parsing
4. honeypot rejection via `company`
5. field validation and max length checks
6. PocketBase auth with email/password
7. lead creation in the `leads` collection
8. Resend notification email send

### Operational caveats

- Rate limiting is memory-only and not distributed.
- Missing env vars surface as server configuration errors.
- If PocketBase accepts the lead but Resend fails, the API still returns a downstream error after the DB write.

## SEO Rules In This Repo

### Static pages

Use `lib/seo-pages.ts`.

The `SEO_pages` collection is queried by `route`, for example:

- `/`
- `/about`
- `/design`
- `/blog`
- `/contact-us`

If someone asks why a static page title or description is not changing, check PocketBase first, then `lib/seo-pages.ts`.

### Dynamic pages

Project and blog detail pages generate metadata directly from the record.

If someone asks why `/design/[slug]` or `/blog/[slug]` SEO is wrong, do not start in `SEO_pages`.

## Important Inconsistencies To Respect Or Fix Carefully

These are the biggest places where an agent can accidentally break behavior.

### Slug handling is not fully normalized

Different files construct project URLs differently:

- `components/sections/our-works-section.tsx` uses `project.slug ?? project.id`
- `components/sections/project-display-section.tsx` falls back to `slug`, then kebab-cased `Name`, then `id`
- `app/design/[slug]/page.tsx` fetches by `slug` only
- `app/sitemap.ts` prefers a derived slug from `Name` before `project.slug`

If you change slug logic, update all of these together or document the intended canonical rule first.

### PocketBase defaults are inconsistent

Some files fall back to `https://staging.angle.services` if `NEXT_PUBLIC_POCKETBASE_URL` is missing, while others use an empty string and fail harder.

Relevant files:

- `components/sections/publication-section.tsx`
- `components/sections/results-vision-section.tsx`

Do not assume a missing env var always fails loudly.

### Client-side reads are common

A lot of content fetches happen in the browser, so these issues often show up as browser runtime problems:

- CORS
- CSP `connect-src`
- broken remote image rendering
- stale `localStorage` caches

`next.config.ts` builds CSP and image remote patterns from `NEXT_PUBLIC_POCKETBASE_URL`, so changing that env var requires a dev-server restart.

## Change Recipes

### Change the design page filters or project tabs

Edit:

- `components/sections/our-works-section.tsx`

Check:

- query-param handling for `projectType` / `scope`
- fetch filter
- tab label generation from `ProjectType`

### Change project detail SEO or structured data

Edit:

- `app/design/[slug]/page.tsx`

Check:

- `generateMetadata`
- `buildJsonLd`
- image URL resolution
- location parsing from `location_json`

### Change homepage marketing content wiring

Edit:

- `components/home-page.tsx`

Check:

- `DEFAULT_HOMEPAGE_RECORD`
- PocketBase record ID env var
- localStorage cache keys and refresh cadence

### Change blog listing behavior

Edit:

- `components/sections/blog-publications-section.tsx`

Check:

- `featured=true` filter
- category filter logic
- page size logic

### Change contact form behavior

Edit:

- `components/lead-form.tsx` for client UX
- `app/api/lead/route.ts` for validation, storage, or email behavior

## Verification Checklist

After touching code in this repo, verify the affected routes manually.

High-priority checks:

1. `/`
2. `/design`
3. one `/design/[slug]` page
4. `/blog`
5. one `/blog/[slug]` page
6. `/contact-us` and form submission path when relevant

Also run:

```bash
npm run lint
```

There is no automated test suite, so agents should not claim test coverage that does not exist.
