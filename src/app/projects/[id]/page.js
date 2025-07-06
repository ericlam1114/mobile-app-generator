'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Code, Eye, Download, Smartphone, RefreshCw, Share2, Play } from 'lucide-react'
import MobilePreview from '@/components/MobilePreview'
import CodeEditor from '@/components/CodeEditor'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [activeView, setActiveView] = useState('preview')
  const [liveCode, setLiveCode] = useState(null)
  const [project, setProject] = useState(null)
  const [iterations, setIterations] = useState([])
  const [currentIteration, setCurrentIteration] = useState(null)
  const [loading, setLoading] = useState(true)

  // Demo user ID - in a real app, this would come from authentication
  const DEMO_USER_ID = 'demo-user-123'

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      
      // Check if this is a new project from sessionStorage
      const initialPrompt = sessionStorage.getItem(`project-${projectId}`)
      if (initialPrompt) {
        // Create new project in database
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: DEMO_USER_ID,
            name: 'New Project',
            description: 'Generated from prompt',
            initialPrompt: initialPrompt,
            businessName: 'App'
          })
        })
        
        if (response.ok) {
          const newProject = await response.json()
          setProject(newProject)
          
          // Initialize with the prompt
          setMessages([
            {
              id: 1,
              type: 'user',
              content: initialPrompt
            },
            {
              id: 2,
              type: 'assistant',
              content: "I'll help you build that app. Let me generate the initial version for you..."
            }
          ])
          
          // Trigger app generation
          generateApp(initialPrompt, false, newProject.id)
          
          // Clean up sessionStorage
          sessionStorage.removeItem(`project-${projectId}`)
        }
      } else {
        // Load existing project
        const [projectResponse, messagesResponse, iterationsResponse] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/messages`),
          fetch(`/api/projects/${projectId}/iterations`)
        ])
        
        if (projectResponse.ok && messagesResponse.ok && iterationsResponse.ok) {
          const [projectData, messagesData, iterationsData] = await Promise.all([
            projectResponse.json(),
            messagesResponse.json(),
            iterationsResponse.json()
          ])
          
          setProject(projectData)
          setMessages(messagesData.map(msg => ({
            id: msg.id,
            type: msg.message_type,
            content: msg.content
          })))
          setIterations(iterationsData)
          
          // Set current iteration
          const current = iterationsData.find(it => it.is_current) || iterationsData[0]
          if (current) {
            setCurrentIteration(current)
            setGeneratedCode(current.generated_code)
            setLiveCode(current.generated_code)
          }
        }
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateApp = async (userInput, isModification = false, projectIdOverride = null) => {
    setIsGenerating(true)
    
    try {
      const requestBody = {
        userInput,
        isModification,
        existingCode: isModification ? (liveCode || generatedCode) : null
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to generate app')
      }

      const result = await response.json()
      const currentProjectId = projectIdOverride || project?.id
      
      if (isModification) {
        // For modifications, update the live code
        setLiveCode(result)
        
        // Create new iteration
        if (currentProjectId) {
          const nextVersion = Math.max(...iterations.map(i => i.version_number), 0) + 1
          
          const iterationResponse = await fetch(`/api/projects/${currentProjectId}/iterations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userInput,
              generatedCode: result,
              features: result.features || [],
              modificationSummary: result.modificationSummary,
              versionNumber: nextVersion,
              isCurrent: true
            })
          })
          
          if (iterationResponse.ok) {
            const newIteration = await iterationResponse.json()
            setIterations(prev => [newIteration, ...prev])
            setCurrentIteration(newIteration)
          }
        }
        
        // Add success message for modification
        const successMessage = {
          id: Date.now(),
          type: 'assistant',
          content: result.modificationSummary || 'I\'ve updated your app based on your request. The changes are now visible in the preview.'
        }
        
        setMessages(prev => [...prev, successMessage])
        
        // Save message to database
        if (currentProjectId) {
          await fetch(`/api/projects/${currentProjectId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageType: 'assistant',
              content: successMessage.content,
              iterationId: currentIteration?.id
            })
          })
        }
      } else {
        // For new generation, set both generated and live code
        setGeneratedCode(result)
        setLiveCode(result)
        
        // Create initial iteration
        if (currentProjectId) {
          const iterationResponse = await fetch(`/api/projects/${currentProjectId}/iterations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userInput,
              generatedCode: result,
              features: result.features || [],
              versionNumber: 1,
              isCurrent: true
            })
          })
          
          if (iterationResponse.ok) {
            const newIteration = await iterationResponse.json()
            setIterations([newIteration])
            setCurrentIteration(newIteration)
          }
        }
        
        // Add success message
        const successMessage = {
          id: Date.now(),
          type: 'assistant',
          content: `Great! I've generated a ${result.template} for "${result.customizations.businessName}". 

**Features included:**
${result.features.map(f => `• ${f}`).join('\n')}

The app is ready with ${Object.keys(result.files).length} files. You can see the preview on the right, edit the code, or download the project.`
        }
        
        setMessages(prev => [...prev, successMessage])
        
        // Save messages to database
        if (currentProjectId) {
          await Promise.all([
            fetch(`/api/projects/${currentProjectId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messageType: 'user',
                content: userInput,
                iterationId: currentIteration?.id
              })
            }),
            fetch(`/api/projects/${currentProjectId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messageType: 'assistant',
                content: successMessage.content,
                iterationId: currentIteration?.id
              })
            })
          ])
        }
      }
    } catch (error) {
      console.error('Error generating app:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: "Sorry, I had trouble processing your request. Please try again or be more specific about what you want."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')

    // Save user message to database
    if (project?.id) {
      await fetch(`/api/projects/${project.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageType: 'user',
          content: currentInput,
          iterationId: currentIteration?.id
        })
      })
    }

    // Determine if this is a modification request
    const isModification = generatedCode !== null
    
    // Generate or modify app
    await generateApp(currentInput, isModification)
  }

  const handleCodeChange = (filename, newCode, allFiles) => {
    // Update the live code state which will be used by the preview
    setLiveCode({
      ...liveCode,
      files: allFiles
    })
  }

  const downloadProject = async () => {
    const codeToDownload = liveCode || generatedCode
    if (!codeToDownload) return

    try {
      const lastUserMessage = messages.filter(m => m.type === 'user').pop()
      if (!lastUserMessage) return

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userInput: lastUserMessage.content,
          downloadType: 'zip',
          customFiles: codeToDownload.files // Send the edited files
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate zip file')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${codeToDownload.appName}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading project:', error)
      alert('Failed to download project. Please try again.')
    }
  }

  // Use liveCode for preview if available, otherwise use generatedCode
  const codeForPreview = liveCode || generatedCode

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="font-semibold text-gray-900">
                {project?.name || codeForPreview?.customizations?.businessName || 'New Project'}
              </h1>
              <p className="text-sm text-gray-500">Mobile App</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            
            <button 
              onClick={() => {
                setLiveCode(generatedCode)
                setActiveView('preview')
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset to original code"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={downloadProject}
              disabled={!generatedCode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Play className="w-4 h-4" />
              Deploy
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Iterations Sidebar */}
          {iterations.length > 1 && (
            <div className="border-b border-gray-200 p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Versions</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {iterations.map((iteration) => (
                  <button
                    key={iteration.id}
                    onClick={() => {
                      setCurrentIteration(iteration)
                      setLiveCode(iteration.generated_code)
                      setGeneratedCode(iteration.generated_code)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentIteration?.id === iteration.id
                        ? 'bg-purple-100 text-purple-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>v{iteration.version_number}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(iteration.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {iteration.modification_summary && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {iteration.modification_summary}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Chat Section */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat
            </h2>
            {generatedCode && (
              <p className="text-xs text-gray-500 mt-1">
                Ask me to modify your app - try "change the color to blue" or "add a new menu item"
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg whitespace-pre-line ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    {generatedCode ? 'Updating your app...' : 'Generating your app...'}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={generatedCode ? "Ask for changes..." : "Describe your app..."}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <button
                onClick={handleSendMessage}
                disabled={isGenerating || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview/Code */}
        <div className="flex-1 flex flex-col">
          {/* View Toggle */}
          <div className="bg-white border-b border-gray-200 p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'preview' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              
              <button
                onClick={() => setActiveView('code')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'code' 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Code className="w-4 h-4" />
                Code
              </button>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {activeView === 'preview' ? (
              <MobilePreview generatedCode={codeForPreview} />
            ) : (
              <CodeEditor 
                generatedCode={codeForPreview} 
                onCodeChange={handleCodeChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 