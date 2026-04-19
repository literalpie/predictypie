This is a package.json from my other at proto app. Use this to set the dependencies

```
{
  "name": "example-bare",
  "type": "module",
  "scripts": {
    "dev": "vite dev --host 127.0.0.1",
    "build": "vite build",
    "start": "vite start",
    "preview": "vite preview",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "fmt": "oxfmt --check",
    "fmt:fix": "oxfmt"
  },
  "dependencies": {
    "@atproto/common-web": "^0.4.21",
    "@atproto/identity": "^0.4.12",
    "@atproto/lex": "^0.0.25",
    "@atproto/oauth-client-node": "^0.3.17",
    "@atproto/syntax": "^0.5.4",
    "@atproto/tap": "^0.2.13",
    "@solidjs/meta": "^0.29.4",
    "@solidjs/router": "^0.16.1",
    "@solidjs/start": "2.0.0-alpha.2",
    "@tailwindcss/vite": "^4.2.2",
    "@types/node": "24.11.0",
    "convex": "^1.35.1",
    "nitro": "3.0.260415-beta",
    "oxfmt": "^0.45.0",
    "oxlint": "^1.60.0",
    "solid-js": "^1.9.12",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.8"
  },
  "engines": {
    "node": ">=24"
  }
}

```
