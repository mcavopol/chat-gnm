"use client"

import { cn } from "@/lib/utils"

interface ConversationStartersProps {
  onSelectStarter: (starter: string) => void
  className?: string
}

export function ConversationStarters({ onSelectStarter, className }: ConversationStartersProps) {
  const starters = [
    "Can you explain the five biological laws using examples?",
    "Share insights or stories from GNM resources.",
    "How can GNM help understand specific health issues?",
    "Teach me about the two-phase healing process.",
  ]

  return (
    <div className={cn("w-full max-w-3xl mx-auto px-4 py-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {starters.map((starter, index) => (
          <button
            key={index}
            className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            onClick={() => onSelectStarter(starter)}
          >
            <p className="text-sm text-gray-700">{starter}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
