'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateTier, useUpdateTier } from '@/hooks/use-tiers';
import type { Tier } from '@/lib/tier-api';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Must be 50 characters or fewer'),
  commissionPercentage: z.coerce
    .number()
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less'),
});

type FormValues = z.infer<typeof schema>;

type TierFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When present, the dialog edits this tier; otherwise it creates a new one. */
  tier?: Tier | null;
};

export function TierFormDialog({ open, onOpenChange, tier }: TierFormDialogProps) {
  const isEdit = !!tier;
  const createMutation = useCreateTier();
  const updateMutation = useUpdateTier();
  const mutation = isEdit ? updateMutation : createMutation;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: tier?.name ?? '',
      commissionPercentage: tier?.commissionPercentage ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: tier?.name ?? '', commissionPercentage: tier?.commissionPercentage ?? 0 });
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens/target tier changes
  }, [open, tier]);

  function handleSubmit(values: FormValues) {
    if (isEdit && tier) {
      updateMutation.mutate(
        { tierId: tier._id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md font-mukta">
        <DialogHeader>
          <DialogTitle className="font-mukta text-base">
            {isEdit ? 'Edit Tier' : 'Add Tier'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mukta text-neutral-700">Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Top Rated" className="font-mukta" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commissionPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mukta text-neutral-700">
                    Commission Percentage (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      placeholder="e.g. 20"
                      className="font-mukta"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mutation.error && (
              <p className="font-mukta text-sm text-red-600">{mutation.error.message}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="font-mukta"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="font-mukta text-white"
                style={{ backgroundColor: '#611508' }}
              >
                {mutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
