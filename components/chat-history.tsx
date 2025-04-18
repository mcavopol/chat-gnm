"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { type Chat, deleteChat, getChats } from "@/lib/chat-store"
import { useRouter } from "next/navigation"

interface ChatHistoryProps {
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
}

export function ChatHistory({ isOpen, onClose, isMobile = false, currentChatId, onSelectChat }: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadChats = async () => {
    setIsLoading(true)
    try {
      const chatHistory = await getChats()
      setChats(chatHistory)
    } catch (error) {
      console.error("Failed to load chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadChats()
    }
  }, [isOpen])

  // Close the history pane when clicking escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Add body lock when history is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobile, isOpen])

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteChat(chatId)
      setChats(chats.filter((chat) => chat.id !== chatId))

      // If the deleted chat is the current one, redirect to /chat
      if (chatId === currentChatId) {
        router.push("/chat")
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const chatDate = new Date(date)

    // If it's today
    if (chatDate.toDateString() === now.toDateString()) {
      return chatDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    // If it's yesterday
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (chatDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // If it's within the last 7 days
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(now.getDate() - 7)
    if (chatDate > oneWeekAgo) {
      return chatDate.toLocaleDateString([], { weekday: "long" })
    }

    // Otherwise show the date
    return chatDate.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} aria-hidden="true" />}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          isMobile ? "w-full sm:w-80" : "w-80",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex items-center gap-1.5 h-10", isMobile && "px-2.5 py-2")}
            onClick={onClose}
            aria-label="Close chat history"
          >
            <X size={isMobile ? 18 : 16} />
            {!isMobile && <span>Close</span>}
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading chats...</div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors relative group",
                  currentChatId === chat.id && "bg-gray-100",
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm truncate pr-6">{chat.title}</h3>
                  <span className="text-xs text-gray-500">{formatDate(chat.updatedAt)}</span>
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1].content.slice(0, 50) +
                      (chat.messages[chat.messages.length - 1].content.length > 50 ? "..." : "")
                    : "No messages yet"}
                </p>
                <button
                  className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  aria-label="Delete chat"
                >
                  <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No chat history found</div>
          )}
        </div>
      </div>
    </>
  )
}
