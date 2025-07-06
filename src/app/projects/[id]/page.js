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

  useEffect(() => {
    // Get the initial prompt from sessionStorage
    const initialPrompt = sessionStorage.getItem(`project-${projectId}`)
    if (initialPrompt) {
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
      generateApp(initialPrompt)
      
      // Clean up sessionStorage
      sessionStorage.removeItem(`project-${projectId}`)
    }
  }, [projectId])

  const generateApp = async (userInput, isModification = false) => {
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
      
      if (isModification) {
        // For modifications, update the live code
        setLiveCode(result)
        
        // Add success message for modification
        const successMessage = {
          id: Date.now(),
          type: 'assistant',
          content: result.modificationSummary || 'I\'ve updated your app based on your request. The changes are now visible in the preview.'
        }
        
        setMessages(prev => [...prev, successMessage])
      } else {
        // For new generation, set both generated and live code
        setGeneratedCode(result)
        setLiveCode(result)
        
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
                {codeForPreview?.customizations?.businessName || 'New Project'}
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