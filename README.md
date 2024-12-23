# Predicty-pie

## Usage

This is an app that keeps track of predictions that people make.

To use it, make a bluesky post with "@predictypie.bsky.social I predict " followed by your prediction.

Currently, this app only lists predictions that people make with the above pattern.

## Development

This app uses [Solid](https://docs.solidjs.com), and pnpm is the package manager.

To test locally, run `pnpm dev`. Things won't work unless you have a `.env` file with contents like the following:

```
BSKY_IDENTIFIER="predictypie.bsky.social"
BSKY_PASSWORD="REDACTED"
```
