import { NextResponse } from 'next/server'
import { projectsDB } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    const projects = await projectsDB.getProjects(userId)
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, name, description, initialPrompt, businessName, templateType } = body
    
    if (!userId || !name || !initialPrompt) {
      return NextResponse.json({ 
        error: 'User ID, name, and initial prompt are required' 
      }, { status: 400 })
    }
    
    const projectData = {
      user_id: userId,
      name,
      description,
      initial_prompt: initialPrompt,
      business_name: businessName,
      template_type: templateType,
      status: 'active'
    }
    
    const project = await projectsDB.createProject(projectData)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
} 