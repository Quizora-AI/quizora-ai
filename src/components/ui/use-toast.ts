
import { useToast as useInternalToast, toast as internalToast, type ToastParams } from "@/hooks/use-toast";

/**
 * Helper function to safely check if a ReactNode contains a specific substring
 */
const reactNodeContainsText = (node: React.ReactNode, text: string): boolean => {
  if (node === null || node === undefined) {
    return false;
  }
  
  if (typeof node === 'string') {
    return node.toLowerCase().includes(text.toLowerCase());
  }
  
  if (typeof node === 'number') {
    return node.toString().includes(text);
  }
  
  return false;
};

// Helper function to check if user has premium status
function checkIfUserIsPremium(): boolean {
  try {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      return settings.isPremium === true;
    }
  } catch (error) {
    console.error("Error checking premium status:", error);
  }
  return false;
}

// Re-export with extended functionality
export function useToast() {
  const internal = useInternalToast();
  
  if (!internal) {
    console.warn("Toast context not available");
    // Return a stub implementation if toast is not available
    return {
      toast: () => null,
      toasts: [],
      dismiss: () => {},
      dismissAll: () => {}
    };
  }
  
  return {
    ...internal,
    // Add any additional functions here
    toast: (props: ToastParams) => {
      // Check if it's a premium-related toast and user is premium
      try {
        if (
          (props.title && reactNodeContainsText(props.title, "free") || 
           props.description && reactNodeContainsText(props.description, "free limit") ||
           props.description && reactNodeContainsText(props.description, "upgrade to premium")) && 
          checkIfUserIsPremium()
        ) {
          console.log("Skipping premium-related toast for premium user");
          return null;
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
      
      return internal.toast(props);
    }
  };
}

export const toast = (props: ToastParams) => {
  // Check if it's a premium-related toast and user is premium
  try {
    if (
      (props.title && reactNodeContainsText(props.title, "free") || 
       props.description && reactNodeContainsText(props.description, "free limit") ||
       props.description && reactNodeContainsText(props.description, "upgrade to premium")) && 
      checkIfUserIsPremium()
    ) {
      console.log("Skipping premium-related toast for premium user");
      return null;
    }
  } catch (error) {
    console.error("Error checking premium status:", error);
  }
  
  return internalToast(props);
};

export type { ToastParams };
