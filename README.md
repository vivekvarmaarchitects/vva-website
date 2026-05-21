# VVA Website

Marketing and portfolio site for Vivek Varma Architects, built with Next.js App Router, React 19, TypeScript, and Tailwind CSS 4.

This codebase is small, but it has an important split:

- Route wrappers in `app/` are mostly server components used for metadata and JSON-LD.
- Most page UI lives in `components/` and many of those components fetch content directly from PocketBase in the browser.
- The only custom server API in this repo is `POST /api/lead`.

If you are modifying this project with another LLM or agent, read `AGENTS.md` after this file. It is the faster operational handbook.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- `motion` + `gsap` for animation
- PocketBase as the content/data backend
- Resend for form email delivery

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` with the variables listed below.

3. Start the app:

```bash
npm run dev
```

4. Lint before shipping changes:

```bash
npm run lint
```

There is currently no automated test suite in the repo, so linting and manual route checks are the main verification steps.

## Environment Variables

These variables are referenced in the current code:

| Variable | Required | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_POCKETBASE_URL` | Yes | Base URL for PocketBase reads in client components, dynamic route fetches, sitemap, SEO image resolution, CSP/image host config in `next.config.ts`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL generation, Open Graph URLs, robots/sitemap site URL resolution. |
| `SITE_URL` | Optional fallback | Same role as `NEXT_PUBLIC_SITE_URL` if the public var is absent. |
| `VERCEL_URL` | Optional fallback | Last-resort host fallback for canonical URLs. |
| `NEXT_PUBLIC_PB_HOMEPAGE_ID` | Recommended | PocketBase record ID for the `homepage` collection. |
| `NEXT_PUBLIC_PB_NUMBERS_TESTIMONIALS_ID` | Recommended | PocketBase record ID for the `numbers_and_testimonials` collection. |
| `NEXT_PUBLIC_PB_REFRESH_MS` | Optional | Client-side polling interval for homepage and results/testimonials sections. `0` disables polling. |
| `NEXT_PUBLIC_DEBUG_PB` | Optional | Enables additional PocketBase console logging in some client components. |
| `POCKETBASE_URL` | Recommended for production | Server-side PocketBase base URL in the lead API. Falls back to `NEXT_PUBLIC_POCKETBASE_URL`. |
| `PB_AUTH_COLLECTION` | Optional | PocketBase auth collection used by `/api/lead`. Defaults to `api_clients`. |
| `PB_SERVER_EMAIL` | Required for `/api/lead` | Server credential for PocketBase auth. |
| `PB_SERVER_PASSWORD` | Required for `/api/lead` | Server credential for PocketBase auth. |
| `RESEND_API_KEY` | Required for `/api/lead` | Resend API key. |
| `LEADS_FROM_EMAIL` | Required for `/api/lead` | Verified sender email for Resend. |

Example `.env.local`:

```bash
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-host
NEXT_PUBLIC_SITE_URL=https://your-site-domain
SITE_URL=https://your-site-domain

NEXT_PUBLIC_PB_HOMEPAGE_ID=zreceve3mfdgrh3
NEXT_PUBLIC_PB_NUMBERS_TESTIMONIALS_ID=lphz7j9p1wcglox
NEXT_PUBLIC_PB_REFRESH_MS=300000
NEXT_PUBLIC_DEBUG_PB=0

POCKETBASE_URL=https://your-pocketbase-host
PB_AUTH_COLLECTION=api_clients
PB_SERVER_EMAIL=service-account@example.com
PB_SERVER_PASSWORD=super-secret-password

RESEND_API_KEY=re_xxxxx
LEADS_FROM_EMAIL=website@your-domain.com
```

## Project Structure

### App routes

| Route | Wrapper file | Primary UI file | Data source |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | `components/home-page.tsx` | PocketBase client fetches + SEO_pages metadata |
| `/about` | `app/about/page.tsx` | `components/about-page.tsx` | Static UI + SEO_pages metadata |
| `/design` | `app/design/page.tsx` | `components/design-page.tsx` | PocketBase client fetches + SEO_pages metadata |
| `/design/[slug]` | `app/design/[slug]/page.tsx` | `components/design-project-page.tsx` | PocketBase server fetches for project detail |
| `/blog` | `app/blog/page.tsx` | `components/blog-page.tsx` | PocketBase client fetches + SEO_pages metadata |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | inline route rendering | PocketBase server fetches for post detail |
| `/contact-us` | `app/contact-us/page.tsx` | `components/contact-us-page.tsx` | Static UI + `/api/lead` submit + SEO_pages metadata |
| `/contact` | `app/contact/page.tsx` | redirect only | Redirects to `/contact-us` |
| `/terms` | `app/terms/page.tsx` | `components/terms-page.tsx` | Static UI + SEO_pages metadata |
| `/privacy` | `app/privacy/page.tsx` | `components/privacy-page.tsx` | Static UI + SEO_pages metadata |

