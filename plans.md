# PredictyPie

Stack: Solid + Convex + AT Proto (no custom PDS)

## Next Steps

### 1. Author-Only Resolution ✅

Only show "Mark Correct/Incorrect" buttons to the prediction author.

**Implementation:**

- In `src/routes/index.tsx`, get current user DID from cookie
- Only render resolve buttons when `pred.authorDid === currentUserDid`
- Current user DID available via cookie regex

### 2. Filter by Status

Add tabs or buttons to filter: All / Unresolved / Correct / Incorrect.

**Implementation:**

- Add query param or state for filter: `filter: "all" | "unresolved" | "correct" | "incorrect"`
- Create new Convex query or filter in existing query
- Add filter buttons to `src/routes/index.tsx`

### 3. User Profile Page

Show all predictions by a specific user at `/user/:identifier`.

**Implementation:**

- Create `src/routes/user/[identifier].tsx`
- Query predictions by `authorDid` (resolve handle to DID if needed)
- Show user's handle + all their predictions

### 4. Deployment

Deploy to production (Vercel/Netlify + Convex cloud).

**Implementation:**

- Push Convex: `npx convex deploy` (creates production deployment)
- Add `CONVEX_DEPLOYMENT_URL` and `CONVEX_DEPLOYMENT_KEY` env vars
- Deploy frontend to Vercel: `pnpm deploy` or manual connect
- Move Tap to production server or configure production webhook URL

### 5. Error Handling

Better error messages for failed predictions, OAuth issues, etc.

**Implementation:**

- Add error state + display in `src/routes/new.tsx`
- Add error display in OAuth flows (`callback.ts`, `login-api.ts`)
- Show user-friendly messages instead of raw errors
- Consider adding error logging to external service (optional)
