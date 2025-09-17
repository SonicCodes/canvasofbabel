"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Deterministic 2D integer hash -> uint32
function hash2d(ix, iy) {
  let h = 0x811C9DC5; // FNV offset basis
  h = Math.imul(h ^ (ix | 0), 0x01000193);
  h = Math.imul(h ^ (iy | 0), 0x01000193);
  // final avalanche
  h ^= h >>> 16;
  h = Math.imul(h, 0x7FEB352D);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846CA68B);
  h ^= h >>> 16;
  return h >>> 0;
}

export default function InfinitePlaneWithFal({ tileSize = 256 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const tileCache = useRef(new Map());
  const loadingTiles = useRef(new Set());
  const [loading, setLoading] = useState(true);

  // Load a tile image from FAL API
  const loadTileImage = useCallback(async (ix, iy) => {
    const key = `${ix}:${iy}`;
    
    // Check if already cached
    if (tileCache.current.has(key)) {
      return tileCache.current.get(key);
    }
    
    // Check if already loading
    if (loadingTiles.current.has(key)) {
      return null;
    }
    
    loadingTiles.current.add(key);
    
    try {
      const seed = hash2d(ix, iy);
      const response = await fetch(`/api/generate-tile?seed=${seed}`);
      const data = await response.json();
      
      if (data.imageUrl) {
        // Load the image
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = data.imageUrl;
        });
        
        // Create canvas for the tile
        const canvas = document.createElement('canvas');
        canvas.width = tileSize;
        canvas.height = tileSize;
        const ctx = canvas.getContext('2d');
        
        // Draw and scale the image to fit the tile
        ctx.drawImage(img, 0, 0, tileSize, tileSize);
        
        tileCache.current.set(key, canvas);
        loadingTiles.current.delete(key);
        
        // Trigger redraw
        requestAnimationFrame(() => draw());
        
        return canvas;
      }
    } catch (error) {
      console.error(`Failed to load tile ${key}:`, error);
      loadingTiles.current.delete(key);
    }
    
    return null;
  }, [tileSize]);

  // Draw placeholder for loading tiles
  const drawPlaceholder = useCallback((ctx, x, y) => {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, tileSize, tileSize);
    
    // Draw loading indicator
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading...', x + tileSize/2, y + tileSize/2);
  }, [tileSize]);

  // Draw the infinite plane
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Set canvas size if needed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Calculate visible tiles
    const startX = Math.floor(offsetRef.current.x / tileSize) - 1;
    const startY = Math.floor(offsetRef.current.y / tileSize) - 1;
    const endX = Math.ceil((offsetRef.current.x + width) / tileSize) + 1;
    const endY = Math.ceil((offsetRef.current.y + height) / tileSize) + 1;
    
    // Draw tiles
    for (let iy = startY; iy < endY; iy++) {
      for (let ix = startX; ix < endX; ix++) {
        const x = ix * tileSize - offsetRef.current.x;
        const y = iy * tileSize - offsetRef.current.y;
        
        const key = `${ix}:${iy}`;
        const tile = tileCache.current.get(key);
        
        if (tile) {
          ctx.drawImage(tile, x, y);
        } else {
          drawPlaceholder(ctx, x, y);
          // Trigger loading
          loadTileImage(ix, iy);
        }
      }
    }
    
    setLoading(false);
  }, [tileSize, drawPlaceholder, loadTileImage]);

  // Setup and initial draw
  useEffect(() => {
    draw();
    
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Mouse/touch handlers
  const handlePointerDown = useCallback((e) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: offsetRef.current.x,
      offsetY: offsetRef.current.y
    };
    e.currentTarget.style.cursor = 'grabbing';
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    offsetRef.current.x = dragRef.current.offsetX - dx;
    offsetRef.current.y = dragRef.current.offsetY - dy;
    
    draw();
  }, [draw]);

  const handlePointerUp = useCallback((e) => {
    dragRef.current.active = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    offsetRef.current.x += e.deltaX;
    offsetRef.current.y += e.deltaY;
    draw();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none',
        background: '#000'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '18px',
          fontFamily: 'monospace'
        }}>
          Initializing Canvas of Babel v2...
        </div>
      )}
      
      {/* Title Overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <h1 style={{
          color: '#fff',
          fontSize: '48px',
          fontFamily: 'monospace',
          margin: 0,
          padding: '20px 40px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #fff',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          userSelect: 'none'
        }}>
          The Canvas of Babel v2
        </h1>
      </div>
      
      {/* Read More Link */}
      <a 
        href="/about"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          color: '#fff',
          fontSize: '16px',
          fontFamily: 'monospace',
          textDecoration: 'none',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #fff',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#fff';
          e.target.style.color = '#000';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.8)';
          e.target.style.color = '#fff';
        }}
      >
        read more
      </a>
    </div>
  );
}
