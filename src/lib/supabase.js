import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database helper functions
export const projectsDB = {
  // Create a new project
  async createProject(projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all projects for a user
  async getProjects(userId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get a specific project
  async getProject(projectId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (error) throw error
    return data
  },

  // Update a project
  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a project
  async deleteProject(projectId) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    if (error) throw error
  }
}

export const iterationsDB = {
  // Create a new iteration
  async createIteration(iterationData) {
    const { data, error } = await supabase
      .from('iterations')
      .insert([iterationData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all iterations for a project
  async getIterations(projectId) {
    const { data, error } = await supabase
      .from('iterations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get the latest iteration for a project
  async getLatestIteration(projectId) {
    const { data, error } = await supabase
      .from('iterations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    return data
  },

  // Get a specific iteration
  async getIteration(iterationId) {
    const { data, error } = await supabase
      .from('iterations')
      .select('*')
      .eq('id', iterationId)
      .single()
    
    if (error) throw error
    return data
  }
}

export const messagesDB = {
  // Create a new message
  async createMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all messages for a project
  async getMessages(projectId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }
} 