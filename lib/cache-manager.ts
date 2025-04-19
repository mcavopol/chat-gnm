"use server"

import { clearAllChats } from "./chat-store"
import { clearAllMemories } from "./memory-store"

/**
 * Clears all application cache data, including chats and memories
 */
export async function clearAllCacheData(): Promise<{ success: boolean; message: string }> {
  try {
    // Clear all chats
    await clearAllChats()

    // Clear all memories
    await clearAllMemories()

    return {
      success: true,
      message: "All application cache data has been cleared successfully.",
    }
  } catch (error) {
    console.error("Error clearing cache data:", error)
    return {
      success: false,
      message: `Failed to clear cache data: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
