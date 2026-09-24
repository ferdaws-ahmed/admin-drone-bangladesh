/* useAdminFetch - DRY hook for every admin API call
 * Handles: loading state, success/error toasts, onSuccess/onError callbacks
 * Usage:
 *   const { loading, fire, data } = useAdminFetch({
 *     fn: adminApi.admin.products.create,
 *     successMessage: 'Product created',
 *     onSuccess: refreshList,
 *   });
 *   await fire(payload, opts);
 */
'use client';

import { useCallback, useRef, useState } from 'react';
import { useToast } from '@/components/common/ToastProvider';

export default function useAdminFetch({
  fn,
  successMessage = null,
  errorMessage = null,
  onSuccess = null,
  onError = null,
  suppressErrorToast = false,
} = {}) {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const reqId = useRef(0);

  const fire = useCallback(
    async (...args) => {
      const thisReq = ++reqId.current;
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        if (thisReq !== reqId.current) return; // stale abort

        if (!result?.success) {
          const msg = result?.message || errorMessage || 'Request failed.';
          if (!suppressErrorToast) push(msg, 'error');
          setError(msg);
          onError?.(result);
          return result;
        }

        setData(result.data ?? null);
        if (successMessage) push(successMessage, 'success');
        onSuccess?.(result.data ?? null, result);
        return result;
      } catch (unexpected) {
        if (thisReq !== reqId.current) return;
        const msg = errorMessage || unexpected?.message || 'Unexpected error.';
        if (!suppressErrorToast) push(msg, 'error');
        setError(msg);
        onError?.(unexpected);
        return { success: false, message: msg, error: unexpected };
      } finally {
        if (thisReq === reqId.current) setLoading(false);
      }
    },
    [fn, successMessage, errorMessage, suppressErrorToast, onSuccess, onError, push]
  );

  return { loading, fire, data, error };
}
