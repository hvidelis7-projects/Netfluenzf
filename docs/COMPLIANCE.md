# Compliance, operations, and production readiness

This document summarizes how Netfluenz should evolve toward a production-grade marketplace (Tier C of the product roadmap). It is guidance for engineering and legal review, not legal advice.

## Payments and M-Pesa

- **Partner-first**: Real money movement should go through licensed payment service providers (PSPs) in Kenya. Treat in-app wallet and escrow UI as **illustrative** until a PSP contract is in place.
- **PCI scope**: Avoid handling raw card data in the SPA; use hosted fields or redirect flows from your PSP.
- **Labelling**: Mark wallet and “secure hold” flows as **beta** or **illustrative** until regulated escrow or trust arrangements exist.

## KYC and verification

- **Creators and brands**: Plan a verification workflow (ID, business registration, social account checks). Start with manual review; automate when volume justifies it.
- **Data minimization**: Collect only what you need for risk and compliance; document retention in the privacy policy.

## Disputes and audit

- **Dispute path**: Define escalation (support → mediation → refund/chargeback policy). Surface a contact channel (`/contact`) and internal playbooks.
- **Audit log**: Campaign state changes and payout events should be append-only on the server (`CampaignLog`-style semantics), not only client-side mocks.

## Observability

- **Errors**: `VITE_SENTRY_DSN` wires `@sentry/browser` via `src/lib/observability.ts`.
- **Analytics**: Prefer privacy-conscious, first-party or aggregated metrics; document cookies in the privacy policy if used.
- **Uptime**: Monitor Firebase Auth / Firestore and Cloudinary APIs (status pages + your edge layer).

## Security hardening

- **Secrets**: Never commit `.env`; only `VITE_*` public keys belong in the client bundle.
- **CSP**: Serve `Content-Security-Policy` (and related headers) from your CDN or reverse proxy in production; tighten `script-src` and `connect-src` to Firebase (`*.googleapis.com`, `*.firebaseio.com`, `*.cloudfunctions.net` as needed) and Cloudinary (`api.cloudinary.com`, `res.cloudinary.com`).
- **Dependencies**: Run `npm audit` and keep frameworks patched; add automated dependency review in CI when feasible.
- **Rate limiting**: Apply on Cloud Functions or API routes for sensitive operations; Firestore security rules in `firebase/firestore.rules` scope per-user data — abuse still needs server-side throttling for public endpoints.

## Backend stack (this repo)

- **Auth & database**: Firebase Authentication + Cloud Firestore (`src/lib/firebase.ts`, `src/services/firestoreData.ts`). Deploy rules with Firebase CLI.
- **Media**: Cloudinary for uploads (`src/services/cloudinary.ts`); not Firebase Storage, to keep a single media CDN and transforms.

## Quality gate

- **Typecheck**: `npm run lint` (TypeScript).
- **Tests**: `npm run test` (Vitest).
- **CI**: GitHub Actions workflow runs lint, test, and build on push/PR.

Replace placeholder legal copy in Terms, Privacy, and Contact before launch.
