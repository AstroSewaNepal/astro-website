import { useEffect, useMemo, useState } from 'react';

import { fetchBlogViewCounts } from '@/lib/blog-view-api';
import { mapGhostBlogPost, type GhostBlogPost } from '@/lib/map-ghost-blog-post';

const POSTS_PER_PAGE = 9;

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  date: string;
  author: string;
  duration: string;
  views: string;
  feature: string[];
  link: string;
  tagSlugs?: string[];
};

type UseBlogPostsReturn = {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  posts: BlogPost[];
  isLoading: boolean;
  displayedPosts: BlogPost[];
  hasMorePosts: boolean;
  handleShowMore: () => void;
};

async function mapPostsWithViews(posts: GhostBlogPost[]): Promise<BlogPost[]> {
  const viewCounts = await fetchBlogViewCounts(posts.map(post => post.slug ?? '').filter(Boolean));
  return posts.map(post => mapGhostBlogPost(post, viewCounts));
}

export const useBlogPosts = (initialPosts: BlogPost[]): UseBlogPostsReturn => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visiblePostsCount, setVisiblePostsCount] = useState<number>(POSTS_PER_PAGE);

  useEffect(() => {
    const fetchPostsByCategory = async () => {
      setIsLoading(true);
      try {
        let url =
          '/api/ghost/posts?include=tags,authors&fields=id,title,slug,excerpt,html,feature_image,published_at,reading_time&limit=all&order=published_at%20desc';
        if (activeCategory) {
          url += `&filter=tag:${activeCategory}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const fetchedPosts = Array.isArray(data.posts) ? (data.posts as GhostBlogPost[]) : [];
        const transformedPosts = await mapPostsWithViews(fetchedPosts);
        setPosts(transformedPosts);
        setVisiblePostsCount(POSTS_PER_PAGE);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts(initialPosts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostsByCategory();
  }, [activeCategory, initialPosts]);

  const displayedPosts = useMemo(() => {
    return posts.slice(0, visiblePostsCount);
  }, [posts, visiblePostsCount]);

  const hasMorePosts = visiblePostsCount < posts.length;

  const handleShowMore = () => {
    setVisiblePostsCount(prev => prev + POSTS_PER_PAGE);
  };

  return {
    activeCategory,
    setActiveCategory,
    posts,
    isLoading,
    displayedPosts,
    hasMorePosts,
    handleShowMore,
  };
};
