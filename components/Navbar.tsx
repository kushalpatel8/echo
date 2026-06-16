'use client';
import Link from 'next/link';
import { useUser, SignOutButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import BackButton from './BackButton';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="echo-nav glass" style={{ 
      padding: '0 1.5rem', 
      borderBottom: (scrolled || isMenuOpen) ? '1px solid var(--echo-border)' : '1px solid transparent',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        gap: '0.5rem'
      }}>
        {/* Back Button — hidden on home/auth pages */}
        <BackButton />

        {/* Logo Section */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--echo-primary), var(--echo-secondary))',
            padding: '2px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)'
          }}>
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }} 
            />
          </div>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: '900', 
            color: 'var(--echo-text)', 
            letterSpacing: '-0.03em',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            ECHO
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hide-mobile desktop-nav" style={{ alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isLoaded && user ? (
              <>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
                    Dashboard
                  </button>
                </Link>
                <div style={{ borderLeft: '1px solid var(--echo-border)', height: '24px', margin: '0 0.5rem' }} />
                <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-all' } }} />
              </>
            ) : (
              <>
                <Link href="/sign-in" style={{ textDecoration: 'none' }}>
                  <button className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
                    Sign In
                  </button>
                </Link>
                <Link href="/sign-up" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)' }}>
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
          <div style={{ borderLeft: '1px solid var(--echo-border)', height: '24px', marginLeft: '0.5rem' }} />
          <ThemeToggle />
        </div>

        {/* Mobile Actions */}
        <div className="show-mobile mobile-nav-actions" style={{ alignItems: 'center', gap: '0.75rem', display: 'flex' }}>
          <ThemeToggle />
          {isLoaded && user ? (
            <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-9 h-9 border-2 border-primary/20 hover:border-primary/50 transition-all' } }} />
          ) : (
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--echo-text)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem'
              }}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="show-mobile mobile-dropdown animate-fade-in-up" style={{ 
          padding: '1rem 1.5rem 2rem', 
          borderTop: '1px solid var(--echo-border)',
          background: 'var(--echo-nav-bg)',
          backdropFilter: 'blur(20px)',
          gap: '1rem'
        }}>
          {isLoaded && user ? (
            <>
              <Link href="/dashboard" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                <button className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
                  Dashboard
                </button>
              </Link>
              <SignOutButton>
                <button className="btn-danger" style={{ width: '100%', padding: '0.75rem' }}>
                  Sign Out
                </button>
              </SignOutButton>
            </>
          ) : (
            <>
              <Link href="/sign-in" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                <button className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up" style={{ textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>
                <button className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
