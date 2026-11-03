# AI Usage Notes — ESOLS Technologies Mini Marketplace Assessment

## 1. AI Tools Used
- **Antigravity AI Agent** (powered by Google Gemini 3.8 Flash)
- **OpenAI GPT-4o-mini API** (integrated into the Seller Product Assistant for e-commerce listing generation)

## 2. Capabilities & Assistance Breakdown
| Stage / Task | How AI Was Utilized |
| :--- | :--- |
| **Requirements Extraction** | Parsing the ESOLS assessment specification, mapping all Prague Divan Bed variation price deltas, swatch requirements, and scoring rubrics. |
| **Architecture & Database Schema** | Designing the PostgreSQL relational schema, Row Level Security (RLS) policies, and unified repository pattern. |
| **Pricing Engine** | Structuring the integer pence calculation system (`toPence`, `fromPence`) to avoid IEEE 754 decimal inaccuracies. |
| **Component Scaffolding** | Writing modular React 19 components with Tailwind CSS for mobile responsiveness, 44px+ tap targets, swipeable galleries, and sticky mobile bars. |
| **Automated Testing** | Generating the 12-test automated verification suite (`tests/pricing-and-flows.test.ts`) covering all 5 configuration combinations. |

## 3. Actual AI Mistake & Resolution (Honest Reflection)

### The Mistake
During the production build of Next.js 16 (`npm run build`), the build worker threw an uncached prerendering error on the dynamic product detail route `/products/[slug]`. 

To fix this, the AI initially attempted to declare `export const dynamic = 'force-dynamic'` directly inside the client component `src/app/products/[slug]/page.tsx`. This triggered a Turbopack fatal compiler error:
```
Error: Route segment config "dynamic" is not compatible with nextConfig.cacheComponents. Please remove it.
```

### How It Was Corrected
1. Inspected `next.config.ts` and identified that the default `create-next-app` template had enabled experimental `cacheComponents: true` and `partialPrefetching: true`, which clashed with client-level dynamic route configurations.
2. Removed the conflicting experimental flags from `next.config.ts` and configured proper remote domain patterns for Unsplash images.
3. Removed `export const dynamic` from the client file and refactored `ProductDetailPage` to resolve dynamic params within a dedicated `<Suspense>` fallback boundary.
4. Reran `npm run build`, which immediately compiled cleanly with 100% route generation success (`✓ Generating static pages (14/14)`).
