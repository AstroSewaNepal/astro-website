This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Ghost Content API Proxy

The `/api/ghost` Next.js route proxies the Ghost Content API using the official SDK. Set the following environment variables (see `.env.example` for defaults):

- `GHOST_CONTENT_API_URL` (falls back to `BLOG_API`)
- `GHOST_CONTENT_API_KEY` (falls back to `CONTENT_API_KEY`)
- `GHOST_CONTENT_API_VERSION` (defaults to `v5.0`)
- `LOG_LEVEL` controls logger verbosity (`debug`, `info`, `warn`, `error`)

Available endpoints mirror the included Postman collection:

- `GET /api/ghost/posts`, `/api/ghost/pages`, `/api/ghost/authors`, `/api/ghost/tags`
- `GET /api/ghost/{resource}/{id}`
- `GET /api/ghost/{resource}/slug/{slug}`

All collection endpoints accept Ghost query parameters such as `filter`, `include`, `formats`, `order`, `limit`, and `page`. Item endpoints accept `include`, `fields`, and `formats`. Responses include Ghost pagination metadata when provided.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
