# SloaneX Static Site

This repository contains the static SloaneX site and Vercel serverless functions.

## Environment variables (Vercel)

Set these in Vercel to enable admin authentication and support email sending:

- `ADMIN_CODE` (set to `420600`) or `ADMIN_CODE_HASH` (sha256 hash of the code).
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (optional)
- `SUPPORT_TO` (optional, defaults to `insanitybjones@gmail.com`)
