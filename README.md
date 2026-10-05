# WishDrop Admin

Separate React admin UI for tracking surprises, wishes, users, media, reports, and settings.

## Run

1. Start API (from repo root or `server/`):

```bash
cd server
npm run dev
```

2. Start admin UI:

```bash
cd admin
npm run dev
```

Or from root: `npm run admin`

Open http://localhost:5173

## Default admin (seeded on API boot)

Set in `server/.env`:

- `ADMIN_EMAIL=admin@wishdrop.local`
- `ADMIN_PASSWORD=Admin12345!`

## Config

- `admin/.env` → `VITE_API_URL=http://localhost:3001/v1`
- Ensure `server/.env` `CORS_ORIGINS` includes `http://localhost:5173`
