"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatForm } from "@/components/chat-form"
import { useAuth } from "@/context/auth-context"

function ChatPageContent() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return <ChatForm />
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}
