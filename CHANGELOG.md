# Changelog

All notable changes to VIPHive Backend are documented here.

## [Unreleased]

### Changed

- Completed the Resend email integration and removed the remaining Gmail SMTP calls and startup verification.
- Added `EMAIL_FROM` as the verified Resend sender address.
- Expanded the development product seed catalog with six additional products and verified image URLs.
- Added backend CI checks for dependency installation, JavaScript syntax, and high-severity vulnerabilities.

### Fixed

- Corrected the Resend CommonJS import so the backend can construct the email client.

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
- Added seeder configuration through `SEED_USER_PASSWORD`.
- Added a GitHub Actions security workflow for pushes and pull requests.

### Changed

- Seeder data now contains only regular dummy users and no default admin account.
- Seeder requires explicit `YES` confirmation before importing or destroying data.
- Seeder blocks production execution and rejects a MongoDB database named `production`.
- `console.log` output is disabled in production while `console.error` remains available for server diagnostics.
- Cloudinary, email, and JWT failures now log only error messages instead of complete error objects.
- Production API error responses remain sanitized while detailed failures stay server-side.

### Security

- Removed hardcoded seed passwords from source code.
- Added separate environment guidance for development, staging, and production credentials.
- Documented that real `.env` files and service credentials must not be committed.
- Added automated checks for tracked environment files, private keys, and common cloud and payment credentials.
