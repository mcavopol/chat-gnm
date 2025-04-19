import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ChatGNM",
  description: "Explore and understand the principles of German New Medicine through an AI-powered conversation.",
    generator: 'v0.dev'
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>
        <AuthProvider>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'