"use client"

import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState, useEffect } from "react"

interface MessageContentProps {
  content: string
  className?: string
}

export function MessageContent({ content, className }: MessageContentProps) {
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    // Reset error state when content changes
    setRenderError(null)
  }, [content])

  if (renderError) {
    return <div className={cn("text-red-500", className)}>Error rendering message. Please try again.</div>
  }

  try {
    return (
      <div className={cn("markdown-content", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2" {...props} />,
            h4: ({ node, ...props }) => <h4 className="font-bold my-1" {...props} />,
            p: ({ node, ...props }) => <p className="my-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
            li: ({ node, ...props }) => <li className="my-1" {...props} />,
            a: ({ node, ...props }) => (
              <a
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
                onClick={(e) => {
                  // Prevent navigation if URL is a blob URL that might cause issues
                  const href = props.href || ""
                  if (href.startsWith("blob:")) {
                    e.preventDefault()
                    console.warn("Prevented navigation to blob URL:", href)
                  }
                }}
              />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props} />
              ) : (
                <code className="block bg-gray-200 p-2 rounded text-sm overflow-x-auto my-2" {...props} />
              ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
            ),
            hr: ({ node, ...props }) => <hr className="my-4 border-gray-300" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            img: ({ node, ...props }) => {
              // Handle potential blob URLs that might cause issues
              const src = props.src || ""
              if (src.startsWith("blob:")) {
                return <span className="text-gray-500">[Image unavailable]</span>
              }
              return <img className="max-w-full my-2 rounded" alt={props.alt || "Image"} {...props} />
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  } catch (error) {
    console.error("Error rendering message content:", error)
    setRenderError(String(error))
    return <div className={cn("text-red-500", className)}>Error rendering message. Please try again.</div>
  }
}
