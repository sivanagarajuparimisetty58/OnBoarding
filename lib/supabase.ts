import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ixuszdrnotgbvrugehvy.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXN6ZHJub3RnYnZydWdlaHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MjcwMDgsImV4cCI6MjA3MDIwMzAwOH0.e7fG85OdpYxk8Npu76Tn99pVLxLuAAiARHWvF_yIkCQ"

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