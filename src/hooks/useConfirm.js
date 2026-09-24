/* useConfirm - renders Modal, returns fire() to trigger confirm
 * Usage:
 *   const { confirmNode, fire } = useConfirm({ title: 'Delete product?' });
 *   const ok = await fire(); // boolean
 *   return <>{confirmNode}</>;
 */
'use client';

import { useCallback, useRef, useState } from 'react';
import Modal from '@/components/common/Modal';
import { AlertTriangle } from 'lucide-react';

export default function useConfirm({
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger', // danger | warning | brand
  confirmClass = null,
} = {}) {
  const [open, setOpen] = useState(false);
  const resolver = useRef(null);

  const fire = useCallback(() => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpen(true);
    });
  }, []);

  const done = (value) => {
    setOpen(false);
    const r = resolver.current;
    resolver.current = null;
    r?.(value);
  };

  const toneBtn =
    confirmClass ||
    {
      danger: 'bg-rose-600 hover:bg-rose-700 text-white',
      warning: 'bg-amber-600 hover:bg-amber-700 text-white',
      brand: 'bg-blue-600 hover:bg-blue-700 text-white',
    }[tone];

  const iconTone = {
    danger: 'text-rose-600',
    warning: 'text-amber-600',
    brand: 'text-blue-600',
  }[tone];

  const confirmNode = (
    <Modal isOpen={open} onClose={() => done(false)} size="sm">
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-full ${tone === 'danger' ? 'bg-rose-50' : tone === 'warning' ? 'bg-amber-50' : 'bg-blue-50'} grid place-items-center shrink-0`}>
          <AlertTriangle className={`h-5 w-5 ${iconTone}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => done(false)}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => done(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${toneBtn}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );

  return { confirmNode, fire };
}
