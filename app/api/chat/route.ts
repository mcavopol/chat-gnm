import { type CoreMessage, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getSystemPrompt } from "@/lib/system-prompt"
import { getMemoriesForContext } from "@/lib/memory-store"

export async function POST(req: Request) {
  const { messages, chatId }: { messages: CoreMessage[]; chatId?: string } = await req.json()
  const systemPrompt = await getSystemPrompt()

  // Get user memories to include in the context
  const memoriesContext = await getMemoriesForContext()

  // Combine the system prompt with the memories
  const fullSystemPrompt = `${systemPrompt}

${memoriesContext}`

  // Use the specified chat model or fall back to a default
  const chatModel = process.env.CHAT_MODEL || "gpt-4.1-nano-2025-04-14"

  const result = streamText({
    model: openai(chatModel),
    system: fullSystemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
