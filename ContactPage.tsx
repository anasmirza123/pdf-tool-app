import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Bug, Lightbulb, HelpCircle } from 'lucide-react';

// TODO: replace with the real support inbox before launch — this is currently
// a placeholder and mail sent via the mailto: link below will not reach anyone.
const SUPPORT_EMAIL = 'support@docuforge.app';

const CATEGORY_LABEL: Record<'general' | 'bug' | 'feature', string> = {
  general: 'General question',
  bug: 'Bug report',
  feature: 'Feature idea'
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'general' | 'bug' | 'feature'>('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // No backend exists to receive this form, so the only honest way to
    // actually deliver the message is to hand it to the person's own email
    // client via a mailto: link — nothing is silently "sent" server-side.
    const subject = `[DocuForge — ${CATEGORY_LABEL[category]}] from ${name}`;
    const body = `${message}\n\n—\nFrom: ${name} <${email}>`;
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-indigo-400">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Support & Feedback</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Have a question about document processing, found a bug with a specific PDF format, or want to suggest a new tool? We'd love to hear from you.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-xl">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Almost done!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your email app should be opening now with your message pre-filled to{' '}
              <span className="font-mono text-slate-200">{SUPPORT_EMAIL}</span>. Just hit send from there —
              nothing is transmitted until you do.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
              className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Subject Category</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-colors ${
                    category === 'general'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" /> General
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-colors ${
                    category === 'bug'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Bug className="h-3.5 w-3.5" /> Bug Report
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('feature')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-colors ${
                    category === 'feature'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lightbulb className="h-3.5 w-3.5" /> Feature Idea
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Message</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question, request, or issue in detail..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 active:scale-[0.99]"
            >
              <Send className="h-4 w-4" /> Send Message
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 gap-2">
        <span className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-indigo-400" />
          Direct Inquiries: <span className="text-slate-300 font-mono">{SUPPORT_EMAIL}</span>
        </span>
      </div>
    </div>
  );
};
