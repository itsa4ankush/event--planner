"use client";

import {
  ArrowLeft,
  Coffee,
  UtensilsCrossed,
  Footprints,
  MessageCircle,
  Shield,
  Brain,
  Battery,
  HeartCrack,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const scheduleOptions = [
  {
    icon: Coffee,
    venue: "Quiet Café",
    time: "Tomorrow, 3:00 PM",
    match: "Best for focused conversation",
  },
  {
    icon: UtensilsCrossed,
    venue: "Casual Lunch",
    time: "Thursday, 12:30 PM",
    match: "Natural time boundary",
  },
  {
    icon: Footprints,
    venue: "Walk in Park",
    time: "Saturday, 10:00 AM",
    match: "Low pressure, easy exit",
  },
];

export default function ConnectionDetail() {
  return (
    <div className="min-h-screen pb-24 px-5 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/recap" className="text-[var(--text-secondary)] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-sm font-bold">
            MC
          </div>
          <div>
            <h1 className="text-lg font-bold">Marissa Cahill</h1>
            <p className="text-xs text-[var(--text-muted)]">Met at Startup Social • 2h ago</p>
          </div>
        </div>
      </div>

      {/* Mutual Intent Signal */}
      <div className="p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 mb-5 flex items-center gap-3">
        <Shield size={18} className="text-[var(--success)] shrink-0" />
        <div>
          <p className="text-xs font-semibold text-[var(--success)]">High Mutual Intent</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Both parties showed strong interest in continuing the conversation
          </p>
        </div>
      </div>

      {/* Smart Scheduling */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-[var(--primary-light)]" />
          Smart Scheduling
        </h2>
        <div className="space-y-2">
          {scheduleOptions.map((opt) => (
            <button
              key={opt.venue}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)] hover:border-[var(--primary)]/50 transition-all text-left active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                <opt.icon size={18} className="text-[var(--primary-light)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{opt.venue}</p>
                <p className="text-xs text-[var(--text-muted)]">{opt.time}</p>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] max-w-[80px] text-right">
                {opt.match}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Reciprocity Tracker */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3">Reciprocity Tracker</h2>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[var(--text-muted)]">You</span>
            <span className="text-xs text-[var(--text-muted)]">Marissa</span>
          </div>
          <div className="relative h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-[52%] bg-[var(--primary)] rounded-full" />
            <div className="absolute right-0 top-0 h-full w-[48%] bg-[var(--accent)] rounded-full" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-medium">52%</span>
            <span className="text-[10px] text-[var(--success)]">✓ Balanced</span>
            <span className="text-xs font-medium">48%</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2 text-center">
            Effort is well-balanced. Keep the momentum going!
          </p>
        </div>
      </section>

      {/* Ghosting Rescue */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageCircle size={14} className="text-[var(--accent)]" />
          Ghosting Rescue
        </h2>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-2">
            Pre-drafted low-pressure message
          </p>
          <div className="p-3 rounded-lg bg-[var(--bg)]/50 mb-3">
            <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
              &ldquo;Hey Marissa! Really enjoyed our chat about sustainable tech earlier. No pressure at all, but if you&apos;re free this week, I&apos;d love to continue that conversation over coffee. Either way, great meeting you!&rdquo;
            </p>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors active:scale-[0.98]">
            Send Message
          </button>
        </div>
      </section>

      {/* Barrier Analysis */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Brain size={14} className="text-[var(--primary-light)]" />
          Barrier Analysis
        </h2>
        <div className="space-y-3">
          <BarrierItem
            icon={<Shield size={14} />}
            label="Social Anxiety"
            level={25}
            color="var(--success)"
            assessment="Low — you seemed comfortable"
          />
          <BarrierItem
            icon={<Battery size={14} />}
            label="Fatigue Level"
            level={40}
            color="var(--accent)"
            assessment="Moderate — schedule for high-energy time"
          />
          <BarrierItem
            icon={<HeartCrack size={14} />}
            label="Rejection Fear"
            level={15}
            color="var(--success)"
            assessment="Very low — strong mutual signals"
          />
        </div>
      </section>

      {/* Navigation */}
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex-1 py-2.5 rounded-xl border border-[var(--bg-elevated)] text-center text-sm text-[var(--text-secondary)] hover:border-[var(--primary)]/50 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/recap"
          className="flex-1 py-2.5 rounded-xl border border-[var(--bg-elevated)] text-center text-sm text-[var(--text-secondary)] hover:border-[var(--primary)]/50 transition-colors"
        >
          Evening Recap
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}

function BarrierItem({
  icon,
  label,
  level,
  color,
  assessment,
}: {
  icon: React.ReactNode;
  label: string;
  level: number;
  color: string;
  assessment: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-xs font-bold" style={{ color }}>
          {level}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${level}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-1.5">{assessment}</p>
    </div>
  );
}
