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
  console.log(`Retrieving chat with ID: ${id}`)
  const chat = chats.find((chat) => chat.id === id)

  if (chat) {
    console.log(`Found chat with title: "${chat.title}" and ${chat.messages.length} messages`)

    // Log message details for debugging
    chat.messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}: ${msg.role} - ${msg.content.substring(0, 30)}...`)
    })

    // Return a deep copy to avoid reference issues
    return {
      ...chat,
      messages: [...chat.messages.map((msg) => ({ ...msg }))],
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    }
  }

  console.log(`Chat with ID ${id} not found`)
  return undefined
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
  console.log(`Created new chat with ID: ${newChat.id}`)
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

  console.log(`Added ${message.role} message to chat ${chatId}: ${message.content.substring(0, 30)}...`)
  return newMessage
}

export async function deleteChat(id: string): Promise<void> {
  chats = chats.filter((chat) => chat.id !== id)
  console.log(`Deleted chat with ID: ${id}`)
}

export async function clearAllChats(): Promise<void> {
  chats = []
  console.log("Cleared all chats")
}

// Helper function to ensure a chat exists or create a new one
export async function ensureChat(id?: string | null): Promise<Chat> {
  if (id) {
    const existingChat = await getChat(id)
    if (existingChat) {
      return existingChat
    }
  }

  // If chat doesn't exist or no ID provided, create a new one
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

// New function to sync guest messages to server after login
export async function syncGuestMessages(chatId: string, guestMessages: any[]): Promise<void> {
  console.log(`Syncing ${guestMessages.length} guest messages to chat ${chatId}`)

  // Check if chat exists
  let chat = chats.find((c) => c.id === chatId)

  // If chat doesn't exist, create it
  if (!chat) {
    chat = {
      id: chatId,
      title: "Imported Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    chats.push(chat)
  }

  // Process each guest message and add it to the chat
  for (const msg of guestMessages) {
    // Skip messages that might already exist (based on content)
    const isDuplicate = chat.messages.some(
      (existingMsg) => existingMsg.role === msg.role && existingMsg.content === msg.content,
    )

    if (!isDuplicate) {
      chat.messages.push({
        id: nanoid(),
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt || Date.now()),
      })
    }
  }

  // Update chat title if it's still default
  if (chat.title === "Imported Chat" && guestMessages.length > 0) {
    const firstUserMsg = guestMessages.find((msg) => msg.role === "user")
    if (firstUserMsg) {
      chat.title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "")
    }
  }

  chat.updatedAt = new Date()
  console.log(`Successfully synced guest messages to chat ${chatId}`)
}
