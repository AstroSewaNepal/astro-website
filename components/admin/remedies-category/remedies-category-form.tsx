'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { RemediesCategory } from '@/lib/remedies-category-api';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageId: z.string().min(1, 'Image is required'),
});

export type RemediesCategoryFormValues = z.infer<typeof schema>;

type UploadStatus = 'idle' | 'uploading' | 'deleting' | 'success' | 'error';

interface RemediesCategoryFormProps {
  defaultValues?: Partial<RemediesCategory>;
  onSubmit: (values: RemediesCategoryFormValues) => void;
  onUploadImage: (file: File) => Promise<{ mediaId: string; url: string }>;
  onDeleteImage: (mediaId: string) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function RemediesCategoryForm({
  defaultValues,
  onSubmit,
  onUploadImage,
  onDeleteImage,
  isSubmitting,
  onCancel,
}: RemediesCategoryFormProps) {
  const form = useForm<RemediesCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      imageId: defaultValues?.image?.mediaId ?? '',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(
    defaultValues?.image?.mediaId ? 'success' : 'idle',
  );
  const [previewUrl, setPreviewUrl] = useState(defaultValues?.image?.url ?? '');
  const [uploadError, setUploadError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const existingMediaId = form.getValues('imageId');
    if (existingMediaId) {
      try {
        await onDeleteImage(existingMediaId);
      } catch {
        // best-effort delete before replacing
      }
    }

    setUploadStatus('uploading');
    setUploadError('');
    form.setValue('imageId', '');
    setPreviewUrl('');

    try {
      const { mediaId, url } = await onUploadImage(file);
      form.setValue('imageId', mediaId);
      setPreviewUrl(url);
      setUploadStatus('success');
    } catch (err) {
      setUploadStatus('error');
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDeleteImage() {
    const mediaId = form.getValues('imageId');
    if (mediaId) {
      setUploadStatus('deleting');
      try {
        await onDeleteImage(mediaId);
      } catch {
        setUploadStatus('success');
        setUploadError('Failed to remove image. Try again.');
        return;
      }
    }
    form.setValue('imageId', '');
    setPreviewUrl('');
    setUploadStatus('idle');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const isBusy = uploadStatus === 'uploading' || uploadStatus === 'deleting';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Gemstones" className="font-mukta" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  placeholder="e.g. Remedies related to gemstones and crystals."
                  rows={3}
                  className="font-mukta w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:opacity-50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageId"
          render={() => (
            <FormItem>
              <FormLabel className="font-mukta text-neutral-700">Image</FormLabel>
              <FormControl>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {(uploadStatus === 'idle' || uploadStatus === 'error') && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full rounded-md border-2 border-dashed px-4 py-6 text-center text-sm font-mukta transition-colors ${
                        uploadStatus === 'error'
                          ? 'border-red-200 hover:border-red-400'
                          : 'border-neutral-200 hover:border-neutral-400'
                      } text-neutral-400`}
                    >
                      Click to upload image
                    </button>
                  )}

                  {uploadStatus === 'uploading' && (
                    <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-3 text-sm font-mukta text-neutral-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
                      Uploading…
                    </div>
                  )}

                  {uploadStatus === 'deleting' && (
                    <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-3 text-sm font-mukta text-neutral-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700" />
                      Removing image…
                    </div>
                  )}

                  {uploadStatus === 'success' && previewUrl && (
                    <div className="relative w-full rounded-md border border-neutral-200 overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="Category image"
                        width={400}
                        height={160}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-neutral-600 shadow hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              {uploadStatus === 'error' && (
                <p className="text-sm font-mukta text-red-500">{uploadError}</p>
              )}
              {uploadError && uploadStatus === 'success' && (
                <p className="text-sm font-mukta text-red-500">{uploadError}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isBusy}
            className="font-mukta"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isBusy}
            className="font-mukta text-white"
            style={{ backgroundColor: '#611508' }}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
