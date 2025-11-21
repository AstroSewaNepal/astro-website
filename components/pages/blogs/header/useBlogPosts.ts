import { useEffect, useMemo, useState } from 'react';

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

type GhostTag = {
  name?: string;
  slug?: string;
};

type GhostAuthor = {
  name?: string;
};

type GhostPost = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  feature_image?: string;
  published_at?: string;
  reading_time?: number;
  authors?: GhostAuthor[];
  tags?: GhostTag[];
};

const transformPost = (post: GhostPost): BlogPost => ({
  id: post.id ?? '',
  title: post.title ?? '',
  slug: post.slug ?? '',
  description: post.excerpt ?? '',
  image: post.feature_image ?? '',
  date: post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '',
  author: post.authors?.[0]?.name ?? 'Unknown Author',
  duration: post.reading_time ? `${post.reading_time} Min` : '1 Min',
  views: '0',
  feature: post.tags?.map((tag: GhostTag) => tag.name ?? '').filter(Boolean) ?? [],
  tagSlugs: post.tags?.map((tag: GhostTag) => tag.slug ?? '').filter(Boolean) ?? [],
  link: `/blogs/${post.slug ?? ''}`,
});

type UseBlogPostsReturn = {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  posts: BlogPost[];
  isLoading: boolean;
  displayedPosts: BlogPost[];
  hasMorePosts: boolean;
  handleShowMore: () => void;
};

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
          '/api/ghost/posts?include=tags,authors&fields=id,title,slug,excerpt,feature_image,published_at,reading_time&limit=all&order=published_at%20desc';
        if (activeCategory) {
          url += `&filter=tag:${activeCategory}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const fetchedPosts = Array.isArray(data.posts) ? data.posts : [];
        const transformedPosts = fetchedPosts.map(transformPost);
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
