import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ghostClient } from '@/lib/ghostClient';

type BrowseResult = { meta?: { pagination?: { total?: number } } };

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [posts, tags, authors] = await Promise.all([
      ghostClient.posts.browse({ limit: 1 }) as unknown as BrowseResult,
      ghostClient.tags.browse({ limit: 1 }) as unknown as BrowseResult,
      ghostClient.authors.browse({ limit: 1 }) as unknown as BrowseResult,
    ]);

    return NextResponse.json({
      posts: posts.meta?.pagination?.total ?? 0,
      tags: tags.meta?.pagination?.total ?? 0,
      authors: authors.meta?.pagination?.total ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 502 });
  }
}
