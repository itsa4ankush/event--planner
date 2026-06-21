'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Event, Invite } from '@/lib/db/schema';

const RESPONSE_OPTIONS = [
  { value: 'yes',   label: '✓ Yes',   active: 'border-emerald-500 bg-emerald-50 text-emerald-700', hover: 'hover:border-emerald-300 hover:bg-emerald-50' },
  { value: 'no',    label: '✗ No',    active: 'border-red-400     bg-red-50     text-red-700',     hover: 'hover:border-red-300 hover:bg-red-50' },
  { value: 'maybe', label: '? Maybe', active: 'border-amber-400   bg-amber-50   text-amber-700',   hover: 'hover:border-amber-300 hover:bg-amber-50' },
] as const;

export default function RsvpPage() {
  const params   = useParams();
  const inviteId = params.inviteId as string;

  const [event,   setEvent]   = useState<Event | null>(null);
  const [invite,  setInvite]  = useState<Invite | null>(null);
  const [formData, setFormData] = useState({
    name: '', contact: '',
    response: 'yes' as 'yes' | 'no' | 'maybe',
    comments: '',
  });
  const [submitted,    setSubmitted]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [pageLoading,  setPageLoading]  = useState(true);

  useEffect(() => { loadEventData(); }, [inviteId]);

  const loadEventData = async () => {
    try {
      const res    = await fetch(`/api/events/${inviteId}`);
      const result = await res.json();
      if (result.success) {
        setEvent(result.data.event);
        const invites = result.data.invites || [];
        if (invites.length > 0) setInvite(invites[0]);
        else if (result.data.invite) setInvite(result.data.invite);
      }
    } catch { /* silent */ }
    finally { setPageLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: inviteId, ...formData }),
      });
      if (res.ok) setSubmitted(true);
      else throw new Error();
    } catch {
      alert('Failed to submit RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin-slow" />
          <p className="text-gray-400 text-sm">Loading invitation…</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F8FAFC' }}>
        <div className="w-full max-w-sm animate-scale-in text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">RSVP received!</h2>
          <p className="text-gray-500 mb-6">
            {formData.response === 'yes'
              ? "Can't wait to see you there."
              : formData.response === 'maybe'
                ? "We'll keep a spot for you just in case."
                : "Thanks for letting us know — we'll miss you!"}
          </p>
          <p className="text-xs text-gray-400">You can close this page.</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F8FAFC' }}>
        <div className="w-full max-w-sm text-center animate-fade-up">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invitation not found</h2>
          <p className="text-gray-500 text-sm">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Nav */}
      <nav className="bg-white sticky top-0 z-40" style={{ borderBottom: '1px solid #E5E7EB', height: '64px' }}>
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.19 9.19 2 12l7.19 2.81L12 22l2.81-7.19L22 12l-7.19-2.81L12 2z" /></svg>
            </div>
            <span className="font-bold text-gray-900 text-[17px] tracking-tight">Anthea</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-[540px] mx-auto px-6 py-10">

        {/* Invite image banner */}
        {invite?.image_url ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 mb-6 animate-fade-up card-shadow">
            <img src={invite.image_url} alt="Event Invitation" className="w-full object-cover max-h-64" />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-violet-600 to-pink-500 h-44 flex flex-col items-center justify-center mb-6 animate-fade-up card-shadow">
            <p className="text-sm font-medium text-violet-100 mb-1">You're invited to</p>
            <h1 className="text-2xl font-bold text-white text-center px-4">{event.title}</h1>
          </div>
        )}

        {/* Event details card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5 animate-fade-up card-shadow" style={{ animationDelay: '0.05s' }}>
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
            {invite?.message_text && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-line">{invite.message_text}</p>
            )}
          </div>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">📅 Date & Time</p>
              <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
              <p className="text-xs text-gray-500">{event.time || 'Time TBD'}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">📍 Location</p>
              <p className="text-sm font-semibold text-gray-900">{event.location_text}</p>
            </div>
          </div>
          {invite?.qr_code_url && (
            <div className="px-6 pb-5 flex items-center gap-4">
              <img src={invite.qr_code_url} alt="QR" className="w-20 h-20 rounded-xl border border-gray-200 p-1 bg-white" />
              <p className="text-xs text-gray-400">Scan to share this RSVP link</p>
            </div>
          )}
        </div>

        {/* RSVP form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-up card-shadow" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold text-gray-900 mb-5">Please RSVP</h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Your name *</label>
              <input
                type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email or phone *</label>
              <input
                type="text" required value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                placeholder="you@email.com or +1 555…"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Will you attend? *</label>
              <div className="grid grid-cols-3 gap-2">
                {RESPONSE_OPTIONS.map(opt => (
                  <button
                    key={opt.value} type="button"
                    onClick={() => setFormData({ ...formData, response: opt.value })}
                    className={`py-2.5 px-3 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${
                      formData.response === opt.value ? opt.active : `border-gray-200 text-gray-500 bg-white ${opt.hover}`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Comments (optional)</label>
              <textarea
                rows={3} value={formData.comments}
                onChange={e => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Dietary restrictions, +1s, questions…"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-violet-200"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />}
              {loading ? 'Sending…' : 'Submit RSVP'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          Powered by <Link href="/" className="font-semibold" style={{ color: '#7C3AED' }}>Anthea AI</Link>
        </p>
      </div>
    </div>
  );
}
