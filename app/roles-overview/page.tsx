'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  Heart, 
  Stethoscope, 
  Users, 
  Shield, 
  Bot, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  CheckSquare, 
  BarChart2, 
  BookOpen, 
  Award, 
  FileText,
  Clock, 
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface RoleDetail {
  id: 'user' | 'volunteer' | 'doctor' | 'admin';
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

const ROLES_DATA: RoleDetail[] = [
  {
    id: 'user',
    title: 'User / Seeker',
    subtitle: 'I need emotional support, self-care & professional care',
    badge: 'Instant Access • Patient / Seeker',
    badgeColor: '#22c55e',
    icon: <Heart size={28} />,
    emoji: '🌱',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.05) 100%)',
    description: 'A private sanctuary for individuals seeking mental clarity, daily wellness, empathetic listening, or expert professional consultation.',
    whoIsItFor: 'Anyone feeling overwhelmed, stressed, lonely, or looking to build healthy emotional habits and connect with certified therapists.',
    verificationLevel: 'Instant Access (No approval required)',
    verificationIcon: <CheckCircle2 size={16} color="#22c55e" />,
    features: [
      {
        title: '24/7 AI Companion',
        desc: 'Instant, empathetic conversations, mindfulness grounding exercises, and mood journaling whenever you need.',
        icon: <Bot size={18} color="#22c55e" />
      },
      {
        title: 'Peer Support Chat',
        desc: 'Real-time text conversations with verified, trained volunteer listeners who care and listen without judgment.',
        icon: <Users size={18} color="#22c55e" />
      },
      {
        title: 'Professional Doctor Consultations',
        desc: 'Browse expert psychologists & psychiatrists, request connections, and access WhatsApp consultations once approved.',
        icon: <Phone size={18} color="#22c55e" />
      },
      {
        title: 'Mood Tracker & Analytics',
        desc: 'Log emotions, calculate daily wellness scores, and review detailed mood trend history over time.',
        icon: <BarChart2 size={18} color="#22c55e" />
      },
      {
        title: 'Relaxation Sanctuary & Games',
        desc: 'Breathe with guided exercises, play mindful mini-games, and explore our curated wellness library.',
        icon: <BookOpen size={18} color="#22c55e" />
      },
      {
        title: 'Guaranteed Anonymity',
        desc: 'Interact under an auto-generated pseudonym to keep your personal identity completely protected.',
        icon: <Lock size={18} color="#22c55e" />
      }
    ],
    responsibilities: [
      'Respect peer listeners and medical professionals',
      'Follow platform safety & community guidelines',
      'Embrace self-care and personal well-being'
    ]
  },
  {
    id: 'doctor',
    title: 'Mental Health Professional',
    subtitle: 'I am a certified doctor, psychologist, or psychiatrist',
    badge: 'Expert Care • Admin Verified',
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
  {
    id: 'volunteer',
    title: 'Volunteer / Peer Supporter',
    subtitle: 'I want to offer compassion, active listening & guidance',
    badge: 'Community Hero • Peer Support',
    badgeColor: '#a78bfa',
    icon: <Users size={28} />,
    emoji: '🤝',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(124,58,237,0.05) 100%)',
    description: 'A community-driven role for empathetic listeners dedicated to supporting peers through emotional distress, isolation, and daily life stress.',
    whoIsItFor: 'Individuals with strong empathy, active listening skills, psychology students, or anyone passionate about mental wellness advocacy.',
    verificationLevel: 'Application & Safety Screening',
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
  },
  {
    id: 'admin',
    title: 'Platform Administrator',
    subtitle: 'I manage security, approvals, and platform governance',
    badge: 'Governance • Token Protected',
    badgeColor: '#fbbf24',
    icon: <Shield size={28} />,
    emoji: '🛡️',
    color: '#fbbf24',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.05) 100%)',
    description: 'System administrators and trust & safety leads responsible for vetting practitioners, monitoring safety, and maintaining community standards.',
    whoIsItFor: 'Authorized platform operations team, clinical advisors, and designated system administrators.',
    verificationLevel: 'Strict Admin Verification Token Required',
    verificationIcon: <Lock size={16} color="#fbbf24" />,
    features: [
      {
        title: 'Credential & License Vetting',
        desc: 'Review submitted degrees, certifications, and licenses for Doctors and Volunteers before granting approval.',
        icon: <ShieldCheck size={18} color="#fbbf24" />
      },
      {
        title: 'User & Role Governance',
        desc: 'Oversee user accounts, role updates, content reports, user appeals, and account safety actions.',
        icon: <Users size={18} color="#fbbf24" />
      },
      {
        title: 'Platform Health & Activity Metrics',
        desc: 'Monitor real-time connection stats, suggestion feedback, system uptime, and community sentiment.',
        icon: <BarChart2 size={18} color="#fbbf24" />
      },
      {
        title: 'Cryptographic Security',
        desc: 'Admin onboarding is strictly gated with server-side environment token verification.',
        icon: <Lock size={18} color="#fbbf24" />
      }
    ],
    responsibilities: [
      'Thoroughly verify medical documentation before approving doctors',
      'Promptly review flagged user content and appeals',
      'Maintain strict platform privacy and compliance'
    ]
  }
];

