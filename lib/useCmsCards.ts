'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CmsCardItem } from '@/types/cms';

// In-memory cache for all cards fetched from the PostgreSQL database
let clientCardsCache: CmsCardItem[] | null = null;
let activeFetchPromise: Promise<CmsCardItem[]> | null = null;
const cacheListeners = new Set<() => void>();

function emitCacheUpdate() {
  cacheListeners.forEach((fn) => fn());
}

/**
 * Fetch all cards once from the database API and store in memory
 */
export async function fetchCardsFromDatabase(forceRefresh?: boolean): Promise<CmsCardItem[]> {
  if (forceRefresh) {
    clientCardsCache = null;
  } else if (clientCardsCache) {
    return clientCardsCache;
  }
  if (activeFetchPromise) return activeFetchPromise;

  const timestamp = Date.now();
  activeFetchPromise = fetch(`/api/cards?all=true&_t=${timestamp}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
    .then(async (res) => {
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          clientCardsCache = json.data;
          emitCacheUpdate();
          return json.data;
        }
      }
      return [];
    })
    .catch((err) => {
      console.error('Failed to fetch cards from database:', err);
      return [];
    })
    .finally(() => {
      activeFetchPromise = null;
    });

  return activeFetchPromise;
}

/**
 * Invalidate the client cache and notify all listeners to refetch
 */
export function invalidateClientCardsCache() {
  clientCardsCache = null;
  emitCacheUpdate();
}

/**
 * Manually update the global client cache (e.g. from CMS admin)
 */
export function setClientCardsCache(cards: CmsCardItem[]) {
  clientCardsCache = cards;
  emitCacheUpdate();
}

/**
 * Hook to consume cards from the database with instant tab switching (no mockdata silhouette)
 */
export function useCmsCards(pillarId?: string, category?: string) {
  const [cachedCards, setCachedCards] = useState<CmsCardItem[] | null>(() => clientCardsCache);

  useEffect(() => {
    let isSubscribed = true;

    const handleUpdate = () => {
      if (isSubscribed) {
        setCachedCards(clientCardsCache);
        if (!clientCardsCache) {
          fetchCardsFromDatabase().then((data) => {
            if (isSubscribed) {
              setCachedCards(data);
            }
          });
        }
      }
    };

    cacheListeners.add(handleUpdate);

    if (!clientCardsCache) {
      fetchCardsFromDatabase().then((data) => {
        if (isSubscribed) {
          setCachedCards(data);
        }
      });
    }

    return () => {
      isSubscribed = false;
      cacheListeners.delete(handleUpdate);
    };
  }, []);

  const loading = cachedCards === null;

  // Filter cards synchronously from cached database records
  const cards = useMemo(() => {
    if (!cachedCards) return [];
    return cachedCards.filter((c) => {
      if (pillarId && c.pillarId !== pillarId) return false;
      if (category && category !== 'Semua' && category !== 'all' && c.category !== category) return false;
      return c.isActive;
    });
  }, [cachedCards, pillarId, category]);

  const refresh = useCallback(async () => {
    clientCardsCache = null;
    setCachedCards(null);
    await fetchCardsFromDatabase(true);
  }, []);

  return { cards, loading, refresh };
}
