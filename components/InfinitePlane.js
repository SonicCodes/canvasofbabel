"use client";

import { useCallback, useEffect, useRef } from "react";

// Deterministic 2D integer hash -> uint32
function hash2d(ix, iy) {
  // Convert to string to preserve negative coordinates uniquely
  const key = `${ix},${iy}`;
  let h = 0x811C9DC5; // FNV offset basis
  
  // Hash the string representation
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);
  }
  
  // Additional mixing based on the actual coordinates
  h = Math.imul(h ^ ix, 0x01000193);
  h = Math.imul(h ^ iy, 0x01000193);
  
  // final avalanche
  h ^= h >>> 16;
  h = Math.imul(h, 0x7FEB352D);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846CA68B);
  h ^= h >>> 16;
  return h >>> 0;
}

// Simple seeded PRNG (Mulberry32)
function createRng(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export default function InfinitePlane({ tileSize = 256 }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const tileCache = useRef(new Map());

  // Generate a tile
  const generateTile = useCallback((ix, iy) => {
    const key = `${ix}:${iy}`;
    if (tileCache.current.has(key)) {
      return tileCache.current.get(key);
    }

    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(tileSize, tileSize);
    const data = imageData.data;
    const seed = hash2d(ix, iy);
    const rng = createRng(seed);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(rng() * 256);     // R
      data[i + 1] = Math.floor(rng() * 256); // G
      data[i + 2] = Math.floor(rng() * 256); // B
      data[i + 3] = 255;                     // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Cache cleanup
    if (tileCache.current.size > 100) {
      const firstKey = tileCache.current.keys().next().value;
      tileCache.current.delete(firstKey);
    }
    
    tileCache.current.set(key, canvas);
    return canvas;
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
        const tile = generateTile(ix, iy);
        const x = ix * tileSize - offsetRef.current.x;
        const y = iy * tileSize - offsetRef.current.y;
        ctx.drawImage(tile, x, y);
      }
    }
  }, [tileSize, generateTile]);

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
    e.currentTarget.style.cursor = 'grab';
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    offsetRef.current.x += e.deltaX;
    offsetRef.current.y += e.deltaY;
    draw();
  }, [draw]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        cursor: 'grab',
        touchAction: 'none'
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
    </div>
  );
}