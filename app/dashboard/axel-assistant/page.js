'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AxelAssistantPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [axelMood, setAxelMood] = useState('idle') // idle, thinking, happy, wave, celebrate
  const messagesEndRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        // Initial greeting
        setTimeout(() => {
          setAxelMood('wave')
          setTimeout(() => {
            setMessages([{
              role: 'assistant',
              content: "Hey there! 👋 I'm AXEL, your AI teaching assistant! I'm here to help you find the right tools, answer questions about using AI in education, and make your life a little easier. What can I help you with today?",
              timestamp: new Date()
            }])
            setAxelMood('idle')
          }, 500)
        }, 300)
      } else {
        router.push('/auth/login')
      }
    }
    checkSession()
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const quickQuestions = [
    { icon: '🔧', text: 'What tools do you have?', category: 'tools' },
    { icon: '📝', text: 'Help me write IEP updates', category: 'tools' },
    { icon: '💡', text: 'How do I write better prompts?', category: 'ai-tips' },
    { icon: '🔒', text: 'Is my student data safe?', category: 'privacy' },
    { icon: '⚖️', text: 'AI ethics for teachers', category: 'ethics' },
    { icon: '⏱️', text: 'What saves the most time?', category: 'tools' },
  ]

  const handleSend = async (messageText = inputValue) => {
    if (!messageText.trim()) return

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setAxelMood('thinking')

    try {
      const response = await fetch('/api/axel-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      })

      const data = await response.json()

      if (data.error) {
        setAxelMood('idle')
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Oops! I had a little hiccup there. Could you try asking again? 🦎",
          timestamp: new Date()
        }])
      } else {
        // Check if response contains celebration triggers
        const isCelebration = data.response.includes('Great') || data.response.includes('Awesome') || data.response.includes('Perfect')
        setAxelMood(isCelebration ? 'celebrate' : 'happy')
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          toolSuggestions: data.toolSuggestions || [],
          timestamp: new Date()
        }])

        // Return to idle after a moment
        setTimeout(() => setAxelMood('idle'), 2000)
      }
    } catch (error) {
      setAxelMood('idle')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment! 🦎",
        timestamp: new Date()
      }])
    }

    setIsTyping(false)
  }

  const handleQuickQuestion = (question) => {
    handleSend(question.text)
  }

  const handleToolClick = (toolId) => {
    router.push(`/dashboard/${toolId}`)
  }

  const getAxelAnimation = () => {
    switch (axelMood) {
      case 'thinking':
        return 'animate-bounce'
      case 'happy':
        return 'animate-wiggle'
      case 'wave':
        return 'animate-wave'
      case 'celebrate':
        return 'animate-celebrate'
      default:
        return 'animate-float'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-4 animate-bounce">
            <img src="/axolotl-mascot.png" alt="AXEL" className="w-full h-full object-contain" />
          </div>
          <p className="text-gray-500 text-lg">AXEL is waking up...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(-5deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-5deg); }
        }
        @keyframes glow {
          0%, 100% { 
            filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.4)) drop-shadow(0 0 20px rgba(147, 51, 234, 0.3));
          }
          50% { 
            filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.5)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.3));
          }
        }
        @keyframes glow-ring {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.3), 0 0 40px rgba(147, 51, 234, 0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 40px rgba(147, 51, 234, 0.5), 0 0 80px rgba(147, 51, 234, 0.3);
            transform: scale(1.05);
          }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
        .animate-wave { animation: wave 0.8s ease-in-out; }
        .animate-celebrate { animation: celebrate 0.6s ease-in-out; }
        .animate-glow { animation: glow 1.5s ease-in-out infinite; }
        .animate-glow-ring { animation: glow-ring 1.5s ease-in-out infinite; }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        .thinking-ring {
          animation: pulse-ring 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-purple-600 transition-colors">Dashboard</button>
              <span className="text-gray-300">›</span>
              <span className="text-gray-800 font-medium">AXEL Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
              <span className="text-xs text-gray-500">{isTyping ? 'Thinking...' : 'Online'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {/* AXEL Avatar Area */}
        <div className="flex justify-center py-6">
          <div className="relative">
            {/* Glow ring when responding */}
            {(axelMood === 'happy' || axelMood === 'celebrate') && (
              <div className="absolute inset-0 -m-6">
                <div className="w-72 h-72 rounded-full bg-purple-200/30 animate-glow-ring" />
              </div>
            )}
            {/* Thinking ring and glow */}
            {axelMood === 'thinking' && (
              <div className="absolute inset-0 -m-6">
                <div className="w-72 h-72 rounded-full border-4 border-purple-300 thinking-ring bg-purple-100/20" />
              </div>
            )}
            {/* Celebration sparkles */}
            {axelMood === 'celebrate' && (
              <>
                <span className="absolute -top-4 -left-4 text-3xl animate-ping">✨</span>
                <span className="absolute -top-4 -right-4 text-3xl animate-ping" style={{animationDelay: '0.2s'}}>⭐</span>
                <span className="absolute -bottom-4 left-1/2 text-3xl animate-ping" style={{animationDelay: '0.4s'}}>🎉</span>
              </>
            )}
            <div className={`w-60 h-60 ${getAxelAnimation()} ${axelMood === 'thinking' ? 'animate-glow' : ''} ${(axelMood === 'happy' || axelMood === 'celebrate') ? 'animate-glow' : ''}`}>
              <img 
                src="/axolotl-mascot.png" 
                alt="AXEL" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-100 shadow-sm rounded-bl-md'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-purple-600">AXEL</span>
                    <span className="text-xs">🦎</span>
                  </div>
                )}
                <p className={`text-sm whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                  {message.content}
                </p>
                
                {/* Tool Suggestions */}
                {message.toolSuggestions && message.toolSuggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Suggested tools:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.toolSuggestions.map((tool, i) => (
                        <button
                          key={i}
                          onClick={() => handleToolClick(tool.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                        >
                          <span>{tool.icon}</span>
                          <span>{tool.name}</span>
                          <span className="text-purple-400">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-purple-600">AXEL</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions - show only at start */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-500 mb-2 text-center">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickQuestion(q)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AXEL anything about teaching tools, AI, or getting started..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                <span>Send</span>
                <span>→</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              AXEL is here to help! I know all about our tools, AI best practices, and teacher workflows. 🦎
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}