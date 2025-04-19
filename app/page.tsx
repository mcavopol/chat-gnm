import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect users directly to the chat interface
  redirect("/chat")
}
