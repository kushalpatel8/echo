'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { BookOpen, Search, Sparkles, ExternalLink, Bookmark, Compass, ArrowLeft } from 'lucide-react';

type LibraryTheme = 'celestial' | 'forest' | 'sunset';

interface BookItem {
  title: string;
  author?: string;
  desc: string;
  icon: string;
  url: string;
  category: string;
}

const LIBRARY_THEMES: Record<LibraryTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: {
    name: '🌌 Celestial Library',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Forest Sanctuary',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Golden Study',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
};

const ALL_BOOKS: BookItem[] = [
  // Hindi Library
  { title: "ओशो हिंदी ऑडियो प्रवचन", author: "ओशो", desc: "ओशो के विभिन्न विषयों पर दिए गए अनमोल ऑडियो प्रवचनों का विशाल संग्रह।", icon: "🎙️", url: "https://oshoworld.com/audio-hindi-home", category: "🇮🇳 हिंदी साहित्य" },
  { title: "मैं कौन हूँ?", author: "ओशो", desc: "स्वयं की खोज और आत्म-साक्षात्कार की एक अनूठी यात्रा।", icon: "🧘", url: "https://www.oshofragrance.org/db/books/files/Osho_Rajneesh_Main_Kaun_Hun.pdf", category: "🇮🇳 हिंदी साहित्य" },
  { title: "श्रीमद्भगवद्गीता", author: "वेद व्यास", desc: "जीवन के रहस्यों और कर्तव्यों का बोध कराने वाला पवित्र ग्रंथ।", icon: "🕉️", url: "https://vedpuran.net/wp-content/uploads/2012/03/unencrypted-geeta.pdf", category: "🇮🇳 हिंदी साहित्य" },
  { title: "मधुशाला", author: "हरिवंश राय बच्चन", desc: "जीवन के दर्शन को एक नए और सुंदर दृष्टिकोण से प्रस्तुत करने वाली कविताएं।", icon: "🍷", url: "https://dn711307.ca.archive.org/0/items/Madhushala/Bachchan-Madhushala.pdf", category: "🇮🇳 हिंदी साहित्य" },
  { title: "गोदान", author: "मुंशी प्रेमचंद", desc: "भारतीय ग्रामीण जीवन और समाज की विसंगतियों का सजीव चित्रण करने वाला कालजयी उपन्यास।", icon: "🌾", url: "https://dn710109.ca.archive.org/0/items/Godan-Hindi/GodaanByMunshiPremchandEbook.pdf", category: "🇮🇳 हिंदी साहित्य" },
  { title: "गीतांजलि (हिंदी)", author: "रवींद्रनाथ टैगोर", desc: "शांति और भक्ति के गीतों का संग्रह, जिसने साहित्य का नोबेल पुरस्कार जीता।", icon: "🕯️", url: "https://drive.google.com/file/d/1L8Ypbvfsw3EZwWvYQpSQS6W_5zc6b9fl/view?usp=sharing", category: "🇮🇳 हिंदी साहित्य" },

  // Spiritual Journeys
  { title: "Osho English Audio", author: "Osho", desc: "A vast collection of Osho's classic discourses in English, covering meditation, love, and life.", icon: "🎙️", url: "https://oshoworld.com/audio-english-home", category: "🧘 Spiritual Journeys" },
  { title: "Gita Supersite", author: "IIT Kanpur", desc: "A comprehensive resource for the Bhagavad Gita, featuring multiple translations and commentaries.", icon: "🕉️", url: "https://www.gitasupersite.iitk.ac.in/", category: "🧘 Spiritual Journeys" },
  { title: "The Prophet", author: "Kahlil Gibran", desc: "A beautiful collection of poetic essays on life, love, and humanity.", icon: "🕊️", url: "https://www.kahlilgibran.com/images/The%20Prophet%20Ebook%20by%20Kahlil%20Gibran.pdf", category: "🧘 Spiritual Journeys" },
  { title: "Siddhartha", author: "Hermann Hesse", desc: "A spiritual journey of self-discovery and finding the meaning of life.", icon: "✨", url: "https://bca.klesnc.edu.in/wp-content/uploads/2025/07/Siddhartha-by-Hermann-Hesse.pdf", category: "🧘 Spiritual Journeys" },
  { title: "Gitanjali", author: "Rabindranath Tagore", desc: "Soul-stirring poetry that reflects the deep connection between the individual and the divine.", icon: "🕯️", url: "https://dn790007.ca.archive.org/0/items/gitanjalisongoff00tagouoft/gitanjalisongoff00tagouoft.pdf", category: "🧘 Spiritual Journeys" },
  { title: "The Dhammapada", author: "The Buddha", desc: "A collection of sayings of the Buddha in verse form, one of the best-known Buddhist scriptures.", icon: "☸️", url: "https://www.buddhistelibrary.org/buddhism-online/e-books/dhammapada-txt.pdf", category: "🧘 Spiritual Journeys" },

  // Ancient Wisdom & Philosophy
  { title: "Meditations", author: "Marcus Aurelius", desc: "Ancient Stoic wisdom for finding inner peace in a chaotic world.", icon: "📜", url: "https://dn720006.ca.archive.org/0/items/meditationsofmar00marc/meditationsofmar00marc.pdf", category: "🏛️ Ancient Wisdom" },
  { title: "Tao Te Ching", author: "Lao Tzu", desc: "The fundamental text of Taoism, offering profound insights into living in harmony.", icon: "☯️", url: "https://ia802905.us.archive.org/view_archive.php?archive=/32/items/plus-mystics/PLUS%20MYSTICS.rar&file=PLUS%20MYSTICS%2FEBOOK%2FENG%2FTAO%2FOKE%2FTao%20Te%20Ching%20The%20New%20Translation%20from%20Tao%20Te%20Ching%2C%20The%20Definitive%20Edition.pdf", category: "🏛️ Ancient Wisdom" },
  { title: "Letters from a Stoic", author: "Seneca", desc: "Philosophical letters offering practical advice on how to live with virtue and tranquil mind.", icon: "✉️", url: "https://dn721801.ca.archive.org/0/items/letters-from-a-stoic-1/Letters%20from%20a%20Stoic%201.pdf", category: "🏛️ Ancient Wisdom" },
  { title: "Self-Reliance", author: "Ralph Waldo Emerson", desc: "A powerful call to trust your own intuition and achieve independence.", icon: "💪", url: "https://www.livinglifefully.com/ebooks/self-reliance.pdf", category: "🏛️ Ancient Wisdom" },

  // Nature & Simplicity
  { title: "Walden", author: "Henry David Thoreau", desc: "A reflection upon simple living in natural surroundings, a classic of American literature.", icon: "🌲", url: "https://dn790008.ca.archive.org/0/items/cu31924021445741/cu31924021445741.pdf", category: "🌿 Nature & Simplicity" },
  { title: "Leaves of Grass", author: "Walt Whitman", desc: "Celebrating the beauty of nature, the human spirit, and the interconnectedness of all things.", icon: "🍃", url: "https://www.waltwhitman.com/leaves-of-grass.pdf", category: "🌿 Nature & Simplicity" },

  // Modern Thought & Growth
  { title: "As a Man Thinketh", author: "James Allen", desc: "A timeless guide on how our thoughts shape our character and life.", icon: "🧠", url: "https://dn790000.ca.archive.org/0/items/asmanthinketh00alleiala/asmanthinketh00alleiala.pdf", category: "🧠 Modern Growth" },
  { title: "Truth Without Apology", author: "Acharya Prashant", desc: "A collection of hard-hitting truths that help strip away life's illusions.", icon: "🧘", url: "https://docs.google.com/document/d/1nqx1neqtlrwoxKGIGh8ZrMqHtmojUV8IGHuL39GtEgI/edit?usp=sharing", category: "🧠 Modern Growth" },
];

