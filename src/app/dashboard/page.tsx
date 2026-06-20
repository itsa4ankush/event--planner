/**
 * EventPilot AI - Main Dashboard
 * Phase 2: Unified event planning dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Event, KpiCategory, Vendor, Guest, WeatherLegalReport, Order, Invite, VendorQuote } from '@/lib/db/schema';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');

  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<KpiCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [weatherReport, setWeatherReport] = useState<WeatherLegalReport | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchingVendors, setSearchingVendors] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<any>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [callingVendor, setCallingVendor] = useState<string | null>(null);
  const [callResult, setCallResult] = useState<VendorQuote | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadEventData(eventId);
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const loadEventData = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`);
      const result = await response.json();

      if (result.success) {
        setEvent(result.data.event);
        setCategories(result.data.categories);
        setVendors(result.data.vendors);
        setGuests(result.data.guests);
        setWeatherReport(result.data.weatherReport);
        setOrders(result.data.orders);
        if (result.data.invites && result.data.invites.length > 0) {
          setInvite(result.data.invites[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindVendors = async () => {
    if (!eventId) return;

    setSearchingVendors(true);
    try {
      const response = await fetch('/api/vendors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();
      if (result.success) {
        // Reload event data to get new vendors
        await loadEventData(eventId);
      }
    } catch (error) {
      console.error('Vendor search failed:', error);
    } finally {
      setSearchingVendors(false);
    }
  };

  const handleVendorAction = async (vendorId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok && eventId) {
        await loadEventData(eventId);
      }
    } catch (error) {
      console.error('Vendor action failed:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!eventId) return;

    setGeneratingReport(true);
    try {
      const response = await fetch('/api/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const result = await response.json();
      if (result.success) {
        setWeatherReport(result.report);
        setCostBreakdown(result.costBreakdown);
        // Reload to get updated data
        await loadEventData(eventId);
      }
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!eventId) return;

    setGeneratingInvite(true);
    try {
      const response = await fetch('/api/invites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          style: 'modern'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setInvite(result.invite);
        await loadEventData(eventId);
      }
    } catch (error) {
      console.error('Invite generation failed:', error);
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleCallVendor = async (vendorId: string) => {
    if (!eventId) return;

    setCallingVendor(vendorId);
    setShowCallModal(true);
    setCallResult(null);

    try {
      const response = await fetch(`/api/vendors/${vendorId}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          mode: 'demo' // Use demo mode for hackathon
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCallResult(result.quote);
        await loadEventData(eventId);
      }
    } catch (error) {
      console.error('Vendor call failed:', error);
    } finally {
      setCallingVendor(null);
    }
  };

  const handleCreateOrders = async () => {
    if (!eventId) return;

    setProcessingPayment(true);
    setShowPaymentModal(true);

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          paymentMethod: 'ideal'
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadEventData(eventId);
      }
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Anthea
              </h1>
              <p className="text-sm text-gray-400">AI Event Planning Dashboard</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition">
              New Event
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!event ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Event Brief Section */}
            <EventBriefSection event={event} />

            {/* KPI Categories Section */}
            <KpiCategoriesSection categories={categories} />

            {/* Find Vendors Button */}
            {categories.length > 0 && vendors.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Find Vendors?</h3>
                <p className="text-gray-600 mb-4">
                  I've identified {categories.length} categories for your event. Let me search for the best vendors!
                </p>
                <button
                  onClick={handleFindVendors}
                  disabled={searchingVendors}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {searchingVendors ? 'Searching Vendors...' : '🔍 Find Vendors'}
                </button>
              </div>
            )}

            {/* Vendors Section */}
            {vendors.length > 0 && (
              <VendorsSection
                vendors={vendors}
                onVendorAction={handleVendorAction}
                onCallVendor={handleCallVendor}
              />
            )}

            {/* Generate Intelligence Report Button */}
            {vendors.filter(v => v.status === 'approved').length > 0 && !weatherReport && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Ready for Intelligence Report?</h3>
                <p className="text-gray-400 mb-4">
                  Get weather forecast, cost estimates, and legal guidance for your event
                </p>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {generatingReport ? '⏳ Generating Report...' : '🔮 Generate Intelligence Report'}
                </button>
              </div>
            )}

            {/* Weather/Legal Panel */}
            <WeatherLegalSection report={weatherReport} costBreakdown={costBreakdown} />

            {/* Invite Preview Section */}
            <InvitePreviewSection
              eventId={event.id}
              invite={invite}
              onGenerate={handleGenerateInvite}
              generating={generatingInvite}
            />

            {/* RSVP List Section */}
            <RsvpListSection guests={guests} />

            {/* Orders/Payment Section */}
            <OrdersSection
              orders={orders}
              vendors={vendors}
              onCreateOrders={handleCreateOrders}
              processing={processingPayment}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Event Yet</h2>
        <p className="text-gray-600 mb-6">
          Start by creating a new event. Our AI agents will help you plan everything from vendor selection to guest invitations.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          Create Your First Event
        </button>
      </div>
    </div>
  );
}

