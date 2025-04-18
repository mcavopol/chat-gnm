import { AdminPanel } from "@/components/admin-panel"
import { getSystemPrompt } from "@/lib/system-prompt"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminPage() {
  const systemPrompt = await getSystemPrompt()

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-4">
        <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to Chat
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
      <AdminPanel initialPrompt={systemPrompt} />
    </div>
  )
}
