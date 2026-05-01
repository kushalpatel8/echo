'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CameraMoodTrackerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading AI Models...');
  const [detectedMood, setDetectedMood] = useState<string | null>(null);
  const [detectedScore, setDetectedScore] = useState<number | null>(null);
  
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
        if (mode === 'camera') {
          setStatus('Models loaded. Starting camera...');
          startCamera();
        } else {
          setStatus('Models loaded. Please upload an image.');
        }
      } catch (err) {
        setError('Failed to load AI models. Please check if the models are available in the public/models folder.');
        console.error(err);
      }
    };

    loadModels();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isModelsLoaded) return;
    
    if (mode === 'camera') {
      setImageUrl(null);
      setDetectedMood(null);
      setDetectedScore(null);
      setStatus('Starting camera...');
      startCamera();
    } else {
      stopCamera();
      setDetectedMood(null);
      setDetectedScore(null);
      if (imageUrl) {
        setStatus('Analyzing uploaded image...');
      } else {
        setStatus('Please upload an image.');
      }
    }
  }, [mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setStatus('Camera active. Analyzing face...');
      }
    } catch (err) {
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

    // Custom mapping for user requested moods: Happy, Sad, Depressed, Tired
    let mappedMood = 'Neutral';
    let score = 5;

    if (dominantExpression === 'happy') {
      mappedMood = 'Happy';
      score = 9;
    } else if (dominantExpression === 'sad') {
      // Differentiate between Sad and Depressed based on intensity
      if (maxProbability > 0.85) {
        mappedMood = 'Depressed';
        score = 2;
      } else {
        mappedMood = 'Sad';
        score = 4;
      }
    } else if (dominantExpression === 'neutral') {
      // Mapping neutral to Tired as requested, since lack of expression often correlates to fatigue
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
    if (mode !== 'camera' || !videoRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || mode !== 'camera') return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        processExpressions(detections[0].expressions);
      } else {
        setStatus('No face detected. Please face the camera.');
        setDetectedMood(null);
      }
    }, 500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = async () => {
    if (!imageRef.current || mode !== 'upload') return;
    setStatus('Analyzing uploaded image...');

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
        body: JSON.stringify({ answers: artificialAnswers, mood: detectedMood, score: detectedScore, method: mode }),
      });
      router.push('/mood-tracker/history');
    } catch (e) {
      console.error("Failed to save mood", e);
      alert("Failed to save mood");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--echo-bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--echo-border)', background: 'var(--echo-surface)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/mood-tracker" style={{ textDecoration: 'none', color: 'var(--echo-text-muted)', fontSize: '0.875rem' }}>← Back to Tracker</Link>
        <div style={{ fontWeight: '700' }}>📷 AI Face Analysis</div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="echo-card animate-fade-in-up" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Detect Mood</h1>
            <p style={{ color: 'var(--echo-text-muted)', lineHeight: '1.6' }}>
              Use your camera or upload a photo to let the AI analyze your facial expressions.
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--echo-surface-2)', padding: '0.25rem', borderRadius: '0.75rem' }}>
            <button 
              onClick={() => setMode('camera')}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: mode === 'camera' ? 'var(--echo-surface)' : 'transparent', color: mode === 'camera' ? 'var(--echo-primary)' : 'var(--echo-text-muted)', fontWeight: mode === 'camera' ? '600' : '500', boxShadow: mode === 'camera' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Live Camera
            </button>
            <button 
              onClick={() => setMode('upload')}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: mode === 'upload' ? 'var(--echo-surface)' : 'transparent', color: mode === 'upload' ? 'var(--echo-primary)' : 'var(--echo-text-muted)', fontWeight: mode === 'upload' ? '600' : '500', boxShadow: mode === 'upload' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Upload Photo
            </button>
          </div>

          {error ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'var(--echo-surface-2)', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--echo-border)' }}>
              
              {!isModelsLoaded && (
                <div style={{ position: 'absolute', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--echo-text-muted)' }}>
                   <div style={{ width: '2rem', height: '2rem', border: '3px solid', borderColor: 'var(--echo-primary) transparent var(--echo-primary) transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }}></div>
                   <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{status}</span>
                </div>
              )}

              {/* CAMERA MODE */}
              {mode === 'camera' && (
                <>
                  {!isCameraActive && isModelsLoaded && (
                    <div style={{ position: 'absolute', zIndex: 10, color: 'var(--echo-text-muted)' }}>Starting camera...</div>
                  )}
                  <video
                    ref={videoRef}
                    onPlay={handleVideoPlay}
                    autoPlay
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isCameraActive ? 1 : 0, transition: 'opacity 0.3s' }}
                  />
                </>
              )}

              {/* UPLOAD MODE */}
              {mode === 'upload' && (
                <>
                  {!imageUrl && isModelsLoaded && (
                    <div style={{ textAlign: 'center', color: 'var(--echo-text-muted)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                      <p style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>Select a clear photo of your face</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                      />
                      <button 
                        className="btn-secondary" 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                  {imageUrl && (
                    <>
                      <img 
                        ref={imageRef} 
                        src={imageUrl} 
                        onLoad={handleImageLoad} 
                        alt="Uploaded face" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                      <button 
                        onClick={() => { setImageUrl(null); setDetectedMood(null); setStatus('Please upload an image.'); }}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                      >
                        ✕ Remove
                      </button>
                    </>
                  )}
                </>
              )}
              
              {/* STATUS BADGE */}
              {(isCameraActive || imageUrl) && (
                <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {status}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/mood-tracker" style={{ textDecoration: 'none', flex: 1 }}>
              <button className="btn-secondary" style={{ width: '100%' }}>Cancel</button>
            </Link>
            <button 
              className="btn-primary" 
              disabled={!detectedMood || (!isCameraActive && !imageUrl)} 
              onClick={handleSaveMood}
              style={{ flex: 1, opacity: (!detectedMood || (!isCameraActive && !imageUrl)) ? 0.5 : 1, cursor: (!detectedMood || (!isCameraActive && !imageUrl)) ? 'not-allowed' : 'pointer' }}
            >
              Save Mood
            </button>
          </div>
          
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
