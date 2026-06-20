/**
 * EventPilot AI - Event Intake Page
 * Phase 3: Conversational intake with text + voice toggle
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  inputMode?: 'text' | 'voice';
}

export default function IntakePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm EventPilot AI. I'll help you plan your event. Tell me about what you're planning, or I can ask you some questions to get started.",
    },
  ]);
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventId, setEventId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage, inputMode }]);

    try {
      // Call the orchestrator agent
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          inputMode,
          eventId,
          organizerId: 'demo-organizer-1', // TODO: Get from auth
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add assistant response
        setMessages(prev => [...prev, { role: 'assistant', content: result.data.response }]);

        // Update event ID if created
        if (result.data.eventId) {
          setEventId(result.data.eventId);
        }

        // If complete, redirect to dashboard
        if (result.data.isComplete && result.data.eventId) {
          setTimeout(() => {
            router.push(`/dashboard?eventId=${result.data.eventId}`);
          }, 2000);
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
        ]);
      }
    } catch (error) {
      console.error('Intake error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (inputMode === 'text') {
      setInputMode('voice');
      startRecording();
    } else {
      setInputMode('text');
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      // TODO: Integrate Vapi speech-to-text
      setIsRecording(true);
      alert('Voice recording will be integrated with Vapi in the next step. For now, please use text input.');
      setInputMode('text');
      setIsRecording(false);
    } catch (error) {
      console.error('Recording error:', error);
      setInputMode('text');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Anthea
              </h1>
              <p className="text-sm text-gray-400">AI Event Planning Assistant</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Input:</span>
              <button
                onClick={handleVoiceToggle}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  inputMode === 'voice'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                }`}
              >
                {inputMode === 'voice' ? '🎤 Voice' : '⌨️ Text'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Messages */}
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-[#2a2a2a] text-gray-100'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.inputMode && message.role === 'user' && (
                      <span className="text-xs opacity-75 mt-1 block">
                        {message.inputMode === 'voice' ? '🎤 Voice' : '⌨️ Text'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-[#2a2a2a] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t border-[#2a2a2a] p-4 bg-[#1a1a1a]">
              <form onSubmit={handleSubmit} className="flex gap-3">
                {inputMode === 'text' ? (
                  <>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Describe your event..."
                      disabled={isProcessing}
                      className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isProcessing}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Send
                    </button>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={stopRecording}
                      className={`px-8 py-4 rounded-xl font-medium transition ${
                        isRecording
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      }`}
                    >
                      {isRecording ? '🔴 Recording... (Tap to stop)' : '🎤 Hold to speak'}
                    </button>
                  </div>
                )}
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {inputMode === 'voice'
                  ? 'Voice mode powered by Vapi (coming soon - use text for now)'
                  : 'Press Enter to send, or switch to voice mode'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Made with Bob
