'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SiteData } from '@/types/siteData';

const defaultData: SiteData = {
  slides: [], categories: [], products: [], testimonials: [], faqs: [],
  instagramImages: [], settings: {}, pageContents: [], footerServiceItems: [],
};

export function useSiteData() {
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/site');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Use default data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, refetch: fetchData };
}
