# Decisions and assumptions

## Assumptions
- “Top rated” means descending `rating.rate`; ties retain provider order. The home page shows exactly five.
- A category page shows up to five top-rated products first, then every other product in that category without duplicates.
- Search matches title, description, or category, case-insensitively; an empty search is rejected.
- Product metadata is sourced from Fake Store API as permitted by the brief.
- Enquiry fields: name and email are required; phone and message are optional. Product identity is sent by product ID.
- A successful local enquiry is logged by the console email adapter. SMTP mode delivers an email to the configured sales inbox. This avoids requiring reviewers to create a paid account.

## Simplifications
- No authentication, admin dashboard, inventory, cart, checkout, or product editing: not in the acceptance criteria.
- No database: product source is explicitly replaceable behind a repository. Enquiries are handed to an email provider rather than persisted.
- No pagination or advanced filters: Fake Store API's small dataset is adequate for the PoC.
- The visual system is a considered neutral starter theme, not a final brand system; creative assets were not supplied.

## Growth path
- Replace `ProductRepository` with a database-backed implementation or a new provider adapter while preserving `ProductService` and API contracts.
- Introduce a design-token/theme layer and reusable component library as the brand direction stabilises.
- Add durable enquiry storage, retry/outbox processing, delivery monitoring, and provider-specific adapters.
- Add caching, pagination, observability, API versioning, and contract tests as catalogue size and traffic grow.

## Next day of work
- Add API integration tests for all endpoints and enquiry validation/provider failure paths.
- Add accessibility review, keyboard/focus states, image fallbacks, loading skeletons, and error retry UI.
- Add deterministic provider fixtures and CI workflow.
- Add persistence and idempotency for enquiries if required by the business.



# Time Spent

Architecture & Planning - 15 min 
Frontend and Backend implementation - 20 min
Review code and build verification - 30 min
Testing and security - 30 min
Build and final review - 15 min
Documentation - 30 min