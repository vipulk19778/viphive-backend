# VIPHive Backend

Express and MongoDB backend for the VIPHive e-commerce application.

## Requirements

- Node.js 18 or newer
- MongoDB database
- Cloudinary account for image uploads
- Razorpay account for payments
- SMTP email account for email delivery

## Local Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with local development credentials, then start the server:

```bash
npm run dev
```

The server uses `PORT` from the environment, defaulting to `8000` when it is not set.

## Environment Variables

Copy `.env.example` and provide real values locally or through the deployment provider's secret manager. Never commit `.env` or real credentials.

Important variables include:

- `NODE_ENV`: `development`, `staging`, or `production`
- `CORS_ORIGIN`: allowed frontend origin
- `PORT`: server port
- `MONGO_URI`: environment-specific MongoDB connection string
- `JWT_SECRET`: unique secret for each environment
- `EMAIL_HOST`: SMTP host, defaulting to `smtp.gmail.com`
- `EMAIL_PORT`: SMTP port, usually `587` for STARTTLS
- `EMAIL_SECURE`: `true` for implicit TLS, otherwise `false`
- `EMAIL_USER`: SMTP account username
- `EMAIL_PASSWORD`: SMTP password or Gmail app password
- `EMAIL_FROM`: sender address, usually the same as `EMAIL_USER`

The backend sends email through Nodemailer over SMTP. For Gmail, enable two-step verification and use an app password instead of the account password. Make sure the deployment host allows outbound SMTP connections.

- `CLOUDINARY_*`: Cloudinary credentials
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: payment credentials

Use separate MongoDB databases and external service credentials for development, staging, and production. Use Razorpay test credentials outside production.

## Commands

```bash
npm start          # Start the server
npm run dev        # Start with Nodemon
```

## Vercel Deployment

Import this backend directory as a Vercel project. Vercel will use `api/index.js` as the serverless entrypoint and route requests through the existing `/api/*` Express paths.

Configure the variables from `.env.example` in the Vercel project settings. Use a MongoDB deployment that accepts connections from Vercel, and use an SMTP account with an app password for email delivery.

## Deployment

Configure each Render service with its own environment variables and MongoDB database:

- Development: development database and test service credentials
- Staging: staging database and test service credentials
- Production: production database and live service credentials

Production should run only:

```bash
npm start
```

Do not add seed credentials to the production environment. Keep `console.log` disabled in production while retaining `console.error` for server-side diagnostics.

## Security Checks

GitHub Actions runs `.github/workflows/security-check.yml` on every push and pull request. It rejects:

- Tracked `.env` files
- MongoDB connection strings containing credentials
- Private keys
- Common AWS and payment-provider credentials

`.env.example` is allowed because it contains placeholders only. Keep real secrets in ignored `.env` files locally or in the deployment provider's secret manager.

GitHub Actions also runs `.github/workflows/ci.yml` for development, staging, and production branches. It installs locked dependencies, checks backend JavaScript syntax, and fails on high-severity dependency vulnerabilities.

## Versioning

This project follows Semantic Versioning:

- **Patch** (`1.0.1`): backwards-compatible bug fixes
- **Minor** (`1.1.0`): backwards-compatible features or security improvements
- **Major** (`2.0.0`): breaking API or behavior changes

For each release, update the version in `package.json` and `package-lock.json`, move the entries from `Unreleased` into a dated version section in `CHANGELOG.md`, and create a matching Git tag such as `v1.1.0`.

## API Areas

- `/api/health`
- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payments`
- `/api/analytics`
