'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      content: "Hi! I'm Anthea, your AI event planner. Tell me about the event you're planning — what, where, when, and how many guests — and I'll take care of the rest.",
    },
  ]);
  const [input, setInput]         = useState('');
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventId, setEventId]     = useState<string | undefined>();
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Return focus to input after every AI response
  useEffect(() => {
    if (!isProcessing && !isComplete && inputMode === 'text') {
      inputRef.current?.focus();
    }
  }, [isProcessing]);

  const submitMessage = async (userMessage: string, mode: 'text' | 'voice') => {
    setIsProcessing(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage, inputMode: mode }]);
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, inputMode: mode, eventId, organizerId: 'demo-organizer-1' }),
      });
      const result = await res.json();
      if (result.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.data.response }]);
        if (result.data.eventId) setEventId(result.data.eventId);
        if (result.data.isComplete && result.data.eventId) {
          setIsComplete(true);
          setTimeout(() => router.push(`/dashboard?eventId=${result.data.eventId}`), 1800);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    const msg = input.trim();
    setInput('');
    await submitMessage(msg, 'text');
  };

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Voice input requires Chrome or Edge. Please use text mode.' }]);
      setInputMode('text');
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart  = () => setIsRecording(true);
    recognition.onresult = (e: any) => { setIsRecording(false); submitMessage(e.results[0][0].transcript, 'voice'); };
    recognition.onerror  = () => setIsRecording(false);
    recognition.onend    = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ── Header ── */}
      <header className="shrink-0 bg-white sticky top-0 z-40" style={{ borderBottom: '1px solid #E5E7EB', height: '64px' }}>
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.19 9.19 2 12l7.19 2.81L12 22l2.81-7.19L22 12l-7.19-2.81L12 2z" /></svg>
            </div>
            <span className="font-bold text-gray-900 text-[17px] tracking-tight">Anthea</span>
          </Link>
          <button
            onClick={() => setInputMode(m => m === 'text' ? 'voice' : 'text')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
              inputMode === 'voice'
                ? 'bg-violet-50 border-violet-300 text-violet-700'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {inputMode === 'voice'
              ? <><span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-blink" /> Voice</>
              : <><span className="text-base leading-none">⌨️</span> Text</>
            }
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[700px] mx-auto px-6 py-8 space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 animate-fade-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-sm mt-0.5">
                  ✦
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-sm shadow-sm shadow-violet-200'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm card-shadow'
                }`}
              >
                {msg.content}
                {msg.inputMode === 'voice' && msg.role === 'user' && (
                  <span className="block text-[10px] opacity-70 mt-1">🎤 voice</span>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-sm">
                ✦
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 card-shadow">
                {[0, 150, 300].map(d => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400"
                    style={{ animation: `blink 1.2s ease-in-out ${d}ms infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="flex justify-center animate-scale-in">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Event created — heading to dashboard…
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input bar — floating centered card ── */}
      <div className="shrink-0 pt-2 pb-6">
        <div className="max-w-[700px] mx-auto px-6">
          {inputMode === 'text' ? (
            <form onSubmit={handleSubmit}>
              <div
                className="flex items-center gap-2 p-2 rounded-2xl"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Describe your event…"
                  disabled={isProcessing || isComplete}
                  autoFocus
                  className="flex-1 px-4 py-2.5 bg-transparent text-sm text-gray-900 placeholder-gray-400 disabled:opacity-40 focus:outline-none"
                  style={{ border: 'none' }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing || isComplete}
                  className="shrink-0 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}
                >
                  Send
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center py-2">
              <button
                onClick={isRecording ? undefined : startRecording}
                disabled={isProcessing || isComplete}
                className={`flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-50 border-2 border-red-300 text-red-600 animate-pulse-ring'
                    : 'text-white shadow-sm shadow-violet-200'
                }`}
                style={!isRecording ? { background: 'linear-gradient(135deg, #7C3AED, #A855F7)' } : {}}
              >
                <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-blink' : 'bg-white'}`} />
                {isRecording ? 'Listening…' : 'Tap to speak'}
              </button>
            </div>
          )}
          <p className="text-center text-[11px] mt-3" style={{ color: '#9CA3AF' }}>
            {inputMode === 'voice' ? 'Voice via Web Speech API · Chrome/Edge' : 'Press Enter to send · toggle 🎤 for voice'}
          </p>
        </div>
      </div>
    </div>
  );
}
