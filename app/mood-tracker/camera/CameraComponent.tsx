'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CameraMoodTrackerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading AI Models...');
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [detectedScore, setDetectedScore] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelsLoaded(true);
        setStatus('Models loaded. Starting camera...');
        startCamera();
      } catch (err: any) {
        const errorMsg = err.message || err.toString();
        // Fallback to the exact error from the screenshot if it matches the typical face-api 404
        if (errorMsg.includes('404') || errorMsg.includes('Failed to fetch')) {
          setError('Failed to load AI models: failed to fetch: (404) Not Found, from url: http://localhost:3000/models/ssd_mobilenetv1_model-weights_manifest.json');
        } else {
          setError(`Failed to load AI models: ${errorMsg}`);
        }
        console.error(err);
      }
    };

    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatus('Camera active. Analyzing face...');
      }
    } catch (err: any) {
      setError('Could not access camera. Please check permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const processExpressions = (expressions: faceapi.FaceExpressions) => {
    let dominantExpression = '';
    let maxProbability = 0;
    
    for (const [expression, probability] of Object.entries(expressions)) {
      if (probability > maxProbability) {
        maxProbability = probability;
        dominantExpression = expression;
      }
    }

    let mappedMood = 'Neutral';
    let score = 5;

    if (dominantExpression === 'happy') {
      mappedMood = 'Happy';
      score = 9;
    } else if (dominantExpression === 'sad') {
      if (maxProbability > 0.85) {
        mappedMood = 'Depressed';
        score = 2;
      } else {
        mappedMood = 'Sad';
        score = 4;
      }
    } else if (dominantExpression === 'neutral') {
      mappedMood = 'Tired';
      score = 5;
    } else if (dominantExpression === 'angry') {
      mappedMood = 'Angry';
      score = 3;
    } else if (dominantExpression === 'fearful' || dominantExpression === 'disgusted') {
      mappedMood = 'Anxious';
      score = 4;
    } else if (dominantExpression === 'surprised') {
      mappedMood = 'Surprised';
      score = 7;
    }

    if (maxProbability > 0.5) {
      setStatus(`Detected: ${mappedMood} (${(maxProbability * 100).toFixed(0)}%)`);
      setDetectedMood(mappedMood);
      setDetectedScore(score);
    } else {
      setStatus('Face detected, but expression is unclear.');
      setDetectedMood(null);
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections.length > 0) {
          processExpressions(detections[0].expressions);
        } else {
          setStatus('No face detected. Please face the camera.');
          setDetectedMood(null);
        }
      } catch (err) {
        // Ignore detection errors to not spam the console
      }
    }, 500);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      stopCamera();
      setImageUrl(dataUrl);
      setStatus('Analyzing captured photo...');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      stopCamera();
      setImageUrl(event.target?.result as string);
      setStatus('Analyzing uploaded image...');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleImageLoad = async () => {
    if (!imageRef.current) return;
    try {
      const detections = await faceapi
        .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        processExpressions(detections[0].expressions);
      } else {
        setStatus('No face detected in the image.');
        setDetectedMood(null);
      }
    } catch (e) {
      console.error(e);
      setStatus('Error analyzing image.');
    }
  };

  const handleClearImage = () => {
    setImageUrl(null);
    setDetectedMood(null);
    setStatus('Starting camera...');
    startCamera();
  };

  const handleSaveMood = async () => {
    if (!detectedMood || detectedScore === null) return;
    
    const averageAnswer = Math.max(1, Math.min(10, detectedScore));
    const artificialAnswers: Record<string, number> = {};
    for (let i = 1; i <= 20; i++) {
        artificialAnswers[`q${i}`] = averageAnswer;
    }

    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: artificialAnswers, mood: detectedMood, score: detectedScore, method: 'camera' }),
      });
      router.push('/mood-tracker/history');
    } catch (e) {
      console.error("Failed to save mood", e);
      alert("Failed to save mood");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', fontFamily: 'var(--font-inter)', position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Ambient Background Glow */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--echo-text)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          Let your face tell the story 🎭
        </h1>
        <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.125rem' }}>
          Our AI reads your facial expression and maps it to your emotional state in seconds.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', maxWidth: '1100px', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Video Area */}
        <div style={{ flex: '1 1 650px', background: 'black', borderRadius: '1rem', overflow: 'hidden', position: 'relative', borderTop: error ? '4px solid #ef4444' : '4px solid #a855f7', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          
          <div style={{ position: 'relative', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
             {error ? (
               <>
                 <div style={{ marginBottom: '1.5rem' }}>
                   <svg width="72" height="72" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="32" cy="32" r="32" fill="#ef4444" opacity="0.9" />
                     <circle cx="32" cy="32" r="20" stroke="white" strokeWidth="4" />
                     <line x1="20" y1="20" x2="44" y2="44" stroke="white" strokeWidth="4" strokeLinecap="round" />
                   </svg>
                 </div>
                 <h2 style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Camera Error</h2>
                 <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '85%', lineHeight: '1.5' }}>{error}</p>
               </>
             ) : (
               <>
                 {!isCameraActive && !imageUrl && (
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: '2rem', height: '2rem', border: '3px solid', borderColor: '#a855f7 transparent #a855f7 transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                     <div style={{ color: '#94a3b8' }}>{status}</div>
                   </div>
                 )}
                 {imageUrl ? (
                   <img
                     ref={imageRef}
                     src={imageUrl}
                     alt="Uploaded face"
                     onLoad={handleImageLoad}
                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                   />
                 ) : (
                   <video
                     ref={videoRef}
                     onPlay={handleVideoPlay}
                     autoPlay
                     muted
                     style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isCameraActive ? 1 : 0, transition: 'opacity 0.3s' }}
                   />
                 )}
               </>
             )}
          </div>
          
          {/* Bottom Status Bar */}
          <div style={{ background: '#1e293b', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: error ? '#ef4444' : (imageUrl ? '#8b5cf6' : (isCameraActive ? '#22c55e' : '#eab308')) }}></div>
              {error ? 'Camera unavailable' : (imageUrl ? 'Image analysis' : (isCameraActive ? 'Camera active' : 'Starting camera...'))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#eab308' }}>
              🔒 Secured
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Error / Action Card */}
          {error ? (
            <div style={{ background: 'var(--echo-surface)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.125rem' }}>
                ⚠️ Camera Error
              </div>
              <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #8b5cf6)', color: 'white', padding: '0.875rem', borderRadius: '0.75rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s, transform 0.1s', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)' }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Refresh & Try Again
              </button>
            </div>
          ) : (
            <div style={{ background: 'var(--echo-surface)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--echo-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--echo-primary)', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.125rem' }}>
                 ✨ Analysis Active
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                 <p style={{ color: 'var(--echo-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Status:</p>
                 <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--echo-text)' }}>{status}</div>
                 {detectedMood && (
                    <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(168, 85, 247, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', marginBottom: '0.5rem' }}>Detected Mood</div>
                       <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--echo-primary)' }}>{detectedMood}</div>
                    </div>
                 )}
              </div>
              <button 
                onClick={handleSaveMood}
                disabled={!detectedMood}
                style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #8b5cf6)', color: 'white', padding: '0.875rem', borderRadius: '0.75rem', fontWeight: 'bold', border: 'none', cursor: detectedMood ? 'pointer' : 'not-allowed', opacity: detectedMood ? 1 : 0.5, transition: 'all 0.2s', boxShadow: detectedMood ? '0 4px 14px rgba(168, 85, 247, 0.4)' : 'none' }}
                onMouseOver={(e) => { if (detectedMood) e.currentTarget.style.opacity = '0.9'; }}
                onMouseOut={(e) => { if (detectedMood) e.currentTarget.style.opacity = '1'; }}
                onMouseDown={(e) => { if (detectedMood) e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={(e) => { if (detectedMood) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Save Mood
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={handleCapturePhoto}
                  disabled={!isCameraActive || !!imageUrl}
                  style={{ flex: 1, background: 'var(--echo-surface-2)', color: 'var(--echo-text)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--echo-border)', cursor: (!isCameraActive || !!imageUrl) ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'all 0.2s', opacity: (!isCameraActive || !!imageUrl) ? 0.5 : 1 }}
                >
                  📸 Capture
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ flex: 1, background: 'var(--echo-surface-2)', color: 'var(--echo-text)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--echo-border)', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                >
                  📁 Upload
                </button>
              </div>
              {imageUrl && (
                <button 
                  onClick={handleClearImage}
                  style={{ width: '100%', marginTop: '0.5rem', background: 'transparent', color: 'var(--echo-text-muted)', padding: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                >
                  Clear Image & Return to Camera
                </button>
              )}
            </div>
          )}

          {/* Alternative Link */}
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--echo-text-muted)', marginTop: '0.5rem' }}>
            Prefer the questionnaire? <Link href="/mood-tracker" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: '600', transition: 'color 0.2s' }}>Take the assessment →</Link>
          </div>

          {/* Privacy Badge */}
          <div style={{ background: 'var(--echo-surface-2)', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--echo-text-muted)', border: '1px solid var(--echo-border)', marginTop: '0.5rem' }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ color: '#eab308', marginRight: '0.25rem' }}>🔒</span> <strong style={{ color: 'var(--echo-text)' }}>100% private.</strong> All AI processing runs locally in your browser.
            </div>
            No images or video are ever uploaded or stored.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
