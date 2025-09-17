"use client";

import { useEffect, useRef } from "react";

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

export default function NoiseTile({ seed = 0, size = 128, scale = 1, mode = "rgb", opacity = 0.8 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    // Handle device pixel ratio for crisp rendering
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const displaySize = size;
    const pixelSize = Math.max(1, Math.floor(scale));
    const width = displaySize;
    const height = displaySize;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rng = createRng(seed);

    // Generate noise
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Optionally group pixels by pixelSize for blocky look
        const rx = Math.floor(x / pixelSize);
        const ry = Math.floor(y / pixelSize);
        const idx = (y * width + x) * 4;
        if (mode === "rgb") {
          const r = Math.floor(rng() * 256);
          const g = Math.floor(rng() * 256);
          const b = Math.floor(rng() * 256);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        } else {
          const value = Math.floor(rng() * 256);
          data[idx] = value; // R
          data[idx + 1] = value; // G
          data[idx + 2] = value; // B
          data[idx + 3] = 255; // A
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, [seed, size, scale, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", width: size, height: size, opacity }}
    />
  );
}