function EventBriefSection({ event }: { event: Event }) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Brief</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500">Title</p>
          <p className="font-medium text-gray-900">{event.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium text-gray-900 capitalize">{event.event_type.replace('_', ' ')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Date</p>
          <p className="font-medium text-gray-900">{new Date(event.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Guests</p>
          <p className="font-medium text-gray-900">{event.guest_count}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium text-gray-900">{event.location_text}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Budget</p>
          <p className="font-medium text-gray-900">
            {event.budget_total ? `$${event.budget_total.toLocaleString()}` : 'Not set'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {event.status}
          </span>
        </div>
      </div>
    </section>
  );
}

function KpiCategoriesSection({ categories }: { categories: KpiCategory[] }) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">KPI Categories</h2>
      {categories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No categories defined yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-900 capitalize mb-2">
                {category.name.replace('_', ' & ')}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(category.status)}`}>
                {category.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VendorsSection({
  vendors,
  onVendorAction,
  onCallVendor
}: {
  vendors: Vendor[];
  onVendorAction: (vendorId: string, status: 'approved' | 'rejected') => void;
  onCallVendor: (vendorId: string) => void;
}) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendors ({vendors.length})</h2>
      <div className="space-y-3">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{vendor.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>⭐ {vendor.rating.toFixed(1)} ({vendor.review_count} reviews)</span>
                {vendor.price_estimate && <span>${vendor.price_estimate.toLocaleString()}</span>}
                <span className="capitalize">{vendor.source}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVendorStatusColor(vendor.status)}`}>
                {vendor.status}
              </span>
              {vendor.status === 'shortlisted' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onVendorAction(vendor.id, 'approved')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onVendorAction(vendor.id, 'rejected')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
              {vendor.status === 'approved' && (
                <button
                  onClick={() => onCallVendor(vendor.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition flex items-center gap-1"
                >
                  📞 Call Vendor
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function InvitePreviewSection({
  eventId,
  invite,
  onGenerate,
  generating
}: {
  eventId: string;
  invite: Invite | null;
  onGenerate: () => void;
  generating: boolean;
}) {
  if (!invite) {
    return (
      <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">📨 Event Invitation</h2>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Generate a beautiful AI-powered invitation for your event</p>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {generating ? '⏳ Generating Invite...' : '✨ Generate Invitation'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-4">📨 Event Invitation</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Invite Preview */}
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Preview</h3>
          {invite.image_url ? (
            <img
              src={invite.image_url}
              alt="Invitation"
              className="w-full rounded-lg border border-[#2a2a2a]"
            />
          ) : (
            <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Generating image...</p>
            </div>
          )}
          {invite.video_url && (
            <div className="mt-3">
              <video
                src={invite.video_url}
                controls
                className="w-full rounded-lg border border-[#2a2a2a]"
              />
            </div>
          )}
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Share Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={invite.share_url || ''}
                readOnly
                className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(invite.share_url || '')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          {invite.qr_code_url && (
            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
              <h3 className="text-sm font-medium text-gray-400 mb-3">QR Code</h3>
              <img
                src={invite.qr_code_url}
                alt="QR Code"
                className="w-32 h-32 mx-auto border-4 border-[#2a2a2a] rounded-lg"
              />
              <p className="text-xs text-gray-500 text-center mt-2">Scan to RSVP</p>
            </div>
          )}

          {invite.message_text && (
            <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Message</h3>
              <p className="text-sm text-gray-300 whitespace-pre-line">{invite.message_text}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RsvpListSection({ guests }: { guests: Guest[] }) {
  const yesCount = guests.filter(g => g.response === 'yes').length;
  const noCount = guests.filter(g => g.response === 'no').length;
  const maybeCount = guests.filter(g => g.response === 'maybe').length;

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">RSVP Responses</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600 font-medium">✓ {yesCount} Yes</span>
          <span className="text-red-600 font-medium">✗ {noCount} No</span>
          <span className="text-yellow-600 font-medium">? {maybeCount} Maybe</span>
        </div>
      </div>
      {guests.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No RSVPs yet</p>
      ) : (
        <div className="space-y-2">
          {guests.map((guest) => (
            <div key={guest.id} className="border border-gray-200 rounded p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{guest.name}</p>
                <p className="text-sm text-gray-600">{guest.contact}</p>
                {guest.comments && <p className="text-sm text-gray-500 mt-1">{guest.comments}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResponseColor(guest.response)}`}>
                {guest.response}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WeatherLegalSection({ report, costBreakdown }: { report: WeatherLegalReport | null; costBreakdown: any }) {
  if (!report) return null;

  return (
    <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-6">🔮 Intelligence Report</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Weather Forecast */}
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
          <h3 className="font-medium text-purple-400 mb-3 flex items-center gap-2">
            <span>🌤️</span> Weather Forecast
          </h3>
          <p className="text-3xl font-bold text-white mb-1">{report.forecast_temp}°C</p>
          <p className="text-gray-400 mb-2">{report.forecast_condition}</p>
          {report.forecast_precipitation !== undefined && (
            <p className="text-sm text-gray-500">💧 {report.forecast_precipitation}mm precipitation</p>
          )}
          {report.forecast_wind_speed !== undefined && (
            <p className="text-sm text-gray-500">💨 {report.forecast_wind_speed}km/h wind</p>
          )}
        </div>

        {/* Cost Estimate */}
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
          <h3 className="font-medium text-pink-400 mb-3 flex items-center gap-2">
            <span>💰</span> Cost Estimate
          </h3>
          <p className="text-3xl font-bold text-white mb-3">
            €{report.cost_estimate?.toLocaleString() || 0}
          </p>
          {costBreakdown && (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Vendors:</span>
                <span>€{costBreakdown.vendors?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Permits:</span>
                <span>€{costBreakdown.permits?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Insurance:</span>
                <span>€{costBreakdown.insurance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400 pt-1 border-t border-[#2a2a2a]">
                <span>Contingency:</span>
                <span>€{costBreakdown.contingency?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Legal Considerations */}
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#2a2a2a]">
          <h3 className="font-medium text-blue-400 mb-3 flex items-center gap-2">
            <span>⚖️</span> Legal Guidance
          </h3>
          {report.legal_notes && report.legal_notes.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-400">
              {report.legal_notes.slice(0, 5).map((note, i) => (
                <li key={i} className="leading-relaxed">{note}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No special considerations</p>
          )}
        </div>
      </div>
    </section>
  );
}

function OrdersSection({
  orders,
  vendors,
  onCreateOrders,
  processing
}: {
  orders: Order[];
  vendors: Vendor[];
  onCreateOrders: () => void;
  processing: boolean;
}) {
  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
  const approvedVendors = vendors.filter(v => v.status === 'approved');
  const canCreateOrders = approvedVendors.length > 0 && orders.length === 0;

  return (
    <section className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">💳 Orders & Payment</h2>
        {orders.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white">€{totalAmount.toLocaleString()}</p>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          {canCreateOrders ? (
            <>
              <p className="text-gray-400 mb-4">Ready to finalize your event budget?</p>
              <button
                onClick={onCreateOrders}
                disabled={processing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {processing ? '⏳ Processing...' : '💳 Proceed to Payment'}
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Powered by</span>
                <svg className="h-5" viewBox="0 0 98 24" fill="none">
                  <path d="M20.2 0C9.1 0 0 9.1 0 20.2s9.1 20.2 20.2 20.2 20.2-9.1 20.2-20.2S31.3 0 20.2 0zm0 36.4c-8.9 0-16.2-7.3-16.2-16.2S11.3 4 20.2 4s16.2 7.3 16.2 16.2-7.3 16.2-16.2 16.2z" fill="#5A67D8"/>
                  <text x="45" y="18" fill="#fff" fontSize="16" fontWeight="bold">Mollie</text>
                </svg>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Approve vendors to create orders</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-white">Invoice #{order.invoice_ref || order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-400">€{order.amount.toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status.replace('mock_', '')}
                </span>
              </div>
              {order.payment_status === 'mock_paid' && (
                <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                  <p className="text-xs text-green-400">✓ Payment completed via Mollie</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Helper functions for status colors
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-800',
    searching: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    ordered: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getVendorStatusColor(status: string): string {
  const colors: Record<string, string> = {
    shortlisted: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-blue-100 text-blue-800',
    quoted: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getResponseColor(response: string): string {
  const colors: Record<string, string> = {
    yes: 'bg-green-100 text-green-800',
    no: 'bg-red-100 text-red-800',
    maybe: 'bg-yellow-100 text-yellow-800',
  };
  return colors[response] || 'bg-gray-100 text-gray-800';
}

function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    mock_pending: 'bg-yellow-100 text-yellow-800',
    mock_paid: 'bg-green-100 text-green-800',
    mock_failed: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Made with Bob

function PaymentModal({ 
  isOpen, 
  onClose, 
  processing 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  processing: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          {processing ? (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <span className="text-2xl">💳</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
              <p className="text-gray-400 mb-4">Securely processing your payment via Mollie...</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Powered by</span>
                <span className="font-bold text-purple-400">Mollie</span>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-400 mb-6">Your orders have been created and payment processed.</p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
