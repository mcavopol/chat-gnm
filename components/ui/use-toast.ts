"use client"

import type * as React from "react"
import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number // Add duration property
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 3000 // Reduced from 5000 to 3000 for faster disappearance

type ToasterToast = ToastProps & {
  open: boolean
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toasts: ToasterToast[] = []

type Toast = Omit<ToasterToast, "id">

export function useToast() {
  const [, setToastCount] = useState(0)

  useEffect(() => {
    return () => {
      toasts.splice(0, toasts.length)
    }
  }, [])

  const toast = useCallback(({ duration = TOAST_REMOVE_DELAY, ...props }: Toast) => {
    const id = genId()

    const newToast = {
      id,
      open: true,
      ...props,
    }

    toasts.push(newToast)
    setToastCount((count) => count + 1)

    setTimeout(() => {
      toasts.forEach((t) => {
        if (t.id === id) {
          t.open = false
          setToastCount((count) => count - 1)
        }
      })
    }, duration)

    return id
  }, [])

  return {
    toast,
    toasts: toasts.slice(0, TOAST_LIMIT),
    dismiss: (toastId?: string) => {
      if (toastId) {
        toasts.forEach((t) => {
          if (t.id === toastId) {
            t.open = false
            setToastCount((count) => count - 1)
          }
        })
      } else {
        toasts.forEach((t) => {
          t.open = false
        })
        setToastCount(0)
      }
    },
  }
}
