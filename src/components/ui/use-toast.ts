
import { useToast as useInternalToast, toast as internalToast, type ToastParams } from "@/hooks/use-toast";
import { isString } from "lodash";

/**
 * Helper function to safely check if a ReactNode contains a specific substring
 */
const reactNodeContainsText = (node: React.ReactNode, text: string): boolean => {
  if (typeof node === 'string') {
    return node.toLowerCase().includes(text.toLowerCase());
  }
  return false;
};

// Re-export with extended functionality
export function useToast() {
  const internal = useInternalToast();
  
  return {
    ...internal,
    // Add any additional functions here
    toast: (props: ToastParams) => {
      // Check if it's a premium-related toast and user is premium
      try {
        if (
          (reactNodeContainsText(props.title, "free") || 
           reactNodeContainsText(props.description, "free limit") ||
           reactNodeContainsText(props.description, "upgrade to premium")) && 
          checkIfUserIsPremium()
        ) {
          console.log("Skipping premium-related toast for premium user");
          return null;
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
      }
      
      return internal.toast(props);
    },
    dismissAll: internal.dismissAll
  };
}

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

export const toast = (props: ToastParams) => {
  // Check if it's a premium-related toast and user is premium
  try {
    if (
      (reactNodeContainsText(props.title, "free") || 
       reactNodeContainsText(props.description, "free limit") ||
       reactNodeContainsText(props.description, "upgrade to premium")) && 
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
