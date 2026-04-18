# PredictyPie v2.0 Plan

Stack: Solid + Convex + AT Proto (no custom PDS)

## Status

- Phase 1: ✅ Complete
- Phase 2: ✅ Lexicon defined (src/lexicons/app.predictypie/prediction.ts)
- Phase 3: ✅ Convex schema deployed (convex/schema.ts)
- Phase 4: ✅ OAuth client + routes created
- Phase 5: ⚠️ SSR works, client-side fetch in progress
- Phase 6: ⏳ Not started

## To Run

```bash
pnpm convex dev --start 'vite dev --port 3001'
```

## Phase 1: Hello World ✅

- Delete: `src/routes/(home).tsx`, `src/routes/prediction/`, `src/loadPredictions.tsx`, `src/mocks.ts`, `supabase/functions/`
- Update dependencies (use `reference-package-json.md`)
- Add Convex + Tailwind config
- Minimal hello world route

## Phase 2: Custom Lexicon ✅

```json
{
  "lexicon": 1,
  "id": "app.predictypie.prediction",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "text": { "type": "string", "maxGraphemes": 500 },
        "deadline": { "type": "datetime", "nullable": true }
      }
    }
  }
}
```

## Phase 3: Convex Schema + Mirror ✅

- **users**: `did` (key), `handle`
- **predictions**: `rkey` (key), `atUri`, `authorDid`, `text`, `deadline`, `createdAt`, `resolvedAs`
- **authStates**, **sessions**: for OAuth
- Firehose consumer → NOT YET (need webhook or firehose setup)

## Phase 4: OAuth + Create ✅

- AT Proto OAuth client (src/auth/client.ts)
- Create form: text + optional deadline
- Submit → `com.atproto.repo.createRecord` on user's PDS

## Phase 5: Browse UI ⚠️

- List predictions from Convex
- Show: text, author (via users table), deadline, resolution status
- Issue: SSR query fails (needs fix), client-side works

## Phase 6: Resolve ⏳

- Author-only: update `resolvedAs` to `correct`/`incorrect`
- Calls `com.atproto.repo.updateRecord` on their PDS

## File Structure

```
src/
├── auth/client.ts           # OAuth client
├── components/LoginForm.tsx
├── lib/
│   ├── convex.tsx        # Convex queries
│   └── contextHttpClient.ts
├── routes/
│   ├── index.tsx        # Home
│   ├── new.tsx          # Create form
│   ├── api/new.ts       # Create API
│   ├── session.ts
│   └── oauth/
│       ├── login.ts
│       └── callback.ts
├── lexicons/app.predictypie/prediction.ts
convex/
├── schema.ts
├── predictions.ts
└── auth.ts
```