### Shared areas

- `app/layout.tsx`: global shell, fonts, theme provider, site header/footer.
- `app/api/lead/route.ts`: lead form API, PocketBase write, Resend send.
- `lib/seo-pages.ts`: shared metadata loader for static routes via the `SEO_pages` collection.
- `lib/project-types.ts`: shared project record shape for design detail.
- `components/sections/*`: page sections that own most of the client-side PocketBase reads.

## Content and Data Architecture

There is no central API client or repository layer in this repo. Each section/component typically fetches PocketBase directly with `fetch(...)`.

Current PocketBase collections referenced by code:

| Collection | Used by |
| --- | --- |
| `homepage` | `components/home-page.tsx` |
| `homepage_projects` | `components/home-page.tsx` |
| `numbers_and_testimonials` | `components/sections/results-vision-section.tsx` |
| `project` | `components/sections/project-display-section.tsx`, `components/sections/our-works-section.tsx`, `app/design/[slug]/page.tsx`, sitemap |
| `blog` | `components/sections/publication-section.tsx`, `components/sections/blog-publications-section.tsx`, `app/blog/[slug]/page.tsx`, sitemap |
| `SEO_pages` | `lib/seo-pages.ts` for static route metadata |
| `leads` | `app/api/lead/route.ts` writes submitted enquiries |
| `api_clients` or custom `PB_AUTH_COLLECTION` | `app/api/lead/route.ts` authenticates here before writing to `leads` |

PocketBase asset URLs are built with the usual pattern:

```text
{POCKETBASE_BASE_URL}/api/files/{collectionId}/{recordId}/{filename}
```

Most components rebuild that URL locally instead of sharing a helper.

## Design Pages Deep Dive

This is the most important part for future contributors.

### `/design`

`app/design/page.tsx` is a thin server wrapper:

- calls `getSeoMetadata("/design")`
- calls `getSeoJsonLd("/design")`
- renders `components/design-page.tsx`

`components/design-page.tsx` itself is mostly layout. The real data work happens inside:

- `components/sections/our-works-section.tsx`
- `components/sections/publication-section.tsx`

#### Our Works request flow

File: `components/sections/our-works-section.tsx`

Request:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/project/records?filter=featured=true&perPage=200&sort=-created
```

Behavior:

- Runs client-side in `useEffect`.
- Uses `cache: "no-store"`.
- Filters `featured` records again after the response.
- Builds tabs from distinct `ProjectType` values.
- Reads `projectType` or `scope` from the URL search params and auto-selects a matching tab.
- Links cards to `/design/{slug}` using `project.slug ?? project.id`.

Important implication:

- The detail page loader fetches by `slug` only.
- If a project record is missing `slug`, some list UIs can still build a fallback URL, but the detail route may not resolve it.

#### Publications block on the design page

File: `components/sections/publication-section.tsx`

Request:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/blog/records?filter=published=true && homepage=true&perPage=30
```

Behavior:

- Runs client-side in `useEffect`.
- Uses `cache: "no-store"`.
- Shows the first 3 matching posts.

### `/design/[slug]`

File: `app/design/[slug]/page.tsx`

This route is server-rendered and owns the project-detail fetch logic.

Primary request:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/project/records?filter=(slug='{slug}')&perPage=1
```

Caching:

- Development: `cache: "no-store"`
- Production: `next: { revalidate: 21600 }` (6 hours)

Secondary request for previous/next navigation:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/project/records?filter=(ProjectType='{project.ProjectType}')&perPage=200&sort=created
```

What the route does with the project record:

- Builds SEO metadata directly from the project record instead of using `SEO_pages`.
- Resolves `seo_image`, `Image_1`, and `Image_2` file URLs.
- Reads image alt metadata from `image_1_alt` and `image_2_alt`.
- Builds JSON-LD for the project.
- Computes previous/next project navigation scoped to the same `ProjectType`.
- Hands the prepared data to `components/design-project-page.tsx`.

