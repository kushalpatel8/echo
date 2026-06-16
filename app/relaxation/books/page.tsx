'use client';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function RelaxationBooksPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)' }}>
      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <BackButton />
        <div style={{ fontWeight: '700', marginLeft: 'auto' }} className="gradient-text">📚 Curated Library</div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="animate-fade-in-up">
            <h1 className="gradient-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
              The Echo Library
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', maxWidth: '700px', margin: '0 auto', fontSize: '1.125rem', lineHeight: '1.6' }}>
              Journey through centuries of wisdom. From ancient philosophies to modern insights, these books are curated to help you find clarity, peace, and strength.
            </p>
          </div>

          {BOOK_CATEGORIES.map((category, idx) => (
            <div key={idx} className="animate-fade-in-up" style={{ marginBottom: '5rem', animationDelay: `${idx * 0.15}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '2rem' }}>{category.title.split(' ')[0]}</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--echo-text)' }}>{category.title.split(' ').slice(1).join(' ')}</h2>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--echo-border), transparent)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '2rem' }}>
                {category.books.map((book, i) => (
                  <a
                    key={i}
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="echo-card glass-panel"
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                      padding: '2.5rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Subtle background icon */}
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.03, pointerEvents: 'none' }}>
                      {book.icon}
                    </div>

                    <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 15px var(--echo-primary-low))', background: 'var(--echo-surface-2)', width: 'fit-content', padding: '1rem', borderRadius: '1rem' }}>
                      {book.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--echo-text)', marginBottom: '0.375rem' }}>
                        {book.title}
                      </h3>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--echo-primary-light)', marginBottom: '1rem' }}>
                        {book.author}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', lineHeight: '1.7' }}>
                        {book.desc}
                      </p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: '700', color: 'var(--echo-primary-light)' }}>
                      <span style={{ padding: '0.5rem 1rem', background: 'var(--echo-primary-low)', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Read Now <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10M7 17L17 7" /></svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <footer style={{ padding: '5rem 1.5rem', textAlign: 'center', background: 'var(--echo-surface)', borderTop: '1px solid var(--echo-border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Ready to return to the room?</h2>
        <Link href="/relaxation" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">Return to Affirmations</button>
        </Link>
      </footer>
    </div>
  );
}

const BOOK_CATEGORIES = [
  {
    title: "हिंदी साहित्य (Hindi Library)",
    books: [
      {
        title: "ओशो हिंदी ऑडियो प्रवचन",
        author: "ओशो",
        desc: "ओशो के विभिन्न विषयों पर दिए गए अनमोल ऑडियो प्रवचनों का विशाल संग्रह।",
        icon: "🎙️",
        url: "https://oshoworld.com/audio-hindi-home"
      },
      {
        title: "मैं कौन हूँ?",
        author: "ओशो",
        desc: "स्वयं की खोज और आत्म-साक्षात्कार की एक अनूठी यात्रा।",
        icon: "🧘",
        url: "https://www.oshofragrance.org/db/books/files/Osho_Rajneesh_Main_Kaun_Hun.pdf"
      },
      {
        title: "श्रीमद्भगवद्गीता",
        desc: "जीवन के रहस्यों और कर्तव्यों का बोध कराने वाला पवित्र ग्रंथ।",
        icon: "🕉️",
        url: "https://vedpuran.net/wp-content/uploads/2012/03/unencrypted-geeta.pdf"
      },
      {
        title: "मधुशाला",
        author: "हरिवंश राय बच्चन",
        desc: "जीवन के दर्शन को एक नए और सुंदर दृष्टिकोण से प्रस्तुत करने वाली कविताएं।",
        icon: "🍷",
        url: "https://dn711307.ca.archive.org/0/items/Madhushala/Bachchan-Madhushala.pdf"
      },
      {
        title: "गोदान",
        author: "मुंशी प्रेमचंद",
        desc: "भारतीय ग्रामीण जीवन और समाज की विसंगतियों का सजीव चित्रण करने वाला कालजयी उपन्यास।",
        icon: "🌾",
        url: "https://dn710109.ca.archive.org/0/items/Godan-Hindi/GodaanByMunshiPremchandEbook.pdf"
      },
      {
        title: "गीतांजलि (हिंदी)",
        author: "रवींद्रनाथ टैगोर",
        desc: "शांति और भक्ति के गीतों का संग्रह, जिसने साहित्य का नोबेल पुरस्कार जीता।",
        icon: "🕯️",
        url: "https://drive.google.com/file/d/1L8Ypbvfsw3EZwWvYQpSQS6W_5zc6b9fl/view?usp=sharing"
      }
    ]
  },
  {
    title: "🧘 Spiritual Journeys",
    books: [
      {
        title: "Osho English Audio",
        author: "Osho",
        desc: "A vast collection of Osho's classic discourses in English, covering meditation, love, and life.",
        icon: "🎙️",
        url: "https://oshoworld.com/audio-english-home"
      },
      {
        title: "Gita Supersite",
        author: "IIT Kanpur",
        desc: "A comprehensive resource for the Bhagavad Gita, featuring multiple translations and commentaries.",
        icon: "🕉️",
        url: "https://www.gitasupersite.iitk.ac.in/"
      },
      {
        title: "The Prophet",
        author: "Kahlil Gibran",
        desc: "A beautiful collection of poetic essays on life, love, and humanity.",
        icon: "🕊️",
        url: "https://www.kahlilgibran.com/images/The%20Prophet%20Ebook%20by%20Kahlil%20Gibran.pdf"
      },
      {
        title: "Siddhartha",
        author: "Hermann Hesse",
        desc: "A spiritual journey of self-discovery and finding the meaning of life.",
        icon: "✨",
        url: "https://bca.klesnc.edu.in/wp-content/uploads/2025/07/Siddhartha-by-Hermann-Hesse.pdf"
      },
      {
        title: "Gitanjali",
        author: "Rabindranath Tagore",
        desc: "Soul-stirring poetry that reflects the deep connection between the individual and the divine.",
        icon: "🕯️",
        url: "https://dn790007.ca.archive.org/0/items/gitanjalisongoff00tagouoft/gitanjalisongoff00tagouoft.pdf"
      },
      {
        title: "The Dhammapada",
        author: "The Buddha",
        desc: "A collection of sayings of the Buddha in verse form, one of the best-known Buddhist scriptures.",
        icon: "☸️",
        url: "https://www.buddhistelibrary.org/buddhism-online/e-books/dhammapada-txt.pdf"
      }
    ]
  },
  {
    title: "🏛️ Ancient Wisdom & Philosophy",
    books: [
      {
        title: "Meditations",
        author: "Marcus Aurelius",
        desc: "Ancient Stoic wisdom for finding inner peace in a chaotic world.",
        icon: "📜",
        url: "https://dn720006.ca.archive.org/0/items/meditationsofmar00marc/meditationsofmar00marc.pdf"
      },
      {
        title: "Tao Te Ching",
        author: "Lao Tzu",
        desc: "The fundamental text of Taoism, offering profound insights into living in harmony.",
        icon: "☯️",
        url: "https://ia802905.us.archive.org/view_archive.php?archive=/32/items/plus-mystics/PLUS%20MYSTICS.rar&file=PLUS%20MYSTICS%2FEBOOK%2FENG%2FTAO%2FOKE%2FTao%20Te%20Ching%20The%20New%20Translation%20from%20Tao%20Te%20Ching%2C%20The%20Definitive%20Edition.pdf"
      },
      {
        title: "Letters from a Stoic",
        author: "Seneca",
        desc: "Philosophical letters offering practical advice on how to live with virtue and tranquil mind.",
        icon: "✉️",
        url: "https://dn721801.ca.archive.org/0/items/letters-from-a-stoic-1/Letters%20from%20a%20Stoic%201.pdf"
      },
      {
        title: "Self-Reliance",
        author: "Ralph Waldo Emerson",
        desc: "A powerful call to trust your own intuition and achieve independence.",
        icon: "💪",
        url: "https://www.livinglifefully.com/ebooks/self-reliance.pdf"
      }
    ]
  },
  {
    title: "🌿 Nature & Simplicity",
    books: [
      {
        title: "Walden",
        author: "Henry David Thoreau",
        desc: "A reflection upon simple living in natural surroundings, a classic of American literature.",
        icon: "🌲",
        url: "https://dn790008.ca.archive.org/0/items/cu31924021445741/cu31924021445741.pdf"
      },
      {
        title: "Leaves of Grass",
        author: "Walt Whitman",
        desc: "Celebrating the beauty of nature, the human spirit, and the interconnectedness of all things.",
        icon: "🍃",
        url: "https://www.waltwhitman.com/leaves-of-grass.pdf"
      }
    ]
  },
  {
    title: "🧠 Modern Thought & Growth",
    books: [
      {
        title: "As a Man Thinketh",
        author: "James Allen",
        desc: "A timeless guide on how our thoughts shape our character and life.",
        icon: "🧠",
        url: "https://dn790000.ca.archive.org/0/items/asmanthinketh00alleiala/asmanthinketh00alleiala.pdf"
      },
      {
        title: "Truth Without Apology",
        author: "Acharya Prashant",
        desc: "A collection of hard-hitting truths that help strip away life's illusions.",
        icon: "🧘",
        url: "https://docs.google.com/document/d/1nqx1neqtlrwoxKGIGh8ZrMqHtmojUV8IGHuL39GtEgI/edit?usp=sharing"
      }
    ]
  },

];
