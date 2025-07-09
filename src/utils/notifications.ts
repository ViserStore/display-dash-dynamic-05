
import toast, { Toaster } from 'react-hot-toast';

// Centralized notification utility using react-hot-toast
export const notify = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  },
  
  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | JSX.Element;
      error: string | JSX.Element;
    }
  ) => {
    return toast.promise(promise, messages);
  }
};

// Export the Toaster component for use in App.tsx
export { Toaster };

// Direct exports for convenience
export { toast };
