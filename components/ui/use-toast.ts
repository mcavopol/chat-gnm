"use client"

import type * as React from "react"
import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

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

  const toast = useCallback(({ ...props }: Toast) => {
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
    }, TOAST_REMOVE_DELAY)

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
