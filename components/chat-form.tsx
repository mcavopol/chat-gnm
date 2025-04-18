"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import { ArrowUpIcon, HistoryIcon, Settings, PlusCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { useEffect, useState } from "react"
import { ChatHistory } from "@/components/chat-history"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MessageContent } from "@/components/message-content"
import Link from "next/link"
import { addMessageToChat, chatExists, createChat, getChat, processUserMessage } from "@/lib/chat-store"
import { useRouter, useSearchParams } from "next/navigation"
import { AboutYouModal } from "./about-you-modal"
import { ConversationStarters } from "./conversation-starters"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("id")

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isAboutYouOpen, setIsAboutYouOpen] = useState(false)
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
    setIsHistoryOpen(false)
  }

  const handleSelectStarter = (starter: string) => {
    setInput(starter)
    // Optional: Focus the input field after selecting a starter
    const textarea = document.querySelector("textarea")
    if (textarea) {
      textarea.focus()
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">ChatGNM</h1>
      <p className="text-muted-foreground text-sm">
        Explore and understand the principles of German New Medicine through an AI-powered conversation.
      </p>
      <p className="text-muted-foreground text-sm">
        Ask a question about GNM concepts or describe a symptom to get started.
      </p>
    </header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className={cn(
            "max-w-[80%] rounded-xl px-4 py-3 text-sm",
            message.role === "assistant"
              ? "self-start bg-gray-100 text-black"
              : "self-end bg-blue-500 text-white [&_.markdown-content_a]:text-white [&_.markdown-content_a]:underline [&_.markdown-content_code]:bg-blue-400",
          )}
        >
          <MessageContent content={message.content} />
        </div>
      ))}
    </div>
  )

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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("flex items-center gap-1.5 h-10", isMobile && "px-2.5 py-2")}
                onClick={() => setIsAboutYouOpen(true)}
                aria-label="About you"
              >
                <User size={isMobile ? 18 : 16} />
                {!isMobile && <span>About You</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>View and edit what ChatGNM knows about you</TooltipContent>
          </Tooltip>

          <div className="flex">
            <Link href="/admin" className="mr-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn("flex items-center gap-1.5 h-10", isMobile && "px-2.5 py-2")}
                aria-label="Admin settings"
              >
                <Settings size={isMobile ? 18 : 16} />
                {!isMobile && <span>Admin</span>}
              </Button>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("flex items-center gap-1.5 h-10", isMobile && "px-2.5 py-2")}
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  aria-label="Toggle chat history"
                >
                  <HistoryIcon size={isMobile ? 18 : 16} />
                  {!isMobile && <span>History</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>View chat history</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {error && <div className="mx-6 my-2 p-2 bg-red-50 text-red-500 text-sm rounded-md">{error}</div>}

        <div className="flex-1 content-center overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-gray-500">Loading...</div>
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

        <form
          onSubmit={handleSubmit}
          className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
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
                className="absolute bottom-1 right-1 size-6 rounded-full"
                disabled={isCreatingChat || isLoading || !input.trim()}
              >
                <ArrowUpIcon size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent sideOffset={12}>Submit</TooltipContent>
          </Tooltip>
        </form>

        <ChatHistory
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          isMobile={isMobile}
          currentChatId={chatId}
          onSelectChat={handleSelectChat}
        />

        <AboutYouModal isOpen={isAboutYouOpen} onClose={() => setIsAboutYouOpen(false)} />
      </main>
    </TooltipProvider>
  )
}
