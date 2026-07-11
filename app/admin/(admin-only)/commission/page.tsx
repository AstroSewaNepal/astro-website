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
import { useCommission, useUpdateCommission } from '@/hooks/use-commission';

const schema = z.object({
  commissionPercentage: z.coerce
    .number()
    .min(0, 'Must be 0 or greater')
    .max(100, 'Must be 100 or less'),
});

type FormValues = z.infer<typeof schema>;

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommissionPage() {
  const { data, isPending } = useCommission();
  const updateMutation = useUpdateCommission();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { commissionPercentage: 0 },
  });

  useEffect(() => {
    if (data) {
      form.reset({ commissionPercentage: data.commissionPercentage });
    }
  }, [data, form]);

  function handleSubmit(values: FormValues) {
    updateMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Commission</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Set the platform-wide commission percentage deducted from astrologer earnings
        </p>
      </div>

      <Card className="rounded-2xl border-neutral-100 shadow-sm max-w-lg">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
            Platform Commission
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {isPending ? (
            <p className="font-mukta text-sm text-neutral-400">Loading…</p>
          ) : (
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

                {data && (
                  <p className="font-mukta text-xs text-neutral-400">
                    Last updated {formatDate(data.updatedAt)}
                    {data.updatedBy ? ` by ${data.updatedBy}` : ''}
                  </p>
                )}

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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
