export interface BlogPostData {
  slug: string;
  id: string;
  uuid: string;
  title: string;
  html: string;
  comment_id: string;
  feature_image: string;
  featured: boolean;
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  custom_excerpt: string;
  codeinjection_head?: string | null;
  codeinjection_foot?: string | null;
  custom_template?: string | null;
  canonical_url: string;
  authors: Author[];
  tags: Tag[];
  primary_author: PrimaryAuthor;
  primary_tag: PrimaryTag;
  url: string;
  excerpt: string;
  reading_time: number;
  access: boolean;
  comments: boolean;
  og_image: string;
  og_title: string;
  og_description: string;
  twitter_image: string;
  twitter_title: string;
  twitter_description: string;
  meta_title: string;
  meta_description: string;
  email_subject?: string | null;
  frontmatter?: string | null;
  feature_image_alt?: string | null;
  feature_image_caption?: string | null;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  profile_image?: string | null;
  cover_image?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  threads?: string | null;
  bluesky?: string | null;
  mastodon?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  url: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  feature_image?: string | null;
  visibility: string;
  og_image?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  twitter_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  codeinjection_head?: string | null;
  codeinjection_foot?: string | null;
  canonical_url?: string | null;
  accent_color?: string | null;
  url: string;
}

export interface PrimaryAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image?: string | null;
  cover_image?: string | null;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  threads?: string | null;
  bluesky?: string | null;
  mastodon?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  url: string;
}

export interface PrimaryTag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  feature_image?: string | null;
  visibility: string;
  og_image?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  twitter_image?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  codeinjection_head?: string | null;
  codeinjection_foot?: string | null;
  canonical_url?: string | null;
  accent_color?: string | null;
  url: string;
}
