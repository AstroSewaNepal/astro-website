const GhostContentAPI = require('@tryghost/content-api');
const isProduction =
  process.env.VERCEL_ENV === 'production' ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

// Initialize the Ghost API
const api = new GhostContentAPI({
  url: 'https://blog.dev.astrosewa.com',
  key: 'dc7f97acd361ee022f82df3f58',
  version: "v5.0"
});

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.astrosewa.com',
  generateRobotsTxt: true,
  exclude: ['/_next/*', '/api/*'],

  // This function fetches your Ghost blogs during the build
  additionalPaths: async config => {
    let allPosts = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const response = await api.posts.browse({
        limit: 15, // Fetch in smaller chunks
        page: page,
        fields: 'slug,updated_at',
      });

      allPosts.push(...response);

      // Check if there are more pages
      if (response.meta.pagination.next) {
        page++;
      } else {
        hasNextPage = false;
      }
    }
    return allPosts.map(post => ({ loc: `/blogs/${post.slug}`, priority: 0.7 }));
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: isProduction ? '/' : undefined,
        disallow: isProduction ? ['/_next/', '/api/', '/*?url='] : ['/'],
      },
    ],
    additionalSitemaps: ['https://www.astrosewa.com/sitemap.xml'],
  },
};