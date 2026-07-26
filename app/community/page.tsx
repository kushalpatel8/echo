'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import BackButton from '@/components/BackButton';
import { Sparkles, Users, Trash2, Paperclip, Lock, Check, X, Image as ImageIcon, Film } from 'lucide-react';
import { isContentHarmful } from '@/lib/moderation';

type RoomTheme = 'celestial' | 'forest' | 'sunset' | 'ocean' | 'aurora';

const ROOM_THEMES: Record<RoomTheme, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: {
    name: '🌌 Celestial Twilight',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Deep Forest Sanctuary',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Amber Serenity',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
  ocean: {
    name: '🌊 Deep Ocean Calm',
    primary: '#3b82f6',
    secondary: '#0ea5e9',
    glow: 'rgba(59, 130, 246, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(14, 165, 233, 0.12) 0%, transparent 60%)',
  },
  aurora: {
    name: '✨ Northern Lights',
    primary: '#a855f7',
    secondary: '#10b981',
    glow: 'rgba(168, 85, 247, 0.2)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(10, 200, 120, 0.12) 0%, transparent 60%)',
  },
};

export default function CommunityPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [roomTheme, setRoomTheme] = useState<RoomTheme>('celestial');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = ROOM_THEMES[roomTheme];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error('Failed to fetch posts', e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(postId);
    try {
      const res = await fetch(`/api/posts?id=${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchPosts();
    } catch (e) {
      console.error(e);
      alert('Failed to delete post.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        alert('Please upload a valid image or video file.');
        return;
      }
      if (selectedFile.type.startsWith('video/') && selectedFile.size > 20 * 1024 * 1024) {
        alert('Video file is too large. Please keep videos under 60 seconds / 20MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadToCloudinary = async (fileToUpload: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Admin needs to set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env');
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', uploadPreset);

    const isVideo = fileToUpload.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await res.json();
    return { url: data.secure_url, type: resourceType };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    const hasHarmfulText = isContentHarmful(content);
    const hasHarmfulImage = file && isContentHarmful(file.name);

    if (hasHarmfulText || hasHarmfulImage) {
      alert("your text image contain abusive and harmful content your not able to post");
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl = undefined;
      let mediaType = 'none';

      if (file) {
        const uploadResult = await uploadToCloudinary(file);
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mediaUrl, mediaType })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create post');
      }

      setContent('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchPosts();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'An error occurred while posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--echo-bg)',
        color: 'var(--echo-text)',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.5s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
        .community-header {
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

        .community-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .community-theme-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--echo-surface-2);
          padding: 0.35rem 0.5rem;
          borderRadius: 999px;
          border: 1px solid var(--echo-border);
        }

        @media (max-width: 640px) {
          .community-header {
            flex-direction: column;
            align-items: center;
            padding: 0.75rem 1rem;
            gap: 0.75rem;
          }

          .community-header-left {
            width: 100%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
          }

          .community-back-container {
            display: none !important;
          }

          .community-header-left a {
            justify-content: center;
            width: 100%;
          }

          .community-theme-selector {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <header className="community-header">
        <div className="community-header-left">
          <div className="community-back-container">
            <BackButton />
          </div>
          <Link href="/" className="hide-desktop" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
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
              <Users size={18} style={{ color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '1.125rem', letterSpacing: '-0.01em', color: 'var(--echo-text)', lineHeight: '1.2' }}>
                ECHO Community
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--echo-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', lineHeight: '1.2', marginTop: '0.15rem' }}>
                <span className="status-dot online" style={{ width: '6px', height: '6px' }} />
                <span>Safe Support Space</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="community-theme-selector" style={{ borderRadius: '999px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }} className="hide-mobile">
            Mood:
          </span>
          {(Object.keys(ROOM_THEMES) as RoomTheme[]).map(key => {
            const t = ROOM_THEMES[key];
            const isSelected = roomTheme === key;
            const isExtra = key === 'ocean' || key === 'aurora';
            return (
              <button
                key={key}
                onClick={() => setRoomTheme(key)}
                className={isExtra ? 'hide-mobile' : ''}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: isSelected ? t.primary : 'transparent',
                  color: isSelected ? '#fff' : 'var(--echo-text-muted)',
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

      <main style={{ flex: 1, padding: '2.5rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Hero Section - Desktop only */}
        <div className="glass hide-mobile" style={{
          padding: '2.5rem', borderRadius: '28px',
          border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
          boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
          marginBottom: '2.5rem', position: 'relative', overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              <Users size={14} /><span>Safe Sanctuary</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
              Community Feed
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
              A safe space to share supportive thoughts, inspiring photos, and uplifting short videos.
            </p>
          </div>
        </div>

        {/* Mobile-only header block */}
        <div className="show-mobile" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.02em', color: 'var(--echo-text)' }}>
            Community Feed
          </h1>
          <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            A safe space to share supportive thoughts, inspiring photos, and uplifting short videos.
          </p>
        </div>

        {isLoaded ? (
          isSignedIn ? (
            <div 
              className="glass" 
              style={{ 
                padding: '1.75rem', 
                marginBottom: '2.5rem', 
                borderRadius: '24px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
                boxShadow: `0 15px 35px rgba(0, 0, 0, 0.1), 0 0 20px ${currentTheme.glow}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})` }} />

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <textarea
                  className="echo-input"
                  placeholder="Share a supportive thought, realization, or moment of gratitude..."
                  style={{ 
                    minHeight: '120px', 
                    resize: 'vertical',
                    background: 'var(--echo-surface-2)',
                    border: '1px solid var(--echo-border)',
                    borderRadius: '16px',
                    padding: '1rem',
                    color: 'var(--echo-text)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    textAlign: 'center',
                  }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={isSubmitting}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }}
                      disabled={isSubmitting}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                    >
                      <Paperclip size={14} />
                      <span>Attach Photo / Video</span>
                    </button>

                    {file && (
                      <span style={{ 
                        fontSize: '0.8125rem', 
                        color: currentTheme.primary, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        background: `${currentTheme.primary}15`,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}>
                        {file.type.startsWith('video/') ? <Film size={12} /> : <ImageIcon size={12} />}
                        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.name}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} 
                          style={{ background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 2px' }}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSubmitting || (!content.trim() && !file)}
                    style={{
                      padding: '0.625rem 1.5rem',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                      border: 'none',
                      color: '#fff',
                      boxShadow: `0 4px 15px ${currentTheme.glow}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {isSubmitting ? 'Posting...' : 'Post to Community'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div 
              className="glass" 
              style={{ 
                marginBottom: '2.5rem', 
                textAlign: 'center', 
                padding: '3rem 2rem',
                borderRadius: '24px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '20px', 
                background: 'var(--echo-surface-2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1.5rem' 
              }}>
                <Lock size={32} style={{ color: 'var(--echo-text-muted)' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--echo-text)' }}>Join the Conversation</h3>
              <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Sign in to share your own thoughts, photos, and videos with the community.
              </p>
              <Link href="/sign-in?redirect_url=/community">
                <button 
                  className="btn-primary"
                  style={{
                    padding: '0.625rem 1.75rem',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
              </Link>
            </div>
          )
        ) : (
          <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--echo-text-muted)', fontWeight: '600' }} className="animate-pulse">Loading feed options...</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.length === 0 ? (
            <div 
              className="glass" 
              style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem', 
                borderRadius: '24px',
                border: '1px solid var(--echo-border)',
                background: 'var(--echo-surface)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' }}>The feed is quiet</h4>
              <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.9rem' }}>Be the first to share something positive!</p>
            </div>
          ) : (
            posts.map(post => {
              let badgeColor = 'var(--echo-text-muted)';
              let badgeBg = 'var(--echo-surface-2)';
              if (post.authorRole === 'doctor') {
                badgeColor = '#06b6d4';
                badgeBg = 'rgba(6, 182, 212, 0.1)';
              } else if (post.authorRole === 'volunteer') {
                badgeColor = '#a78bfa';
                badgeBg = 'rgba(167, 139, 250, 0.1)';
              }

              return (
                <div 
                  key={post._id} 
                  className="glass animate-fade-in-up"
                  style={{
                    padding: '1.75rem',
                    borderRadius: '24px',
                    border: '1px solid var(--echo-border)',
                    background: 'var(--echo-surface)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div 
                      style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '12px', 
                        background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: '800', 
                        color: '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        fontSize: '1.25rem',
                        boxShadow: `0 4px 10px ${currentTheme.glow}`
                      }}
                    >
                      {post.authorName[0]?.toUpperCase()}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--echo-text)' }}>
                        {post.authorName}
                        <span style={{ 
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          color: badgeColor,
                          background: badgeBg,
                          border: `1px solid ${badgeColor}25`
                        }}>
                          {post.authorRole}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--echo-text-muted)', marginTop: '0.15rem' }}>
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {user?.id === post.authorId && (
                      <button 
                        onClick={() => handleDeletePost(post._id)}
                        disabled={isDeleting === post._id}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#ef4444', 
                          cursor: 'pointer', 
                          opacity: 0.7,
                          transition: 'opacity 0.2s ease',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete Post"
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                      >
                        {isDeleting === post._id ? (
                          <span style={{ fontSize: '0.8rem' }} className="animate-spin">⏳</span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>

                  <p style={{ 
                    color: 'var(--echo-text)', 
                    lineHeight: '1.7', 
                    fontSize: '1rem',
                    whiteSpace: 'pre-wrap', 
                    marginBottom: post.mediaUrl ? '1.25rem' : '0' 
                  }}>
                    {post.content}
                  </p>

                  {post.mediaUrl && post.mediaType === 'image' && (
                    <div 
                      style={{ 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        marginTop: '1.25rem',
                        border: '1px solid var(--echo-border)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img 
                        src={post.mediaUrl} 
                        alt="Post attachment" 
                        style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} 
                      />
                    </div>
                  )}

                  {post.mediaUrl && post.mediaType === 'video' && (
                    <div 
                      style={{ 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        marginTop: '1.25rem', 
                        background: 'black',
                        border: '1px solid var(--echo-border)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      }}
                    >
                      <video 
                        src={post.mediaUrl} 
                        controls 
                        style={{ width: '100%', maxHeight: '500px', display: 'block' }} 
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
