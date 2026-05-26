"use client";

import { ArrowLeft, MapPin, Clock, Send, Footprints, Coffee, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const connections = [
  {
    name: "Marissa Reeves",
    type: "Primary",
    confidence: 92,
    mutualIntent: "High",
    urgency: "Follow up today",
    recap: "Discussed shared interest in sustainable tech startups. She mentioned looking for co-founders.",
    tone: "Warm & Direct",
    action: "Send Follow-Up Now",
    actionIcon: Send,
    commitment: "Share the article about green energy VCs you mentioned",
  },
  {
    name: "Tobias Kline",
    type: "Secondary",
    confidence: 74,
    mutualIntent: "Medium",
    urgency: "Within 48 hours",
    recap: "Bonded over morning running routines. Lives in the same neighborhood.",
    tone: "Casual & Friendly",
    action: "Confirm Walk",
    actionIcon: Footprints,
    commitment: "Saturday morning run at Tiergarten, 7:30am",
  },
  {
    name: "Lena Petrova",
    type: "Secondary",
    confidence: 61,
    mutualIntent: "Moderate",
    urgency: "This week",
    recap: "Brief chat about UX design trends. She works at a design agency you admire.",
    tone: "Professional & Curious",
    action: "Invite for Coffee",
    actionIcon: Coffee,
    commitment: "Ask about her agency's approach to accessibility",
  },
];

export default function EveningRecap() {
  return (
    <div className="min-h-screen pb-24 px-5 pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold">Evening Recap</h1>
      </div>

      {/* Event Info */}
      <div className="flex items-center gap-4 mb-6 ml-8">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <MapPin size={12} />
          <span>WeWork Rooftop, Berlin</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Clock size={12} />
          <span>Startup Social</span>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
        <Sparkles size={16} className="text-[var(--primary-light)] shrink-0" />
        <p className="text-xs text-[var(--text-secondary)]">
          <span className="font-semibold text-white">3 connections</span> made tonight. AI has analyzed conversation context and generated personalized follow-up strategies.
        </p>
      </div>

      {/* Connection Cards */}
      <div className="space-y-4">
        {connections.map((conn) => (
          <div
            key={conn.name}
            className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-semibold">
                  {conn.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{conn.name}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      conn.type === "Primary"
                        ? "bg-[var(--primary)]/20 text-[var(--primary-light)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                    }`}
                  >
                    {conn.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[var(--success)]">{conn.confidence}%</p>
                <p className="text-[10px] text-[var(--text-muted)]">confidence</p>
              </div>
            </div>

            {/* AI Recap */}
            <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
              {conn.recap}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                <Shield size={10} />
                Intent: {conn.mutualIntent}
              </span>
              <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">
                <Clock size={10} />
                {conn.urgency}
              </span>
              <span className="text-[10px] px-2 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                Tone: {conn.tone}
              </span>
            </div>

            {/* Micro-commitment */}
            <div className="p-2.5 rounded-lg bg-[var(--bg)]/50 mb-3">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Suggested Micro-Commitment</p>
              <p className="text-xs text-[var(--text-secondary)]">{conn.commitment}</p>
            </div>

            {/* Action Button */}
            <Link
              href="/connection/marissa"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors active:scale-[0.98]"
            >
              <conn.actionIcon size={14} />
              {conn.action}
            </Link>
          </div>
        ))}
      </div>

      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-2 mt-6 py-3 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        Go to Dashboard
      </Link>

      <BottomNav />
    </div>
  );
}
