'use client';

import { useDeferredValue, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Gem, Loader2 } from 'lucide-react';

import { useBackendClient } from '@/hooks/use-backend-client';
import { categoryPath, matchesCategory, type RemedyCategory } from '@/lib/remedies/catalogue';

import { GoToCartBar, RemediesHeader } from './remedy-bits';
import { SearchBox } from './search-box';

/**
 * The app's Remedies tab (ap src/screens/Remedies/index.tsx): the categories, searchable, each opening its
 * products. Open to guests, like Astro Connect; Orders and the cart show for clients.
 */
export function RemedyCategories() {
  const backend = useBackendClient();
  const [search, setSearch] = useState('');
  const query = useDeferredValue(search);
  const categories = useQuery({
    queryKey: ['remedies', 'categories'],
    queryFn: () => backend.get<RemedyCategory[]>('/remedies-categories'),
    staleTime: 10 * 60 * 1000,
  });
  const list = (Array.isArray(categories.data) ? categories.data : []).filter(c =>
    matchesCategory(c, query),
  );

  return (
    <div className="flex w-full flex-col">
      <RemediesHeader title="Remedies" orders />
      <SearchBox
        value={search}
        onChange={setSearch}
        label="Search remedies"
        placeholder="Search remedies..."
      />

      {categories.isPending ? (
        <div className="flex justify-center py-20" role="status" aria-label="Loading">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.isError ? (
        <div className="py-16 text-center text-[17px] text-[#4a1a1a]">
          <p>We could not load the remedies.</p>
          <button
            type="button"
            onClick={() => categories.refetch()}
            className="mt-2 text-primary underline"
          >
            Try again
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Gem className="h-14 w-14 text-primary/60" aria-hidden />
          <p className="text-[17px] text-[#4a1a1a]">No remedies found</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {list.map(category => (
            <li key={category._id}>
              <CategoryCard category={category} />
            </li>
          ))}
        </ul>
      )}

      <GoToCartBar />
    </div>
  );
}

/** Phone: the app's row card. Desktop: the same card, taller, with the arrow on hover. */
function CategoryCard({ category }: { category: RemedyCategory }) {
  const image = category.image?.url;
  return (
    <Link
      href={categoryPath(category._id)}
      className="group flex h-full items-center gap-3 rounded-2xl border border-[#BE7B71] bg-[#FFFAE6] p-3 shadow-[0_2px_4px_rgba(114,10,11,0.08)] transition-shadow hover:shadow-[0_6px_18px_rgba(114,10,11,0.14)] lg:gap-4 lg:p-4"
    >
      <span className="h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[#F1DBD7] lg:h-24 lg:w-24">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- backend media URLs
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-raleway text-[28px] font-bold text-primary">
            {category.title.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-raleway text-[18px] font-semibold text-[#1C1C1C]">
          {category.title}
        </span>
        {category.description ? (
          <span className="line-clamp-2 text-[14px] leading-5 text-[#79787A]">
            {category.description}
          </span>
        ) : null}
        <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-full border-[1.5px] border-primary px-3.5 py-1 text-[14px] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          View
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
