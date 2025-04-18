"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import { ArrowUpIcon, HistoryIcon, PlusCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MessageContent } from "@/components/message-content"
import { addMessageToChat, chatExists, createChat, getChat, processUserMessage } from "@/lib/chat-store"
import { useRouter, useSearchParams } from "next/navigation"
import { NavigationModal } from "./navigation-modal"
import { motion } from "framer-motion"
import { ConversationStarters } from "./conversation-starters"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("id")

  const [isNavModalOpen, setIsNavModalOpen] = useState(false)
  const [navModalTab, setNavModalTab] = useState<"about" | "history">("about")
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  const { messages, input, setInput, append, setMessages } = useChat({
    api: "/api/chat",
    id: chatId || undefined,
    body: {
      chatId,
    },
    onFinish: async (message) => {
      if (chatId) {
        try {
          // Check if chat exists before adding message
          const exists = await chatExists(chatId)
          if (exists) {
            await addMessageToChat(chatId, {
              role: "assistant",
              content: message.content,
              createdAt: new Date(),
            })
          } else {
            console.error(`Chat with ID ${chatId} not found when adding assistant message`)
            // If chat doesn't exist, create a new one and redirect
            handleNewChat()
          }
        } catch (error) {
          console.error("Error adding assistant message:", error)
        }
      }
    },
  })

  // Load chat messages when chatId changes
  useEffect(() => {
    const loadChat = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (chatId) {
          const chat = await getChat(chatId)
          if (chat) {
            setMessages(
              chat.messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
              })),
            )
          } else {
            // If chat doesn't exist, create a new one
            console.warn(`Chat with ID ${chatId} not found, creating new chat`)
            handleNewChat()
          }
        } else {
          setMessages([])
        }
      } catch (error) {
        console.error("Error loading chat:", error)
        setError("Failed to load chat")
      } finally {
        setIsLoading(false)
      }
    }

    loadChat()
  }, [chatId, setMessages])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setError(null)

    try {
      setIsCreatingChat(true)

      // Ensure we have a valid chat
      let currentChatId = chatId
      let shouldRedirect = false

      if (!currentChatId) {
        // No chat ID, create a new one
        const newChat = await createChat()
        currentChatId = newChat.id
        shouldRedirect = true
      } else {
        // Check if the chat exists
        const exists = await chatExists(currentChatId)
        if (!exists) {
          // Chat doesn't exist, create a new one
          const newChat = await createChat()
          currentChatId = newChat.id
          shouldRedirect = true
        }
      }

      // Add user message to chat history
      const messageResult = await addMessageToChat(currentChatId, {
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      })

      if (!messageResult) {
        throw new Error("Failed to add message to chat")
      }

      // Process the user message for memory extraction/updates
      // This happens asynchronously and doesn't block the chat flow
      processUserMessage(userMessage).catch((error) => {
        console.error("Error processing user message for memories:", error)
      })

      // Redirect if needed (do this before append to avoid race conditions)
      if (shouldRedirect) {
        router.push(`/chat?id=${currentChatId}`)
      }

      // Send message to AI
      await append({
        role: "user",
        content: userMessage,
      })
    } catch (error) {
      console.error("Error submitting message:", error)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.requestSubmit()
    }
  }

  const handleNewChat = async () => {
    try {
      setIsCreatingChat(true)
      const newChat = await createChat()
      router.push(`/chat?id=${newChat.id}`)
      setMessages([])
    } catch (error) {
      console.error("Failed to create new chat:", error)
      setError("Failed to create new chat")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleSelectChat = (selectedChatId: string) => {
    router.push(`/chat?id=${selectedChatId}`)
  }

  // Modified to automatically submit the form when a starter is selected
  const handleSelectStarter = async (starter: string) => {
    setInput(starter)

    // Use setTimeout to ensure the input is set before submitting
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  const openNavModal = (tab: "about" | "history") => {
    setNavModalTab(tab)
    setIsNavModalOpen(true)
  }

  const header = (
    <motion.header
      className="m-auto flex max-w-96 flex-col gap-5 text-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-semibold leading-none tracking-tight">ChatGNM</h1>
      <p className="text-muted-foreground text-sm">
        Explore and understand the principles of German New Medicine through an AI-powered conversation.
      </p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <p className="text-muted-foreground text-sm font-medium">Choose a topic or ask your own question:</p>
      </motion.div>
    </motion.header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          data-role={message.role}
          className={cn(
            "max-w-[80%] rounded-xl px-4 py-3 text-sm",
            message.role === "assistant"
              ? "self-start bg-gray-100 text-black"
              : "self-end bg-blue-500 text-white [&_.markdown-content_a]:text-white [&_.markdown-content_a]:underline [&_.markdown-content_code]:bg-blue-400",
          )}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <MessageContent content={message.content} />
        </motion.div>
      ))}
    </div>
  )

  // Determine if the submit button should have a blue background
  const hasText = input.trim().length > 0

  return (
    <TooltipProvider>
      <main
        className={cn(
          "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none relative",
          className,
        )}
        {...props}
      >
        <div className="sticky top-0 z-10 flex justify-between p-4 bg-white/80 backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("flex items-center gap-1.5 h-10", isMobile && "px-2.5 py-2")}
                onClick={handleNewChat}
                disabled={isCreatingChat}
                aria-label="New chat"
              >
                <PlusCircle size={isMobile ? 18 : 16} />
                {!isMobile && <span>New Chat</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Start a new chat</TooltipContent>
          </Tooltip>

          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("flex items-center gap-1.5 h-10 mr-2", isMobile && "px-2.5 py-2")}
                  onClick={() => openNavModal("about")}
                  aria-label="About you"
                >
                  <User size={isMobile ? 18 : 16} />
                  {!isMobile && <span>About You</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>View and edit what ChatGNM knows about you</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("flex items-center gap-1.5 h-10", isMobile && "px-2.5 py-2")}
                  onClick={() => openNavModal("history")}
                  aria-label="Chat history"
                >
                  <HistoryIcon size={isMobile ? 18 : 16} />
                  {!isMobile && <span>History</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>View chat history</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {error && (
          <motion.div
            className="mx-6 my-2 p-2 bg-red-50 text-red-500 text-sm rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}

        <div className="flex-1 content-center overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <motion.div
                className="text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Loading...
              </motion.div>
            </div>
          ) : messages.length ? (
            messageList
          ) : (
            <>
              {header}
              <ConversationStarters onSelectStarter={handleSelectStarter} className="mt-6" />
            </>
          )}
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <AutoResizeTextarea
            onKeyDown={handleKeyDown}
            onChange={(v) => setInput(v)}
            value={input}
            placeholder="Enter a message"
            className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
            disabled={isCreatingChat || isLoading}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute bottom-1 right-1 size-6 rounded-full transition-colors duration-300",
                  hasText && "bg-blue-600 text-white hover:bg-blue-700",
                )}
                disabled={isCreatingChat || isLoading || !input.trim()}
              >
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </motion.form>

        <NavigationModal
          isOpen={isNavModalOpen}
          onClose={() => setIsNavModalOpen(false)}
          initialTab={navModalTab}
          currentChatId={chatId}
          onSelectChat={handleSelectChat}
        />
      </main>
    </TooltipProvider>
  )
}
