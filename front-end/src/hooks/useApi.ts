import { useState, useCallback } from 'react';
import { ApiError } from '../services/api';
import { toast } from 'sonner';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | void>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: {
    showSuccessToast?: boolean;
    successMessage?: string;
    showErrorToast?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, isLoading: false }));

        if (options.showSuccessToast) {
          toast.success(options.successMessage || 'Operation completed successfully');
        }

        options.onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof ApiError 
          ? error.message 
          : 'An unexpected error occurred';

        setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));

        if (options.showErrorToast !== false) {
          toast.error(errorMessage);
        }

        options.onError?.(errorMessage);
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hook for list operations
export function useApiList<T>(
  apiFunction: () => Promise<T[]>,
  autoLoad = true
) {
  const api = useApi(apiFunction);

  useState(() => {
    if (autoLoad) {
      api.execute();
    }
  });

  return {
    ...api,
    data: api.data || [],
    refresh: api.execute,
  };
}
