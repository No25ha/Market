'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSubCategoriesByCategoryId } from '@/services/subCategories';
import { SubCategory } from '@/types';

type Props = {
  categoryId: string;
  baseHref: string;
};

export default function SubCategoryTabs({ categoryId, baseHref }: Props) {
  const searchParams = useSearchParams();
  const activeSub = searchParams.get('sub');

  const [subs, setSubs] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getSubCategoriesByCategoryId(categoryId);
      setSubs(data);
      setLoading(false);
    };
    if (categoryId) load();
  }, [categoryId]);

  const allHref = useMemo(() => baseHref, [baseHref]);

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-full bg-gray-200 animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!subs.length) return null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[64px] z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto">
        {/* All */}
        <Link
          href={`${baseHref}?categoryId=${categoryId}`}
          className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 border
            ${!activeSub ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          All
        </Link>

        {subs.map((s) => {
          const isActive = activeSub === s._id;
          return (
            <Link
              key={s._id}
              href={`${baseHref}?sub=${s._id}`}
              className={`px-4 py-2 rounded-full text-sm font-medium shrink-0 border
                ${isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {s.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
