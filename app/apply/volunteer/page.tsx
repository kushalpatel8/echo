'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function VolunteerApplyPage() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    phoneNo: '',
    whatsappNumber: '',
    reason: '',
    degree: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'volunteer' }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit application');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--echo-bg)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem' }}>Join as a Volunteer 🤝</h1>
          <p style={{ color: 'var(--echo-text-muted)' }}>Fill in your details to help others on their healing journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="echo-card animate-fade-in-up">
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="echo-label">Phone Number</label>
            <input
              type="tel"
              className="echo-input"
              required
              placeholder="+91 9876543210"
              value={formData.phoneNo}
              onChange={e => setFormData(p => ({ ...p, phoneNo: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="echo-label">WhatsApp Number</label>
            <input
              type="tel"
              className="echo-input"
              required
              placeholder="+91 9876543210"
              value={formData.whatsappNumber}
              onChange={e => setFormData(p => ({ ...p, whatsappNumber: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="echo-label">Why do you want to volunteer?</label>
            <textarea
              className="echo-input"
              required
              placeholder="Tell us about your motivation..."
              value={formData.reason}
              onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="echo-label">Degree (Sociology/Philosophy/Medical - Optional)</label>
            <input
              type="text"
              className="echo-input"
              placeholder="e.g. BA in Sociology"
              value={formData.degree}
              onChange={e => setFormData(p => ({ ...p, degree: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="echo-label">Any relevant experience? (Where?)</label>
            <textarea
              className="echo-input"
              placeholder="Describe your previous experience..."
              value={formData.experience}
              onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))}
            />
          </div>

          {error && <div className="badge badge-red" style={{ marginBottom: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: '0.5rem' }}>{error}</div>}

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/role-selection" style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>Change Role</Link>
        </div>
      </div>
    </main>
  );
}
