'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Event, KpiCategory, Vendor, Guest, WeatherLegalReport, Order, Invite, VendorQuote } from '@/lib/db/schema';

/* ─── Light-theme palette ─────────────────────────── */
const card = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
} as const;
const bg      = '#F8FAFC';
const preview = '#F9FAFB';
const div1    = '1px solid #E5E7EB';
const div2    = '1px solid #F3F4F6';

/* ─── Status badge Tailwind classes (light theme) ─── */
const KPI_BADGE: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-500 border border-gray-200',
  searching:   'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse',
  shortlisted: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  ordered:     'bg-violet-50 text-violet-700 border border-violet-200',
};
const KPI_LABEL: Record<string, string> = {
  not_started: 'Not Started', searching: 'Searching…',
  shortlisted: 'Shortlisted', approved: 'Approved', ordered: 'Ordered',
};
const VENDOR_BADGE: Record<string, string> = {
  shortlisted: 'bg-amber-50 text-amber-700 border border-amber-200',
  contacted:   'bg-blue-50 text-blue-700 border border-blue-200',
  quoted:      'bg-violet-50 text-violet-700 border border-violet-200',
  approved:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected:    'bg-red-50 text-red-700 border border-red-200',
};
const CAT_ICON: Record<string, string> = {
  venue: '🏛️', food_drinks: '🍽️', decor: '✨', photography: '📸',
  merch: '👕', entertainment: '🎵', av_equipment: '📺',
};

/* ═══════════════════ PAGE EXPORT ═══════════════════ */
export default function DashboardPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: bg }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 rounded-full border-2 border-violet-500 border-t-transparent animate-spin-slow" />
        <p className="text-xs text-gray-400">Loading dashboard…</p>
      </div>
    </div>
  );
}

