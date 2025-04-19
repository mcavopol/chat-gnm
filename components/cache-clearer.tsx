"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { clearClientCache } from "@/lib/client-cache-manager"
import { Trash2, RefreshCw } from "lucide-react"

export function CacheClearer() {
  const [isClearing, setIsClearing] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all application cache data? This will remove all chats and user memories.",
      )
    ) {
      return
    }

    setIsClearing(true)
    setResult(null)

    try {
      // Clear server-side cache
      const response = await fetch("/api/admin/clear-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const serverResult = await response.json()

      // Clear client-side cache
      const clientResult = clearClientCache()

      if (serverResult.success && clientResult.success) {
        setResult({
          success: true,
          message: "All application cache has been cleared successfully. You may need to refresh the page.",
        })
      } else {
        setResult({
          success: false,
          message: `Failed to clear cache: ${serverResult.message || clientResult.message}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm p-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold">Clear Application Cache</h2>
        <p className="text-sm text-gray-500">
          This will clear all chats, user memories, and session data from the application. This action cannot be undone.
        </p>

        <div className="flex justify-between items-center">
          <Button
            onClick={handleClearCache}
            disabled={isClearing}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isClearing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isClearing ? "Clearing..." : "Clear All Cache"}
          </Button>

          {result && (
            <div
              className={`text-sm px-4 py-2 rounded-md ${
                result.success ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              }`}
            >
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
