# Form & Found — Product Catalogue PoC

A responsive, full-stack product catalogue for the AI-Native Engineer assessment.

## Technology choices
- **Client:** React + TypeScript + Vite. Component-based UI, typed API boundary and fast local development.
- **Backend:** Node.js + Express + TypeScript. REST API with separate controller, service and repository responsibilities.
- **Product source:** Fake Store API, accessed only by the backend through `ProductRepository`.
- **Email:** Provider abstraction. The default local provider logs enquiries to the backend terminal; optional SMTP mode sends email when configured. No paid account is needed to run the project.

## Requirements
- Windows 10/11, macOS or Linux
- Node.js 20 or newer (LTS recommended)
- npm
- Internet access for downloading dependencies and retrieving Fake Store API products

## Run on Windows (PowerShell)
Open PowerShell in the extracted project folder:

```powershell
node --version
npm --version
npm install
Copy-Item backend/.env.example backend/.env
npm run dev
```

If PowerShell says script execution is disabled when running npm, use `npm.cmd` instead of `npm` for the commands, e.g. `npm.cmd install` and `npm.cmd run dev`.

Open the web app at http://localhost:5173. API health check: http://localhost:4000/health.

The root `npm install` installs both workspace packages. You do not need to install frontend and backend separately.

## Test and build
```powershell
npm test
npm run build
```

## Real email setup
The default `EMAIL_PROVIDER=console` is intentionally suitable for reviewers without accounts: submit an enquiry and inspect the backend terminal. To deliver real email, configure `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`, and `SALES_EMAIL` in `backend/.env`. Never commit `.env` or credentials.

## API
- `GET /api/products/featured` — five highest-rated products
- `GET /api/categories` — category names
- `GET /api/categories/:name/products` — category products and top five
- `GET /api/products/search?q=term` — case-insensitive title/description/category search
- `GET /api/products/:id` — product details
- `POST /api/enquiries` — validates and sends/logs enquiry

## Design notes
See `DECISIONS.md` for assumptions and trade-offs, and `AI_USAGE.md` for the AI-use record.

Fake Store API is an external demo dependency, so catalogue endpoints need internet access. Product images and typography are loaded from public sources. The product source can be replaced by implementing the `ProductDataSource` interface and swapping the repository adapter.

## Automated test coverage

The root test command runs both test suites:

```powershell
npm test
```

Run a suite independently:

```powershell
npm run test --workspace backend
npm run test --workspace frontend
```

The backend suite uses Vitest and Supertest to cover product sorting/search/category behavior, provider URL construction and failure mapping, HTTP routing, health checks, malformed JSON, and safe error responses. Provider network calls are mocked, so these tests do not depend on Fake Store API availability.

The frontend suite uses Vitest, jsdom, and React Testing Library to cover API request construction and failures, shared components, catalogue page loading/error/empty states, category de-duplication, search behavior, product detail/enquiry form visibility, and not-found navigation. Browser tests use mocked API responses and do not require the backend to be running.

For a production-style TypeScript and frontend bundle check, run `npm run build` after installing dependencies. Tests are intentionally isolated from live SMTP and external product-provider services.
