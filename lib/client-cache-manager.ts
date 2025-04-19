"use client"

/**
 * Clears all client-side cache data from localStorage
 */
export function clearClientCache(): { success: boolean; message: string } {
  try {
    // Clear authentication session
    localStorage.removeItem("chatgnm-session")

    // Add any other localStorage items that need to be cleared

    return {
      success: true,
      message: "Client-side cache cleared successfully.",
    }
  } catch (error) {
    console.error("Error clearing client-side cache:", error)
    return {
      success: false,
      message: `Failed to clear client-side cache: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
