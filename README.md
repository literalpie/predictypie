# PredictyPie

A social app for making and browsing predictions. It uses AT Proto, so you can sign in with Bluesky or any other AT Proto handle.

## User Guide

* Click on a prediction to see more details about it
* Click "New Prediction" (after signing in) to create a prediction.
  * You can add a deadline for the prediction, or make it more open-ended
  * If you are tracking a prediction made by someone else, fill out the "who made it" field. This can be something like a BlueSky handle, YouTube channel, or just a name.
  * If you are tracking a prediction made by someone else, I suggest also supplying a "source". This should be a URL where the person made the prediction.

## Developer Quick Start

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
