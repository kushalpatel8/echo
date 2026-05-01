'use client';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';

interface FaceMoodDetectorProps {
  onMoodDetected: (mood: string, confidence: number) => void;
  onClose: () => void;
}

export default function FaceMoodDetector({ onMoodDetected, onClose }: FaceMoodDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Loading AI Models...');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelsLoaded(true);
        setStatus('Models loaded. Starting camera...');
        startCamera();
      } catch (err) {
        setError('Failed to load AI models.');
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
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current || !canvasRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        
        // Find the dominant expression
        let dominantExpression = '';
        let maxProbability = 0;
        
        for (const [expression, probability] of Object.entries(expressions)) {
          if (probability > maxProbability) {
            maxProbability = probability;
            dominantExpression = expression;
          }
        }

        // Map face-api expressions to our Moods
        // face-api expressions: neutral, happy, sad, angry, fearful, disgusted, surprised
        let mappedMood = 'Neutral';
        if (dominantExpression === 'happy') mappedMood = 'Radiant';
        else if (dominantExpression === 'neutral') mappedMood = 'Calm';
        else if (dominantExpression === 'sad') mappedMood = 'Distressed';
        else if (dominantExpression === 'angry') mappedMood = 'Critical';
        else if (dominantExpression === 'fearful') mappedMood = 'Uneasy';
        else if (dominantExpression === 'disgusted') mappedMood = 'Uneasy';
        else if (dominantExpression === 'surprised') mappedMood = 'Neutral';

        // Only trigger if confidence is high enough
        if (maxProbability > 0.6) {
          setStatus(`Detected: ${mappedMood} (${(maxProbability * 100).toFixed(0)}%)`);
          // Automatically use this mood after a few consistent detections or let user confirm
          // For now, we will pass it back but wait for user to click "Confirm"
        }
      } else {
        setStatus('No face detected. Please face the camera.');
      }
    }, 500);
  };

  const mapCurrentMood = async () => {
    if (!videoRef.current) return;
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections) {
      const expressions = detections.expressions;
      let dominantExpression = '';
      let maxProbability = 0;
      
      for (const [expression, probability] of Object.entries(expressions)) {
        if (probability > maxProbability) {
          maxProbability = probability;
          dominantExpression = expression;
        }
      }

      let mappedMood = 'Neutral';
      if (dominantExpression === 'happy') mappedMood = 'Radiant';
      else if (dominantExpression === 'neutral') mappedMood = 'Calm';
      else if (dominantExpression === 'sad') mappedMood = 'Distressed';
      else if (dominantExpression === 'angry') mappedMood = 'Critical';
      else if (dominantExpression === 'fearful') mappedMood = 'Uneasy';
      else if (dominantExpression === 'disgusted') mappedMood = 'Uneasy';
      else if (dominantExpression === 'surprised') mappedMood = 'Neutral';

      let score = 5;
      if (mappedMood === 'Radiant') score = 9;
      else if (mappedMood === 'Calm') score = 7;
      else if (mappedMood === 'Neutral') score = 5;
      else if (mappedMood === 'Uneasy') score = 4;
      else if (mappedMood === 'Distressed') score = 3;
      else if (mappedMood === 'Critical') score = 1;

      onMoodDetected(mappedMood, score);
    } else {
      alert("No face detected! Please ensure your face is clearly visible.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Face Analysis</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-4">
            {error}
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video mb-4 flex items-center justify-center">
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-gray-500 dark:text-gray-400">
                <svg className="animate-spin h-8 w-8 mb-2 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium">{status}</p>
              </div>
            )}
            <video
              ref={videoRef}
              onPlay={handleVideoPlay}
              autoPlay
              muted
              className={`w-full h-full object-cover ${!isCameraActive ? 'opacity-0' : 'opacity-100'}`}
              style={{ transform: 'scaleX(-1)' }} // Mirror the video
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            
            {isCameraActive && (
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-md rounded-lg p-2 text-center text-white text-xs font-medium border border-white/10">
                {status}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={mapCurrentMood}
            disabled={!isCameraActive || !!error}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm text-white transition-all ${
              !isCameraActive || !!error 
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none'
            }`}
          >
            Capture Mood
          </button>
        </div>
      </div>
    </div>
  );
}
