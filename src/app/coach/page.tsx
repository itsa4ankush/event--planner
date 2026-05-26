"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Target,
  Heart,
  Calendar,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

type Message = {
  id: string;
  role: "coach" | "user";
  content: string;
  timestamp: string;
};

type FriendshipStage = "initial" | "follow-up" | "deepening" | "sustained";

const stageInfo: Record<FriendshipStage, { label: string; color: string; icon: typeof Target }> = {
  initial: { label: "Initial Meet-Up", color: "var(--primary)", icon: Target },
  "follow-up": { label: "Follow-Up", color: "var(--accent)", icon: Calendar },
  deepening: { label: "Deepening", color: "var(--success)", icon: Heart },
  sustained: { label: "Sustained", color: "#8b5cf6", icon: MessageCircle },
};

const coachResponses: Record<FriendshipStage, string[]> = {
  initial: [
    "Great job putting yourself out there! The hardest part is showing up, and you've already done that. What felt natural about the conversation?",
    "Remember, the goal isn't to be perfect — it's to be genuine. People connect with authenticity, not polish. What's one thing you'd like to follow up on?",
    "First meetings are like planting seeds. You don't need to grow a whole garden today. Just make sure they know you enjoyed meeting them.",
    "I noticed you connected with someone new! That takes courage. What drew you to start that conversation?",
  ],
  "follow-up": [
    "Following up shows you value the connection. A simple 'Hey, I enjoyed our chat about X' goes a long way. Want me to help draft something?",
    "The 24-hour window is your friend here. People are most receptive right after meeting. What feels like a natural next step?",
    "Don't overthink it! A follow-up doesn't need to be elaborate. Even a quick message referencing something specific you discussed shows you were listening.",
    "You're in the sweet spot for follow-up. The connection is still fresh. What activity would feel low-pressure for both of you?",
  ],
  deepening: [
    "You're moving past surface-level! This is where real friendships form. Shared experiences create stronger bonds than just conversations.",
    "At this stage, vulnerability builds trust. It's okay to share something a bit more personal. What's something you'd like them to know about you?",
    "Consistency is key now. Regular check-ins, even brief ones, signal that this friendship matters to you. How often feels right?",
    "You're doing amazing! The fact that you're both still engaging means there's genuine mutual interest. What's an activity you'd both enjoy?",
  ],
  sustained: [
    "Look at you! This connection has real staying power. The key now is maintaining without forcing. Quality over quantity.",
    "Sustained friendships thrive on reciprocity. Make sure you're both initiating. How does the balance feel?",
    "You've built something meaningful here. Remember to celebrate that! Not every connection reaches this stage, and that's okay.",
    "At this point, you can relax into the friendship. The foundation is solid. What would make this friendship even more fulfilling?",
  ],
};

const quickPrompts = [
  "I'm nervous about following up",
  "What should I say?",
  "How do I suggest meeting again?",
  "I feel like I'm bothering them",
  "Help me stay motivated",
];

export default function CoachPage() {
  const [stage, setStage] = useState<FriendshipStage>("initial");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "coach",
      content:
        "Hey! 👋 I'm your Connection Coach. I'm here to help you turn new meetings into real friendships. What stage are you at with a connection right now?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getCoachResponse = (userMessage: string): string => {
    const responses = coachResponses[stage];
    // Simple keyword matching for contextual responses
    const lower = userMessage.toLowerCase();

    if (lower.includes("nervous") || lower.includes("anxious") || lower.includes("scared")) {
      return "It's completely normal to feel nervous! Remember, the other person probably feels the same way. Start small — a brief, friendly message is all you need. You've got this! 💪";
    }
    if (lower.includes("bother") || lower.includes("annoying") || lower.includes("too much")) {
      return "You're not bothering them! If someone gave you their contact info or engaged in conversation, they're open to hearing from you. One follow-up message is never too much. Trust the signals.";
    }
    if (lower.includes("what should i say") || lower.includes("what to say")) {
      return "Keep it simple and specific! Reference something from your conversation: 'Hey [name], I really enjoyed talking about [topic]. Would you be up for [low-pressure activity] sometime this week?' Specific > generic every time.";
    }
    if (lower.includes("motivated") || lower.includes("give up") || lower.includes("worth it")) {
      return "Building friendships is a skill, and you're actively practicing it. Every connection you nurture is progress toward your goal. Even if some don't work out, you're growing. Keep going! 🌱";
    }
    if (lower.includes("reject") || lower.includes("ignored") || lower.includes("ghost")) {
      return "Not every connection will click, and that's okay — it's not a reflection of your worth. Some people are busy, some aren't in the right headspace. Focus on the ones who reciprocate your energy.";
    }

    // Default: pick a random stage-appropriate response
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate coach thinking
    setTimeout(() => {
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: getCoachResponse(content),
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, coachMsg]);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const currentStage = stageInfo[stage];

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--bg-elevated)] px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">AI Coach</h1>
              <p className="text-[10px] text-[var(--text-muted)]">Your friendship guide</p>
            </div>
          </div>
        </div>

        {/* Stage Selector */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {(Object.keys(stageInfo) as FriendshipStage[]).map((s) => {
            const info = stageInfo[s];
            const isActive = stage === s;
            return (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--bg-elevated)]"
                }`}
                style={isActive ? { backgroundColor: info.color } : {}}
              >
                <info.icon size={11} />
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-[var(--primary)] text-white rounded-br-md"
                  : "bg-[var(--bg-card)] border border-[var(--bg-elevated)] rounded-bl-md"
              }`}
            >
              {msg.role === "coach" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={10} className="text-[var(--primary-light)]" />
                  <span className="text-[10px] text-[var(--primary-light)] font-medium">Coach</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p
                className={`text-[10px] mt-1.5 ${
                  msg.role === "user" ? "text-white/60" : "text-[var(--text-muted)]"
                }`}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-5 py-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--bg-elevated)] text-[11px] text-[var(--text-secondary)] whitespace-nowrap hover:border-[var(--primary)]/50 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-5 py-3 border-t border-[var(--bg-elevated)] bg-[var(--bg)]"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach anything..."
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)] text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[var(--primary-dark)] transition-colors active:scale-95"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
}
