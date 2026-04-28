import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ghostClient } from '@/lib/ghostClient';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await ghostClient.posts.browse({
      limit: 10,
      order: 'published_at desc',
      include: ['authors', 'tags'],
      fields: ['id', 'title', 'slug', 'published_at', 'reading_time', 'status'],
    });

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 502 });
  }
}
