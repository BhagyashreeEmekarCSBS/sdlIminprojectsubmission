'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/authContext';
import {
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle2,
  Send,
  Ticket,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // General Review state
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Food Quality');
  const [comments, setComments] = useState('');
  const [reviewMsg, setReviewMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Complaint state
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintMsg, setComplaintMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchFeedbackData = async () => {
    try {
      const [compRes, feedRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/feedback'),
      ]);

      if (compRes.ok) setComplaints((await compRes.json()).complaints || []);
      if (feedRes.ok) setRecentFeedbacks((await feedRes.json()).feedbacks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReviewMsg({ text: 'Please sign in to submit feedback.', error: true });
      return;
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, category, comments }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMsg({ text: data.message });
        setComments('');
        fetchFeedbackData();
      } else {
        setReviewMsg({ text: data.error || 'Failed to submit review', error: true });
      }
    } catch (e) {
      setReviewMsg({ text: 'Error submitting review', error: true });
    }
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setComplaintMsg({ text: 'Please sign in to file a support ticket.', error: true });
      return;
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: complaintSubject,
          description: complaintDesc,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComplaintMsg({ text: data.message });
        setComplaintSubject('');
        setComplaintDesc('');
        fetchFeedbackData();
      } else {
        setComplaintMsg({ text: data.error || 'Failed to raise ticket', error: true });
      }
    } catch (e) {
      setComplaintMsg({ text: 'Error raising ticket', error: true });
    }
  };

  return (
    <div className="flex-1 flex w-full">
      <Sidebar />

      <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-orange-600" />
            <span>Student Feedback & Support Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Share your dining feedback, rate canteen dishes, or raise order issues for staff review
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form 1: General Review / Rating */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Rate Canteen Quality & Service</span>
              </h2>
              <p className="text-xs text-slate-500">
                Submit a genuine review to earn 5 loyalty points!
              </p>
            </div>

            {reviewMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  reviewMsg.error
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {reviewMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Food Quality">Food Quality & Taste</option>
                  <option value="Service Speed">Preparation & Service Speed</option>
                  <option value="Cleanliness">Cleanliness & Hygiene</option>
                  <option value="App Experience">Smart Canteen Pro System</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">Comments</label>
                <textarea
                  rows={3}
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Tell us what you liked or what could be improved..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback (+5 Points)</span>
              </button>
            </form>
          </div>

          {/* Form 2: Report an Issue / Complaint Ticket */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>Report an Issue / Complaint Ticket</span>
              </h2>
              <p className="text-xs text-slate-500">
                Raise an issue directly with Canteen Management for rapid resolution
              </p>
            </div>

            {complaintMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  complaintMsg.error
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {complaintMsg.text}
              </div>
            )}

            <form onSubmit={handleFileComplaint} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Missing chutney in Masala Dosa, Cold Chai"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Issue Description</label>
                <textarea
                  rows={4}
                  required
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Describe what occurred, token number if known, and how we can make it right..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Raise Support Ticket</span>
              </button>
            </form>
          </div>
        </div>

        {/* Existing Support Tickets / Response Status */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-orange-600" />
            <span>Your Support Tickets & Resolutions ({complaints.length})</span>
          </h2>

          {complaints.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No tickets filed yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-orange-600">{c.ticketNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.subject}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{c.description}</p>

                  {c.adminResponse && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 mt-2">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-0.5">
                        Admin Resolution:
                      </span>
                      <p className="text-emerald-700 dark:text-emerald-300">{c.adminResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
