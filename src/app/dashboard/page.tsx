"use client";

import { TrendingUp, Users, Clock, ChevronRight, Sparkles, Zap, MessageCircle } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const connections = [
  { name: "Marcus Ellison", score: 90, trend: "up", lastAction: "Coffee scheduled tomorrow" },
  { name: "Priya Konduri", score: 70, trend: "stable", lastAction: "Replied to your message" },
  { name: "Jan-Pieter Vos", score: 45, trend: "down", lastAction: "No response in 3 days" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen pb-24 px-5 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Good evening</p>
          <h1 className="text-xl font-bold">Your Connections</h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-xs font-bold">
          AC
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <MetricCard label="Active" value="3" sublabel="free tier" icon={<Users size={14} />} />
        <MetricCard label="7-Day Rate" value="62%" sublabel="conversion" icon={<TrendingUp size={14} />} />
        <MetricCard label="Sustained" value="4.2" sublabel="avg score" icon={<Sparkles size={14} />} />
      </div>

      {/* Connection Health */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Connection Health</h2>
          <span className="text-xs text-[var(--text-muted)]">Reciprocity Score</span>
        </div>
        <div className="space-y-2">
          {connections.map((conn) => (
            <Link
              key={conn.name}
              href="/connection/marissa"
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)] hover:border-[var(--primary)]/50 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-semibold text-[var(--text-secondary)]">
                {conn.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{conn.name}</p>
                  <span
                    className={`text-xs font-bold ${
                      conn.score >= 80
                        ? "text-[var(--success)]"
                        : conn.score >= 60
                        ? "text-[var(--accent)]"
                        : "text-[var(--danger)]"
                    }`}
                  >
                    {conn.score}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-[var(--text-muted)] truncate">{conn.lastAction}</p>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full mt-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      conn.score >= 80
                        ? "bg-[var(--success)]"
                        : conn.score >= 60
                        ? "bg-[var(--accent)]"
                        : "bg-[var(--danger)]"
                    }`}
                    style={{ width: `${conn.score}%` }}
                  />
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Insight */}
      <section className="mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 border border-[var(--primary)]/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-[var(--primary-light)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">24-Hour Conversion Window</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Connections followed up within 24 hours are 3x more likely to become sustained relationships. You have 2 pending follow-ups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Coach CTA */}
      <section className="mb-6">
        <Link
          href="/coach"
          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 border border-[var(--primary)]/20 hover:border-[var(--primary)]/40 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shrink-0">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">AI Coach</p>
            <p className="text-xs text-[var(--text-muted)]">Get guidance on your next move</p>
          </div>
          <ChevronRight size={16} className="text-[var(--text-muted)]" />
        </Link>
      </section>

      {/* Tonight's Activity */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Tonight&apos;s Activity</h2>
          <Link href="/recap" className="text-xs text-[var(--primary-light)] flex items-center gap-1">
            View Evening Recap <ChevronRight size={12} />
          </Link>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <Clock size={18} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-medium">2 new introductions captured</p>
              <p className="text-xs text-[var(--text-muted)]">Startup Social @ WeWork Rooftop</p>
            </div>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[var(--text-muted)]">{icon}</span>
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-[var(--text-muted)]">{sublabel}</p>
    </div>
  );
}
