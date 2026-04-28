'use client';

import { useAdminPosts } from '@/hooks/use-admin-queries';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLUMNS = ['Title', 'Author', 'Tag', 'Published', 'Status'];

export default function RecentPostsTable() {
  const { data: posts, isLoading, isError, error } = useAdminPosts();

  return (
    <Card className="rounded-2xl shadow-sm border-neutral-100">
      <CardHeader className="px-6 pt-5 pb-3">
        <CardTitle className="text-base font-mukta font-semibold text-neutral-800">
          Recent Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-5">
        {isError && (
          <p className="text-sm font-mukta text-red-600 py-4">{(error as Error).message}</p>
        )}
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-100">
              {COLUMNS.map(col => (
                <TableHead
                  key={col}
                  className="font-mukta text-neutral-500 text-xs uppercase tracking-wide"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-neutral-100">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {posts?.map(post => (
              <TableRow key={post.id} className="border-neutral-100 hover:bg-neutral-50">
                <TableCell className="font-mukta text-neutral-800 max-w-[200px]">
                  <span className="block truncate" title={post.title}>
                    {post.title}
                  </span>
                </TableCell>
                <TableCell className="font-mukta text-neutral-600 text-sm whitespace-nowrap">
                  {post.primary_author?.name ?? '—'}
                </TableCell>
                <TableCell>
                  {post.primary_tag ? (
                    <Badge
                      variant="secondary"
                      className="font-mukta text-xs rounded-full bg-[#611508]/10 text-[#611508] border-0"
                    >
                      {post.primary_tag.name}
                    </Badge>
                  ) : (
                    <span className="text-neutral-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="font-mukta text-neutral-500 text-sm whitespace-nowrap">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Draft'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`font-mukta text-xs rounded-full border-0 ${
                      post.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {post.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && posts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center font-mukta text-neutral-400 py-8">
                  No posts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
