'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import PhoneInput from '@/components/PhoneInput';

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
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handlePhoneChange = (fullNumber: string) => {
    setFormData(prev => {
      const updated = { ...prev, phoneNo: fullNumber };
      if (sameAsPhone) {
        updated.whatsappNumber = fullNumber;
      }
      return updated;
    });
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsappNumber: prev.phoneNo }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const phoneDigits = formData.phoneNo.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 6) {
      setError('Please provide a valid phone number with country code.');
      setLoading(false);
      return;
    }

    const whatsappDigits = formData.whatsappNumber.replace(/\D/g, '');
    if (!whatsappDigits || whatsappDigits.length < 6) {
      setError('Please provide a valid WhatsApp number with country code.');
      setLoading(false);
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please tell us why you want to volunteer.');
      setLoading(false);
      return;
    }

    if (!agreed) {
      setError('You must agree to the Terms & Conditions and Code of Conduct to apply.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'volunteer' }),
      });

      if (res.ok) {
        router.push('/apply/status');
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
          {/* Phone Number with Country Code */}
          <PhoneInput
            id="volunteer-phone"
            label="Phone Number"
            required
            value={formData.phoneNo}
            onChange={handlePhoneChange}
            defaultCountryCode="+91"
            placeholder="e.g. 98765 43210"
            helperText="Select your country code and enter your primary phone number."
          />

          {/* Same as Phone Number checkbox */}
          <div style={{ marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--echo-text-muted)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={sameAsPhone}
                onChange={e => handleSameAsPhoneToggle(e.target.checked)}
                style={{ width: '0.95rem', height: '0.95rem', accentColor: 'var(--echo-primary)', cursor: 'pointer' }}
              />
              <span>WhatsApp number is the same as Phone Number</span>
            </label>
          </div>

          {/* WhatsApp Number with Country Code */}
          {!sameAsPhone && (
            <PhoneInput
              id="volunteer-whatsapp"
              label="WhatsApp Number"
              required
              value={formData.whatsappNumber}
              onChange={fullNumber => setFormData(p => ({ ...p, whatsappNumber: fullNumber }))}
              defaultCountryCode="+91"
              placeholder="e.g. 98765 43210"
              helperText="Provide your active WhatsApp contact with country code for platform communications."
            />
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="echo-label">Why do you want to volunteer? *</label>
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

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid var(--echo-border)', 
            borderRadius: '0.75rem', 
            padding: '1.25rem', 
            marginBottom: '1.5rem' 
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📜</span> Helper Terms & Code of Conduct
            </h3>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', paddingLeft: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Zero Tolerance for Abuse:</strong> You agree to communicate with empathy and respect. Using profanity, slurs, or emotionally harmful language is strictly prohibited.</li>
              <li><strong>3-Strike Policy:</strong> Our automated AI moderation actively screens all chat sessions. Violating communication standards results in: 1st Warning, 2nd Strong Warning, and on the 3rd offense, an immediate automatic account ban.</li>
              <li><strong>Confidentiality:</strong> You agree to maintain strict confidentiality regarding all patient and user conversations.</li>
              <li><strong>Professional Integrity:</strong> You understand that providing misleading advice or harassment will lead to immediate revocation of your helper status by admin.</li>
            </ul>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--echo-text)', fontWeight: '600' }}>
              <input 
                type="checkbox" 
                required 
                checked={agreed} 
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: '0.2rem', width: '1rem', height: '1rem', accentColor: 'var(--echo-primary)', cursor: 'pointer' }}
              />
              <span>I have read and agree to the Helper Terms, Code of Conduct, and the 3-Strike Ban Policy.</span>
            </label>
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
