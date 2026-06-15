import { useState, useEffect, useCallback } from 'react';

export interface UserParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  verification?: string;
  status?: string;
  sort?: string;
}

export function useUsers(initialParams: UserParams = {}) {
  const [params, setParams] = useState<UserParams>({ page: 1, limit: 10, ...initialParams });
  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const result = await res.json();
      setData(result.data);
      setMeta(result.meta);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/users/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const updateParams = (newParams: Partial<UserParams>) => {
    setParams(prev => ({ ...prev, page: 1, ...newParams }));
  };

  const setPage = (page: number) => {
    setParams(prev => ({ ...prev, page }));
  };

  const refresh = () => {
    fetchUsers();
    fetchAnalytics();
  };

  return { data, meta, analytics, isLoading, error, params, updateParams, setPage, refresh };
}
