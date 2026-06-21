"use client";

import Link from "next/link";

/* ══════════════ INLINE ICONS ══════════════ */

const SparkleIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2L9.19 9.19 2 12l7.19 2.81L12 22l2.81-7.19L22 12l-7.19-2.81L12 2z" />
  </svg>
);
const ChatIcon = ({ size = 18, color = "#7C3AED" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const TrophyIcon = ({ size = 18, color = "#7C3AED" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 5h-2V3H7v2H5C3.9 5 3 5.9 3 7v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0011 15.9V18H9v2h6v-2h-2v-2.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
  </svg>
);
const PhoneIcon = ({ size = 18, color = "#22C55E" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);
const WandIcon = ({ size = 18, color = "#EC4899" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a1 1 0 00-1.41 0L1.29 18.96a1 1 0 000 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a1 1 0 000-1.41l-2.33-2.35zm-1.03 5.49l-2.12-2.12 2.44-2.44 2.12 2.12-2.44 2.44z" />
  </svg>
);
const CloudSunIcon = ({ size = 18, color = "#3B82F6" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
  </svg>
);
const CardIcon = ({ size = 18, color = "#3B82F6" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
  </svg>
);
const MsgSmallIcon = ({ size = 15, color = "#9CA3AF" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
);
const ShieldIcon = ({ size = 22, color = "#F59E0B" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);
const LayersIcon = ({ size = 22, color = "#22C55E" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
  </svg>
);
const ChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ══════════════ FEATURES DATA ══════════════ */
const FEATURES = [
  { icon: <ChatIcon />,      bg: "#EDE9FE", title: "Conversational Intake",    desc: "Describe your event in plain language — voice or text. Anthea extracts every detail." },
  { icon: <TrophyIcon />,    bg: "#EDE9FE", title: "Smart Vendor Ranking",     desc: "AI-ranked shortlists sorted by review score, availability, and price." },
  { icon: <PhoneIcon />,     bg: "#F0FDF4", title: "Live Voice Calls",         desc: "Real outbound AI calls for vendor enquiries via Vapi — straight from the dashboard." },
  { icon: <WandIcon />,      bg: "#FDF2F8", title: "AI-Generated Invites",     desc: "PixVerse creates stunning image + video invites in seconds." },
  { icon: <CloudSunIcon />,  bg: "#EFF6FF", title: "Weather & Legal Brief",    desc: "Live forecasts and permit guidance for your event date and location." },
  { icon: <CardIcon />,      bg: "#EFF6FF", title: "One-Click Mock Payment",   desc: "Mollie-branded checkout flow to approve vendors and lock in your budget." },
];

/* ══════════════ CALENDAR ILLUSTRATION ══════════════ */
const CAL_DAYS  = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CAL_DATES = [
  [null, 1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12, 13],
  [14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27],
  [28, 29, 30, null, null, null, null],
];

function CalendarIllustration() {
  return (
    <div className="relative flex items-center justify-center py-4">
      {/* Floating sparkles */}
      {[
        { top: "-8px",  right: "24px", color: "#FBBF24", size: "20px", delay: "0s",    dur: "2s"   },
        { top: "30%",   right: "-16px", color: "#A855F7", size: "12px", delay: "0.4s", dur: "1.8s" },
        { bottom: "16px", left: "8px",  color: "#EC4899", size: "10px", delay: "0.2s", dur: "2.2s" },
        { bottom: "0",  right: "20%",  color: "#3B82F6", size: "14px", delay: "0.6s", dur: "1.6s" },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute font-bold select-none"
          style={{
            top: s.top, right: s.right, bottom: s.bottom, left: s.left,
            color: s.color, fontSize: s.size,
            animation: `blink ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
        >
          ✦
        </div>
      ))}

      {/* Calendar card */}
      <div
        className="w-60 rounded-3xl overflow-hidden select-none"
        style={{
          boxShadow: "0 28px 56px rgba(124,58,237,0.22), 0 6px 20px rgba(0,0,0,0.08)",
          transform: "perspective(900px) rotateY(-8deg) rotateX(3deg)",
        }}
      >
        {/* Purple header */}
        <div className="px-5 pt-4 pb-3" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)" }}>
          <div className="flex justify-between items-center mb-3">
            <p className="text-white font-bold text-sm tracking-tight">June 2026</p>
            <div className="flex gap-2 text-violet-200 text-xs font-bold">
              <span>‹</span><span>›</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {CAL_DAYS.map(d => (
              <div key={d} className="text-center text-[10px] text-violet-200 font-semibold">{d}</div>
            ))}
          </div>
        </div>

        {/* White body */}
        <div className="bg-white px-4 pt-3 pb-4">
          <div className="space-y-0.5">
            {CAL_DATES.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((d, di) => (
                  <div
                    key={di}
                    className="text-center text-xs py-1.5 rounded-lg font-medium"
                    style={
                      d === 21
                        ? { background: "linear-gradient(135deg,#7C3AED,#A855F7)", color: "white", fontWeight: 700 }
                        : d === 14 || d === 28
                          ? { background: "#EDE9FE", color: "#7C3AED" }
                          : { color: d ? "#374151" : "transparent" }
                    }
                  >
                    {d ?? "·"}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Event indicator */}
          <div className="mt-3 p-2.5 rounded-xl flex items-center gap-2" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#7C3AED" }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: "#7C3AED" }}>FIFA Watch Party</p>
              <p className="text-[10px]" style={{ color: "#A78BFA" }}>Jun 21 · 50 guests · Backyard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════ MAIN PAGE ══════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ════ NAV ════ */}
      <nav
        className="bg-white sticky top-0 z-40"
        style={{ borderBottom: "1px solid #E5E7EB", height: "64px" }}
      >
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              <SparkleIcon size={14} color="white" />
            </div>
            <span className="font-bold text-gray-900 text-[17px] tracking-tight">Anthea</span>
          </div>

          {/* Center badge */}
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-blink" />
            Multi-Agent AI · Hackathon MVP
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            <Link href="/intake" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-2">
              Start Planning
            </Link>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <MsgSmallIcon />
            </button>
            <Link
              href="/intake"
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              Start Planning <span className="text-violet-200">→</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-8 py-8 space-y-5">

        {/* ════ HERO CARD ════ */}
        <section
          className="rounded-3xl p-10 sm:p-14 relative overflow-hidden animate-fade-up"
          style={{ background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 55%, #F0EDFF 100%)" }}
        >
          {/* Decorative floating dots */}
          {[
            { top: "12%",  left: "38%", size: 7, opacity: 0.5 },
            { top: "60%",  left: "44%", size: 5, opacity: 0.35 },
            { top: "25%",  left: "55%", size: 4, opacity: 0.3 },
            { top: "75%",  left: "33%", size: 6, opacity: 0.4 },
            { top: "45%",  left: "62%", size: 3, opacity: 0.25 },
          ].map((dot, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                top: dot.top, left: dot.left,
                width: dot.size, height: dot.size,
                background: "#A78BFA", opacity: dot.opacity,
              }}
            />
          ))}

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-center relative z-10">
            {/* Left content */}
            <div>
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
              >
                <SparkleIcon size={18} color="white" />
              </div>

              {/* Heading */}
              <h1
                className="font-extrabold leading-tight mb-5"
                style={{ fontSize: "clamp(36px,5vw,54px)", color: "#111827", letterSpacing: "-0.03em" }}
              >
                Plan your next event<br />with{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Anthea
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="mb-8 leading-relaxed"
                style={{ color: "#6B7280", fontSize: "16px", maxWidth: "430px" }}
              >
                From "FIFA World Cup watch party, 50 guests, my backyard" to a fully
                planned event — vendors, invites, RSVPs, and budget — in minutes.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/intake"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                  }}
                >
                  Start Planning
                </Link>
                <button
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-violet-50 hover:-translate-y-0.5"
                  style={{
                    border: "1px solid #DDD6FE",
                    background: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <MsgSmallIcon size={16} color="#7C3AED" />
                </button>
              </div>
            </div>

            {/* Right: 3D Calendar */}
            <div className="hidden lg:flex justify-center">
              <CalendarIllustration />
            </div>
          </div>
        </section>

        {/* ════ FEATURE GRID ════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl p-6 cursor-default animate-fade-up"
              style={{
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                animationDelay: `${i * 0.06}s`,
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 10px 32px rgba(124,58,237,0.13), 0 2px 8px rgba(0,0,0,0.06)";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                el.style.transform = "translateY(0)";
              }}
            >
              {/* Top row: icon + chevron */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: f.bg }}
                >
                  {f.icon}
                </div>
                <ChevronRight />
              </div>

              {/* Text */}
              <h3
                className="font-semibold mb-2"
                style={{ color: "#111827", fontSize: "15px", letterSpacing: "-0.01em" }}
              >
                {f.title}
              </h3>
              <p style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.65" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ════ BOTTOM INFO CARDS ════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1 — AI is ready to help */}
          <div
            className="bg-white rounded-3xl p-6 animate-fade-up"
            style={{
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              animationDelay: "0.24s",
            }}
          >
            {/* Glow icon */}
            <div className="relative w-12 h-12 mb-5">
              <div
                className="absolute inset-0 rounded-2xl blur-md"
                style={{ background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent)", opacity: 0.6 }}
              />
              <div
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
              >
                <SparkleIcon size={20} color="white" />
              </div>
            </div>
            <h3 className="font-bold mb-2" style={{ color: "#111827", fontSize: "16px" }}>
              AI is ready to help
            </h3>
            <p className="mb-5" style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.65" }}>
              Tell Anthea what you have in mind and we'll handle the rest.
            </p>
            <Link
              href="/intake"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              style={{ border: "1px solid #E5E7EB", color: "#111827" }}
            >
              Start a conversation →
            </Link>
          </div>

          {/* Card 2 — Your event, your way */}
          <div
            className="rounded-3xl p-6 animate-fade-up"
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              animationDelay: "0.30s",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "#DCFCE7" }}
            >
              <LayersIcon size={22} color="#22C55E" />
            </div>
            <h3 className="font-bold mb-2" style={{ color: "#111827", fontSize: "16px" }}>
              Your event, your way
            </h3>
            <p className="mb-5" style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.65" }}>
              Vendors, invites, weather, payments — managed in one place.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ background: "#22C55E" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              AI Agents Active 6/6
            </div>
          </div>

          {/* Card 3 — Secure & trusted */}
          <div
            className="rounded-3xl p-6 animate-fade-up"
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              animationDelay: "0.36s",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "#FEF3C7" }}
            >
              <ShieldIcon size={22} color="#F59E0B" />
            </div>
            <h3 className="font-bold mb-2" style={{ color: "#111827", fontSize: "16px" }}>
              Secure & trusted
            </h3>
            <p className="mb-5" style={{ color: "#6B7280", fontSize: "13px", lineHeight: "1.65" }}>
              Payments powered by Mollie.<br />Your data is safe with us.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}
              >
                🔒 Mollie Secure
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}
              >
                ✓ PCI Compliant
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ════ FOOTER ════ */}
      <footer className="py-10" style={{ borderTop: "1px solid #F1F5F9" }}>
        <div className="max-w-[1100px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A855F7)" }}
            >
              <SparkleIcon size={11} color="white" />
            </div>
            <span className="font-semibold text-gray-700 text-sm tracking-tight">Anthea</span>
          </div>
          <p style={{ color: "#9CA3AF", fontSize: "12px" }}>
            Powered by Vapi · PixVerse · Open-Meteo · Mollie
          </p>
          <div className="flex items-center gap-4">
            <Link href="/intake" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Start Planning</Link>
            <Link href="/dashboard" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
