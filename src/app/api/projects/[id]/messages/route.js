import { NextResponse } from 'next/server'
import { messagesDB } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const projectId = params.id
    
    const messages = await messagesDB.getMessages(projectId)
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const projectId = params.id
    const body = await request.json()
    const { messageType, content, iterationId } = body
    
    if (!messageType || !content) {
      return NextResponse.json({ 
        error: 'Message type and content are required' 
      }, { status: 400 })
    }
    
    const messageData = {
      project_id: projectId,
      iteration_id: iterationId,
      message_type: messageType,
      content
    }
    
    const message = await messagesDB.createMessage(messageData)
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
} 