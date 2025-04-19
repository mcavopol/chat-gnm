"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, User, Mail, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Memory, addMemory, deleteMemory, getMemories } from "@/lib/memory-store"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/user-profile-store"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

interface AboutYouContentProps {
  onMemoryChange?: () => void
}

export function AboutYouContent({ onMemoryChange }: AboutYouContentProps) {
  const { toast } = useToast()
  const { logout } = useAuth()
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadMemories = async () => {
    setIsLoading(true)
    try {
      const userMemories = await getMemories()
      setMemories(userMemories)
    } catch (error) {
      console.error("Failed to load memories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      setProfile(userProfile)

      if (userProfile) {
        setFirstName(userProfile.firstName || "")
        setLastName(userProfile.lastName || "")
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
    }
  }

  useEffect(() => {
    loadMemories()
    loadProfile()
  }, [])

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return

    try {
      setIsAdding(true)
      await addMemory(newMemory, "user-added")
      setNewMemory("")
      await loadMemories()
      // Notify parent component that memories have changed
      if (onMemoryChange) {
        onMemoryChange()
      }

      // Show success toast
      toast({
        title: "Memory added",
        description: "Your information has been saved.",
      })
    } catch (error) {
      console.error("Failed to add memory:", error)
      toast({
        title: "Error",
        description: "Failed to add memory. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id)
      setMemories(memories.filter((memory) => memory.id !== id))
      // Notify parent component that memories have changed
      if (onMemoryChange) {
        onMemoryChange()
      }

      // Show success toast
      toast({
        title: "Memory deleted",
        description: "The information has been removed.",
      })
    } catch (error) {
      console.error("Failed to delete memory:", error)
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return false

    setIsSaving(true)
    try {
      const updatedProfile = await updateUserProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleFirstNameBlur = async () => {
    if (firstName !== (profile?.firstName || "")) {
      const success = await handleSaveProfile()
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your first name has been saved.",
        })
      }
    }
  }

  const handleLastNameBlur = async () => {
    if (lastName !== (profile?.lastName || "")) {
      const success = await handleSaveProfile()
      if (success) {
        toast({
          title: "Profile updated",
          description: "Your last name has been saved.",
        })
      }
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/chat")
  }

  return (
    <div>
      {/* Profile Section */}
      <div className="p-4 border-b">
        <div className="mb-3">
          <h3 className="font-medium">Your Profile</h3>
        </div>

        {profile ? (
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {profile.gravatarUrl ? (
                <Image
                  src={profile.gravatarUrl || "/placeholder.svg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // If Gravatar image fails to load, show fallback
                    e.currentTarget.src = "/vibrant-street-market.png"
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-500">
                  <User size={24} />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex gap-2">
                <div className="relative group">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={handleFirstNameBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur()
                      }
                    }}
                    placeholder="First Name"
                    className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full"
                    disabled={isSaving}
                  />
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={handleLastNameBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur()
                      }
                    }}
                    placeholder="Last Name"
                    className="font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail size={14} className="mr-1" />
                  {profile.email}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 h-8 flex items-center"
                >
                  <LogOut size={16} className="mr-1" />
                  <span className="text-sm">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 text-gray-500">No profile information available</div>
        )}
      </div>

      {/* Memories Section */}
      <div className="p-4">
        <h3 className="font-medium mb-3">What ChatGNM Knows About You</h3>
        <p className="text-sm text-gray-600 mb-4">
          This information is used to provide more personalized responses. You can add new information or remove
          existing items.
        </p>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : memories.length > 0 ? (
          <ul className="space-y-2">
            {memories.map((memory) => (
              <li key={memory.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-md group">
                <div className="flex-1 pr-2">
                  <p className="text-sm">{memory.content}</p>
                  <span className="text-xs text-gray-500">
                    {memory.source === "extracted" ? "Learned from conversation" : "Added by you"}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteMemory(memory.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete memory"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No information stored yet. ChatGNM will learn about you as you chat, or you can add information manually
            below.
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="Add something about yourself..."
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAdding}
            />
            <Button onClick={handleAddMemory} disabled={!newMemory.trim() || isAdding} className="h-9">
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Add information you'd like ChatGNM to remember about you across all conversations.
          </p>
        </div>
      </div>
    </div>
  )
}
