"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, BookOpen, Activity, RefreshCw, Stethoscope } from "lucide-react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ConversationStartersProps {
  onSelectStarter: (starter: string) => void
  className?: string
}

export function ConversationStarters({ onSelectStarter, className }: ConversationStartersProps) {
  const isTablet = useMediaQuery("(min-width: 768px)")
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const starters = [
    {
      text: "Explain the five biological laws using examples",
      icon: <BookOpen size={isDesktop ? 20 : 18} />,
      color: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200",
      iconColor: "text-gray-600 group-hover:text-gray-800",
    },
    {
      text: "Share insights or stories from GNM resources.",
      icon: <MessageSquare size={isDesktop ? 20 : 18} />,
      color: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200",
      iconColor: "text-gray-600 group-hover:text-gray-800",
    },
    {
      text: "Undestand specific health issues through the GNM lens",
      icon: <Activity size={isDesktop ? 20 : 18} />,
      color: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200",
      iconColor: "text-gray-600 group-hover:text-gray-800",
    },
    {
      text: "Teach me about the two-phase healing process.",
      icon: <RefreshCw size={isDesktop ? 20 : 18} />,
      color: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200",
      iconColor: "text-gray-600 group-hover:text-gray-800",
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
    <div className={cn("w-full mx-auto px-4 py-6", className)}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {starters.map((starter, index) => (
          <motion.button
            key={index}
            className={cn(
              "group text-left p-4 md:p-5 border rounded-xl transition-colors duration-300 shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
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
              <p className="text-sm md:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                {starter.text}
              </p>
            </div>
          </motion.button>
        ))}

        {/* New wider conversation starter */}
        <motion.button
          className={cn(
            "group text-left p-4 md:p-5 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
            "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 hover:from-gray-200 hover:to-gray-300",
            "col-span-1 md:col-span-2 mt-1", // Span 2 columns on md screens and above
          )}
          onClick={() => onSelectStarter("Help me troubleshoot a symptom.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-gray-700 group-hover:text-gray-900">
              <Stethoscope size={isDesktop ? 20 : 18} />
            </div>
            <p className="text-sm md:text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium">
              Help me troubleshoot a symptom.
            </p>
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
