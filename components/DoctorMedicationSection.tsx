'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  User,
  Users,
  Sparkles,
  ChevronRight,
  X,
  Stethoscope,
  Pill,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import type { AssigneeCandidate, PrescriptionMedicine } from '@/types';
import { generatePrescriptionPdf } from '@/lib/prescriptionPdf';

interface DoctorMedicationSectionProps {
  doctorName: string;
  doctorDegree?: string;
  doctorLicense?: string;
  currentThemePrimary: string;
  preselectedPatientId?: string;
  onPrescriptionSent?: (count: number) => void;
}

const PRESET_REGIMENS = [
  {
    label: '🧘 Anxiety Relief Regimen',
    desc: 'Escitalopram + Propranolol for situational panic',
    medicines: [
      { name: 'Escitalopram Tablet', dosage: '10mg', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take with food and water. Do not skip doses.' },
      { name: 'Propranolol Tablet', dosage: '20mg', frequency: 'As needed for physical panic', duration: '15 Days', instructions: 'Take 30 mins before stressful events. Max 2 tablets/day.' },
    ],
    notes: 'Incorporate 10 minutes of diaphragmatic breathing twice daily. Limit caffeine intake past noon.',
  },
  {
    label: '😴 Restful Sleep Support',
    desc: 'Melatonin + Magnesium Glycinate',
    medicines: [
      { name: 'Melatonin Sublingual Tablet', dosage: '3mg', frequency: '30 mins before bedtime', duration: '20 Days', instructions: 'Dim lights after taking. Keep screens away.' },
      { name: 'Magnesium Glycinate', dosage: '250mg', frequency: 'Once daily at dinner', duration: '30 Days', instructions: 'Supports muscular relaxation and nervous calm.' },
    ],
    notes: 'Maintain regular sleep/wake hours. Avoid heavy meals within 2 hours of sleeping.',
  },
  {
    label: '☀️ Mood Elevation Regimen',
    desc: 'Sertraline + B-Complex & D3',
    medicines: [
      { name: 'Sertraline Tablet', dosage: '50mg', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take with a meal. Mild nausea in initial days is normal.' },
      { name: 'Vitamin B-Complex + D3', dosage: '1 Capsule', frequency: 'Once daily with breakfast', duration: '30 Days', instructions: 'Nutritional nervous system support.' },
    ],
    notes: 'Engage in 20 minutes of outdoor sunlight exposure daily. Schedule review in 4 weeks.',
  },
  {
    label: '🧠 Cognitive Calm & Focus',
    desc: 'L-Theanine + Ashwagandha',
    medicines: [
      { name: 'L-Theanine Extract Capsule', dosage: '200mg', frequency: 'Twice daily (Morning & Afternoon)', duration: '30 Days', instructions: 'Promotes alpha brain wave relaxation without drowsiness.' },
      { name: 'Standardized Ashwagandha', dosage: '300mg', frequency: 'Once daily at night', duration: '30 Days', instructions: 'Adaptogenic cortisol regulation.' },
    ],
    notes: 'Practice mindful hydration. Take a 5-minute screen rest every 50 minutes of work.',
  },
];

export default function DoctorMedicationSection({
  doctorName,
  doctorDegree = 'M.D. Healthcare Professional',
  doctorLicense = 'Verified Telehealth Practitioner',
  currentThemePrimary,
  preselectedPatientId,
  onPrescriptionSent,
}: DoctorMedicationSectionProps) {
  // Step 1: Candidate Patients
  const [candidates, setCandidates] = useState<AssigneeCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<AssigneeCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [patientFilter, setPatientFilter] = useState<'all' | 'direct'>('direct');

  // Step 2: Medication Form
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [signatureConfirmed, setSignatureConfirmed] = useState(true);

  // Step 3: Sending & State
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; chatId?: string; pdfUrl?: string } | null>(null);

  // Prescriptions History
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch candidates
  useEffect(() => {
    let isMounted = true;
    setLoadingCandidates(true);
    fetch('/api/tasks/candidates')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        const list: AssigneeCandidate[] = data.users || [];
        setCandidates(list);

        if (preselectedPatientId) {
          const found = list.find(u => u.clerkId === preselectedPatientId);
          if (found) setSelectedPatient(found);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingCandidates(false);
      });

    return () => { isMounted = false; };
  }, [preselectedPatientId]);

  // Fetch past prescriptions
  const loadHistory = () => {
    setLoadingHistory(true);
    fetch('/api/prescriptions')
      .then(res => res.json())
      .then(data => {
        const list = data.prescriptions || [];
        setHistory(list);
        if (onPrescriptionSent) onPrescriptionSent(list.length);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription? It will be removed from your records and patient chat.')) return;
    try {
      const res = await fetch(`/api/prescriptions?id=${prescriptionId}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => {
          const updated = prev.filter(p => (p._id as string) !== prescriptionId);
          if (onPrescriptionSent) onPrescriptionSent(updated.length);
          return updated;
        });
      } else {
        alert('Failed to delete prescription');
      }
    } catch {
      alert('Failed to delete prescription');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(user => {
      if (patientFilter === 'direct' && !user.isDirect) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(q) ||
        user.relationship?.toLowerCase().includes(q)
      );
    });
  }, [candidates, patientFilter, searchQuery]);

  const directCount = useMemo(() => candidates.filter(c => c.isDirect).length, [candidates]);

  // Medicine handlers
  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionMedicine, value: string) => {
    setMedicines(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const applyPreset = (preset: typeof PRESET_REGIMENS[0]) => {
    setMedicines(preset.medicines);
    setClinicalNotes(preset.notes);
  };

  // Preview prescription PDF in new tab
  const handlePreviewPdf = () => {
    if (!selectedPatient) {
      alert('Please select a patient first.');
      return;
    }
    const validMeds = medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      alert('Please add at least one medicine with a name.');
      return;
    }

    const doc = generatePrescriptionPdf({
      doctorName,
      doctorDegree,
      doctorLicense,
      patientName: selectedPatient.name,
      medicines: validMeds,
      notes: clinicalNotes,
    });

    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  };

  // Step 3: Send directly to patient chat in PDF format
  const handleSendPrescription = async () => {
    if (!selectedPatient) {
      setFeedback({ type: 'error', message: 'Step 1: Please select a patient recipient first.' });
      return;
    }

    const validMeds = medicines.filter(m => m.name.trim());
    if (validMeds.length === 0) {
      setFeedback({ type: 'error', message: 'Step 2: Please enter at least one medication name.' });
      return;
    }

    if (!signatureConfirmed) {
      setFeedback({ type: 'error', message: 'Please confirm your digital signature authorization.' });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      // 1. Generate the PDF client-side on Echo Letterhead
      const doc = generatePrescriptionPdf({
        doctorName,
        doctorDegree,
        doctorLicense,
        patientName: selectedPatient.name,
        medicines: validMeds,
        notes: clinicalNotes,
      });

      const pdfDataUri = doc.output('datauristring');
      const pureBase64 = pdfDataUri.includes('base64,') ? pdfDataUri.split('base64,')[1].trim() : pdfDataUri;

      // 2. Post to API to store prescription and dispatch directly to patient chat
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.clerkId,
          patientName: selectedPatient.name,
          medicines: validMeds,
          notes: clinicalNotes,
          digitalSignature: `Dr. ${doctorName}`,
          pdfBase64: pureBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch prescription');
      }

      setFeedback({
        type: 'success',
        message: `Prescription successfully generated on Echo letterhead and delivered directly to ${selectedPatient.name}'s chat!`,
        chatId: data.chatId,
        pdfUrl: data.pdfUrl,
      });

      // Reset form
      setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setClinicalNotes('');
      loadHistory();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error sending prescription' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* ── HEADER BANNER ── */}
      <div
        className="glass"
        style={{
          padding: '2rem 2.25rem',
          borderRadius: '24px',
          border: '1px solid var(--echo-border)',
          background: 'var(--echo-surface)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${currentThemePrimary}, #0d9488)` }} />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '999px', background: 'rgba(13,148,136,0.12)', color: '#0d9488', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              <Stethoscope size={13} />
              Echo Digital Rx System
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--echo-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pill size={24} style={{ color: currentThemePrimary }} />
              Prescribe Medication on Echo Letterhead
            </h2>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginTop: '0.35rem', maxWidth: '680px' }}>
              Select a patient, write personalized medication on the official Echo clinic letterhead, digitally authorize with your name, and dispatch directly into their consultation chat in PDF format.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>Prescribing Authority</div>
              <div style={{ fontWeight: '800', color: 'var(--echo-text)', fontSize: '0.9375rem' }}>Dr. {doctorName}</div>
              <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: '600' }}>{doctorLicense}</div>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: feedback.type === 'success' ? '#22c55e' : '#ef4444' }}>
            {feedback.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span style={{ fontSize: '0.9375rem', fontWeight: '700' }}>{feedback.message}</span>
          </div>

          {feedback.type === 'success' && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {feedback.chatId && (
                <Link href={`/chat/${feedback.chatId}`} style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem', background: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ExternalLink size={14} /> View in Patient Chat
                  </button>
                </Link>
              )}
              {feedback.pdfUrl && (
                <a href={feedback.pdfUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={14} /> View PDF
                  </button>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1: SELECT THE USER (PATIENT) ── */}
      <div
        className="glass"
        style={{
          padding: '1.75rem',
          borderRadius: '24px',
          border: '1px solid var(--echo-border)',
          background: 'var(--echo-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: currentThemePrimary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8125rem' }}>
              1
            </span>
            <h3 style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)', margin: 0 }}>
              Step 1: Select the Patient
            </h3>
          </div>
          {selectedPatient && (
            <button
              onClick={() => setSelectedPatient(null)}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <X size={13} /> Change Patient
            </button>
          )}
        </div>

        {selectedPatient ? (
          /* Active Selected Patient Display */
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              border: `2px solid ${currentThemePrimary}`,
              background: 'var(--echo-surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${currentThemePrimary}, #0d9488)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '1.125rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {selectedPatient.imageUrl ? (
                  <img src={selectedPatient.imageUrl} alt={selectedPatient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  selectedPatient.name?.[0] || 'P'
                )}
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{selectedPatient.name}</span>
                  <span className={`status-dot ${selectedPatient.isOnline ? 'online' : 'offline'}`} />
                  <span style={{ fontSize: '0.7rem', color: selectedPatient.isOnline ? '#22c55e' : 'var(--echo-text-muted)' }}>
                    {selectedPatient.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>{selectedPatient.relationship}</span>
                  <span>Prescription will be delivered directly to this patient</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-purple" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                ✓ Recipient Selected
              </span>
            </div>
          </div>
        ) : (
          /* Search & Patient Selection Grid */
          <div style={{ borderRadius: '16px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface-2)', padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--echo-text-muted)' }} />
                <input
                  type="text"
                  className="echo-input"
                  placeholder="Search patients by name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem', background: 'var(--echo-bg)', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setPatientFilter('direct')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    background: patientFilter === 'direct' ? currentThemePrimary : 'var(--echo-bg)',
                    color: patientFilter === 'direct' ? '#fff' : 'var(--echo-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  My Patients ({directCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPatientFilter('all')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    background: patientFilter === 'all' ? currentThemePrimary : 'var(--echo-bg)',
                    color: patientFilter === 'all' ? '#fff' : 'var(--echo-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  All Users ({candidates.length})
                </button>
              </div>
            </div>

            {loadingCandidates ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                Loading patients list...
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                No patients found matching "{searchQuery}".
              </div>
            ) : (
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {filteredCandidates.map(cand => (
                  <div
                    key={cand.clerkId}
                    onClick={() => {
                      setSelectedPatient(cand);
                      setFeedback(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      background: 'var(--echo-bg)',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${currentThemePrimary}66`;
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${currentThemePrimary}, #0d9488)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                        }}
                      >
                        {cand.imageUrl ? <img src={cand.imageUrl} alt={cand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : cand.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{cand.name}</span>
                          <span className={`status-dot ${cand.isOnline ? 'online' : 'offline'}`} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>{cand.relationship}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.6875rem' }}>{cand.isDirect ? 'Patient' : 'Community'}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: currentThemePrimary, display: 'flex', alignItems: 'center' }}>
                        Select <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── STEP 2: WRITE MEDICINE ON LETTERHEAD ECHO & DIGITALLY SIGN ── */}
      <div
        className="glass"
        style={{
          padding: '2rem',
          borderRadius: '24px',
          border: '1px solid var(--echo-border)',
          background: 'var(--echo-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: currentThemePrimary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8125rem' }}>
              2
            </span>
            <h3 style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)', margin: 0 }}>
              Step 2: Write Medicine on Echo Letterhead & Digitally Sign
            </h3>
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={13} color={currentThemePrimary} /> Quick Clinical Regimens:
          </span>
        </div>

        {/* Quick Regimens Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          {PRESET_REGIMENS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface-2)',
                color: 'var(--echo-text)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = currentThemePrimary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--echo-border)'; }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Medicines Dynamic Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {medicines.map((med, index) => (
            <div
              key={index}
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: currentThemePrimary, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${currentThemePrimary}22`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{index + 1}</span>
                  Medicine Details
                </span>

                {medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(index)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: '#ef4444',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="echo-label">Medicine Name *</label>
                  <input
                    type="text"
                    className="echo-input"
                    placeholder="e.g. Escitalopram Tablet"
                    value={med.name}
                    onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="echo-label">Dosage *</label>
                  <input
                    type="text"
                    className="echo-input"
                    placeholder="e.g. 10mg / 1 Tablet"
                    value={med.dosage}
                    onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="echo-label">Frequency & Timing *</label>
                  <input
                    type="text"
                    className="echo-input"
                    placeholder="e.g. Once daily after breakfast"
                    value={med.frequency}
                    onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="echo-label">Duration *</label>
                  <input
                    type="text"
                    className="echo-input"
                    placeholder="e.g. 30 Days"
                    value={med.duration}
                    onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="echo-label">Special Instructions (Optional)</label>
                <input
                  type="text"
                  className="echo-input"
                  placeholder="e.g. Take with water. Avoid caffeine in the evening."
                  value={med.instructions || ''}
                  onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddMedicine}
            className="btn-secondary"
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              alignSelf: 'flex-start',
            }}
          >
            <Plus size={15} /> Add Another Medicine
          </button>
        </div>

        {/* Clinical Notes & Lifestyle Advice */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label className="echo-label">Clinical Advice & Patient Lifestyle Guidance</label>
          <textarea
            className="echo-input"
            placeholder="e.g. Hydrate adequately, incorporate 15 minutes of fresh air walking daily, avoid alcohol, review in 3 weeks..."
            rows={3}
            value={clinicalNotes}
            onChange={e => setClinicalNotes(e.target.value)}
            style={{ minHeight: '80px', resize: 'vertical' }}
          />
        </div>

        {/* Digital Signature Confirmation */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            background: 'var(--echo-surface-2)',
            border: '1px solid var(--echo-border)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(13,148,136,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9375rem', color: 'var(--echo-text)' }}>
                  Digital Medical Authorization
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
                  Digitally signed by <strong style={{ color: 'var(--echo-text)' }}>Dr. {doctorName}</strong> ({doctorLicense})
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--echo-text)' }}>
              <input
                type="checkbox"
                checked={signatureConfirmed}
                onChange={e => setSignatureConfirmed(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: currentThemePrimary, cursor: 'pointer' }}
              />
              <span>Seal with Digital Signature</span>
            </label>
          </div>
        </div>

        {/* ── LIVE ECHO LETTERHEAD PREVIEW CARD ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--echo-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              📄 Official Echo Letterhead Preview
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>
              Exact format that will be exported to PDF
            </span>
          </div>

          <div
            style={{
              borderRadius: '20px',
              border: '1px solid var(--echo-border)',
              background: '#ffffff',
              color: '#0f172a',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Color Accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, #0d9488, #6366f1)' }} />

            {/* Letterhead Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f766e', letterSpacing: '0.1em', margin: 0 }}>
                  E C H O
                </h1>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6366f1', letterSpacing: '0.05em' }}>
                  MENTAL HEALTH & TELEHEALTH CLINIC
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Confidential Digital Prescription • Verified Healthcare Consultations
                </div>
              </div>

              <div style={{ textAlign: 'right', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a' }}>OFFICIAL MEDICAL PRESCRIPTION</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: '700' }}>Ref: #ECHO-RX-ONLINE</div>
              </div>
            </div>

            {/* Doctor & Patient Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.75rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase' }}>Prescribing Doctor</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: '#0f172a' }}>Dr. {doctorName}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>{doctorDegree}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>License No: {doctorLicense}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase' }}>Patient Information</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: '#0f172a' }}>{selectedPatient?.name || '[Select Patient Above]'}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>Consultation: Echo Telehealth Session</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Status: Active Patient Record</div>
              </div>
            </div>

            {/* Rx Symbol & Medication List */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #0d9488', paddingBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0d9488', fontFamily: 'serif' }}>Rx</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#0f172a' }}>Prescribed Medications & Regimen</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {medicines.filter(m => m.name.trim()).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    No medications added yet. Type medicines above or choose a quick regimen.
                  </div>
                ) : (
                  medicines.filter(m => m.name.trim()).map((med, i) => (
                    <div key={i} style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9375rem', color: '#0f172a' }}>
                          {i + 1}. {med.name} <span style={{ color: '#0d9488', fontSize: '0.8125rem' }}>[{med.dosage}]</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                          Frequency: <strong>{med.frequency}</strong> • Duration: <strong>{med.duration}</strong>
                        </div>
                        {med.instructions && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.15rem' }}>
                            Note: {med.instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Clinical Notes in Preview */}
            {clinicalNotes && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f766e', marginBottom: '0.35rem' }}>
                  CLINICAL GUIDANCE & LIFESTYLE ADVICE:
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: '1.5' }}>{clinicalNotes}</div>
              </div>
            )}

            {/* Digital Signature in Preview */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.65rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0f766e' }}>🔒 DIGITALLY AUTHENTICATED</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Echo Telehealth Medical Standards</div>
                <div style={{ fontSize: '0.65rem', color: '#0d9488' }}>Verified Electronic Signature</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Digitally Signed by:</div>
                <div style={{ fontSize: '1.35rem', fontFamily: 'serif', fontStyle: 'italic', color: '#0f172a', fontWeight: '700', borderBottom: '1px solid #0d9488', display: 'inline-block', paddingBottom: '0.2rem' }}>
                  Dr. {doctorName}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.25rem' }}>Verified Medical Practitioner</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 3: SEND DIRECTLY TO PATIENT CHAT IN PDF FORMAT ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--echo-border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: currentThemePrimary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8125rem' }}>
              3
            </span>
            <span style={{ fontWeight: '800', fontSize: '0.9375rem', color: 'var(--echo-text)' }}>
              Step 3: Send Directly to Patient Chat in PDF format
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePreviewPdf}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={15} /> Preview PDF
            </button>

            <button
              type="button"
              onClick={handleSendPrescription}
              disabled={sending || !selectedPatient || medicines.filter(m => m.name.trim()).length === 0}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '700',
                background: currentThemePrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: (!selectedPatient || medicines.filter(m => m.name.trim()).length === 0) ? 0.6 : 1,
                cursor: (!selectedPatient || medicines.filter(m => m.name.trim()).length === 0) ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? (
                'Generating & Sending PDF...'
              ) : (
                <>
                  <Send size={15} /> Send Directly to {selectedPatient ? selectedPatient.name : 'Patient'}&apos;s Chat (PDF)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── PRESCRIPTIONS HISTORY ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--echo-text)', margin: 0 }}>
              Prescriptions Issued History ({history.length})
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
              All medical prescriptions you have issued and delivered to patient chats.
            </p>
          </div>
        </div>

        {loadingHistory ? (
          <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
            <p style={{ color: 'var(--echo-text-muted)' }}>Loading prescription records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="glass" style={{ padding: '3.5rem 2rem', textAlign: 'center', borderRadius: '20px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💊</div>
            <p style={{ color: 'var(--echo-text)', fontWeight: '600', marginBottom: '0.25rem' }}>No prescriptions issued yet</p>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>
              Select a patient above to prescribe medication and send the signed PDF directly to their chat.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {history.map((rx: any) => (
              <div
                key={rx._id}
                className="glass echo-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: '20px',
                  border: '1px solid var(--echo-border)',
                  background: 'var(--echo-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(13,148,136,0.12)',
                      color: '#0d9488',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--echo-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Patient: {rx.patientName}</span>
                      <span className="badge badge-green" style={{ fontSize: '0.6875rem' }}>PDF Delivered to Chat</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span>💊 {rx.medicines?.length || 0} medication{(rx.medicines?.length || 0) !== 1 ? 's' : ''}</span>
                      <span>✍️ Signed: {rx.digitalSignature}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {new Date(rx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {rx.chatId && (
                    <Link href={`/chat/${rx.chatId}`} style={{ textDecoration: 'none' }}>
                      <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ExternalLink size={14} /> Open Chat
                      </button>
                    </Link>
                  )}
                  {rx.pdfUrl && (
                    <a href={rx.pdfUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8125rem', background: currentThemePrimary, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={14} /> View PDF
                      </button>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePrescription(rx._id as string)}
                    className="btn-secondary"
                    style={{
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                      background: 'rgba(239, 68, 68, 0.06)',
                      cursor: 'pointer',
                    }}
                    title="Delete Prescription"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
