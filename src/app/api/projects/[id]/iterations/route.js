import { NextResponse } from 'next/server'
import { iterationsDB } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const projectId = params.id
    
    const iterations = await iterationsDB.getIterations(projectId)
    return NextResponse.json(iterations)
  } catch (error) {
    console.error('Error fetching iterations:', error)
    return NextResponse.json({ error: 'Failed to fetch iterations' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { prompt, generatedCode, features, modificationSummary, versionNumber, isCurrent } = body
    
    if (!prompt || !generatedCode || !versionNumber) {
      return NextResponse.json({ 
        error: 'Prompt, generated code, and version number are required' 
      }, { status: 400 })
    }
    
    const iterationData = {
      project_id: projectId,
      version_number: versionNumber,
      prompt,
      generated_code: generatedCode,
      features: features || [],
      modification_summary: modificationSummary,
      is_current: isCurrent || false
    }
    
    const iteration = await iterationsDB.createIteration(iterationData)
    return NextResponse.json(iteration, { status: 201 })
  } catch (error) {
    console.error('Error creating iteration:', error)
    return NextResponse.json({ error: 'Failed to create iteration' }, { status: 500 })
  }
} 