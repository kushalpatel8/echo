'use client';
import { useRef, useEffect, useState } from 'react';

export default function ZenGarden() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set dimensions
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 400;
        // Init sand background
        context.fillStyle = '#e5e7eb'; // Light grey sand
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add sand texture (grainy effect)
        for(let i = 0; i < 5000; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          context.fillStyle = 'rgba(212, 212, 212, 0.5)';
          context.fillRect(x, y, 1, 1);
        }
      }
    };

    resize();
    setCtx(context);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if(ctx) ctx.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'; // Shadow of the rake

    // Create rake effect (multi-line)
    const offsets = [-10, -5, 0, 5, 10];
    offsets.forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(x + offset, y);
      ctx.lineTo(x + offset, y);
      ctx.stroke();
    });
  };

  const clearGarden = () => {
    if(!ctx || !canvasRef.current) return;
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    for(let i = 0; i < 5000; i++) {
       const x = Math.random() * canvasRef.current.width;
       const y = Math.random() * canvasRef.current.height;
       ctx.fillStyle = 'rgba(212, 212, 212, 0.5)';
       ctx.fillRect(x, y, 1, 1);
    }
  };

  return (
    <div className="echo-card animate-fade-in-up" style={{ textAlign: 'center', background: 'var(--echo-surface-2)', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem' }}>Zen Sand Garden</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--echo-text-muted)' }}>Slowly rake the sand to create calming patterns.</p>
        </div>
        <button className="btn-secondary" onClick={clearGarden} style={{ fontSize: '0.8125rem' }}>Reset Sand</button>
      </div>
      <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '8px solid #d1d5db', boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1)', cursor: 'crosshair', background: '#e5e7eb' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={endDrawing}
          onTouchMove={draw}
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--echo-text-muted)' }}>Tip: Try drawing slow circular or wavy patterns.</p>
    </div>
  );
}
