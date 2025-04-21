
// This file integrates shadcn's toast functionality
import * as React from "react"
import type { ToastActionElement, ToastProps as ToastUIProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

// Define interfaces to avoid circular references
export interface ToasterToast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Define toast parameters without circular references
export interface ToastParams {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
  duration?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
  REMOVE_ALL_TOASTS: "REMOVE_ALL_TOASTS", // New action to remove all toasts
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: Omit<ToasterToast, "id">
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast> & { id: string }
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_ALL_TOASTS"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// Clear all toast timeouts
const clearToastTimeouts = () => {
  toastTimeouts.forEach((timeout) => {
    clearTimeout(timeout)
  })
  toastTimeouts.clear()
}

// Check if a toast with the same title and description already exists
const hasToastDuplicate = (newToast: Omit<ToasterToast, "id">, toasts: ToasterToast[]): boolean => {
  return toasts.some(
    toast => 
      toast.title === newToast.title && 
      toast.description === newToast.description
  );
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      // Check for duplicates before adding
      if (hasToastDuplicate(action.toast, state.toasts)) {
        return state;
      }
      
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.toast, id: genId() },
        ].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id
            ? { ...t, ...action.toast }
            : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    case actionTypes.REMOVE_ALL_TOASTS:
      clearToastTimeouts();
      return {
        ...state,
        toasts: [],
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast(props: ToastParams) {
  // Check for duplicates before adding
  if (hasToastDuplicate(props, memoryState.toasts)) {
    return {
      id: "",
      dismiss: () => {},
      update: () => {},
    };
  }

  const id = genId()

  const update = (props: ToastParams) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

// Function to dismiss all toasts
function dismissAllToasts() {
  dispatch({ type: actionTypes.REMOVE_ALL_TOASTS })
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    dismissAll: () => dismissAllToasts(),
  }
}

export { useToast, toast }
