/**
 * Contact: validated form opens the user’s mail client with a pre-filled message.
 */

import React, { useState } from 'react';
import { LegalPage } from './LegalPage';
import { playSound } from '../../audio.ts';

const SUPPORT_EMAIL = 'Trifluenz@global.gmail.com';

function buildMailto(subject: string, body: string): string {
  const params = new URLSearchParams({
    subject: `[Trifluenz] ${subject}`,
    body,
  });
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}

const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sentHint, setSentHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim() || subject.trim().length < 3) {
      setError('Please enter a short subject.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setError('Please enter a message (at least 10 characters).');
      return;
    }

    const body = `From: ${name.trim()} <${email.trim()}>\n\n${message.trim()}\n`;
    const url = buildMailto(subject.trim(), body);
    playSound('click');
    window.location.href = url;
    setSentHint(true);
  };

  return (
    <LegalPage title="Contact">
      <p className="text-gray-800">
        For partnerships, campaign support, creator onboarding, or legal notices, use the form below. It opens your
        email app with a pre-filled message to <strong>{SUPPORT_EMAIL}</strong>.
      </p>
      <p className="text-sm text-gray-600">
        Phone: <strong>0790155109</strong>. For urgent safety issues, include &quot;Urgent&quot; in the subject line.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Your email
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="contact-subject" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Subject
          </label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Message
          </label>
          <textarea
            id="contact-message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white/80 px-3 py-2.5 text-sm focus:border-[#FF5500] focus:outline-none focus:ring-1 focus:ring-[#FF5500]"
            required
          />
        </div>
        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        {sentHint && (
          <p className="text-sm font-medium text-emerald-700" role="status">
            If your mail app did not open, copy your message and send it manually to {SUPPORT_EMAIL}.
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto sm:px-10 button-brand"
        >
          Open email draft
        </button>
      </form>
    </LegalPage>
  );
};

export default Contact;
