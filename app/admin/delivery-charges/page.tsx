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
import {
  useDeliveryCharges,
  useCreateDeliveryCharge,
  useUpdateDeliveryCharge,
} from '@/hooks/use-delivery-charge';

const schema = z.object({
  insideValley: z.coerce.number().min(0, 'Must be 0 or greater'),
  outsideValley: z.coerce.number().min(0, 'Must be 0 or greater'),
  outOfCountry: z.coerce.number().min(0, 'Must be 0 or greater'),
});

type FormValues = z.infer<typeof schema>;

export default function DeliveryChargesPage() {
  const { data, isPending } = useDeliveryCharges();
  const createMutation = useCreateDeliveryCharge();
  const updateMutation = useUpdateDeliveryCharge();

  const existing = data?.[0] ?? null;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess;
  const mutationError = createMutation.error ?? updateMutation.error;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      insideValley: 0,
      outsideValley: 0,
      outOfCountry: 0,
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        insideValley: existing.insideValley,
        outsideValley: existing.outsideValley,
        outOfCountry: existing.outOfCountry,
      });
    }
  }, [existing, form]);

  function handleSubmit(values: FormValues) {
    if (existing) {
      updateMutation.mutate({ id: existing._id, input: values });
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Delivery Charges</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Set zone-based delivery pricing applied to physical remedy orders
        </p>
      </div>

      <Card className="rounded-2xl border-neutral-100 shadow-sm max-w-lg">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
            {existing ? 'Edit Delivery Charges' : 'Configure Delivery Charges'}
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
                  name="insideValley"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mukta text-neutral-700">
                        Inside Valley (NPR)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step="1"
                          placeholder="e.g. 100"
                          className="font-mukta"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outsideValley"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mukta text-neutral-700">
                        Outside Valley (NPR)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step="1"
                          placeholder="e.g. 200"
                          className="font-mukta"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outOfCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mukta text-neutral-700">
                        Out of Country (NPR)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          step="1"
                          placeholder="e.g. 500"
                          className="font-mukta"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {mutationError && (
                  <p className="font-mukta text-sm text-red-600">{mutationError.message}</p>
                )}

                {isSuccess && (
                  <p className="font-mukta text-sm text-green-600">Saved successfully.</p>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="font-mukta text-white"
                    style={{ backgroundColor: '#611508' }}
                  >
                    {isSaving ? 'Saving…' : 'Save'}
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
