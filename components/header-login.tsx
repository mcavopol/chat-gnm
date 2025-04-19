"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { EmailInputModal } from "./email-input-modal"

export function HeaderLogin() {
  const { isAuthenticated } = useAuth()
  const [showEmailModal, setShowEmailModal] = useState(false)

  const handleLoginClick = () => {
    setShowEmailModal(true)
  }

  const handleEmailModalClose = () => {
    setShowEmailModal(false)
  }

  // Always render the button container, but conditionally show the button
  return (
    <>
      <div className="absolute top-4 right-4 z-20 flex items-center">
        {!isAuthenticated && (
          <motion.div whileTap={{ scale: 0.95 }} className="w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoginClick}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 h-auto w-full border border-gray-200"
            >
              <LogIn size={16} className="mr-1.5 flex-shrink-0" />
              <span>Login</span>
            </Button>
          </motion.div>
        )}
      </div>

      <EmailInputModal isOpen={showEmailModal} onClose={handleEmailModalClose} />
    </>
  )
}
