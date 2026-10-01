'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, Check, Phone } from 'lucide-react';
import { Country, COUNTRIES, POPULAR_COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';

export interface PhoneInputProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (value: string, meta: { countryCode: string; nationalNumber: string; country: Country }) => void;
  defaultCountryCode?: string; // e.g. "IN" or "+91"
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  helperText?: string;
  error?: string;
}

export default function PhoneInput({
  label,
  required = false,
  value = '',
  onChange,
  defaultCountryCode = '+91',
  placeholder,
  disabled = false,
  id,
  name,
  className = '',
  helperText,
  error,
}: PhoneInputProps) {
  // Parse initial country and number from value or default
  const findCountry = (codeOrDial: string): Country => {
    const clean = codeOrDial.trim();
    if (!clean) return DEFAULT_COUNTRY;
    return (
      COUNTRIES.find(c => c.code.toLowerCase() === clean.toLowerCase() || c.dialCode === clean) ||
      DEFAULT_COUNTRY
    );
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value.startsWith('+')) {
      const match = COUNTRIES.find(c => value.startsWith(c.dialCode));
      if (match) return match;
    }
    return findCountry(defaultCountryCode);
  });

  const extractNationalNumber = (val: string, country: Country) => {
    if (val.startsWith(country.dialCode)) {
      return val.slice(country.dialCode.length).trim();
    }
    // Remove leading '+' and country digits if present
    const digitsOnly = val.replace(/\D/g, '');
    const dialDigits = country.dialCode.replace(/\D/g, '');
    if (digitsOnly.startsWith(dialDigits)) {
      return digitsOnly.slice(dialDigits.length);
    }
    return val.replace(/\D/g, '');
  };

  const [nationalNumber, setNationalNumber] = useState<string>(() => {
    return extractNationalNumber(value, selectedCountry);
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state if external value changes (e.g., "Same as phone number" checkbox)
  useEffect(() => {
    if (value) {
      if (value.startsWith('+')) {
        const match = COUNTRIES.slice().sort((a, b) => b.dialCode.length - a.dialCode.length).find(c => value.startsWith(c.dialCode));
        if (match) {
          setSelectedCountry(match);
          const num = value.slice(match.dialCode.length).trim().replace(/\D/g, '');
          setNationalNumber(num);
          return;
        }
      }
      setNationalNumber(value.replace(/\D/g, ''));
    } else {
      setNationalNumber('');
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    const full = nationalNumber ? `${country.dialCode} ${nationalNumber}` : '';
    onChange(full, { countryCode: country.dialCode, nationalNumber, country });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanDigits = e.target.value.replace(/\D/g, '');
    setNationalNumber(cleanDigits);
    const full = cleanDigits ? `${selectedCountry.dialCode} ${cleanDigits}` : '';
    onChange(full, { countryCode: selectedCountry.dialCode, nationalNumber: cleanDigits, country: selectedCountry });
  };

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`phone-input-container ${className}`} style={{ marginBottom: '1.25rem', position: 'relative' }}>
      {label && (
        <label
          htmlFor={id}
          className="echo-label"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div
        ref={dropdownRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: '0.75rem',
          border: error ? '1px solid #ef4444' : '1px solid var(--echo-border)',
          background: 'var(--echo-surface)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Country Code Picker Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-label="Select Country Code"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.75rem 0.85rem',
            background: 'var(--echo-surface-2)',
            border: 'none',
            borderRight: '1px solid var(--echo-border)',
            borderTopLeftRadius: '0.75rem',
            borderBottomLeftRadius: '0.75rem',
            color: 'var(--echo-text)',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            flexShrink: 0,
            transition: 'background 0.2s ease',
          }}
          title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <span style={{ fontWeight: '700', letterSpacing: '0.02em', color: 'var(--echo-text)' }}>
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--echo-text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* National Number Input */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            id={id}
            name={name}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            required={required}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder || selectedCountry.placeholder || 'Enter phone number'}
            className="echo-phone-input"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--echo-text)',
              fontSize: '0.9375rem',
              fontWeight: '500',
              fontFamily: 'inherit',
            }}
          />
          {nationalNumber && !disabled && (
            <button
              type="button"
              onClick={() => {
                setNationalNumber('');
                onChange('', { countryCode: selectedCountry.dialCode, nationalNumber: '', country: selectedCountry });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--echo-text-muted)',
                padding: '0.5rem',
                marginRight: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Popover */}
        {isOpen && (
          <div
            className="glass animate-fade-in-up"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 999,
              width: 'min(360px, 92vw)',
              maxHeight: '380px',
              borderRadius: '16px',
              border: '1px solid var(--echo-border)',
              background: 'var(--echo-surface)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25), 0 0 15px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Search header */}
            <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface-2)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '10px',
                  background: 'var(--echo-surface)',
                  border: '1px solid var(--echo-border)',
                }}
              >
                <Search size={15} style={{ color: 'var(--echo-text-muted)', flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country or code (e.g. +1, India)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--echo-text)',
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Popular countries quick-picker pills (only when not actively searching) */}
              {!searchQuery && (
                <div style={{ marginTop: '0.625rem' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--echo-text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                    Popular
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
                    {POPULAR_COUNTRIES.map(pop => (
                      <button
                        key={pop.code}
                        type="button"
                        onClick={() => handleCountrySelect(pop)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '8px',
                          border: selectedCountry.code === pop.code ? '1px solid var(--echo-primary)' : '1px solid var(--echo-border)',
                          background: selectedCountry.code === pop.code ? 'var(--echo-primary-low)' : 'var(--echo-surface)',
                          color: selectedCountry.code === pop.code ? 'var(--echo-primary)' : 'var(--echo-text)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{pop.flag}</span>
                        <span>{pop.dialCode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Countries scroll list */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.35rem',
                maxHeight: '260px',
              }}
            >
              {filteredCountries.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--echo-text-muted)', fontSize: '0.8125rem' }}>
                  No countries found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredCountries.map(country => {
                  const isSelected = selectedCountry.code === country.code;
                  return (
                    <button
                      key={`${country.code}-${country.dialCode}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isSelected ? 'var(--echo-primary-low)' : 'transparent',
                        color: isSelected ? 'var(--echo-primary)' : 'var(--echo-text)',
                        fontSize: '0.8125rem',
                        fontWeight: isSelected ? '700' : '500',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--echo-surface-2)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{country.flag}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {country.name}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--echo-text-muted)', fontWeight: '600' }}>
                          ({country.code})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{ fontWeight: '700', color: isSelected ? 'var(--echo-primary)' : 'var(--echo-text-muted)' }}>
                          {country.dialCode}
                        </span>
                        {isSelected && <Check size={14} color="var(--echo-primary)" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && (
        <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.35rem' }}>
          {helperText}
        </div>
      )}

      {error && (
        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.35rem', fontWeight: '600' }}>
          {error}
        </div>
      )}
    </div>
  );
}
