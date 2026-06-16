'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import BackButton from '@/components/BackButton';

export default function CommunityPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Basic validation: Check if it's an image or video
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        alert('Please upload a valid image or video file.');
        return;
      }
      
      // If video, check roughly size limit (e.g. ~15MB for 60 seconds depending on quality)
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
      
      // Refresh feed
      fetchPosts();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'An error occurred while posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="echo-nav" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BackButton />
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/favicon.ico" alt="Echo Logo" style={{ width: '40px', height: '40px', borderRadius: '12px' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--echo-text)' }}>ECHO <span style={{ fontWeight: '400', opacity: 0.7 }}>Community</span></span>
          </Link>
        </div>
        <ThemeToggle />
      </nav>

      <main style={{ flex: 1, padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 className="section-heading" style={{ marginBottom: '0.5rem' }}>Community Feed</h1>
        <p style={{ color: 'var(--echo-text-muted)', marginBottom: '2rem' }}>A safe space to share thoughts, photos, and short videos.</p>

        {/* Create Post Section */}
        {isLoaded ? (
          isSignedIn ? (
            <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--echo-primary)' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <textarea
                  className="echo-input"
                  placeholder="Share a supportive thought..."
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={isSubmitting}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                    >
                      📎 Attach Photo / Video (up to 60s)
                    </button>
                    {file && (
                      <span style={{ fontSize: '0.875rem', color: 'var(--echo-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        ✓ {file.name}
                        <button type="button" onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer' }}>✕</button>
                      </span>
                    )}
                  </div>
                  
                  <button type="submit" className="btn-primary" disabled={isSubmitting || (!content.trim() && !file)}>
                    {isSubmitting ? 'Posting...' : 'Post to Community'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="echo-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Join the Conversation</h3>
              <p style={{ color: 'var(--echo-text-muted)', marginBottom: '1.5rem' }}>Sign in to share your own thoughts, photos, and videos with the community.</p>
              <Link href="/sign-in?redirect_url=/community">
                <button className="btn-primary">Sign In</button>
              </Link>
            </div>
          )
        ) : (
          <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--echo-text-muted)' }}>Loading...</span>
          </div>
        )}

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.length === 0 ? (
            <div className="echo-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--echo-text-muted)' }}>No posts yet. Be the first to share something positive!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="echo-card animate-fade-in-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--echo-primary), #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'white', fontSize: '1.25rem' }}>
                    {post.authorName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {post.authorName}
                      <span className={`badge badge-${post.authorRole === 'doctor' ? 'cyan' : post.authorRole === 'volunteer' ? 'purple' : 'gray'}`}>
                        {post.authorRole}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {user?.id === post.authorId && (
                    <button 
                      onClick={() => handleDeletePost(post._id)}
                      disabled={isDeleting === post._id}
                      style={{ background: 'none', border: 'none', color: 'var(--echo-text-muted)', cursor: 'pointer', fontSize: '1.25rem', opacity: 0.7 }}
                      title="Delete Post"
                    >
                      {isDeleting === post._id ? '⏳' : '🗑️'}
                    </button>
                  )}
                </div>

                <p style={{ color: 'var(--echo-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: post.mediaUrl ? '1rem' : '0' }}>
                  {post.content}
                </p>

                {post.mediaUrl && post.mediaType === 'image' && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '1rem' }}>
                    <img src={post.mediaUrl} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
                  </div>
                )}

                {post.mediaUrl && post.mediaType === 'video' && (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', marginTop: '1rem', background: 'black' }}>
                    <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: '500px' }} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
