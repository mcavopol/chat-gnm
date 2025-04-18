"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, BookOpen, Activity, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

interface ConversationStartersProps {
  onSelectStarter: (starter: string) => void
  className?: string
}

export function ConversationStarters({ onSelectStarter, className }: ConversationStartersProps) {
  const starters = [
    {
      text: "Can you explain the five biological laws using examples?",
      icon: <BookOpen size={18} />,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-500 group-hover:text-blue-600",
    },
    {
      text: "Share insights or stories from GNM resources.",
      icon: <MessageSquare size={18} />,
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-500 group-hover:text-green-600",
    },
    {
      text: "How can GNM help understand specific health issues?",
      icon: <Activity size={18} />,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-500 group-hover:text-purple-600",
    },
    {
      text: "Teach me about the two-phase healing process.",
      icon: <RefreshCw size={18} />,
      color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      iconColor: "text-amber-500 group-hover:text-amber-600",
    },
  ]

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className={cn("w-full max-w-3xl mx-auto px-4 py-6", className)}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {starters.map((starter, index) => (
          <motion.button
            key={index}
            className={cn(
              "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              starter.color,
            )}
            onClick={() => onSelectStarter(starter.text)}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className={cn("flex-shrink-0 transition-colors duration-300", starter.iconColor)}>
                {starter.icon}
              </div>
              <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                {starter.text}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
