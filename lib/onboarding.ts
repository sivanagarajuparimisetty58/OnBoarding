import { supabase, type User, type OnboardingConfig, type ComponentType } from './supabase'

export async function createUser(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({ email, password })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single()
    
    if (error) {
      return null
    }
    
    return data
  } catch (error) {
    return null
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select()
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getOnboardingConfig(): Promise<Record<number, ComponentType[]>> {
  try {
    const { data, error } = await supabase
      .from('onboarding_config')
      .select()
      .order('page_number', { ascending: true })
    
    if (error) {
      console.error('Error fetching config:', error)
      return { 2: ['about_me'], 3: ['address'] }
    }
    
    const config: Record<number, ComponentType[]> = { 2: [], 3: [] }
    
    data?.forEach((item: OnboardingConfig) => {
      if (!config[item.page_number]) {
        config[item.page_number] = []
      }
      config[item.page_number].push(item.component_name)
    })
    
    // Ensure each page has at least one component
    if (config[2].length === 0) config[2].push('about_me')
    if (config[3].length === 0) config[3].push('address')
    
    return config
  } catch (error) {
    console.error('Error fetching config:', error)
    return { 2: ['about_me'], 3: ['address'] }
  }
}

export async function updateOnboardingConfig(config: Record<number, ComponentType[]>): Promise<boolean> {
  try {
    // Delete existing config
    await supabase.from('onboarding_config').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Insert new config
    const insertData: Array<{ page_number: number; component_name: ComponentType }> = []
    
    Object.entries(config).forEach(([page, components]) => {
      components.forEach((component) => {
        insertData.push({
          page_number: parseInt(page),
          component_name: component
        })
      })
    })
    
    const { error } = await supabase
      .from('onboarding_config')
      .insert(insertData)
    
    if (error) {
      console.error('Error updating config:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error updating config:', error)
    return false
  }
}