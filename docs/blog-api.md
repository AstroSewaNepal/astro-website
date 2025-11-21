# Ghost Blog API Proxy

This project exposes a typed proxy to the Ghost Content API under the Next.js App Router path `/api/ghost`. It mirrors the Postman collection bundled in the repository while keeping API keys server‑side.

## Authentication

All proxy routes authenticate with Ghost using `GHOST_CONTENT_API_KEY` (or `CONTENT_API_KEY` as a fallback). Clients calling the proxy do **not** need to send an API key.

## Environment

Configure the following variables (see `.env.example`):

- `GHOST_CONTENT_API_URL` (defaults to `BLOG_API`) – Ghost site base URL.
- `GHOST_CONTENT_API_KEY` (defaults to `CONTENT_API_KEY`) – Content API key.
- `GHOST_CONTENT_API_VERSION` – API version string passed to Ghost (`v6.0` by default).
- `LOG_LEVEL` – Logger verbosity (`debug`, `info`, `warn`, `error`; defaults to `info`).

Restart the dev server after changing environment values.

## Available Routes

| Route                                   | Description                     | Query Parameters                                                   |
| --------------------------------------- | ------------------------------- | ------------------------------------------------------------------ |
| `GET /api/ghost/posts`                  | Browse posts                    | `filter`, `include`, `formats`, `fields`, `order`, `limit`, `page` |
| `GET /api/ghost/pages`                  | Browse pages                    | Same as above                                                      |
| `GET /api/ghost/authors`                | Browse authors                  | Same as above                                                      |
| `GET /api/ghost/tags`                   | Browse tags                     | Same as above                                                      |
| `GET /api/ghost/{resource}/{id}`        | Fetch a single item by Ghost ID | `include`, `fields`, `formats`                                     |
| `GET /api/ghost/{resource}/slug/{slug}` | Fetch a single item by slug     | `include`, `fields`, `formats`                                     |

`{resource}` accepts `posts`, `pages`, `authors`, or `tags`.

### Pagination & Metadata

Collection responses forward Ghost's pagination metadata when available:

```json
{
  "posts": [{ "...": "..." }],
  "meta": {
    "pagination": {
      "page": 1,
      "pages": 3,
      "limit": 5,
      "total": 15,
      "next": 2,
      "prev": null
    }
  }
}
```

### Error Handling

- `404` when the resource type is unsupported or Ghost returns a `NotFoundError`.
- `502` when Ghost responds with an error (network, authentication, validation, etc.).

Body shape:

```json
{ "error": "Failed to fetch Ghost resource" }
```

Logs include the Ghost resource, query options, and error message at `LOG_LEVEL` severity.

## Local Testing

1. Set the environment variables in `.env`.
2. Run `npm run dev`.
3. Hit `http://localhost:3000/api/ghost/posts?limit=5&include=tags,authors` to verify connectivity.
