"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Chat, deleteChat, getChats } from "@/lib/chat-store"
import { useRouter } from "next/navigation"

interface HistoryContentProps {
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
}

export function HistoryContent({ currentChatId, onSelectChat }: HistoryContentProps) {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const [deletedCurrentChat, setDeletedCurrentChat] = useState(false)

  // Effect to handle redirection when current chat is deleted
  useEffect(() => {
    if (deletedCurrentChat) {
      router.push("/chat")
      // Reset the flag after redirection
      setDeletedCurrentChat(false)
    }
  }, [deletedCurrentChat, router])

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
    loadChats()
  }, [])

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteChat(chatId)
      setChats(chats.filter((chat) => chat.id !== chatId))

      // If the deleted chat is the current one, set the flag to trigger redirection
      if (chatId === currentChatId) {
        setDeletedCurrentChat(true)
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
    <div>
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">Loading chats...</div>
      ) : chats.length > 0 ? (
        <div>
          {chats.map((chat) => (
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
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No chat history found</div>
      )}
    </div>
  )
}
