// src/context/DataCacheContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import authApiClient from '../services/auth-api-client';
import { isAuthenticated } from '../utils/auth';

const DataCacheContext = createContext();

export function DataCacheProvider({ children }) {
  const [cache, setCache] = useState(new Map());
  const [loading, setLoading] = useState(new Set());

  const getCacheKey = (key, deps = []) => `${key}_${JSON.stringify(deps)}`;

  const fetchWithCache = useCallback(async (key, fetchFunction, dependencies = [], forceRefresh = false) => {
    const cacheKey = getCacheKey(key, dependencies);
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // Prevent duplicate requests
    if (loading.has(cacheKey)) {
      // Wait for ongoing request to complete
      return new Promise((resolve) => {
        const checkCache = () => {
          if (cache.has(cacheKey)) {
            resolve(cache.get(cacheKey));
          } else {
            setTimeout(checkCache, 50);
          }
        };
        checkCache();
      });
    }

    setLoading(prev => new Set([...prev, cacheKey]));
    
    try {
      const data = await fetchFunction();
      setCache(prev => new Map([...prev, [cacheKey, data]]));
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      throw error;
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(cacheKey);
        return newSet;
      });
    }
  }, [cache, loading]);

  const fetchHomeData = useCallback(async (user) => {
    const results = {};

    try {
      // Fetch users data (only if authenticated)
      if (isAuthenticated()) {
        const allUsers = await fetchWithCache('users', async () => {
          const res = await authApiClient.get('/users/');
          return res.data.results || res.data;
        });
        
        results.admins = allUsers.filter(user => user.is_staff === true);
        results.users = allUsers.filter(user => user.is_staff === false);
      } else {
        results.admins = [];
        results.users = [];
      }

      // Fetch public data (cached globally)
      results.categories = await fetchWithCache('categories', async () => {
        const res = await authApiClient.get('/categories/');
        return res.data.results;
      });

      results.freeBlogs = await fetchWithCache('freeBlogs', async () => {
        const res = await authApiClient.get('/posts/free-blogs/');
        return res.data;
      });

      results.trendingBlogs = await fetchWithCache('trendingBlogs', async () => {
        const res = await authApiClient.get('/posts/');
        return res.data.results;
      });

      // Fetch premium blogs (depends on user subscription status)
      if (user && (user.is_subscribed || user.is_staff)) {
        results.premiumBlogs = await fetchWithCache(
          'premiumBlogs', 
          async () => {
            const res = await authApiClient.get('/posts/premium-blogs/');
            return res.data;
          },
          [user.is_subscribed, user.is_staff] // Dependencies
        );
      } else {
        results.premiumBlogs = [];
      }

      return results;
    } catch (error) {
      console.error('Error in fetchHomeData:', error);
      throw error;
    }
  }, [fetchWithCache]);

  const clearCache = useCallback((keys = null) => {
    if (keys) {
      setCache(prev => {
        const newCache = new Map(prev);
        keys.forEach(key => {
          // Remove all cache entries that start with this key
          for (const cacheKey of newCache.keys()) {
            if (cacheKey.startsWith(key)) {
              newCache.delete(cacheKey);
            }
          }
        });
        return newCache;
      });
    } else {
      setCache(new Map());
    }
  }, []);

  const refreshData = useCallback((key, dependencies = []) => {
    const cacheKey = getCacheKey(key, dependencies);
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(cacheKey);
      return newCache;
    });
  }, []);

  const value = {
    fetchHomeData,
    fetchWithCache,
    clearCache,
    refreshData,
    isLoading: (key, deps = []) => loading.has(getCacheKey(key, deps)),
    isCached: (key, deps = []) => cache.has(getCacheKey(key, deps)),
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
}