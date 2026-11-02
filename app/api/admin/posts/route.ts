import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/admin-access';
import { ghostClient } from '@/lib/ghostClient';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const posts = await ghostClient.posts.browse({
      limit: 10,
      order: 'published_at desc',
      include: ['authors', 'tags'],
      fields: ['id', 'title', 'slug', 'published_at', 'reading_time', 'status'],
    });

    // With `fields`, Ghost returns only `authors` / `tags` (no primary_*), and the Content API never sends
    // `status` because it only serves published posts.
    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        primary_author: post.authors?.[0] ?? null,
        primary_tag: post.tags?.[0] ?? null,
        status: 'published',
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 502 });
  }
}
