"use client";

import { ArrowRight, Sparkles, Target, Clock } from "lucide-react";
import Link from "next/link";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-purple-600 opacity-10 blur-3xl" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[400px] h-[400px] rounded-full bg-pink-600 opacity-10 blur-3xl" />

      {/* Main Content */}
      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-8">
            <Sparkles size={32} className="text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Anthea
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered event planning assistant. From concept to execution, seamlessly orchestrated.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<Sparkles size={24} />}
            title="Conversational Planning"
            description="Natural language event intake with intelligent follow-ups"
          />
          <FeatureCard
            icon={<Target size={24} />}
            title="Smart Vendor Matching"
            description="AI-ranked vendors based on reviews and availability"
          />
          <FeatureCard
            icon={<Clock size={24} />}
            title="Complete Orchestration"
            description="Invites, RSVPs, budget tracking, and weather insights"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/intake"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
          >
            Start Planning
            <ArrowRight size={20} />
          </Link>
          <p className="text-gray-500 text-sm mt-6">
            Multi-agent AI system • Hackathon MVP
          </p>
        </div>
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
    <div className="p-6 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-purple-500/50 transition-all">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
