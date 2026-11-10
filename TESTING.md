# Automated test plan and coverage

## Run commands

From the repository root (Node.js 20+):

```powershell
npm install
npm test
npm run build
```

Run either suite on its own:

```powershell
npm run test --workspace backend
npm run test --workspace frontend
```

The frontend suite runs in jsdom. It mocks HTTP requests and does not need the API server or Fake Store API. Backend provider calls are mocked; the only real HTTP requests are in-process requests against the Express application using Supertest.

## Backend cases

| Area | Covered behavior |
|---|---|
| Product service | Five highest-rated products, short datasets, stable ties, missing ratings, category delegation, top-five category ranking, title/description/category search, case-insensitive matching, blank query, provider errors |
| Product repository | Provider URL and headers, category URL encoding, 404 mapping, HTTP/network failure mapping, malformed JSON |
| Controller/API | Featured/categories/category/search/product routes, missing/blank/overlong search, trimmed query, invalid product IDs, product-not-found, enquiry schema and field limits, trimmed enquiry fields, email invocation, product lookup failure, email provider failure |
| Express app | Health response, security header, route wiring, unknown routes, malformed JSON, safe AppError/500 responses |
| Email service | Default console provider logs enquiry details without SMTP credentials |

## Frontend cases

| Area | Covered behavior |
|---|---|
| API client | Each endpoint, encoded path/query values, POST JSON headers/body, API error message, non-JSON error fallback, network failure |
| Shared components | Loading status semantics, custom loading text, product title/price/rating/link/image, image-load failure fallback |
| Layout | Category navigation, nested route content, trimmed search submission, empty search behavior |
| Home | Loading, successful featured products, empty state, API error |
| Category | Category heading, featured products, duplicate exclusion, additional products, empty state, API error |
| Search | Query handling, result count, empty query, no matches, API error |
| Product detail | Product content, enquiry form open, successful enquiry, submission error, product load error |
| Not found | 404 content and return-home navigation |

## Scope notes

Static assets and bootstrap-only files (`styles.css`, `index.html`, `main.tsx`, Vite configuration, and the server listen entry point) are not isolated unit-test targets. Their runtime behavior is checked through the frontend build and the HTTP application tests. The SMTP transport is intentionally not contacted by tests; the default console adapter is covered and SMTP credentials must never be placed in tests or committed.
