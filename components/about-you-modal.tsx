"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type Memory, addMemory, deleteMemory, getMemories } from "@/lib/memory-store"
import { useMediaQuery } from "@/hooks/use-media-query"

interface AboutYouModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutYouModal({ isOpen, onClose }: AboutYouModalProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [newMemory, setNewMemory] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")

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

  useEffect(() => {
    if (isOpen) {
      loadMemories()
    }
  }, [isOpen])

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

  const handleAddMemory = async () => {
    if (!newMemory.trim()) return

    try {
      setIsAdding(true)
      await addMemory(newMemory, "user-added")
      setNewMemory("")
      await loadMemories()
    } catch (error) {
      console.error("Failed to add memory:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id)
      setMemories(memories.filter((memory) => memory.id !== id))
    } catch (error) {
      console.error("Failed to delete memory:", error)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-0 top-10 mx-auto z-50 bg-white shadow-lg rounded-lg max-h-[80vh] overflow-hidden",
          isMobile ? "w-[95%]" : "w-[500px]",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">About You</h2>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-130px)]">
          <p className="text-sm text-gray-600 mb-4">
            This is what ChatGNM knows about you. This information is used to provide more personalized responses. You
            can add new information or remove existing items.
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
    </>
  )
}
