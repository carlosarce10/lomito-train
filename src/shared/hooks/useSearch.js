import { useMemo } from 'react';

export default function useSearch(items, searchTerm, getSearchableText) {
  return useMemo(() => {
    if (!searchTerm?.trim()) return items;
    const lower = searchTerm.toLowerCase().trim();
    return items.filter((item) => getSearchableText(item).toLowerCase().includes(lower));
  }, [items, searchTerm, getSearchableText]);
}
