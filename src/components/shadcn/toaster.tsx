'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/shadcn/toast';
import { useToast } from '@/components/shadcn/use-toast';
import { CheckCircleFill, XCircleFill } from 'react-bootstrap-icons';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className='grid gap-1'>
            {title && (
              <ToastTitle>
                {props.variant === 'destructive' ? (
                  <XCircleFill className='mb-[2px] mr-2 inline-block text-lg text-red-500' color='currentColor' />
                ) : (
                  <CheckCircleFill className='mb-[2px] mr-2 inline-block text-lg text-green-500' color='currentColor' />
                )}{' '}
                {title}
              </ToastTitle>
            )}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
