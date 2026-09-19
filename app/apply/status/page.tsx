'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import {
  Stethoscope,
  Users,
  Clock,
  ShieldCheck,
  Phone,
  FileText,
  Award,
  Heart,
  CheckSquare,
  Shield,
  Home,
  Trash2,
  Undo2,
  LogOut,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import BubbleLoader from '@/components/BubbleLoader';

interface RoleDetail {
  id: 'doctor' | 'volunteer';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  whoIsItFor: string;
  verificationLevel: string;
  verificationIcon: React.ReactNode;
  features: { title: string; desc: string; icon: React.ReactNode }[];
  responsibilities: string[];
}

const ROLES_INFO: Record<'doctor' | 'volunteer', RoleDetail> = {
  doctor: {
    id: 'doctor',
    title: 'Mental Health Professional (Doctor)',
    subtitle: 'Clinical therapist, licensed psychologist, or psychiatrist',
    badge: 'Expert Care • Admin Verification Required',
    badgeColor: '#06b6d4',
    icon: <Stethoscope size={28} />,
    emoji: '👨‍⚕️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.05) 100%)',
    description: 'A clinical gateway for certified medical doctors, clinical psychologists, and psychiatrists to support patients with professional expertise.',
    whoIsItFor: 'Licensed psychologists, psychiatrists, therapists, and certified mental health professionals holding valid medical credentials.',
    verificationLevel: 'Document & License Review by Admin',
    verificationIcon: <ShieldCheck size={16} color="#06b6d4" />,
    features: [
      {
        title: 'Patient Connection Requests',
        desc: 'Review incoming patient requests, view summaries, and accept or decline based on your clinical capacity.',
        icon: <FileText size={18} color="#06b6d4" />
      },
      {
        title: 'Professional WhatsApp Handshake',
        desc: 'ECHO’s secure Request-Accept-Connect system: only share your WhatsApp contact with patients you explicitly approve.',
        icon: <Phone size={18} color="#06b6d4" />
      },
      {
        title: 'Direct Patient Consultation Chat',
        desc: 'Secure, real-time messaging console to provide timely clinical guidance and consultations.',
        icon: <Users size={18} color="#06b6d4" />
      },
      {
        title: 'Verified Professional Profile',
        desc: 'Showcase your specialization, medical degrees, years of experience, and clinic affiliations to building trust.',
        icon: <Award size={18} color="#06b6d4" />
      }
    ],
    responsibilities: [
      'Submit valid medical license & qualification documents',
      'Maintain patient confidentiality & clinical ethics',
      'Promptly respond to approved patient connection requests'
    ]
  },
  volunteer: {
    id: 'volunteer',
    title: 'Volunteer / Peer Supporter',
    subtitle: 'Offering compassion, active listening & daily wellness guidance',
    badge: 'Community Hero • Peer Support',
    badgeColor: '#a78bfa',
    icon: <Users size={28} />,
    emoji: '🤝',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(124,58,237,0.05) 100%)',
    description: 'A community-driven role for empathetic listeners dedicated to supporting peers through emotional distress, isolation, and daily life stress.',
    whoIsItFor: 'Individuals with strong empathy, active listening skills, psychology students, or anyone passionate about mental wellness advocacy.',
    verificationLevel: 'Application & Safety Screening by Admin',
    verificationIcon: <ShieldCheck size={16} color="#a78bfa" />,
    features: [
      {
        title: '1-on-1 Peer Support Chat',
        desc: 'Connect live with users seeking a warm, compassionate, non-judgmental human presence.',
        icon: <Heart size={18} color="#a78bfa" />
      },
      {
        title: 'Wellness Task Assignment',
        desc: 'Assign personalized daily self-care tasks and mindful micro-habits to guide users on their recovery journey.',
        icon: <CheckSquare size={18} color="#a78bfa" />
      },
      {
        title: 'Community Karma & Leaderboard',
        desc: 'Earn karma points for every meaningful interaction and climb the ECHO helper leaderboard.',
        icon: <Award size={18} color="#a78bfa" />
      },
      {
        title: 'Safety Guidelines & Crisis Prompts',
        desc: 'Access standard crisis escalation guidelines to keep conversations safe and constructive.',
        icon: <Shield size={18} color="#a78bfa" />
      }
    ],
    responsibilities: [
      'Provide unconditional positive regard and active listening',
      'Never offer unauthorized medical diagnoses or prescriptions',
      'Follow platform crisis and emergency escalation protocols'
    ]
  }
};

