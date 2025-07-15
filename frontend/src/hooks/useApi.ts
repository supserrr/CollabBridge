import { useState, useEffect } from 'react';
import { ApiResponse } from '@/types';

export const useApi = <T>(
  apiFunction: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

export const useAsyncAction = <T, P = any>(
  action: (params: P) => Promise<ApiResponse<T>>
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await action(params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Action failed');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
