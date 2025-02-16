# Predicty-pie

## Usage

See the live app at https://predictypie.netlify.app/

This is an app that keeps track of predictions that people make.

To use it, make a bluesky post with "@predictypie.bsky.social I predict " followed by your prediction.

Currently, this app only lists predictions that people make with the above pattern.

## Development

See [./plans](./plans.md) for the informal roadmap.

- [Solid](https://docs.solidjs.com) is used for UI
- pnpm is the package manager
- Netlify is used to publish the app on every push to the main branch

To test locally, run `pnpm dev`. Things won't work unless you have a `.env` file with contents like the following:

```
BSKY_IDENTIFIER="predictypie.bsky.social"
BSKY_PASSWORD="REDACTED"
```
