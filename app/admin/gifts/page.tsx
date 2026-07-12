'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGifts } from '@/hooks/use-gifts';
import GiftsTable from '@/components/admin/gifts/gifts-table';
import CreateEditDialog from '@/components/admin/gifts/create-edit-dialog';
import DeleteDialog from '@/components/admin/gifts/delete-dialog';
import type { Gift } from '@/lib/gifts-api';

export default function GiftsPage() {
  const { data, isLoading, isError, error } = useGifts();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Gift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Gift | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Gifts</h1>
          <p className="mt-0.5 font-mukta text-sm text-neutral-500">
            Manage gifts users can send to astrologers
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 font-mukta text-white"
          style={{ backgroundColor: '#611508' }}
        >
          <Plus className="h-4 w-4" />
          New Gift
        </Button>
      </div>

      {isError && <p className="font-mukta text-sm text-red-600">{(error as Error).message}</p>}

      <Card className="rounded-2xl border-neutral-100 shadow-sm">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
            All Gifts
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <GiftsTable
            data={data ?? []}
            isLoading={isLoading}
            onEdit={row => setEditTarget(row)}
            onDelete={row => setDeleteTarget(row)}
          />
        </CardContent>
      </Card>

      <CreateEditDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <CreateEditDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        gift={editTarget ?? undefined}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        gift={deleteTarget}
      />
    </div>
  );
}
