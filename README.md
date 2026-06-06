# PredictyPie

An AT Protocol app for making and browsing predictions. Users store predictions in their own PDS, and they're mirrored to Convex via Tap webhook.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start Convex + dev server
pnpm convex dev --start 'vite dev --port 3000 --host'
```

Visit http://127.0.0.1:3000 and log in with your AT Protocol account.

## Tap (Webhook for Mirroring)

Tap mirrors predictions from users' PDSes to Convex.

### Run Tap

```bash
$(go env GOPATH)/bin/tap run --webhook-url=http://localhost:3000/webhook --collection-filters=app.predictypie.prediction --admin-password=admin
```

For less traffic, it's helpful to run tap without `--collection-filters` and do 
```bash
curl -X POST http://localhost:2480/repos/add \
  -H "Content-Type: application/json" \
  -d '{"dids": ["did:plc:r3bpptdqfsipcnildivvdv5d"]}'
```

The webhook endpoint is at `/webhook`.

## Environment Variables

Create `.env.local` with:

```
CONVEX_DEPLOYMENT=<your-convex-deployment>
TAP_ADMIN_PASSWORD=admin
```

## Tech Stack

- Solid + Vite
- Convex (database)
- AT Protocol OAuth (PDS-hosted data)
- Tap (repo synchronization)
