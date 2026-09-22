# Changelog

All notable changes to VIPHive Backend are documented here.

## [Unreleased]

- Extended MongoDB connection idle time to reduce reconnects on warm serverless instances.
- Added pagination and search filtering to admin Users, Orders, and Payments list endpoints.
- Added allowlisted sorting for admin Products, Users, Orders, and Payments before pagination.
- Blocked unverified users from protected API routes.
- Added sorted product categories to paginated product metadata.
- Added category filtering to the paginated products endpoint.

### Added

- Added an authenticated OTP-based change-password endpoint with Joi validation and bcrypt password hashing.

### Changed

- Added short-lived CDN caching and a focused field projection to speed up public product listing responses.
- Added a root endpoint redirect from `/` to `/api/health` for convenient API health checks.
- Redesigned order and OTP email templates with a responsive VIPHive layout, item summaries, status cards, safe HTML escaping, and plain-text fallbacks.
- Updated backend email templates to use the VIPHive logo and a shared slate/amber color system for brand consistency with frontend UI colors.
- Added the bundled VIPHive logo as an inline Nodemailer attachment so email clients can render it reliably without a logo URL environment variable.
- Updated change-password OTP verification to remain valid until the new password is successfully submitted.

- Replaced Resend email delivery with configurable Nodemailer SMTP delivery.
- Added SMTP host, port, security, credentials, and sender environment settings.
- Added a Vercel serverless entrypoint, catch-all rewrite, and cached MongoDB connection handling for deployment.
- Expanded the development product seed catalog with six additional products and verified image URLs.
- Added backend CI checks for dependency installation, JavaScript syntax, and high-severity vulnerabilities.

### Fixed

- Normalized trailing slashes in `CORS_ORIGIN` so staging frontend requests pass browser CORS validation.
- Standardized the SMTP password environment variable as `EMAIL_PASSWORD`.
- Removed `PORT` from mandatory environment validation so the Vercel function can load without a server listener port.
- Made the health endpoint independent of MongoDB and bounded serverless MongoDB connection attempts with a small reusable pool and timeouts.
- Fixed product image uploads failing during Vercel initialization by using an absolute writable temporary upload directory.
- Added a public forgot-password reset endpoint that consumes the OTP only after the new password is saved.

## [1.1.2] - 2026-09-10

### Fixed

- Switched Gmail SMTP from port 465 to STARTTLS on port 587 for better compatibility with Render outbound networking.
- Added explicit SMTP connection, greeting, and socket timeouts.

## [1.1.1] - 2026-09-10

### Fixed

- Forced Gmail SMTP connections to IPv4 to support production hosts without IPv6 connectivity.

## [1.1.0] - 2026-09-10

### Added

- Added project setup, deployment, environment, and API documentation in `README.md`.
- Added a GitHub Actions security workflow for pushes and pull requests.

### Changed

- `console.log` output is disabled in production while `console.error` remains available for server diagnostics.
- Cloudinary, email, and JWT failures now log only error messages instead of complete error objects.
- Production API error responses remain sanitized while detailed failures stay server-side.

### Security

- Added separate environment guidance for development, staging, and production credentials.
- Documented that real `.env` files and service credentials must not be committed.
- Added automated checks for tracked environment files, private keys, and common cloud and payment credentials.
