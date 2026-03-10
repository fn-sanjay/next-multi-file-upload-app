# Cloud Vault (Multi File Upload)

Secure file storage and management with chunked uploads, tags, favorites, trash, and an admin console. Built with Next.js App Router, Prisma, and Supabase Storage.

## Features
- Auth: JWT + CSRF, email verification, password reset, and Google OAuth
- Uploads: chunked uploads with SHA-256 deduplication and folder path support
- Files & Folders: favorites, trash/restore, batch actions, tree view
- Tags: create, attach/detach for files and folders (max 3 per item)
- Storage: usage breakdown, quota requests
- Admin: user control, storage stats, storage request approvals, client queries

## Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma + PostgreSQL
- Supabase Storage
- Uppy (upload UI)
- Tailwind CSS + Radix UI

## Local Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Configure environment variables
3. Push database schema
   ```bash
   npm run db:push
   ```
4. Optional: seed an admin user
   ```bash
   npm run db:seed
   ```
5. Start dev server
   ```bash
   npm run dev
   ```

## Environment Variables
Create a `.env` file with the following keys (values omitted here on purpose):

```bash
# Database
DATABASE_URL=

# Auth
JWT_ACCESS_SECRET=

# Admin seed
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Scripts
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Lint
npm run db:push    # Push Prisma schema
npm run db:seed    # Seed admin user
```

## API Docs (Swagger)
- Swagger UI: `GET /api/docs/ui`
- OpenAPI JSON: `GET /api/docs`

## API Overview
Base URL: `/api`

### Auth
- `GET /auth/csrf`
- `GET /auth/verify-email`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/refresh-token`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/google`
- `GET /auth/google/callback`

### Uploads
- `POST /user/uploads/init`
- `POST /user/uploads/chunk`
- `POST /user/uploads/complete`

### Files
- `GET /user/files`
- `POST /user/files`
- `GET /user/files/{id}`
- `PATCH /user/files/{id}`
- `DELETE /user/files/{id}`
- `GET /user/files/{id}/download`
- `GET /user/files/{id}/preview`
- `POST /user/files/{id}/favorite`
- `DELETE /user/files/{id}/favorite`
- `POST /user/files/{id}/trash`
- `DELETE /user/files/{id}/trash`
- `POST /user/files/batch`

### Folders
- `GET /user/folders`
- `POST /user/folders`
- `GET /user/folders/{id}`
- `PATCH /user/folders/{id}`
- `DELETE /user/folders/{id}`
- `GET /user/folders/tree`
- `POST /user/folders/batch`
- `POST /user/folders/{id}/trash`
- `POST /user/folders/{id}/restore`
- `POST /user/folders/{id}/favorite`
- `DELETE /user/folders/{id}/favorite`

### Tags
- `GET /user/tags`
- `POST /user/tags`
- `PATCH /user/tags/{id}`
- `DELETE /user/tags/{id}`
- `POST /user/tags/files`
- `DELETE /user/tags/files`
- `POST /user/tags/folders`
- `DELETE /user/tags/folders`

### Search & Recent
- `GET /user/search`
- `GET /user/recent`
- `POST /user/recent`

### Storage
- `GET /user/storage-usage`
- `GET /user/storage-requests`
- `POST /user/storage-requests`

### Support
- `GET /user/support-tickets`
- `POST /user/support-tickets`
- `GET /user/support-tickets/{id}`
- `POST /user/support-tickets/{id}`

### Profile
- `PATCH /user/profile`

### Admin
- `GET /admin/users`
- `PATCH /admin/users/{id}`
- `DELETE /admin/users/{id}`
- `GET /admin/storage-stats`
- `GET /admin/storage-requests`
- `PATCH /admin/storage-requests/{id}`
- `GET /admin/client-queries`
- `PATCH /admin/client-queries/{id}`

## Notes
- Supabase Storage bucket name used in code: `uploads`.
- Tag limits: max 3 tags per file/folder, max 10 tags per user.

## License
Private repository.
