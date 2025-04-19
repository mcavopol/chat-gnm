import { clearAllCacheData } from "@/lib/cache-manager"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const result = await clearAllCacheData()

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}
