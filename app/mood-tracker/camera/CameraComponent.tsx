'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import ThemeToggle from '@/components/ThemeToggle';
import { Camera, Sparkles, AlertCircle } from 'lucide-react';

type ThemeKey = 'celestial' | 'forest' | 'sunset';

const THEMES: Record<ThemeKey, { name: string; primary: string; secondary: string; glow: string; bgGrad: string }> = {
  celestial: {
    name: '🌌 Celestial',
    primary: '#7c3aed',
    secondary: '#06b6d4',
    glow: 'rgba(124, 58, 237, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(6, 182, 212, 0.12) 0%, transparent 60%)',
  },
  forest: {
    name: '🌲 Forest',
    primary: '#059669',
    secondary: '#10b981',
    glow: 'rgba(5, 150, 105, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
  },
  sunset: {
    name: '🌅 Sunset',
    primary: '#f59e0b',
    secondary: '#e11d48',
    glow: 'rgba(245, 158, 11, 0.25)',
    bgGrad: 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.18) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(225, 29, 72, 0.12) 0%, transparent 60%)',
  },
};

function AmbientSelector({ activeTheme, setActiveTheme }: { activeTheme: ThemeKey; setActiveTheme: (k: ThemeKey) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--echo-surface-2)', padding: '0.35rem 0.5rem', borderRadius: '999px', border: '1px solid var(--echo-border)' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--echo-text-muted)', paddingLeft: '0.5rem' }}>Ambient:</span>
      {(Object.keys(THEMES) as ThemeKey[]).map(key => {
        const t = THEMES[key];
        const isSel = activeTheme === key;
        return (
          <button key={key} onClick={() => setActiveTheme(key)} style={{
            padding: '0.35rem 0.75rem', borderRadius: '999px', border: 'none',
            background: isSel ? t.primary : 'transparent', color: isSel ? '#fff' : 'var(--echo-text-muted)',
            fontSize: '0.75rem', fontWeight: isSel ? '700' : '500', cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {t.name.split(' ')[0]} {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        );
      })}
    </div>
  );
}

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
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('celestial');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const currentTheme = THEMES[activeTheme];

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

    setDetectedMood(mappedMood);
    setDetectedScore(score);
  };

  const handleVideoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 });
    
    intervalRef.current = setInterval(async () => {
      if (videoRef.current && isCameraActive) {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceExpressions();
          
        if (detection && detection.expressions) {
          processExpressions(detection.expressions);
        }
      }
    }, 500);
  };

  const handleImageLoad = async () => {
    if (imageRef.current) {
      setStatus('Analyzing uploaded photo...');
      const detection = await faceapi
        .detectSingleFace(imageRef.current)
        .withFaceExpressions();
        
      if (detection && detection.expressions) {
        processExpressions(detection.expressions);
        setStatus('Analysis complete.');
      } else {
        setError('No face detected in the image. Please try another photo.');
        setStatus('Analysis failed.');
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stopCamera();
      setImageUrl(URL.createObjectURL(file));
      setDetectedMood(null);
      setDetectedScore(null);
    }
  };

  const handleClearImage = () => {
    setImageUrl(null);
    setDetectedMood(null);
    setDetectedScore(null);
    setError(null);
    setStatus('Restarting camera...');
    startCamera();
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopCamera();
        setImageUrl(dataUrl);
      }
    }
  };

  const handleSaveMood = async () => {
    if (!detectedMood || !detectedScore) return;
    try {
      await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: {
            detectedMood,
            moodScore: detectedScore
          }
        }),
      });
      router.push('/mood-tracker/history');
    } catch (e) {
      console.error("Failed to save mood", e);
      alert("Failed to save mood");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', color: 'var(--echo-text)', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        .show-mobile-flex {
          display: none !important;
        }
        @media (max-width: 768px) {
          .show-mobile-flex {
            display: flex !important;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Dynamic Ambient Background Glow */}
      <div style={{ position: 'fixed', inset: 0, background: currentTheme.bgGrad, pointerEvents: 'none', zIndex: 0, transition: 'background 1s ease' }} />

      {/* Sticky Header */}
      <header style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--echo-border)',
        background: 'var(--echo-surface)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BackButton />
          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--echo-text)', marginLeft: '0.25rem' }}>
            Face Mood Tracker
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="hide-mobile">
            <AmbientSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="page-container" style={{ position: 'relative', zIndex: 1, paddingBottom: '5rem' }}>
        
        {/* Mobile Ambient Mood Selector */}
        <div className="show-mobile-flex" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <AmbientSelector activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        </div>

        {/* Hero Welcome Banner */}
        <div className="glass" style={{
          padding: '2.5rem', borderRadius: '28px',
          border: '1px solid var(--echo-border)', background: 'var(--echo-surface)',
          boxShadow: `0 25px 60px rgba(0,0,0,0.12), 0 0 40px ${currentTheme.glow}`,
          marginBottom: '3rem', position: 'relative', overflow: 'hidden',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', background: `radial-gradient(circle, ${currentTheme.primary} 0%, transparent 70%)`, opacity: 0.12, filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.875rem', borderRadius: '999px', background: 'var(--echo-surface-2)', color: 'var(--echo-primary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              <Camera size={14} /><span>AI Face Scan</span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--echo-text)', marginBottom: '0.5rem' }}>
              Let your face tell the story
            </h1>
            <p style={{ color: 'var(--echo-text-muted)', fontSize: '1.0625rem', lineHeight: '1.6', margin: '0 auto', maxWidth: '600px' }}>
              Our AI reads your facial expression and maps it to your emotional state in seconds.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', maxWidth: '1100px', margin: '0 auto', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Left Video Area */}
          <div className="glass" style={{ flex: '1 1 650px', background: 'black', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: error ? '2px solid #ef4444' : `2px solid ${currentTheme.primary}`, display: 'flex', flexDirection: 'column', boxShadow: `0 15px 35px rgba(0,0,0,0.15), 0 0 30px ${currentTheme.glow}` }}>
            
            <div style={{ position: 'relative', aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
               {error ? (
                 <>
                   <div style={{ marginBottom: '1.5rem' }}>
                     <AlertCircle size={48} color="#ef4444" />
                   </div>
                   <h2 style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Camera Error</h2>
                   <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '85%', lineHeight: '1.5' }}>{error}</p>
                 </>
               ) : (
                 <>
                   {!isCameraActive && !imageUrl && (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '2rem', height: '2rem', border: '3px solid', borderColor: `${currentTheme.primary} transparent ${currentTheme.primary} transparent`, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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
            
            {/* Status bar */}
            {!error && (
              <div style={{ background: 'rgba(0,0,0,0.8)', padding: '1rem', color: '#94a3b8', fontSize: '0.8125rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>Status: <span style={{ color: '#f8fafc', fontWeight: '600' }}>{status}</span></div>
                {isCameraActive && <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span> Live Feed</div>}
              </div>
            )}
          </div>

          {/* Right Control Area */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--echo-surface)', border: '1px solid var(--echo-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
               <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color={currentTheme.primary} /> Analysis Result
               </h2>
               
               <div style={{ minHeight: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--echo-border)', borderRadius: '16px', background: 'var(--echo-surface-2)', marginBottom: '1.5rem', padding: '1rem' }}>
                 {!detectedMood ? (
                    <div style={{ textAlign: 'center', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>
                      Position your face in the camera view to run real-time expression detection.
                    </div>
                 ) : (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.875rem', color: 'var(--echo-text-muted)', marginBottom: '0.5rem' }}>Detected Mood</div>
                       <div style={{ fontSize: '2rem', fontWeight: '900', color: currentTheme.primary }}>{detectedMood}</div>
                    </div>
                 )}
               </div>

               <button 
                 onClick={handleSaveMood}
                 disabled={!detectedMood}
                 className="btn-primary"
                 style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontWeight: '800', cursor: detectedMood ? 'pointer' : 'not-allowed', opacity: detectedMood ? 1 : 0.5, transition: 'all 0.2s' }}
               >
                 Save Mood
               </button>

               <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                 <button 
                   onClick={handleCapturePhoto}
                   disabled={!isCameraActive || !!imageUrl}
                   className="btn-secondary"
                   style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', cursor: (!isCameraActive || !!imageUrl) ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'all 0.2s', opacity: (!isCameraActive || !!imageUrl) ? 0.5 : 1 }}
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
                   className="btn-secondary"
                   style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                 >
                   📁 Upload
                 </button>
               </div>
               
               {imageUrl && (
                 <button 
                   onClick={handleClearImage}
                   style={{ width: '100%', marginTop: '0.75rem', background: 'transparent', color: 'var(--echo-text-muted)', padding: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                 >
                   Clear Image & Return to Camera
                 </button>
               )}
            </div>

            {/* Alternative Link */}
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--echo-text-muted)' }}>
              Prefer the questionnaire? <Link href="/mood-tracker" style={{ color: currentTheme.primary, textDecoration: 'none', fontWeight: '700', transition: 'color 0.2s' }}>Take the assessment →</Link>
            </div>

            {/* Privacy Badge */}
            <div className="glass" style={{ borderRadius: '20px', padding: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--echo-text-muted)', border: '1px solid var(--echo-border)', background: 'var(--echo-surface)' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ marginRight: '0.25rem' }}>🔒</span> <strong style={{ color: 'var(--echo-text)' }}>100% private.</strong> All AI processing runs locally in your browser.
              </div>
              No images or video feed are ever uploaded or stored.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