/* ═══════════════════ DASHBOARD ═══════════════════ */
function DashboardContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const eventId      = searchParams.get('eventId');

  const [event,         setEvent]         = useState<Event | null>(null);
  const [categories,    setCategories]    = useState<KpiCategory[]>([]);
  const [vendors,       setVendors]       = useState<Vendor[]>([]);
  const [guests,        setGuests]        = useState<Guest[]>([]);
  const [weatherReport, setWeatherReport] = useState<WeatherLegalReport | null>(null);
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [invite,        setInvite]        = useState<Invite | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<any>(null);

  const [loading,           setLoading]           = useState(true);
  const [searchingVendors,  setSearchingVendors]  = useState(false);
  const [generatingReport,  setGeneratingReport]  = useState(false);
  const [generatingInvite,  setGeneratingInvite]  = useState(false);
  const [callingVendor,     setCallingVendor]     = useState<string | null>(null);
  const [vendorQuote,       setVendorQuote]       = useState<VendorQuote | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentDone,       setPaymentDone]       = useState(false);

  const [demoPhone,     setDemoPhone]     = useState('+31 6 12345678');
  const [isDemoCalling, setIsDemoCalling] = useState(false);
  const [callLog,       setCallLog]       = useState<string[]>([]);
  const tickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { if (eventId) loadEventData(eventId); else setLoading(false); }, [eventId]);
  useEffect(() => { if (tickerRef.current) tickerRef.current.scrollTop = tickerRef.current.scrollHeight; }, [callLog]);

  const loadEventData = async (id: string) => {
    try {
      const r = await fetch(`/api/events/${id}`);
      const d = await r.json();
      if (d.success) {
        setEvent(d.data.event);  setCategories(d.data.categories);
        setVendors(d.data.vendors); setGuests(d.data.guests);
        setWeatherReport(d.data.weatherReport ?? null); setOrders(d.data.orders);
        if (d.data.invite) setInvite(d.data.invite);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleFindVendors = async () => {
    if (!eventId) return; setSearchingVendors(true);
    try {
      const r = await fetch('/api/vendors/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }) });
      if ((await r.json()).success) await loadEventData(eventId);
    } finally { setSearchingVendors(false); }
  };
  const handleVendorAction = async (vendorId: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/vendors/${vendorId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (eventId) await loadEventData(eventId);
  };
  const handleCallVendor = async (vendorId: string) => {
    if (!eventId) return; setCallingVendor(vendorId); setVendorQuote(null);
    try {
      const r = await fetch(`/api/vendors/${vendorId}/call`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, mode: 'demo' }) });
      const d = await r.json();
      if (d.success) { setVendorQuote(d.quote); await loadEventData(eventId); }
    } finally { setCallingVendor(null); }
  };
  const handleDemoCall = async () => {
    if (!demoPhone.trim() || !eventId) return;
    setIsDemoCalling(true);
    setCallLog(['[SYSTEM]: Initializing Vapi Agent Outbound Protocol…', `[VAPI]: Connecting to ${demoPhone}…`]);
    try {
      const r = await fetch('/api/demo-call', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: demoPhone, eventId }) });
      const d = await r.json();
      if (d.success) {
        const lines = (d.transcript as string).split('\n').filter(Boolean).map((l: string) => `[VAPI]: ${l}`);
        setCallLog(prev => [...prev, ...lines, `[SYSTEM]: Call complete. Duration: ${d.duration}s.`]);
      }
    } finally { setIsDemoCalling(false); }
  };
  const handleGenerateReport = async () => {
    if (!eventId) return; setGeneratingReport(true);
    try {
      const r = await fetch('/api/intelligence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }) });
      const d = await r.json();
      if (d.success) { setWeatherReport(d.report); setCostBreakdown(d.costBreakdown); }
    } finally { setGeneratingReport(false); }
  };
  const handleGenerateInvite = async () => {
    if (!eventId) return; setGeneratingInvite(true);
    try {
      const r = await fetch('/api/invites/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, style: 'modern' }) });
      const d = await r.json();
      if (d.success) setInvite(d.invite);
    } finally { setGeneratingInvite(false); }
  };
  const handleCreateOrders = async () => {
    if (!eventId) return; setProcessingPayment(true);
    try {
      const r = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, paymentMethod: 'ideal' }) });
      if ((await r.json()).success) { await loadEventData(eventId); setPaymentDone(true); }
    } finally { setProcessingPayment(false); }
  };

  if (loading) return <FullPageSpinner />;

  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const subtotal        = approvedVendors.reduce((s, v) => s + (v.price_estimate || 0), 0);
  const orderTotal      = orders.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="min-h-screen" style={{ background: bg, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ════ NAV ════ */}
      <nav className="bg-white sticky top-0 z-40" style={{ borderBottom: '1px solid #E5E7EB', height: '64px' }}>
        <div className="max-w-[1100px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L9.19 9.19 2 12l7.19 2.81L12 22l2.81-7.19L22 12l-7.19-2.81L12 2z" /></svg>
              </div>
              <span className="font-bold text-gray-900 text-[17px] tracking-tight">Anthea</span>
            </Link>
            {event && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-sm text-gray-500 truncate max-w-[180px]">{event.title}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${event ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-xs font-mono text-gray-500">{event ? 'Agents Active' : 'Idle'}</span>
            </div>
            <button onClick={() => router.push('/intake')} className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
              + New Event
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {!event ? <EmptyState /> : (
          <>
            {/* ── Event title bar ── */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                {event.time && ` · ${event.time}`}
                {' · '}{event.guest_count} guests · {event.location_text}
              </p>
            </div>

            {/* ════ TOP GRID: sidebar + vendor table ════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

              {/* Left sidebar */}
              <div className="space-y-5">
                <EventBriefPanel event={event} />
                <KpiListPanel categories={categories} />
              </div>

              {/* Vendor table — 2 col span */}
              <div className="lg:col-span-2">
                <VendorTableSection
                  vendors={vendors}
                  demoPhone={demoPhone}
                  onPhoneChange={setDemoPhone}
                  isDemoCalling={isDemoCalling}
                  callLog={callLog}
                  tickerRef={tickerRef}
                  searchingVendors={searchingVendors}
                  callingVendor={callingVendor}
                  vendorQuote={vendorQuote}
                  onFindVendors={handleFindVendors}
                  onVendorAction={handleVendorAction}
                  onCallVendor={handleCallVendor}
                  onDemoCall={handleDemoCall}
                />
              </div>
            </div>

            {/* ════ BOTTOM GRID: 3 equal modules ════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <InviteRsvpHub invite={invite} guests={guests} generating={generatingInvite} onGenerate={handleGenerateInvite} />
              <IntelligencePanel report={weatherReport} costBreakdown={costBreakdown} generating={generatingReport} onGenerate={handleGenerateReport} />
              <CheckoutPipeline orders={orders} approvedVendors={approvedVendors} subtotal={subtotal} orderTotal={orderTotal} processing={processingPayment} done={paymentDone} onCreateOrders={handleCreateOrders} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════ SUB-COMPONENTS ════════════════ */

function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-3xl mb-5">📅</div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">No event loaded</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">Start planning to populate this dashboard with live agent data.</p>
      <button onClick={() => router.push('/intake')} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-violet-200">
        Plan an Event
      </button>
    </div>
  );
}

/* ── Event brief panel ── */
function EventBriefPanel({ event }: { event: Event }) {
  const rows = [
    ['Date',   new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })],
    ['Time',   event.time || 'TBD'],
    ['Guests', `${event.guest_count} people`],
    ['Budget', event.budget_total ? `$${event.budget_total.toLocaleString()}` : 'Open'],
    ['Status', event.status],
  ];
  return (
    <section className="p-5 rounded-xl" style={card}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">🧠 Orchestrator Intake</h2>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">Vapi STT / Text</span>
      </div>

      <div className="p-3 rounded-lg text-sm mb-4" style={{ background: preview, border: div1 }}>
        <span className="text-[10px] font-mono text-gray-400 block mb-1">Extracted Brief:</span>
        <p className="text-gray-700 leading-relaxed">
          "{event.event_type.replace(/_/g, ' ')}, {event.guest_count} guests, {event.location_text}."
        </p>
      </div>

      <div className="space-y-0">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between py-2 text-xs" style={{ borderBottom: div2 }}>
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-700 font-medium capitalize">{val}</span>
          </div>
        ))}
      </div>

      <Link href="/intake" className="mt-4 block text-center py-2 rounded-lg text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors">
        Modify Brief →
      </Link>
    </section>
  );
}

