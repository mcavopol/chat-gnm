"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import { ArrowUpIcon, HistoryIcon, PlusCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { useEffect, useState, useCallback, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { MessageContent } from "@/components/message-content"
import { addMessageToChat, chatExists, createChat, getChat, processUserMessage, getChats } from "@/lib/chat-store"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { NavigationModal } from "./navigation-modal"
import { motion, AnimatePresence } from "framer-motion"
import { ConversationStarters } from "./conversation-starters"
import { getMemories } from "@/lib/memory-store"
import { useAuth } from "@/context/auth-context"
import { LoginPrompt } from "./login-prompt"
import { HeaderLogin } from "./header-login"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chatId = searchParams.get("id")
  const { isAuthenticated, isGuest, logout } = useAuth()

  const [isNavModalOpen, setIsNavModalOpen] = useState(false)
  const [navModalTab, setNavModalTab] = useState<"about" | "history">("about")
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [hasCompletedSecondExchange, setHasCompletedSecondExchange] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1023px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const isLargeDesktop = useMediaQuery("(min-width: 1440px)")
  const [chatLoadAttempted, setChatLoadAttempted] = useState(false)

  // Use a ref to track the message count
  const userMessageCountRef = useRef(0)

  const {
    messages,
    input,
    setInput,
    append,
    setMessages,
    isLoading: isAiLoading,
  } = useChat({
    api: "/api/chat",
    id: chatId || undefined,
    body: {
      chatId,
    },
    onError: (error) => {
      console.error("Chat API error:", error)
      setError("An error occurred while communicating with the AI. Please try again.")
    },
    onFinish: async (message) => {
      console.log("AI finished responding", {
        isGuest,
        userMessageCount: userMessageCountRef.current,
        messagesLength: messages.length,
      })

      // If this was the second exchange and user is a guest, show login prompt
      if (isGuest && userMessageCountRef.current === 2) {
        console.log("Setting hasCompletedSecondExchange to true")
        setHasCompletedSecondExchange(true)

        // Show login prompt after a short delay to ensure UI updates
        setTimeout(() => {
          console.log("Showing login prompt after second exchange")
          setShowLoginPrompt(true)
        }, 500)
      }

      if (isAuthenticated && chatId) {
        try {
          // Check if chat exists before adding message
          const exists = await chatExists(chatId)
          if (exists) {
            await addMessageToChat(chatId, {
              role: "assistant",
              content: message.content,
              createdAt: new Date(),
            })
            // Refresh chat history after adding a message
            checkChats()
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

  // Add these state variables and effects
  const [hasMemories, setHasMemories] = useState(false)
  const [hasChats, setHasChats] = useState(false)
  const [isCheckingMemories, setIsCheckingMemories] = useState(true)
  const [isCheckingChats, setIsCheckingChats] = useState(true)
  const pathname = usePathname()

  // Reset message count when messages are cleared
  useEffect(() => {
    if (messages.length === 0) {
      console.log("Resetting userMessageCountRef to 0")
      userMessageCountRef.current = 0
      setHasCompletedSecondExchange(false)
      setShowLoginPrompt(false)
    }
  }, [messages.length])

  // Create reusable functions for checking memories and chats
  const checkMemories = useCallback(async () => {
    if (!isAuthenticated) return

    setIsCheckingMemories(true)
    try {
      const memories = await getMemories()
      console.log("Memories found:", memories.length)
      setHasMemories(memories.length > 0)
    } catch (error) {
      console.error("Failed to check memories:", error)
      setHasMemories(false)
    } finally {
      setIsCheckingMemories(false)
    }
  }, [isAuthenticated])

  const checkChats = useCallback(async () => {
    if (!isAuthenticated) return

    setIsCheckingChats(true)
    try {
      const chats = await getChats()
      console.log("Chats found:", chats.length)
      setHasChats(chats.length > 0)
    } catch (error) {
      console.error("Failed to check chats:", error)
      setHasChats(false)
    } finally {
      setIsCheckingChats(false)
    }
  }, [isAuthenticated])

  // Initial check for memories and chats if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkMemories()
      checkChats()
    }
  }, [isAuthenticated, checkMemories, checkChats])

  // Refresh checks when modal is closed (in case user added/deleted items)
  useEffect(() => {
    if (!isNavModalOpen && isAuthenticated) {
      checkMemories()
      checkChats()
    }
  }, [isNavModalOpen, isAuthenticated, checkMemories, checkChats])

  // Determine if we're in an active conversation
  const isActiveConversation = chatId !== null && messages.length > 0
  const isRootChatRoute = pathname === "/chat" && !chatId

  // Load chat messages when chatId changes (only if authenticated)
  useEffect(() => {
    const loadChat = async () => {
      // Reset chat load attempted flag when chatId changes
      setChatLoadAttempted(false)

      if (!isAuthenticated || !chatId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log(`Loading chat with ID: ${chatId}`)
        const chat = await getChat(chatId)

        if (chat) {
          console.log(
            `Chat found with ${chat.messages.length} messages:`,
            chat.messages.map((m) => `${m.role}: ${m.content.substring(0, 20)}...`),
          )

          // Map the messages to the format expected by useChat
          const mappedMessages = chat.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          }))

          console.log(`Setting ${mappedMessages.length} messages in chat state`)

          // Clear existing messages first to ensure clean state
          setMessages([])

          // Use setTimeout to ensure the state update happens in the next tick
          setTimeout(() => {
            setMessages(mappedMessages)

            // Count user messages in the loaded chat
            const userMsgCount = chat.messages.filter((msg) => msg.role === "user").length
            userMessageCountRef.current = userMsgCount

            // If there are already 2 or more user messages and user is guest, set completed second exchange
            if (isGuest && userMsgCount >= 2) {
              setHasCompletedSecondExchange(true)
              setShowLoginPrompt(true)
            }

            setIsLoading(false)
          }, 0)
        } else {
          // If chat doesn't exist, create a new one
          console.warn(`Chat with ID ${chatId} not found, creating new chat`)
          handleNewChat()
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error loading chat:", error)
        setError("Failed to load chat")
        setIsLoading(false)
      }

      // Mark that we've attempted to load the chat
      setChatLoadAttempted(true)
    }

    loadChat()
  }, [chatId, isAuthenticated, setMessages, isGuest])

  // Add a debug effect to log messages when they change
  useEffect(() => {
    if (chatId && chatLoadAttempted) {
      console.log(
        `Current messages in chat state (${messages.length}):`,
        messages.map((m) => `${m.role}: ${m.content.substring(0, 20)}...`),
      )
    }
  }, [messages, chatId, chatLoadAttempted])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setError(null)

    // Increment user message count for guest users
    if (isGuest) {
      userMessageCountRef.current += 1
      console.log("User message count increased to:", userMessageCountRef.current)
    }

    console.log("Submitting message", {
      isGuest,
      userMessageCount: userMessageCountRef.current,
      messagesLength: messages.length,
    })

    try {
      if (isAuthenticated) {
        setIsCreatingChat(true)

        // Ensure we have a valid chat
        let currentChatId = chatId
        let shouldRedirect = false

        if (!currentChatId) {
          // No chat ID, create a new one
          try {
            const newChat = await createChat()
            currentChatId = newChat.id
            shouldRedirect = true
          } catch (createError) {
            console.error("Failed to create chat:", createError)
            throw new Error("Failed to create a new chat")
          }
        } else {
          // Check if the chat exists
          try {
            const exists = await chatExists(currentChatId)
            if (!exists) {
              // Chat doesn't exist, create a new one
              const newChat = await createChat()
              currentChatId = newChat.id
              shouldRedirect = true
            }
          } catch (checkError) {
            console.error("Failed to check if chat exists:", checkError)
            throw new Error("Failed to verify chat")
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
        processUserMessage(userMessage)
          .then(() => {
            // Refresh memories after processing
            checkMemories()
          })
          .catch((error) => {
            console.error("Error processing user message for memories:", error)
          })

        // Refresh chat history after adding a message
        checkChats()

        // Redirect if needed (do this before append to avoid race conditions)
        if (shouldRedirect) {
          router.push(`/chat?id=${currentChatId}`)
        }
      }

      // Send message to AI with error handling
      try {
        await append({
          role: "user",
          content: userMessage,
        })
      } catch (appendError) {
        console.error("Error appending message:", appendError)
        throw new Error("Failed to send message to AI")
      }
    } catch (error) {
      console.error("Error submitting message:", error)
      setError(`Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`)
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
    if (!isAuthenticated) {
      // For guest users, just clear the messages
      setMessages([])
      userMessageCountRef.current = 0
      setHasCompletedSecondExchange(false)
      setShowLoginPrompt(false)
      return
    }

    try {
      setIsCreatingChat(true)
      const newChat = await createChat()
      router.push(`/chat?id=${newChat.id}`)
      setMessages([])
      // Refresh chat history after creating a new chat
      checkChats()
    } catch (error) {
      console.error("Failed to create new chat:", error)
      setError("Failed to create new chat")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleSelectChat = (selectedChatId: string) => {
    // Clear current messages before navigating to ensure clean state
    setMessages([])
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
    // Set the tab first, then open the modal
    setNavModalTab(tab)
    setIsNavModalOpen(true)
  }

  // We keep the handleLogout function for future use but removed the button
  const handleLogout = () => {
    logout()
    setMessages([])
    userMessageCountRef.current = 0
    setHasCompletedSecondExchange(false)
    setShowLoginPrompt(false)
    router.push("/chat")
  }

  const handleLoginClose = () => {
    setShowLoginPrompt(false)
  }

  const header = (
    <motion.header
      className="m-auto flex flex-col gap-5 text-center max-w-full md:max-w-2xl lg:max-w-3xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-none tracking-tight">ChatGNM</h1>
      <p className="text-muted-foreground text-sm md:text-base">
        Explore and understand the principles of German New Medicine through an AI-powered conversation.
      </p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <p className="text-muted-foreground text-sm md:text-base font-medium">
          Choose a topic or ask your own question:
        </p>
      </motion.div>
    </motion.header>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id || index}
          data-role={message.role}
          className={cn(
            "max-w-[80%] rounded-xl px-4 py-3 text-sm md:text-base",
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

  // Determine if the input form should be shown
  // Hide input when:
  // 1. Login prompt is shown AND user is not authenticated
  // 2. OR when AI is loading
  // 3. OR when user has completed second exchange but is not authenticated
  const shouldHideInput =
    (showLoginPrompt && !isAuthenticated) || isAiLoading || (hasCompletedSecondExchange && !isAuthenticated)

  const showInputForm = !shouldHideInput

  // Determine the appropriate max-width based on screen size
  const containerMaxWidth = cn(
    isLargeDesktop ? "max-w-5xl" : isDesktop ? "max-w-4xl" : isTablet ? "max-w-2xl" : "max-w-[35rem]",
  )

  return (
    <TooltipProvider>
      <main
        className={cn(
          "ring-none mx-auto flex h-svh max-h-svh w-full flex-col items-stretch border-none relative",
          containerMaxWidth,
          className,
        )}
        {...props}
      >
        {/* Add the HeaderLogin component for the streamlined login in the top-right corner */}
        {isRootChatRoute && <HeaderLogin />}

        <div className="sticky top-0 z-10 flex justify-between p-4 bg-white/80 backdrop-blur-sm">
          {isActiveConversation && !isRootChatRoute ? (
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
          ) : (
            <div /> // Empty div for spacing when new chat button is hidden
          )}

          <div className="flex">
            {isAuthenticated && (
              <>
                {!isCheckingMemories && hasMemories && (
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
                )}

                {!isCheckingChats && hasChats && (
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
                )}
              </>
            )}
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

        <div
          className={cn(
            "flex-1 content-center overflow-y-auto px-6",
            showLoginPrompt && !isAuthenticated && "pb-24", // Add padding at the bottom when login prompt is shown
          )}
        >
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

        <AnimatePresence>
          {showInputForm && (
            <motion.form
              onSubmit={handleSubmit}
              className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm md:text-base focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AutoResizeTextarea
                onKeyDown={handleKeyDown}
                onChange={(v) => setInput(v)}
                value={input}
                placeholder="Enter a message"
                className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none text-sm md:text-base"
                disabled={isCreatingChat || isLoading}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "absolute bottom-1 right-1 size-6 md:size-8 rounded-full transition-colors duration-300",
                      hasText && "bg-blue-600 text-white hover:bg-blue-700",
                    )}
                    disabled={isCreatingChat || isLoading || !input.trim()}
                  >
                    <ArrowUpIcon size={isMobile ? 16 : 18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={12}>Submit</TooltipContent>
              </Tooltip>
            </motion.form>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLoginPrompt && !isAuthenticated && <LoginPrompt onClose={handleLoginClose} />}
        </AnimatePresence>

        <NavigationModal
          isOpen={isNavModalOpen}
          onClose={() => setIsNavModalOpen(false)}
          initialTab={navModalTab}
          currentChatId={chatId}
          onSelectChat={handleSelectChat}
          onMemoryChange={checkMemories}
          onChatChange={checkChats}
        />
      </main>
    </TooltipProvider>
  )
}
