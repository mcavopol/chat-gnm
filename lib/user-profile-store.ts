"use server"

import { nanoid } from "nanoid"
import crypto from "crypto"

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  gravatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

// In a real app, this would be stored in a database
let userProfile: UserProfile | null = null

export async function getUserProfile(): Promise<UserProfile | null> {
  return userProfile
}

export async function createUserProfile(email: string): Promise<UserProfile> {
  // Generate Gravatar URL
  const gravatarUrl = getGravatarUrl(email)

  const newProfile: UserProfile = {
    id: nanoid(),
    email,
    gravatarUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  userProfile = newProfile
  console.log(`Created user profile for email: ${email}`)
  return newProfile
}

export async function updateUserProfile(
  updates: Partial<Omit<UserProfile, "id" | "createdAt" | "updatedAt">>,
): Promise<UserProfile | null> {
  if (!userProfile) {
    console.error("No user profile exists to update")
    return null
  }

  userProfile = {
    ...userProfile,
    ...updates,
    updatedAt: new Date(),
  }

  console.log(`Updated user profile: ${JSON.stringify(updates)}`)
  return userProfile
}

export async function clearUserProfile(): Promise<void> {
  userProfile = null
  console.log("Cleared user profile")
}

// Helper function to generate Gravatar URL
function getGravatarUrl(email: string): string {
  const trimmedEmail = email.trim().toLowerCase()
  const hash = crypto.createHash("md5").update(trimmedEmail).digest("hex")
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=200`
}
