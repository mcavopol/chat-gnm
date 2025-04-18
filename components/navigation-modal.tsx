"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AboutYouContent } from "./about-you-content"
import { HistoryContent } from "./history-content"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface NavigationModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "about" | "history"
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
}

export function NavigationModal({
  isOpen,
  onClose,
  initialTab = "about",
  currentChatId,
  onSelectChat,
}: NavigationModalProps) {
  const [activeTab, setActiveTab] = useState<"about" | "history">(initialTab)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const router = useRouter()

  // Update activeTab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  // Close the modal when clicking escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Add body lock when modal is open on mobile
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <motion.div
        className={cn(
          "fixed inset-x-0 top-10 mx-auto z-50 bg-white shadow-lg rounded-lg max-h-[80vh] overflow-hidden",
          isMobile ? "w-[95%]" : "w-[700px]",
        )}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "about" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("about")}
              className={cn("rounded-md px-3", activeTab === "about" ? "bg-blue-600 text-white hover:bg-blue-700" : "")}
            >
              About You
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className={cn(
                "rounded-md px-3",
                activeTab === "history" ? "bg-blue-600 text-white hover:bg-blue-700" : "",
              )}
            >
              History
            </Button>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="rounded-md px-3">
                Admin
              </Button>
            </Link>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          {activeTab === "about" ? (
            <AboutYouContent />
          ) : (
            <HistoryContent
              currentChatId={currentChatId}
              onSelectChat={(chatId) => {
                onSelectChat(chatId)
                onClose()
              }}
            />
          )}
        </div>
      </motion.div>
    </>
  )
}
