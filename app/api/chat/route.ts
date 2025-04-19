import { type CoreMessage, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getSystemPrompt } from "@/lib/system-prompt"
import { getMemoriesForContext } from "@/lib/memory-store"

export async function POST(req: Request) {
  try {
    const { messages, chatId }: { messages: CoreMessage[]; chatId?: string } = await req.json()
    const systemPrompt = await getSystemPrompt()

    // Get user memories to include in the context (only if chatId is provided)
    let memoriesContext = ""
    try {
      memoriesContext = chatId ? await getMemoriesForContext() : ""
    } catch (memoryError) {
      console.error("Error fetching memories:", memoryError)
      // Continue without memories if there's an error
    }

    // Combine the system prompt with the memories
    const fullSystemPrompt = `${systemPrompt}

${memoriesContext}`

    // Use the specified chat model or fall back to a default
    const chatModel = process.env.CHAT_MODEL || "gpt-4.1-nano-2025-04-14"

    try {
      const result = streamText({
        model: openai(chatModel),
        system: fullSystemPrompt,
        messages,
      })

      return result.toDataStreamResponse()
    } catch (streamError) {
      console.error("Error streaming text:", streamError)
      return new Response(JSON.stringify({ error: "Failed to generate AI response" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("API route error:", error)
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
