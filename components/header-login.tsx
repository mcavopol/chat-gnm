"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { EmailInputModal } from "./email-input-modal"
import { getUserProfile } from "@/lib/user-profile-store"
import Image from "next/image"

export function HeaderLogin() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user profile if authenticated
  useState(() => {
    const loadProfile = async () => {
      if (isAuthenticated) {
        setIsLoading(true)
        try {
          const userProfile = await getUserProfile()
          setProfile(userProfile)
        } catch (error) {
          console.error("Failed to load profile:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadProfile()
  })

  const handleLoginClick = () => {
    setShowEmailModal(true)
  }

  const handleEmailModalClose = () => {
    setShowEmailModal(false)
  }

  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {profile && (
              <div
                className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all"
                onClick={() => router.push("/chat")}
              >
                <Image
                  src={profile.gravatarUrl || "/placeholder.svg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/vibrant-street-market.png"
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoginClick}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Button>
          </motion.div>
        )}
      </div>

      <EmailInputModal isOpen={showEmailModal} onClose={handleEmailModalClose} />
    </>
  )
}
