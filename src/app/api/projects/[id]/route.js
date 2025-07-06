import { NextResponse } from 'next/server'
import { projectsDB } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const projectId = params.id
    
    const project = await projectsDB.getProject(projectId)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const projectId = params.id
    const body = await request.json()
    
    const project = await projectsDB.updateProject(projectId, body)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const projectId = params.id
    
    await projectsDB.deleteProject(projectId)
    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
} 