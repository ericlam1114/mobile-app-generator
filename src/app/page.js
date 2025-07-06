'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Globe } from 'lucide-react'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    // Generate a project ID (in a real app, this would be from the backend)
    const projectId = Date.now().toString()
    
    // Store the prompt in sessionStorage to pass to the project page
    sessionStorage.setItem(`project-${projectId}`, prompt)
    
    // Navigate to the project page
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Lovable</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-700 hover:text-gray-900">Community</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Pricing</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Enterprise</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Learn</a>
              <a href="#" className="text-gray-700 hover:text-gray-900">Launched</a>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Get free credits
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">M</span>
                My Lovable
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold">
            Build your app in {' '}
            <span className="inline-flex items-center gap-2">
              {/* <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div> */}
              seconds
            </span>
          </h1>
          
          <p className="text-xl text-gray-600">
            Create apps and websites by chatting with AI
          </p>
          
          <form onSubmit={handleSubmit} className="mt-12">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Lovable to create a blog about..."
                className="w-full px-6 py-4 pr-20 text-lg bg-white rounded-2xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isGenerating}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Add"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                {/* <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <Globe className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Public</span>
                </div> */}
                
                {/* <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg border border-green-200"> */}
                  {/* <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg> */}
                  {/* <span className="text-sm text-green-700 font-medium">Supabase</span> */}
                  {/* <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div> */}
                
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Gradient Background Effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  )
}