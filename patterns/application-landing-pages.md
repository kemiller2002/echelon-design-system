# Application Landing Page and Demo Separation Standard

**ID:** EDS-UX-LANDING-001  
**Status:** Normative draft, pending implementation verification  
**Applies to:** Every user-facing Echelon application

## Mandatory requirements

1. Every application MUST have a distinct, branded landing page, using its own approved application logo and the shared Echelon design system.
2. The landing page MUST explain the application's purpose, intended audience, primary value, and clear next action. It MUST NOT require a live demonstration, sample records, or simulated workflow to explain the product.
3. The landing page MUST remain useful and understandable before authentication, where public access is intended. It MUST not disclose private data, internal architecture, secrets, or operational diagnostics.
4. The landing page MUST be responsive, accessible, and work in approved light/dark themes.
5. Landing-page content and primary actions MUST be specific to the application; shared Forma layout/components provide consistency without making all landing pages identical.
6. Production workflows MUST be separate from demonstration workflows. Do not automatically seed demonstration data into production or present demo content as real user records.
7. The application MUST provide explicit navigation between the landing page and authenticated workspace, with appropriate handling for unauthenticated, authenticated, unavailable, and offline states.
8. Initial loading, route transitions, and pending actions MUST comply with EDS-UX-WAIT-001. The application's own logo MUST comply with EDS-BRAND-APP-001.
9. An application MUST NOT claim full design-system compliance without a verified landing page and tested entry path.

## Landing-page content guidance

Recommended sections: application identity and one-sentence purpose, audience/problem, capabilities or benefits, concise explanation of how it works, primary CTA, and optional documentation/contact. Use only real, supported claims. Avoid exposing unfinished functionality as complete. Do not force a feature-by-feature live walkthrough onto the landing page.

## Demo mode: deferred design decision

A separate demo experience may be introduced later. Potential approaches include a dedicated route, sandbox environment, or a query-string selector such as `?demo=true`. **No specific mechanism is approved by this standard.** A URL parameter MUST NOT grant privileges, bypass authentication/authorization, or mix demo data with production data. Demo content must be visibly identified and isolated. Decide routing, data isolation, reset behavior, security, and test requirements in a separate approved contract before implementation.

## Implementation ownership

- **Design system:** Defines landing-page behavior, content contract, accessibility, and acceptance.
- **Forma:** Supplies reusable page sections, responsive shell, CTA, and navigation components.
- **Forma Studio:** Demonstrates layout patterns and responsive variants.
- **Conditor:** Scaffolds an application-specific landing-page template and placeholders.
- **Percepta/Dokimos:** Verify supported requirements, accessibility, navigation, and evidence.
- **Application repository:** Owns its actual content, unique logo, routes, and integration.

## Verification

Test direct landing-page navigation, refresh, responsive breakpoints, keyboard and screen-reader semantics, CTA destination, authentication boundaries, dark/light mode, initial WASM startup, loading/error states, and that no sample records or demo privileges are exposed unintentionally. Include negative fixtures for blank/placeholder landing pages, demo-first default routing, broken CTAs, and leaked sample data.

## Migration priority

**Signal first.** Audit its current default route and landing behavior, implement a dedicated branded introduction, and preserve production workflows behind an explicit entry action. Do not introduce demo-mode behavior until its separate contract is approved.
