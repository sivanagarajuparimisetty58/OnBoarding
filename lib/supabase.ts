import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://neclltgwsfknlzaehkln.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lY2xsdGd3c2Zrbmx6YWVoa2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NDg0MzUsImV4cCI6MjA3MDMyNDQzNX0.QgrBr-3grYXUPkFYk_MrFh4pdwBFMGKUzs0sWvNYN6Q"

export const supabase = createClient(supabaseUrl, supabaseKey)

export type User = {
  id: string
  email: string
  password: string
  about_me?: string
  street_address?: string
  city?: string
  state?: string
  zip?: string
  birthdate?: string
  current_step: number
  completed: boolean
  created_at: string
  updated_at: string
}

export type OnboardingConfig = {
  id: string
  page_number: number
  component_name: 'about_me' | 'address' | 'birthdate'
  created_at: string
  updated_at: string
}

export type ComponentType = 'about_me' | 'address' | 'birthdate'