"use server"

import { nanoid } from "nanoid"
import { processUserMessage as processMemories } from "./memory-store"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// In a real app, this would be stored in a database
let chats: Chat[] = []

export async function getChats(): Promise<Chat[]> {
  return [...chats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export async function getChat(id: string): Promise<Chat | undefined> {
  return chats.find((chat) => chat.id === id)
}

export async function chatExists(id: string): Promise<boolean> {
  return chats.some((chat) => chat.id === id)
}

export async function createChat(): Promise<Chat> {
  const newChat: Chat = {
    id: nanoid(),
    title: "New Chat",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  chats.push(newChat)
  return newChat
}

export async function addMessageToChat(chatId: string, message: Omit<ChatMessage, "id">): Promise<ChatMessage | null> {
  const chat = chats.find((c) => c.id === chatId)

  if (!chat) {
    console.error(`Chat with ID ${chatId} not found`)
    return null
  }

  const newMessage: ChatMessage = {
    id: nanoid(),
    ...message,
  }

  chat.messages.push(newMessage)
  chat.updatedAt = new Date()

  // Update chat title based on first user message if it's still the default
  if (chat.title === "New Chat" && message.role === "user" && chat.messages.length <= 2) {
    chat.title = message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
  }

  return newMessage
}

export async function deleteChat(id: string): Promise<void> {
  chats = chats.filter((chat) => chat.id !== id)
}

export async function clearAllChats(): Promise<void> {
  chats = []
}

// Helper function to ensure a chat exists or create a new one
export async function ensureChat(id?: string | null): Promise<Chat> {
  if (id) {
    const existingChat = await getChat(id)
    if (existingChat) {
      return existingChat
    }
  }

  // If chat doesn't exist or no ID provided, create a new chat
  return await createChat()
}

// Process user message for memory extraction/updates
export async function processUserMessage(message: string): Promise<void> {
  return processMemories(message)
}

export async function getMemoriesForContext(): Promise<string> {
  const { getMemoriesForContext } = await import("./memory-store")
  return getMemoriesForContext()
}