export default function ApplicationStatusPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        if (!isMounted) return;

        if (data.user) {
          if (data.user.applicationStatus === 'approved') {
            router.replace('/');
            return;
          }
          setUser(data.user);
        } else {
          router.replace('/role-selection');
        }
      } catch {
        // Handled on next poll cycle
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router]);

  const handleWithdrawApplication = async () => {
    if (!confirm('Are you sure you want to withdraw your application? Your role will return to regular user, and you can reapply whenever you wish.')) {
      return;
    }

    try {
      setActionLoading('withdraw');
      const res = await fetch('/api/apply', { method: 'DELETE' });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to withdraw application. Please try again.');
      }
    } catch {
      alert('Network error while withdrawing application.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading('delete');
      await fetch('/api/users/profile', { method: 'DELETE' });
      signOut(() => router.push('/'));
    } catch {
      alert('Failed to delete account. Please try again.');
      setActionLoading(null);
    }
  };

  if (loading) {
    return <BubbleLoader message="Checking application status..." />;
  }

  const roleKey = user?.role === 'doctor' ? 'doctor' : 'volunteer';
  const roleInfo = ROLES_INFO[roleKey];
  const profile = user?.role === 'doctor' ? user?.doctorProfile : user?.volunteerProfile;
  const isRejected = user?.applicationStatus === 'rejected';

  return (
    <main style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: `radial-gradient(ellipse at top center, ${roleInfo.color}15 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(124, 58, 237, 0.08) 0%, transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Header Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--echo-surface)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--echo-border)',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-secondary))',
            padding: '2px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img src="/favicon.ico" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--echo-text)', letterSpacing: '-0.03em' }}>
            ECHO
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggle />
          <button
            onClick={() => router.push('/')}
            className="btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Home size={15} /> Return Home
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>
        
        {/* Status Announcement Banner */}
        <div
          className="glass echo-card animate-fade-in-up"
          style={{
            borderRadius: '24px',
            padding: '2.25rem 2rem',
            textAlign: 'center',
            border: `1px solid ${isRejected ? '#ef4444' : roleInfo.color}55`,
            background: isRejected 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--echo-surface) 100%)'
              : `linear-gradient(135deg, ${roleInfo.color}15 0%, var(--echo-surface) 100%)`,
            boxShadow: `0 15px 40px rgba(0,0,0,0.1), 0 0 25px ${isRejected ? '#ef4444' : roleInfo.color}20`,
            marginBottom: '2rem'
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            {isRejected ? '❌' : '⏳'}
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            background: isRejected ? 'rgba(239, 68, 68, 0.15)' : `${roleInfo.color}20`,
            border: `1px solid ${isRejected ? '#ef4444' : roleInfo.color}60`,
            color: isRejected ? '#ef4444' : roleInfo.color,
            fontSize: '0.8125rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem',
          }}>
            {isRejected ? 'Application Declined' : 'Under Review by Admin'}
          </div>

          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '900', color: 'var(--echo-text)', marginBottom: '0.75rem' }}>
            {isRejected 
              ? `Application for ${roleInfo.title} Not Approved`
              : `Application for ${roleInfo.title} is Pending`}
          </h1>

          <p style={{ color: 'var(--echo-text-muted)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 1.75rem' }}>
            {isRejected
              ? 'Unfortunately, your application was not approved by the admin team. You can withdraw your application, modify your credentials, or return home as a regular user.'
              : `Thank you for applying as a ${user?.role === 'doctor' ? 'Doctor' : 'Volunteer'}! Our administration team is currently vetting your submitted credentials. This page will automatically update once verified.`}
          </p>

          {/* Key Actions Row */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Home size={16} /> Return Home
            </button>

            <button
              onClick={handleWithdrawApplication}
              disabled={actionLoading === 'withdraw'}
              className="btn-secondary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.9375rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fbbf24',
                borderColor: 'rgba(251, 191, 36, 0.4)',
              }}
            >
              <Undo2 size={16} />
              {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw Application'}
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={actionLoading === 'delete'}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.9375rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Trash2 size={16} />
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>

        {/* Submitted Application Summary Card */}
        {profile && (
          <div
            className="glass echo-card animate-fade-in-up"
            style={{
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid var(--echo-border)',
              background: 'var(--echo-surface)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--echo-text)' }}>
                <span>📋</span> Your Submitted Application Details
              </h3>
              <span className={`badge badge-${user?.role === 'doctor' ? 'cyan' : 'purple'}`}>
                {user?.role}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              background: 'var(--echo-surface-2)',
              borderRadius: '14px',
              padding: '1.25rem',
              fontSize: '0.875rem'
            }}>
              {profile.phoneNo && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>📞 Phone Number</div>
                  <div style={{ fontWeight: '600' }}>{profile.phoneNo}</div>
                </div>
              )}

              {profile.whatsappNumber && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>💬 WhatsApp Number</div>
                  <div style={{ fontWeight: '600' }}>{profile.whatsappNumber}</div>
                </div>
              )}

              {profile.licenseNumber && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>📜 License / Reg No.</div>
                  <div style={{ fontWeight: '600' }}>{profile.licenseNumber}</div>
                </div>
              )}

              {profile.college && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>🏛️ College / University</div>
                  <div style={{ fontWeight: '600' }}>{profile.college}</div>
                </div>
              )}

              {profile.degree && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>🎓 Degree / Specialization</div>
                  <div style={{ fontWeight: '600' }}>{profile.degree}</div>
                </div>
              )}

              {profile.experience && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>💼 Experience</div>
                  <div style={{ fontWeight: '600' }}>{profile.experience}</div>
                </div>
              )}

              {(profile.whyDoctor || profile.whyVolunteer) && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>📝 Statement of Purpose</div>
                  <div style={{ color: 'var(--echo-text-muted)', lineHeight: '1.5' }}>{profile.whyDoctor || profile.whyVolunteer}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Role Overview Card for ONLY this applied role */}
        <div
          className="glass echo-card animate-fade-in-up"
          style={{
            borderRadius: '24px',
            border: `1px solid ${roleInfo.color}44`,
            background: 'var(--echo-surface)',
            overflow: 'hidden',
            boxShadow: `0 15px 45px rgba(0,0,0,0.12), 0 0 25px ${roleInfo.color}18`,
          }}
        >
          {/* Card Header */}
          <div style={{
            padding: '2rem 2rem 1.5rem',
            background: roleInfo.gradient,
            borderBottom: '1px solid var(--echo-border)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--echo-surface)',
                border: `2px solid ${roleInfo.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                boxShadow: `0 8px 20px ${roleInfo.color}33`,
              }}>
                {roleInfo.emoji}
              </div>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                background: `${roleInfo.badgeColor}18`,
                border: `1px solid ${roleInfo.badgeColor}55`,
                color: roleInfo.badgeColor,
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.02em',
              }}>
                {roleInfo.verificationIcon} {roleInfo.badge}
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--echo-text)', marginBottom: '0.35rem' }}>
              {roleInfo.title}
            </h2>
            <p style={{ fontSize: '0.875rem', color: roleInfo.color, fontWeight: '600' }}>
              {roleInfo.subtitle}
            </p>
          </div>

          {/* Card Body */}
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            
            {/* Description */}
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {roleInfo.description}
            </p>

            {/* Who is it for */}
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'var(--echo-surface-2)',
              border: '1px solid var(--echo-border)',
              marginBottom: '1.75rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--echo-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
                🎯 Target Profile
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--echo-text)', fontWeight: '500', lineHeight: '1.5' }}>
                {roleInfo.whoIsItFor}
              </div>
            </div>

            {/* Key Features Breakdown */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--echo-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={14} color={roleInfo.color} /> What You Will Access Once Approved
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {roleInfo.features.map((feat, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--echo-border)',
                  }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {feat.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--echo-text)', marginBottom: '0.2rem' }}>
                        {feat.title}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)', lineHeight: '1.45' }}>
                        {feat.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div style={{
              padding: '1.25rem',
              borderRadius: '14px',
              background: `${roleInfo.color}0d`,
              border: `1px solid ${roleInfo.color}33`,
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: '800', color: roleInfo.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} /> Professional Responsibilities
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--echo-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {roleInfo.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>

            {/* Verification Status Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.875rem 1rem',
              borderRadius: '12px',
              background: 'var(--echo-surface-2)',
              border: '1px solid var(--echo-border)',
            }}>
              <Clock size={16} color={roleInfo.color} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text)', fontWeight: '600' }}>
                Status: <span style={{ color: isRejected ? '#ef4444' : '#fbbf24', fontWeight: '700' }}>
                  {isRejected ? 'Application Rejected' : 'Pending Administrative Vetting'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