Fields the detail route expects most often:

- `slug`
- `Name`
- `Intro`
- `ProjectType`
- `Sector`
- `Location`
- `Year`
- `seo_title`
- `seo_description`
- `seo_image`
- `seo_image_alt`
- `Image_1`
- `Image_2`
- `image_1_alt`
- `image_2_alt`
- `location_json`

## Homepage and Blog Data Flows

### Homepage

`components/home-page.tsx` does two separate client-side reads:

1. `homepage` single-record fetch by ID from `NEXT_PUBLIC_PB_HOMEPAGE_ID`
2. `homepage_projects` list fetch with `expand=Project_Name,Slug`

The homepage component also:

- stores cached payloads in `localStorage`
- refreshes on an interval controlled by `NEXT_PUBLIC_PB_REFRESH_MS`
- merges PocketBase data over a local fallback object

### Results/testimonials

`components/sections/results-vision-section.tsx` fetches a single `numbers_and_testimonials` record by ID and also uses `localStorage` plus interval refresh.

### Blog listing

`components/sections/blog-publications-section.tsx` fetches:

```text
GET {NEXT_PUBLIC_POCKETBASE_URL}/api/collections/blog/records?filter=published=true && featured=true&perPage=200
```

Then it filters, paginates, and groups posts client-side.

### Blog detail

`app/blog/[slug]/page.tsx` fetches one blog record by `slug` on the server and builds article SEO/JSON-LD there.

## Lead Form and API

Client entry:

- `components/contact-us-page.tsx` renders `components/lead-form.tsx`
- `components/lead-form.tsx` POSTs JSON to `/api/lead`

Server flow in `app/api/lead/route.ts`:

1. Validate request origin.
2. Apply in-memory IP rate limiting: 5 requests per minute.
3. Parse JSON body.
4. Use `company` as a honeypot field.
5. Validate `name`, `purpose`, `email`, `phone_number`, `message`, and `consent`.
6. Authenticate against PocketBase with `PB_SERVER_EMAIL` and `PB_SERVER_PASSWORD`.
7. Create a record in the `leads` collection.
8. Send a notification email through Resend.

Important operational notes:

- The rate limiter is process-memory only, so it resets on redeploy/restart and is not shared across instances.
- The API returns `500` for missing configuration, `502` for PocketBase/Resend downstream failures, `429` for rate limits, and `403` for origin failures.
- `purpose` values are mapped before storing in PocketBase.

## SEO, Sitemap, and Robots

### Static-route metadata

`lib/seo-pages.ts` fetches records from the `SEO_pages` collection by `route`.

Static route wrappers call:

- `getSeoMetadata(route)`
- `getSeoJsonLd(route)`

### Dynamic-route metadata

These routes do not use `SEO_pages`:

- `app/design/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`

They generate metadata directly from their PocketBase records.

### Sitemap

`app/sitemap.ts`:

- includes fixed static routes
- fetches all `project` records
- fetches all `blog` records where `published=true`
- emits `/design/{slug}` and `/blog/{slug}` URLs

### Robots

`app/robots.ts` disallows indexing outside production and points production crawlers to `/sitemap.xml`.

## Operational Gotchas

- `NEXT_PUBLIC_POCKETBASE_URL` is used in both runtime fetches and `next.config.ts`. If it changes, restart the dev server so CSP and image host config stay in sync.
- Several components fetch PocketBase directly in the client, so CORS/CSP issues will show up in the browser, not just on the server.
- Some components default to `https://staging.angle.services` when `NEXT_PUBLIC_POCKETBASE_URL` is missing, while others fail more directly. Set the env var everywhere to avoid mixed environments.
- Slug handling is not perfectly consistent across project list/detail/sitemap code. Before changing slug logic, check `components/sections/our-works-section.tsx`, `components/sections/project-display-section.tsx`, `app/design/[slug]/page.tsx`, and `app/sitemap.ts` together.

## Recommended Workflow For Future Contributors

1. Read `AGENTS.md`.
2. Identify whether your change belongs to a route wrapper, a page component, or a data-fetching section.
3. If you touch PocketBase-backed UI, verify the collection, filters, and field names in code before refactoring.
4. Run `npm run lint`.
5. Manually check the affected route, especially `/design`, `/design/[slug]`, `/blog`, `/blog/[slug]`, and `/contact-us` when relevant.
