"use server"

import { nanoid } from "nanoid"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface Memory {
  id: string
  content: string
  source: "extracted" | "user-added"
  createdAt: Date
  updatedAt: Date
}

// In a real app, this would be stored in a database
let memories: Memory[] = []

export async function getMemories(): Promise<Memory[]> {
  return [...memories].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
}

export async function getMemoryById(id: string): Promise<Memory | undefined> {
  return memories.find((memory) => memory.id === id)
}

export async function addMemory(content: string, source: "extracted" | "user-added"): Promise<Memory> {
  const newMemory: Memory = {
    id: nanoid(),
    content,
    source,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  memories.push(newMemory)
  return newMemory
}

export async function updateMemory(id: string, content: string): Promise<Memory | null> {
  const memoryIndex = memories.findIndex((memory) => memory.id === id)

  if (memoryIndex === -1) {
    return null
  }

  memories[memoryIndex] = {
    ...memories[memoryIndex],
    content,
    updatedAt: new Date(),
  }

  return memories[memoryIndex]
}

export async function deleteMemory(id: string): Promise<void> {
  memories = memories.filter((memory) => memory.id !== id)
}

export async function clearAllMemories(): Promise<void> {
  memories = []
}

// Add error handling for memory processing

export async function processUserMessage(message: string): Promise<void> {
  try {
    // Get existing memories
    const existingMemories = await getMemories()

    // Format existing memories for the LLM
    const formattedMemories = existingMemories.map((memory) => `- "${memory.content}", ID: ${memory.id}`).join("\n")

    // Use the MEMORY_MODEL_API_KEY if available, otherwise fall back to the default OPENAI_API_KEY
    const memoryModelApiKey = process.env.MEMORY_MODEL_API_KEY || process.env.OPENAI_API_KEY

    // Use the specified memory model or fall back to a default
    const memoryModel = process.env.MEMORY_MODEL || "gpt-4.1-nano-2025-04-14"

    try {
      // Use LLM to analyze the message and compare with existing memories
      const result = await generateText({
        model: openai(memoryModel, { apiKey: memoryModelApiKey }),
        system: `You are a memory management system that extracts and organizes information about a user.
        
Your task is to analyze a user's message and determine if it contains any new information worth remembering.

Compare the new information with the existing memories and decide whether to:
1. Create new memory entries for completely new information
2. Update existing memories with related new information
3. Do nothing if no new information is present

Respond with a JSON object in the following format:
{
  "action": "create" | "update" | "none",
  "memories": [
    {
      "action": "create" | "update",
      "id": "existing-memory-id-if-updating",
      "content": "the memory content"
    }
  ]
}

Only extract meaningful personal information that would be useful to remember about the user.
Be selective and only create or update memories when there is significant information.
`,
        prompt: `User message: "${message}"

Existing memories:
${formattedMemories || "No existing memories."}

Analyze the user message and determine what actions to take regarding memories.`,
      })

      try {
        // Parse the LLM response
        const memoryActions = JSON.parse(result.text)

        // Process the actions
        if (memoryActions.action === "none") {
          // No action needed
          return
        }

        // Process each memory action
        for (const memory of memoryActions.memories) {
          if (memory.action === "create") {
            // Create a new memory
            await addMemory(memory.content, "extracted")
          } else if (memory.action === "update" && memory.id) {
            // Update an existing memory
            await updateMemory(memory.id, memory.content)
          }
        }
      } catch (parseError) {
        console.error("Error parsing LLM response:", parseError)
        console.log("Raw LLM response:", result.text)
      }
    } catch (llmError) {
      console.error("Error calling LLM for memory processing:", llmError)
      // Fail gracefully - don't let memory processing errors affect the main chat flow
    }
  } catch (error) {
    console.error("Error processing user message for memories:", error)
  }
}

// Add error handling for getMemoriesForContext
export async function getMemoriesForContext(): Promise<string> {
  try {
    const allMemories = await getMemories()

    if (allMemories.length === 0) {
      return ""
    }

    // Format the memories as a simple list
    let memoryText = "### What I Know About You\n"

    allMemories.forEach((memory) => {
      memoryText += `- ${memory.content}\n`
    })

    return memoryText
  } catch (error) {
    console.error("Error getting memories for context:", error)
    return "" // Return empty string on error to avoid breaking the chat
  }
}
