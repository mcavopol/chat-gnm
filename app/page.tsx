import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">ChatGNM</h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Explore and understand the principles of German New Medicine through an AI-powered conversation.
        </p>
        <div>
          <Link href="/chat">
            <Button size="lg" className="px-8 py-6 text-lg rounded-full bg-blue-600 hover:bg-blue-700">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
