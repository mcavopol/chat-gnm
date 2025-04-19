"use client"

import { Suspense } from "react"
import { ChatForm } from "@/components/chat-form"

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <ChatForm />
    </Suspense>
  )
}
