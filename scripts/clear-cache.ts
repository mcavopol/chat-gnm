import { clearAllCacheData } from "../lib/cache-manager"

async function main() {
  console.log("Clearing application cache...")

  try {
    const result = await clearAllCacheData()

    if (result.success) {
      console.log("✅ Success:", result.message)
    } else {
      console.error("❌ Error:", result.message)
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
  }
}

main()
