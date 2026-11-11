# AI usage notes

## Tools and models
- Assistant: ChatGPT (model: GPT-6)
- Coding environment/tool: VSCode


## Agent instructions
- No agent instruction file was required for this starter. If you use `AGENTS.md`, `CLAUDE.md`, or editor rules, commit them and list them here.


## Plan
1. Translate acceptance criteria into user flows and assumptions.
2. Define a backend API and isolate the product provider behind a repository.
3. Implement the catalogue UI and enquiry flow.
4. Add validation, tests, documentation, then run build and test commands.


## Key prompts / moments
1. Architecture
Act as a Senior Software Architect. Review the acceptance criteria and plan a scalable foundation for a Product Catalogue using React + TypeScript frontend and Node.js + TypeScript backend.

Define:
- Frontend, backend, business logic and data-provider boundaries.
- Project folder structure and component architecture.
- Responsive UI design, abstraction for products and email services so that they can be replaced with actual data later.
- API contracts, error handling and validation strategy.

Before development, create a test strategy covering frontend and backend tests.
Document assumptions, trade-offs and implementation priorities in DECISIONS.md.
Keep the solution simple and maintainable. Do not implement features yet. Present the plan and wait for review.
[shared the acceptance criteia from the assessment doc]

2. Implementation
Implement the approved architecture and test plan.

Frontend:
- Build a premium, modern, responsive product catalogue as per the acceptance criteria shared before.
- Reusable components, consistent design system, loading, empty and error states.

Backend:
- Create REST APIs for featured products, categories, category products, search, product details and enquiries.
- Fetch product data through a dedicated Fake Store API provider.
- Implement repository and service layers.
- Implement an abstract EmailProvider with a free local/mock implementation.
- Add request validation and centralized error handling.

Ensure the frontend never calls Fake Store API directly. Keep data providers and presentation layers replaceable independently. Follow the standard project conventions and avoid unnecessary dependencies. Implement the tests alongside the code.

3. Testing and Security
Implement and verify:
- Unit tests for services, repositories and business logic.
- API integration tests for all backend endpoints.
- Frontend component and user journey tests based on possible scenarios and edge cases.
- API error and loading states.

Security and quality:
- Protect environment variables and secrets.
- Add appropriate CORS configuration.
- Handle external API failures and timeouts.
- Avoid exposing internal errors or sensitive information.
- Check TypeScript types and remove dead code.

Do not write superficial tests just to increase coverage. Tests must verify actual behaviour. Fix implementation defects rather than weakening assertions. Document any remaining limitations.

4. Build, Verify and Document
- Fix the test and build errors and failures [shared error logs]
Prepare:
- README.md with setup and run instructions.
- DECISIONS.md with assumptions, trade-offs, dropped requirements and future improvements.


## AI mistakes caught during review
- Image rendering was not proper and aligned in UI. Fixed the alignment.
- Did not generate unit tests at the first prompt as expected for all files, generated only for backend. Added detailed prompts to generate and have required coverage.
