"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, BookOpen, Activity, AlertTriangle, Stethoscope, ClipboardList } from "lucide-react"
import { motion } from "framer-motion"

interface ConversationStartersProps {
  onSelectStarter: (starter: string) => void
  className?: string
}

export function ConversationStarters({ onSelectStarter, className }: ConversationStartersProps) {
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
        {/* New wide conversation starter at the top */}
        <motion.button
          className={cn(
            "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "bg-teal-50 border-teal-200 hover:bg-teal-100",
            "col-span-1 md:col-span-2 mb-1", // Span 2 columns on md screens and above
          )}
          onClick={() => onSelectStarter("Interview me about my personal health history.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-teal-500 group-hover:text-teal-600">
              <ClipboardList size={18} />
            </div>
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium">
              Interview me about my personal health history.
            </p>
          </div>
        </motion.button>

        {/* Updated regular tiles */}
        <motion.button
          className={cn(
            "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "bg-blue-50 border-blue-200 hover:bg-blue-100",
          )}
          onClick={() => onSelectStarter("Explain the five biological laws using examples.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-blue-500 group-hover:text-blue-600">
              <BookOpen size={18} />
            </div>
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
              Explain the five biological laws using examples.
            </p>
          </div>
        </motion.button>

        <motion.button
          className={cn(
            "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "bg-green-50 border-green-200 hover:bg-green-100",
          )}
          onClick={() => onSelectStarter("Share insights or stories from GNM resources.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-green-500 group-hover:text-green-600">
              <MessageSquare size={18} />
            </div>
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
              Share insights or stories from GNM resources.
            </p>
          </div>
        </motion.button>

        <motion.button
          className={cn(
            "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "bg-purple-50 border-purple-200 hover:bg-purple-100",
          )}
          onClick={() => onSelectStarter("Tell me how GNM provides a different lens for understanding health issues.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-purple-500 group-hover:text-purple-600">
              <Activity size={18} />
            </div>
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
              Tell me how GNM provides a different lens for understanding health issues.
            </p>
          </div>
        </motion.button>

        {/* Updated amber tile with new text and icon */}
        <motion.button
          className={cn(
            "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "bg-amber-50 border-amber-200 hover:bg-amber-100",
          )}
          onClick={() => onSelectStarter("Explain the key exceptions to GNM.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-amber-500 group-hover:text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
              Explain the key exceptions to GNM.
            </p>
          </div>
        </motion.button>

        {/* Bottom wide conversation starter */}
        <motion.button
          className={cn(
            "group text-left p-4 border rounded-xl transition-colors duration-300 shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            "bg-red-50 border-red-200 hover:bg-red-100",
            "col-span-1 md:col-span-2 mt-1", // Span 2 columns on md screens and above
          )}
          onClick={() => onSelectStarter("Help me troubleshoot a symptom.")}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 transition-colors duration-300 text-red-500 group-hover:text-red-600">
              <Stethoscope size={18} />
            </div>
            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300 font-medium">
              Help me troubleshoot a symptom.
            </p>
          </div>
        </motion.button>
      </motion.div>
    </div>
  )
}
