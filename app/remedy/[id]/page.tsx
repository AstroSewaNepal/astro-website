import type { Metadata } from 'next';

import { RemedyDetail } from '@/components/remedies/remedy-detail';
import { coverImage, type Remedy } from '@/lib/remedies/catalogue';
import { descriptionText } from '@/lib/remedies/description';
import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

type Props = { params: Promise<{ id: string }> };

/**
 * A product of the remedies shop (doc 11), and the link the app shares (`/remedy/:id`). It used to hand the link to
 * the app; Android opens the app itself through its verified app links, so a browser that lands here shows the product.
 */
async function loadRemedy(id: string): Promise<Remedy | null> {
  const api = tryGetPublicBackendBaseUrl();
  if (!api || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  try {
    const res = await fetch(`${api}/astrologers/remedies/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Remedy | null };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const remedy = await loadRemedy(id);
  if (!remedy || remedy.isActive === false) return { title: 'Remedy', robots: { index: false } };
  const description = descriptionText(remedy.description) || remedy.subtitle || undefined;
  const image = coverImage(remedy.media);
  return {
    title: remedy.name,
    description,
    alternates: { canonical: `/remedy/${id}` },
    openGraph: { title: remedy.name, description, images: image ? [image] : undefined },
  };
}

export default async function RemedyPage({ params }: Props) {
  const { id } = await params;
  return <RemedyDetail remedyId={id} />;
}
