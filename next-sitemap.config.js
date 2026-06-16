const GhostContentAPI = require('@tryghost/content-api');

/** * We use process.env to grab the keys you just saved in Vercel.
 * This keeps your keys hidden from the public.
 */
const api = new GhostContentAPI({
  url: process.env.GHOST_CONTENT_API_URL || process.env.BLOG_API || 'https://blog.dev.astrosewa.com',
  key: process.env.GHOST_CONTENT_API_KEY || process.env.CONTENT_API_KEY,
  version: "v5.0"
});

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.astrosewa.com',
  generateRobotsTxt: true, 
  exclude: ['/_next/*', '/api/*'],
  
  // Fetching Ghost Blogs (Optimized & Secure)
  additionalPaths: async () => {
    // If the API Key is missing (e.g., local dev), skip this step to avoid errors
    if (!process.env.GHOST_CONTENT_API_KEY && !process.env.CONTENT_API_KEY) {
      console.warn("Sitemap: GHOST_CONTENT_API_KEY is missing. Skipping blog fetch.");
      return [];
    }

    try {
      const posts = await api.posts.browse({ 
        limit: 'all', 
        fields: 'slug,updated_at' 
      });
      
      return posts.map(post => ({
        loc: `/blogs/${post.slug}`, 
        priority: 0.7,
        lastmod: post.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Sitemap Ghost Fetch Error:", error);
      return []; 
    }
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_next/',    
          '/api/',      
          '/*?url=',    
        ],
      },
    ],
    additionalSitemaps: [
    ],
  },
}