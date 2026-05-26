"use client";

import { ArrowRight, Zap, Target, Clock } from "lucide-react";
import Link from "next/link";

export default function Welcome() {
  return (
    <div className="min-h-screen flex flex-col px-6 py-12 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-[var(--primary)] opacity-10 blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[250px] h-[250px] rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />

      {/* Logo & Header */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center mb-6">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Connection
            <br />
            <span className="text-[var(--primary-light)]">Catalyst</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base leading-relaxed">
            Turn fleeting introductions into meaningful relationships. AI-powered follow-ups that feel natural.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-8 space-y-3">
          <FeatureCard
            icon={<Zap size={18} />}
            title="Zero Friction Exchange"
            description="Capture connections effortlessly at any event"
          />
          <FeatureCard
            icon={<Target size={18} />}
            title="Mutual Intent Clarity"
            description="Know when both sides want to connect"
          />
          <FeatureCard
            icon={<Clock size={18} />}
            title="24-Hour Conversion Window"
            description="Strike while the connection is warm"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 pt-8 pb-4">
        <Link
          href="/onboarding"
          className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
        >
          Get Started
          <ArrowRight size={20} />
        </Link>
        <p className="text-center text-[var(--text-muted)] text-xs mt-4">
          Free tier includes 3 active connections
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--bg-elevated)]">
      <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary-light)] shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-[var(--text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
      </div>
    </div>
  );
}
