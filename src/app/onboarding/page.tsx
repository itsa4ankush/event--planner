"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const goals = [
  "Building friendships",
  "Finding activity partners",
  "Converting event intros",
  "Professional networking",
  "Dating connections",
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = ["Morning", "Afternoon", "Evening", "Late Night"];
const meetingStyles = ["Coffee/Café", "Walk & Talk", "Lunch", "Activity-based", "Virtual"];
const tones = [
  { label: "Ease Anxiety", description: "Gentle, low-pressure messaging" },
  { label: "Combat Fatigue", description: "Short, energizing prompts" },
  { label: "Overcome Rejection Fear", description: "Confidence-building nudges" },
];

export default function Onboarding() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>("");

  const toggleItem = (item: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-[var(--text-secondary)] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Step 2 of 4</span>
          <div className="flex gap-1">
            <div className="w-6 h-1.5 rounded-full bg-[var(--primary)]" />
            <div className="w-6 h-1.5 rounded-full bg-[var(--primary)]" />
            <div className="w-6 h-1.5 rounded-full bg-[var(--bg-elevated)]" />
            <div className="w-6 h-1.5 rounded-full bg-[var(--bg-elevated)]" />
          </div>
        </div>
        <Link href="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-[var(--primary-light)]">
          Skip
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Personalize Your Experience</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Help us understand your social goals and preferences
      </p>

      {/* Goals */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Social Goals
        </h2>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleItem(goal, selectedGoals, setSelectedGoals)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedGoals.includes(goal)
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-elevated)] hover:border-[var(--primary)]"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </section>

      {/* Availability */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Availability
        </h2>
        <div className="flex gap-1.5 mb-3">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => toggleItem(day, selectedDays, setSelectedDays)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedDays.includes(day)
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--bg-elevated)]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {times.map((time) => (
            <button
              key={time}
              onClick={() => toggleItem(time, selectedTimes, setSelectedTimes)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedTimes.includes(time)
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-elevated)]"
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </section>

      {/* Meeting Style */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Meeting Style
        </h2>
        <div className="flex flex-wrap gap-2">
          {meetingStyles.map((style) => (
            <button
              key={style}
              onClick={() => toggleItem(style, selectedStyles, setSelectedStyles)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedStyles.includes(style)
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--bg-elevated)]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Tone */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Communication Tone
        </h2>
        <div className="space-y-2">
          {tones.map((tone) => (
            <button
              key={tone.label}
              onClick={() => setSelectedTone(tone.label)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                selectedTone === tone.label
                  ? "bg-[var(--primary)]/10 border border-[var(--primary)]"
                  : "bg-[var(--bg-card)] border border-[var(--bg-elevated)] hover:border-[var(--primary)]/50"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${
                  selectedTone === tone.label ? "border-[var(--primary)]" : "border-[var(--text-muted)]"
                }`}
              >
                {selectedTone === tone.label && (
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{tone.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{tone.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
      >
        Continue to Dashboard
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