const CATEGORIES = ["All", "🇮🇳 हिंदी साहित्य", "🧘 Spiritual Journeys", "🏛️ Ancient Wisdom", "🌿 Nature & Simplicity", "🧠 Modern Growth"];

export default function RelaxationBooksPage() {
  const [theme, setTheme] = useState<LibraryTheme>('celestial');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const currentTheme = LIBRARY_THEMES[theme];

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('echo_library_bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleBookmark = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(prev => {
      const updated = prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title];
      try { localStorage.setItem('echo_library_bookmarks', JSON.stringify(updated)); } catch (err) {}
      return updated;
    });
  };

  // Filter books by category and search
  const filteredBooks = useMemo(() => {
    return ALL_BOOKS.filter(book => {
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        book.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredBook = ALL_BOOKS[featuredIndex % ALL_BOOKS.length];

  // Rotate featured book
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % ALL_BOOKS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--echo-bg)',
        color: 'var(--echo-text)',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.5s ease',
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: currentTheme.bgGrad,
          pointerEvents: 'none',
          transition: 'background 1s ease',
          zIndex: 0,
        }}
      />

      <style>{`
        .library-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--echo-border);
          background: var(--echo-surface);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .library-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .library-logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .library-theme-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--echo-surface-2);
          padding: 0.35rem 0.5rem;
          border-radius: 999px;
          border: 1px solid var(--echo-border);
        }

        @media (max-width: 640px) {
          .library-header {
            flex-direction: column;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }

          .library-header-left {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .library-back-container {
            display: none !important;
          }

          .library-logo-wrapper {
            justify-content: center;
            width: 100%;
          }

          .library-theme-selector {
            display: flex !important;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <header className="library-header">
        <div className="library-header-left">
          <div className="library-back-container">
            <BackButton />
          </div>
          <div className="library-logo-wrapper">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 15px ${currentTheme.glow}`,
              }}
            >
              <BookOpen size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
                The Echo Library
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
                <span>Curated Wisdom & Sanctuary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Mood Selector */}
        <div className="library-theme-selector">
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>
            Ambient Mood:
          </span>
          {(Object.keys(LIBRARY_THEMES) as LibraryTheme[]).map(key => {
            const t = LIBRARY_THEMES[key];
            const isSelected = theme === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: isSelected ? 'var(--echo-primary)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--echo-text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>
        {/* Hero Welcome Banner */}
        <div className="glass hide-mobile" style={{
          padding: '2.5rem', borderRadius: '28px',
          border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
          boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
          marginBottom: '3rem', position: 'relative', overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              <BookOpen size={14} /><span>Echo Library</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
              The Echo Library
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
              Explore our collection of curated books, audios, and spiritual guides to find inner peace and wisdom.
            </p>
          </div>
        </div>

        {/* Hero Featured Wisdom Showcase */}
        <div
          className="glass"
          style={{
            padding: '3rem 2.5rem',
            borderRadius: '28px',
            border: '1px solid var(--echo-border)',
            background: 'var(--echo-surface)',
            boxShadow: `0 25px 60px rgba(0, 0, 0, 0.15), 0 0 40px ${currentTheme.glow}`,
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.15, filter: 'blur(35px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', position: 'relative', zIndex: 2 }}>
            <div style={{ flex: '1 1 450px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                <Sparkles size={13} />
                <span>Featured Wisdom of the Day</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: '900', color: 'var(--echo-text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                {featuredBook.title}
              </h2>
              {featuredBook.author && (
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--echo-primary)', marginBottom: '1.25rem' }}>
                  By {featuredBook.author}
                </div>
              )}
              <p style={{ fontSize: '1.0625rem', color: 'var(--echo-text-muted)', lineHeight: '1.7', maxWidth: '620px', marginBottom: '2rem' }}>
                {featuredBook.desc}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href={featuredBook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <button
                    className="btn-primary"
                    style={{
                      padding: '0.875rem 2rem',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      borderRadius: '14px',
                      background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                      boxShadow: `0 8px 25px ${currentTheme.glow}`,
                    }}
                  >
                    <span>Read in Sanctuary</span>
                    <ExternalLink size={16} />
                  </button>
                </a>
              </div>
            </div>

            <div
              style={{
                fontSize: '6.5rem',
                padding: '2rem',
                borderRadius: '28px',
                background: 'var(--echo-surface-2)',
                border: '1px solid var(--echo-border)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {featuredBook.icon}
            </div>
          </div>
        </div>

        {/* Search Bar & Category Filter Pills */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div
              className="glass"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '16px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
                flex: '1 1 320px',
                maxWidth: '500px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              }}
            >
              <Search size={18} style={{ color: 'var(--echo-text-muted)' }} />
              <input
                type="text"
                placeholder="Search titles, authors, or spiritual teachings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--echo-text)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', color: 'var(--echo-text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Bookmarks Toggle Pill */}
            <button
              className="hide-mobile"
              onClick={() => {
                if (selectedCategory === 'Bookmarks') {
                  setSelectedCategory('All');
                } else {
                  setSelectedCategory('Bookmarks');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '16px',
                border: selectedCategory === 'Bookmarks' ? '1.5px solid var(--echo-primary)' : '1px solid var(--echo-border)',
                background: selectedCategory === 'Bookmarks' ? 'var(--echo-primary)' : 'var(--echo-surface)',
                color: selectedCategory === 'Bookmarks' ? '#ffffff' : 'var(--echo-text)',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedCategory === 'Bookmarks' ? '0 4px 15px var(--echo-primary-low)' : 'none',
              }}
            >
              <Bookmark size={16} style={{ fill: selectedCategory === 'Bookmarks' ? '#ffffff' : 'transparent' }} />
              <span>Saved Bookmarks ({bookmarks.length})</span>
            </button>
          </div>

          {/* Category Dropdown (Mobile only) */}
          <div className="show-mobile" style={{ marginBottom: '1.5rem', padding: '0' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '14px',
                  border: '1px solid var(--echo-border)',
                  background: 'var(--echo-surface)',
                  color: 'var(--echo-text)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  appearance: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  outline: 'none',
                  textAlign: 'center',
                  textAlignLast: 'center',
                }}
              >
                <option value="All">📚 All Categories</option>
                <option value="Bookmarks">🔖 Saved Bookmarks ({bookmarks.length})</option>
                {CATEGORIES.filter(cat => cat !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--echo-text-muted)', fontSize: '0.8rem' }}>
                ▼
              </div>
            </div>
          </div>

          {/* Category Filter Pills (Desktop/Tablet) */}
          <div className="hide-mobile" style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const isSel = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '999px',
                    border: isSel ? '1.5px solid var(--echo-primary)' : '1px solid var(--echo-border)',
                    background: isSel ? 'var(--echo-primary)' : 'var(--echo-surface-2)',
                    color: isSel ? '#ffffff' : 'var(--echo-text-muted)',
                    fontSize: '0.8125rem',
                    fontWeight: isSel ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSel ? '0 4px 12px var(--echo-primary-low)' : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Books Grid */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', borderBottom: '1px solid var(--echo-border)', paddingBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '1.375rem', fontWeight: '800', color: 'var(--echo-text)' }}>
              {selectedCategory === 'Bookmarks' ? '🔖 Your Saved Bookmarks' : selectedCategory === 'All' ? '📚 Entire Collection' : selectedCategory} ({selectedCategory === 'Bookmarks' ? ALL_BOOKS.filter(b => bookmarks.includes(b.title)).length : filteredBooks.length})
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
              Click any book to read in full screen
            </span>
          </div>

          {(selectedCategory === 'Bookmarks' ? ALL_BOOKS.filter(b => bookmarks.includes(b.title)) : filteredBooks).length === 0 ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>No books found</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                {selectedCategory === 'Bookmarks' ? "You haven't saved any bookmarks yet. Click the ribbon icon on any book card to save it here for quick access!" : "No books matched your search query. Try searching for a different title, author, or philosophy."}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.5rem' }}>
              {(selectedCategory === 'Bookmarks' ? ALL_BOOKS.filter(b => bookmarks.includes(b.title)) : filteredBooks).map((book, i) => {
                const isBookmarked = bookmarks.includes(book.title);
                return (
                  <div
                    key={i}
                    className="glass echo-card"
                    style={{
                      padding: '1.75rem',
                      borderRadius: '24px',
                      border: '1px solid var(--echo-border)',
                      background: 'var(--echo-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                    }}
                  >
                    <div>
                      {/* Top Bar with Category & Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-text-muted)', fontWeight: '600' }}>
                          {book.category}
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(book.title, e)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                          style={{
                            border: 'none',
                            background: isBookmarked ? 'var(--echo-primary-low)' : 'var(--echo-surface-2)',
                            color: isBookmarked ? 'var(--echo-primary)' : 'var(--echo-text-muted)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Bookmark size={16} style={{ fill: isBookmarked ? 'var(--echo-primary)' : 'transparent' }} />
                        </button>
                      </div>

                      {/* Icon & Title */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '2.5rem', padding: '0.625rem', borderRadius: '16px', background: 'var(--echo-surface-2)', border: '1px solid var(--echo-border)', display: 'flex', alignItems: 'center', justifyItems: 'center', minWidth: '64px', minHeight: '64px', justifyContent: 'center' }}>
                          {book.icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '1.1875rem', fontWeight: '800', color: 'var(--echo-text)', marginBottom: '0.25rem', lineHeight: '1.3' }}>
                            {book.title}
                          </h4>
                          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--echo-primary)' }}>
                            {book.author || 'Ancient Wisdom'}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', lineHeight: '1.65', marginBottom: '1.75rem' }}>
                        {book.desc}
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--echo-border)', paddingTop: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', flex: 1 }}
                      >
                        <button
                          className="btn-primary"
                          style={{
                            width: '100%',
                            padding: '0.625rem 1rem',
                            fontSize: '0.8125rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            borderRadius: '12px',
                            background: 'var(--echo-primary)',
                          }}
                        >
                          <span>Read Book</span>
                          <ExternalLink size={14} />
                        </button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="glass"
          style={{
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '28px',
            border: '1px solid var(--echo-border)',
            background: 'var(--echo-surface)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--echo-text)', marginBottom: '0.75rem' }}>
            Ready to return to the Relaxation Room?
          </h3>
          <p style={{ fontSize: '0.9375rem', color: 'var(--echo-text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Continue your daily affirmations, guided breathing exercises, and ambient audio soundscapes.
          </p>
          <Link href="/relaxation" style={{ textDecoration: 'none' }}>
            <button
              className="btn-primary"
              style={{
                padding: '0.875rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.625rem',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              }}
            >
              <ArrowLeft size={18} />
              <span>Return to Sanctuary</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
