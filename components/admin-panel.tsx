"use client"

import { useState } from "react"
import { updateSystemPrompt } from "@/lib/system-prompt"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AdminPanelProps {
  initialPrompt: string
}

export function AdminPanel({ initialPrompt }: AdminPanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateSystemPrompt(prompt)
      setMessage("System prompt updated successfully")
    } catch (error) {
      setMessage("Failed to update system prompt")
      console.error(error)
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(""), 3000) // Clear message after 3 seconds
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Chat
          </Link>
        </div>
        <h2 className="text-xl font-semibold">System Prompt</h2>
        <p className="text-sm text-gray-500 mt-1">
          Edit the system prompt that defines how the AI assistant behaves and responds.
        </p>
      </div>
      <div className="p-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full min-h-[300px] p-3 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter system prompt..."
        />
      </div>
      <div className="p-6 border-t flex justify-between items-center">
        {message && (
          <div className={`text-sm ${message.includes("Failed") ? "text-red-500" : "text-green-500"}`}>{message}</div>
        )}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setPrompt(initialPrompt)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