/* ── KPI categories list ── */
function KpiListPanel({ categories }: { categories: KpiCategory[] }) {
  return (
    <section className="p-5 rounded-xl" style={card}>
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">📊 KPI Categories Progress</h2>
      {categories.length === 0
        ? <p className="text-xs text-gray-400">Awaiting intake to extract planning categories…</p>
        : (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: preview, border: div1 }}>
                <span className="text-sm text-gray-700 font-medium flex items-center gap-2">
                  <span>{CAT_ICON[cat.name] || '📋'}</span>
                  <span className="capitalize">{cat.name.replace(/_/g, ' ')}</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${KPI_BADGE[cat.status] || 'bg-gray-100 text-gray-500'}`}>
                  {KPI_LABEL[cat.status] || cat.status}
                </span>
              </div>
            ))}
          </div>
        )
      }
    </section>
  );
}

/* ── Vendor table ── */
interface VendorTableProps {
  vendors: Vendor[];
  demoPhone: string; onPhoneChange: (v: string) => void;
  isDemoCalling: boolean; callLog: string[];
  tickerRef: React.RefObject<HTMLDivElement | null>;
  searchingVendors: boolean; callingVendor: string | null; vendorQuote: VendorQuote | null;
  onFindVendors: () => void;
  onVendorAction: (id: string, s: 'approved' | 'rejected') => void;
  onCallVendor: (id: string) => void;
  onDemoCall: () => void;
}

function VendorTableSection(p: VendorTableProps) {
  return (
    <section className="p-5 rounded-xl flex flex-col h-full" style={card}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">🔍 Vendor Research Agent Shortlist</h2>
          <p className="text-[11px] font-mono text-gray-400 mt-0.5">Signal Scope: Google • Yelp • Amazon | Mode: Rating Sorted</p>
        </div>
        {/* Demo call trigger */}
        <div className="flex items-center gap-2 p-2 rounded-lg shrink-0 self-start" style={{ background: preview, border: '1px solid #FCA5A5' }}>
          <input
            type="tel" value={p.demoPhone} onChange={e => p.onPhoneChange(e.target.value)}
            disabled={p.isDemoCalling}
            className="w-32 text-xs rounded-lg px-2 py-1.5 text-gray-700"
            style={{ background: '#FFFFFF', border: div1 }}
          />
          <button
            onClick={p.onDemoCall} disabled={p.isDemoCalling || !p.demoPhone.trim()}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ background: p.isDemoCalling ? '#9CA3AF' : '#DC2626' }}
          >
            {p.isDemoCalling ? '⏳ Dialing…' : '📞 Test Call'}
          </button>
        </div>
      </div>

      {/* Terminal ticker */}
      {p.callLog.length > 0 && (
        <div ref={p.tickerRef} className="bg-gray-900 text-green-400 font-mono text-xs p-3 rounded-lg mb-4 h-20 overflow-y-auto border border-gray-200">
          {p.callLog.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      {/* Table or empty CTA */}
      {p.vendors.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-sm text-gray-600 mb-1 font-medium">No vendors sourced yet</p>
          <p className="text-xs text-gray-400 mb-5">Anthea will search Google, Yelp, and Amazon for top-rated vendors in your area.</p>
          <button onClick={p.onFindVendors} disabled={p.searchingVendors}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
            style={{ background: '#7C3AED' }}>
            {p.searchingVendors && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />}
            {p.searchingVendors ? 'Searching…' : '🔍 Find Vendors'}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase text-gray-400 font-mono" style={{ background: preview }}>
              <tr>
                <th className="px-3 py-2.5 rounded-tl-lg">Vendor Name</th>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5 text-center">Rating</th>
                <th className="px-3 py-2.5 text-right">Est. Cost</th>
                <th className="px-3 py-2.5 text-center rounded-tr-lg">Actions / Status</th>
              </tr>
            </thead>
            <tbody>
              {p.vendors.map((v, i) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors" style={{ borderTop: div1 }}>
                  <td className="px-3 py-3 font-semibold text-gray-900">{v.name}</td>
                  <td className="px-3 py-3 text-[11px] text-gray-400 font-mono capitalize">{v.source}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-emerald-600 font-bold">{v.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400 ml-1">({v.review_count.toLocaleString()})</span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-gray-700">
                    {v.price_estimate ? `€${v.price_estimate.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${VENDOR_BADGE[v.status] || 'bg-gray-100 text-gray-500'}`}>
                        {v.status === 'approved' ? '✓ Approved' : v.status}
                      </span>
                      {v.status === 'shortlisted' && (
                        <>
                          <button onClick={() => p.onVendorAction(v.id, 'approved')} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">Approve</button>
                          <button onClick={() => p.onVendorAction(v.id, 'rejected')} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors">Reject</button>
                        </>
                      )}
                      {v.status === 'approved' && (
                        <button onClick={() => p.onCallVendor(v.id)} disabled={!!p.callingVendor} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-40">
                          {p.callingVendor === v.id ? '⏳ Calling…' : '📞 Simulate Call'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quote result */}
      {p.vendorQuote && (
        <div className="mt-4 p-3 rounded-lg font-mono text-xs bg-gray-900 text-green-400 border border-gray-200">
          <p className="text-gray-500 mb-1">[VAPI]: Live Call Transcript & Quote —</p>
          <p className="whitespace-pre-wrap leading-relaxed">{p.vendorQuote.transcript_or_notes}</p>
          {p.vendorQuote.quoted_price && <p className="mt-2 text-emerald-400 font-bold">Extracted Quote: ${p.vendorQuote.quoted_price}</p>}
        </div>
      )}
    </section>
  );
}

/* ── Invite & RSVP hub ── */
function InviteRsvpHub({ invite, guests, generating, onGenerate }: {
  invite: Invite | null; guests: Guest[]; generating: boolean; onGenerate: () => void;
}) {
  const yes = guests.filter(g => g.response === 'yes').length;
  const no  = guests.filter(g => g.response === 'no').length;
  const mb  = guests.filter(g => g.response === 'maybe').length;

  return (
    <section className="p-5 rounded-xl flex flex-col" style={card}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">✨ Invite & RSVP Hub</h2>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200">PixVerse AI</span>
      </div>

      {/* Preview */}
      {invite?.image_url ? (
        <>
          {invite.image_url.startsWith('data:') && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg mb-2 text-xs bg-amber-50 border border-amber-200 text-amber-700">
              ⚠️ Insufficient PixVerse tokens — showing template invite.
            </div>
          )}
          <div className="relative rounded-xl overflow-hidden mb-3 aspect-video border border-gray-200">
            <img src={invite.image_url} alt="Invite" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-violet-300">Generated Invite Preview</p>
              <p className="text-sm font-bold text-white truncate">{invite.message_text?.split('\n')[0] || 'Event Invitation'}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl mb-3 aspect-video flex flex-col items-center justify-center border border-gray-200" style={{ background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)' }}>
          <p className="text-2xl mb-2">📨</p>
          <p className="text-xs text-violet-500 font-medium">No invite generated yet</p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {invite?.image_url ? (
          <a href={invite.image_url} download="invite.png" className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            ↓ Download Assets
          </a>
        ) : (
          <button onClick={onGenerate} disabled={generating} className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50">
            {generating ? '⏳ Generating…' : '✨ Generate Invite'}
          </button>
        )}
        <button onClick={() => invite?.share_url && navigator.clipboard.writeText(invite.share_url)} disabled={!invite?.share_url}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30">
          🔗 Copy RSVP Link
        </button>
      </div>

      {/* RSVP list */}
      <div style={{ borderTop: div1, paddingTop: '12px' }}>
        <div className="flex justify-between items-center text-xs text-gray-400 font-mono mb-2">
          <span>Live Responses</span>
          <span className="flex gap-3">
            <span className="text-emerald-600">{yes} Yes</span>
            <span className="text-red-500">{no} No</span>
            <span className="text-amber-600">{mb} Maybe</span>
          </span>
        </div>
        {guests.length > 0 ? (
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {guests.map(g => (
              <div key={g.id} className="flex justify-between text-xs p-1.5 rounded-lg" style={{ background: preview, border: div1 }}>
                <span className="text-gray-700 font-medium truncate">{g.name}</span>
                <span className={`font-mono shrink-0 ml-2 ${g.response === 'yes' ? 'text-emerald-600' : g.response === 'no' ? 'text-red-500' : 'text-amber-600'}`}>
                  {g.response === 'yes' ? 'Confirmed' : g.response === 'no' ? 'Declined' : 'Maybe'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No RSVPs yet. Share the invite link.</p>
        )}
      </div>
    </section>
  );
}

/* ── Intelligence panel ── */
function IntelligencePanel({ report, costBreakdown, generating, onGenerate }: {
  report: WeatherLegalReport | null; costBreakdown: any; generating: boolean; onGenerate: () => void;
}) {
  return (
    <section className="p-5 rounded-xl" style={card}>
      <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">⛅ Cost, Weather & Legal Agent</h2>

      {!report ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-gray-500 mb-1 font-medium">No intelligence report yet</p>
          <p className="text-xs text-gray-400 mb-5">Fetches live weather, permit guidance, and cost estimates.</p>
          <button onClick={onGenerate} disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors shadow-sm"
            style={{ background: '#2563EB' }}>
            {generating && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" />}
            {generating ? 'Generating…' : '🔮 Generate Report'}
          </button>
        </div>
      ) : (
        <>
          {/* Weather warning */}
          {(report.forecast_precipitation ?? 0) > 1 && (
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4 bg-amber-50 border border-amber-200">
              <span className="text-amber-500 text-sm mt-0.5">⚠️</span>
              <div>
                <h4 className="text-xs font-bold text-amber-700">Weather Mitigation Active</h4>
                <p className="text-xs text-amber-600 mt-0.5">Forecast shows precipitation — consider indoor or tent fallback.</p>
              </div>
            </div>
          )}

          {/* Temperature display */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: preview, border: div1 }}>
            <div className="text-3xl font-bold text-gray-900">{report.forecast_temp}°C</div>
            <div>
              <p className="text-sm text-gray-700 font-medium">{report.forecast_condition}</p>
              <p className="text-xs text-gray-400 font-mono">💧 {report.forecast_precipitation}mm · 💨 {report.forecast_wind_speed}km/h</p>
            </div>
          </div>

          {/* Key-value rows */}
          <div className="space-y-0 text-xs">
            <div className="flex justify-between py-2" style={{ borderBottom: div1 }}>
              <span className="text-gray-400">Cost Estimate:</span>
              <span className="text-gray-900 font-semibold font-mono">€{(report.cost_estimate || 0).toLocaleString()}</span>
            </div>
            {costBreakdown && (
              <div className="flex justify-between py-2" style={{ borderBottom: div1 }}>
                <span className="text-gray-400">Vendors Subtotal:</span>
                <span className="text-gray-900 font-mono">€{Number(costBreakdown.vendors).toLocaleString()}</span>
              </div>
            )}
            {report.legal_notes?.slice(0, 2).map((note, i) => (
              <div key={i} className="flex justify-between py-2 gap-4" style={{ borderBottom: i < 1 ? div1 : 'none' }}>
                <span className="text-gray-400 shrink-0">{i === 0 ? 'Legal:' : 'Mitigation:'}</span>
                <span className={`text-right ${i === 0 ? 'text-amber-600' : 'text-blue-600'}`}>{note}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* ── Checkout pipeline ── */
function CheckoutPipeline({ orders, approvedVendors, subtotal, orderTotal, processing, done, onCreateOrders }: {
  orders: Order[]; approvedVendors: Vendor[]; subtotal: number; orderTotal: number;
  processing: boolean; done: boolean; onCreateOrders: () => void;
}) {
  const total   = orderTotal || subtotal;
  const hasPaid = orders.some(o => o.payment_status === 'mock_paid');

  return (
    <section className="p-5 rounded-xl flex flex-col justify-between" style={{ ...card, border: '1px dashed #D1D5DB' }}>
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">💳 Checkout Pipeline</h2>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            Powered by Mollie
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Complete your secure multi-agent structured order confirmation instantly.</p>

        {/* Financial breakdown */}
        <div className="p-4 rounded-xl space-y-2 mb-4" style={{ background: preview, border: div1 }}>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Approved Vendors Subtotal</span>
            <span className="font-mono text-gray-600">€{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Estimated AI Handling Fees</span>
            <span className="font-mono text-gray-600">€0.00</span>
          </div>
          <div className="h-px" style={{ background: '#E5E7EB' }} />
          <div className="flex justify-between">
            <span className="font-bold text-gray-900 text-sm">Total Event Budget:</span>
            <span className="font-mono font-bold text-emerald-600 text-base">€{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Order history */}
        {orders.length > 0 && (
          <div className="space-y-1 mb-4">
            {orders.map(o => (
              <div key={o.id} className="flex justify-between text-xs p-2 rounded-lg" style={{ background: preview, border: div1 }}>
                <span className="text-gray-400 font-mono">{o.invoice_ref?.slice(0, 16) || o.id.slice(0, 12)}…</span>
                <span className={o.payment_status === 'mock_paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                  {o.payment_status === 'mock_paid' ? 'Paid (mock)' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      {approvedVendors.length === 0 && orders.length === 0 ? (
        <div className="py-3 text-center text-xs text-gray-400 rounded-xl border border-dashed border-gray-200">
          Approve vendors above to unlock payment.
        </div>
      ) : hasPaid || done ? (
        <div className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✓ Ledger Verified (Paid)
        </div>
      ) : (
        <button onClick={onCreateOrders} disabled={processing}
          className="w-full font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-white shadow-sm"
          style={{ background: processing ? '#9CA3AF' : '#059669', boxShadow: processing ? 'none' : '0 2px 8px rgba(5,150,105,0.25)' }}>
          {processing
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin-slow" /> Contacting Gateway…</>
            : <><span>🛡</span> Approve Mock Payment</>}
        </button>
      )}
      <p className="text-center text-[10px] font-mono text-gray-300 mt-2">No real payment is processed.</p>
    </section>
  );
}