export default function RolesOverviewPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState<'all' | 'user' | 'doctor' | 'volunteer' | 'admin'>('all');
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  const toggleRoleExpand = (roleId: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const filteredRoles = selectedTab === 'all' 
    ? ROLES_DATA 
    : ROLES_DATA.filter(r => r.id === selectedTab);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Dynamic Ambient Background Glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at top center, rgba(124, 58, 237, 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.08) 0%, transparent 60%)',
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
            onClick={() => router.push('/role-selection')}
            className="btn-primary"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Select Role <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 3rem' }} className="animate-fade-in-up">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            background: 'var(--echo-primary-low)',
            border: '1px solid var(--echo-border)',
            color: 'var(--echo-primary)',
            fontSize: '0.8125rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '1.25rem',
          }}>
            <Sparkles size={14} /> Ecosystem & Role Guide
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: '900',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            color: 'var(--echo-text)',
            marginBottom: '1rem',
          }}>
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}! Discover Your Role in <span className="gradient-text">ECHO</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: 'var(--echo-text-muted)',
            lineHeight: '1.6',
            marginBottom: '2rem',
          }}>
            ECHO unites seekers, volunteer peer listeners, certified mental health practitioners, and administrators into one safe sanctuary. Review each role below to choose the experience tailored for you.
          </p>

          {/* Quick Filter Tabs */}
          <div style={{
            display: 'inline-flex',
            background: 'var(--echo-surface)',
            border: '1px solid var(--echo-border)',
            borderRadius: '16px',
            padding: '0.375rem',
            gap: '0.25rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}>
            {[
              { id: 'all', label: '🌟 All Roles', color: 'var(--echo-text)' },
              { id: 'user', label: '🌱 User / Seeker', color: '#22c55e' },
              { id: 'doctor', label: '👨‍⚕️ Doctor', color: '#06b6d4' },
              { id: 'volunteer', label: '🤝 Volunteer', color: '#a78bfa' },
              { id: 'admin', label: '🛡️ Admin', color: '#fbbf24' },
            ].map(tab => {
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  style={{
                    padding: '0.6rem 1.125rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: active ? 'var(--echo-surface-2)' : 'transparent',
                    color: active ? tab.color : 'var(--echo-text-muted)',
                    fontWeight: active ? '800' : '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Roles Detailed Cards (2 columns per row) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: selectedTab === 'all' ? 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))' : '1fr', 
            gap: '2rem', 
            marginBottom: '3.5rem' 
          }}
        >
          {filteredRoles.map(role => (
            <div
              key={role.id}
              className="glass echo-card animate-fade-in-up"
              style={{
                borderRadius: '24px',
                border: `1px solid ${role.color}44`,
                background: 'var(--echo-surface)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: `0 15px 45px rgba(0,0,0,0.12), 0 0 25px ${role.color}18`,
                position: 'relative',
              }}
            >
              {/* Card Header */}
              <div style={{
                padding: '2rem 2rem 1.5rem',
                background: role.gradient,
                borderBottom: '1px solid var(--echo-border)',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'var(--echo-surface)',
                    border: `2px solid ${role.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    boxShadow: `0 8px 20px ${role.color}33`,
                  }}>
                    {role.emoji}
                  </div>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    background: `${role.badgeColor}18`,
                    border: `1px solid ${role.badgeColor}55`,
                    color: role.badgeColor,
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.02em',
                  }}>
                    {role.verificationIcon} {role.badge}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--echo-text)', marginBottom: '0.35rem' }}>
                  {role.title}
                </h2>
                <p style={{ fontSize: '0.875rem', color: role.color, fontWeight: '600' }}>
                  {role.subtitle}
                </p>
              </div>

              {/* Card Body */}
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Description */}
                <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {role.description}
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
                    🎯 Ideal For
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--echo-text)', fontWeight: '500', lineHeight: '1.5' }}>
                    {role.whoIsItFor}
                  </div>
                </div>

                {/* Expandable Section: Core Capabilities & Verification Note */}
                {expandedRoles[role.id] && (
                  <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
                    {/* Key Features Breakdown */}
                    <div style={{ marginBottom: '1.75rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--echo-text)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={14} color={role.color} /> Core Capabilities & Features
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {role.features.map((feat, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '0.75rem',
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

                    {/* Verification Process Note */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.875rem 1rem',
                      borderRadius: '12px',
                      background: `${role.color}10`,
                      border: `1px solid ${role.color}33`,
                    }}>
                      <Clock size={16} color={role.color} />
                      <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text)', fontWeight: '600' }}>
                        Access: <span style={{ color: role.color, fontWeight: '700' }}>{role.verificationLevel}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions: More Details Toggle + Select Role Button */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => toggleRoleExpand(role.id)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 1rem',
                      borderRadius: '12px',
                      border: `1px solid ${role.color}44`,
                      background: expandedRoles[role.id] ? `${role.color}15` : 'var(--echo-surface-2)',
                      color: role.color,
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {expandedRoles[role.id] ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp size={15} />
                      </>
                    ) : (
                      <>
                        <span>More Details & Features</span>
                        <ChevronDown size={15} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/role-selection?role=${role.id}`)}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '14px',
                      border: 'none',
                      background: role.color,
                      color: role.id === 'doctor' || role.id === 'admin' ? '#000' : '#fff',
                      fontSize: '0.9375rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      boxShadow: `0 6px 20px ${role.color}40`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 10px 25px ${role.color}60`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = `0 6px 20px ${role.color}40`;
                    }}
                  >
                    <span>Select {role.title.split('/')[0].trim()}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>



        {/* Final Prominent Call To Action */}
        <div className="glass" style={{
          padding: '3rem 2rem',
          borderRadius: '28px',
          border: '1px solid var(--echo-border)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.12) 100%)',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: '900', color: 'var(--echo-text)', marginBottom: '0.75rem' }}>
            Ready to Begin Your ECHO Journey?
          </h2>
          <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Click continue to pick your role and personalize your dashboard experience.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/role-selection')}
              className="btn-primary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
                cursor: 'pointer',
              }}
            >
              <span>Continue to Role Selection</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
