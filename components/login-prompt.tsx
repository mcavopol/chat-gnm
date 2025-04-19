"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { LogIn } from "lucide-react"
import { EmailInputModal } from "./email-input-modal"

interface LoginPromptProps {
  onClose: () => void
}

export function LoginPrompt({ onClose }: LoginPromptProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)

  const handleLoginClick = () => {
    setShowEmailModal(true)
  }

  const handleEmailModalClose = () => {
    setShowEmailModal(false)
    // If the user closed the modal without logging in, keep the login prompt open
  }

  return (
    <>
      <motion.div
        className="fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-lg"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-[35rem] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <h3 className="font-medium text-base">Log in to save your conversation and continue</h3>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <Button
            onClick={handleLoginClick}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isLoading ? (
              "Logging in..."
            ) : (
              <>
                <LogIn size={16} className="mr-2" />
                Log in
              </>
            )}
          </Button>
        </div>
      </motion.div>

      <EmailInputModal isOpen={showEmailModal} onClose={handleEmailModalClose} />
    </>
  )
}
