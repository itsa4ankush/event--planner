/**
 * Anthea - Public RSVP Page
 * Phase 6: Enhanced with event data and invite display
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Event, Invite } from '@/lib/db/schema';

export default function RsvpPage() {
  const params = useParams();
  const inviteId = params.inviteId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    response: 'yes' as 'yes' | 'no' | 'maybe',
    comments: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [inviteId]);

  const loadEventData = async () => {
    try {
      const response = await fetch(`/api/events/${inviteId}`);
      const result = await response.json();
      
      if (result.success) {
        setEvent(result.data.event);
        // Try to get invite data
        const invites = result.data.invites || [];
        if (invites.length > 0) {
          setInvite(invites[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: inviteId,
          ...formData,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('RSVP submission failed');
      }
    } catch (error) {
      console.error('RSVP submission failed:', error);
      alert('Failed to submit RSVP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-gray-400 mb-6">
            Your RSVP has been received. We look forward to seeing you at the event!
          </p>
          <p className="text-sm text-gray-500">
            You can close this page now.
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400">
            This invitation link may be invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Event Preview Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Invite Image/Video */}
          {invite?.image_url && (
            <div className="relative h-64 overflow-hidden">
              <img
                src={invite.image_url}
                alt="Event Invitation"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {!invite?.image_url && (
            <div className="h-48 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-2">You're Invited!</h1>
                <p className="text-purple-100">{event.title}</p>
              </div>
            </div>
          )}
          
          <div className="p-8">
            {/* Event Details */}
            <h2 className="text-2xl font-bold text-white mb-6">{event.title}</h2>
            
            {invite?.message_text && (
              <p className="text-gray-400 mb-6 whitespace-pre-line">{invite.message_text}</p>
            )}
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">📅 Date & Time</p>
                <p className="font-medium text-white">{formattedDate}</p>
                <p className="text-gray-400">{event.time || 'Time TBD'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">📍 Location</p>
                <p className="font-medium text-white">{event.location_text}</p>
              </div>
            </div>

            {/* QR Code */}
            {invite?.qr_code_url && (
              <div className="mb-6 text-center">
                <img
                  src={invite.qr_code_url}
                  alt="RSVP QR Code"
                  className="w-32 h-32 mx-auto border-4 border-[#2a2a2a] rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">Scan to RSVP</p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Please RSVP</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-400 mb-1">
                    Email or Phone *
                  </label>
                  <input
                    type="text"
                    id="contact"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="john@example.com or +1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Will you attend? *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, response: 'yes' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                        formData.response === 'yes'
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-[#2a2a2a] text-gray-400 hover:border-green-500/50'
                      }`}
                    >
                      ✓ Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, response: 'no' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                        formData.response === 'no'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-[#2a2a2a] text-gray-400 hover:border-red-500/50'
                      }`}
                    >
                      ✗ No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, response: 'maybe' })}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                        formData.response === 'maybe'
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : 'border-[#2a2a2a] text-gray-400 hover:border-yellow-500/50'
                      }`}
                    >
                      ? Maybe
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-400 mb-1">
                    Additional Comments
                  </label>
                  <textarea
                    id="comments"
                    rows={3}
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Dietary restrictions, +1s, special requests..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit RSVP'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by <span className="font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Anthea AI</span></p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
