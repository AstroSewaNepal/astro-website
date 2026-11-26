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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  useFreeConsultationSettings,
  useUpdateFreeConsultationSettings,
} from '@/hooks/use-astrologers';
import { FREE_COOLDOWN_MONTHS_RANGE, FREE_MINUTES_RANGE } from '@/lib/free-consultation-admin-api';

const wholeNumber = (min: number, max: number) =>
  z.coerce
    .number()
    .int('Use a whole number')
    .min(min, `Must be ${min} or more`)
    .max(max, `Must be ${max} or less`);

const schema = z.object({
  minutes: wholeNumber(FREE_MINUTES_RANGE.min, FREE_MINUTES_RANGE.max),
  cooldownMonths: wholeNumber(FREE_COOLDOWN_MONTHS_RANGE.min, FREE_COOLDOWN_MONTHS_RANGE.max),
});

type FormValues = z.infer<typeof schema>;

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Free chat length and the wait before a client's next free chat. */
export function FreeChatSettingsCard() {
  const { data: settings, isPending, isError } = useFreeConsultationSettings();
  const updateMutation = useUpdateFreeConsultationSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { minutes: 5, cooldownMonths: 3 },
  });

  useEffect(() => {
    if (settings) {
      form.reset({ minutes: settings.minutes, cooldownMonths: settings.cooldownMonths });
    }
  }, [settings, form]);

  const savedAt = formatDate(settings?.updatedAt ?? null);

  return (
    <Card className="max-w-xl rounded-2xl border-neutral-100 shadow-sm">
      <CardHeader className="px-6 pb-3 pt-5">
        <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
          Free chat settings
        </CardTitle>
        <p className="font-mukta text-xs text-neutral-500">
          Every client gets one free chat with an astrologer switched on in Astrologers. It counts
          as used once the astrologer writes in it; the next one opens after the wait below.
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isPending ? (
          <p className="font-mukta text-sm text-neutral-400">Loading…</p>
        ) : isError ? (
          <p className="font-mukta text-sm text-red-500">
            Failed to load the settings. Please try again.
          </p>
        ) : (
          <Form {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(values => updateMutation.mutate(values))}
              className="space-y-4"
            >
              {settings && !settings.enabled && (
                <p className="rounded-md bg-amber-50 px-3 py-2 font-mukta text-xs text-amber-800">
                  Free chat is switched off on this server, so clients don&apos;t see it yet. The
                  settings below still save.
                </p>
              )}

              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mukta text-neutral-700">
                      Free chat length (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={FREE_MINUTES_RANGE.min}
                        max={FREE_MINUTES_RANGE.max}
                        step="1"
                        className="font-mukta"
                      />
                    </FormControl>
                    <FormDescription className="font-mukta text-xs">
                      {FREE_MINUTES_RANGE.min} to {FREE_MINUTES_RANGE.max}. Free chats start on the
                      quarter hour, so they fit in 15 minutes. Chats already booked keep their
                      length.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cooldownMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mukta text-neutral-700">
                      Months until the next free chat
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={FREE_COOLDOWN_MONTHS_RANGE.min}
                        max={FREE_COOLDOWN_MONTHS_RANGE.max}
                        step="1"
                        className="font-mukta"
                      />
                    </FormControl>
                    <FormDescription className="font-mukta text-xs">
                      {FREE_COOLDOWN_MONTHS_RANGE.min} to {FREE_COOLDOWN_MONTHS_RANGE.max}. Counted
                      from the used free chat. Clients already waiting keep their date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="font-mukta text-xs text-neutral-400">
                {savedAt
                  ? `Last saved ${savedAt}`
                  : 'Not saved yet: the default values are in use.'}
              </p>

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
  );
}
