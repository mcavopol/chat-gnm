"use client"

import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface MessageContentProps {
  content: string
  className?: string
}

export function MessageContent({ content, className }: MessageContentProps) {
  const [renderError, setRenderError] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

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
            h1: ({ node, ...props }) => <h1 className="text-xl md:text-2xl font-bold my-2 md:my-3" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg md:text-xl font-bold my-2 md:my-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-md md:text-lg font-bold my-2" {...props} />,
            h4: ({ node, ...props }) => <h4 className="font-bold my-1 md:my-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-2 md:my-3" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 md:my-3" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 md:my-3" {...props} />,
            li: ({ node, ...props }) => <li className="my-1 md:my-2" {...props} />,
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
                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm md:text-base" {...props} />
              ) : (
                <code
                  className="block bg-gray-200 p-2 rounded text-sm md:text-base overflow-x-auto my-2 md:my-3"
                  {...props}
                />
              ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 md:my-3" {...props} />
            ),
            hr: ({ node, ...props }) => <hr className="my-4 md:my-6 border-gray-300" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            img: ({ node, ...props }) => {
              // Handle potential blob URLs that might cause issues
              const src = props.src || ""
              if (src.startsWith("blob:")) {
                return <span className="text-gray-500">[Image unavailable]</span>
              }
              return <img className="max-w-full my-2 md:my-3 rounded" alt={props.alt || "Image"} {...props} />
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
