'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useUpdateTierTagCommission } from '@/hooks/use-tier-tags';
import { formatTierName } from '@/lib/tier-tag-utils';
import type { TierTag } from '@/lib/tier-tags-api';

const schema = z.object({
  commissionPercentage: z.coerce
    .number()
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less'),
});

type FormValues = z.infer<typeof schema>;

type TierCommissionCardProps = {
  tag: TierTag;
};

export function TierCommissionCard({ tag }: TierCommissionCardProps) {
  const updateMutation = useUpdateTierTagCommission();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { commissionPercentage: tag.commissionPercentage ?? 0 },
  });

  useEffect(() => {
    if (typeof tag.commissionPercentage === 'number') {
      form.reset({ commissionPercentage: tag.commissionPercentage });
    }
  }, [tag.commissionPercentage, form]);

  function handleSubmit(values: FormValues) {
    updateMutation.mutate({ tagId: tag._id, input: values });
  }

  return (
    <Card className="rounded-2xl border-neutral-100 shadow-sm">
      <CardHeader className="px-6 pb-3 pt-5">
        <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
          {formatTierName(tag.name)}
        </CardTitle>
        <p className="font-mukta text-xs text-neutral-500">
          {tag.commissionPercentage === null
            ? 'No rate set — astrologers with this tier use the global consultation rate'
            : 'Overrides the global consultation rate for astrologers with this tier'}
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            {updateMutation.error && (
              <p className="font-mukta text-sm text-red-600">{updateMutation.error.message}</p>
            )}

            {updateMutation.isSuccess && (
              <p className="font-mukta text-sm text-green-600">Saved successfully.</p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="font-mukta text-white"
                style={{ backgroundColor: '#611508' }}
              >
                {updateMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
