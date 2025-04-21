
import { useToast as useInternalToast, toast as internalToast, type ToastParams } from "@/hooks/use-toast";

// Re-export with extended functionality
export function useToast() {
  const internal = useInternalToast();
  
  return {
    ...internal,
    // Add any additional functions here
  };
}

export const toast = internalToast;
export type { ToastParams };
