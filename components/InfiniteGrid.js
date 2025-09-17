"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const NoiseTile = dynamic(() => import("./NoiseTile"), { ssr: false });

export default function InfiniteGrid({ tileSize = 160, batchSize = 100, layers = 3 }) {
  const [seeds, setSeeds] = useState(() => {
    const arr = [];
    for (let i = 1; i <= batchSize; i++) arr.push(i);
    return arr;
  });
  const nextSeedRef = useRef(batchSize + 1);
  const sentinelRef = useRef(null);
  const sentinelRightRef = useRef(null);
  const contentRef = useRef(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const start = nextSeedRef.current;
    const end = start + batchSize;
    const more = [];
    for (let s = start; s < end; s++) more.push(s);
    nextSeedRef.current = end;
    setSeeds((prev) => [...prev, ...more]);
    loadingRef.current = false;
  }, [batchSize]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore();
          }
        }
      },
      { rootMargin: "800px 0px 800px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Horizontal scroll container detection
  useEffect(() => {
    const el = sentinelRightRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadMore();
          }
        }
      },
      { rootMargin: "0px 800px 0px 800px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const containerStyle = {
    position: "relative",
    minHeight: "100vh",
    width: "100vw",
    overflow: "auto",
  };

  const numCols = useMemo(() => Math.max(8, Math.ceil(Math.sqrt(seeds.length))), [seeds.length]);

  const gridStyle = {
    position: "relative",
    display: "grid",
    gridAutoFlow: "dense",
    gridTemplateColumns: `repeat(${numCols}, ${tileSize}px)`,
    gridAutoRows: `${tileSize}px`,
    gap: "0px",
    padding: "0px",
    width: "fit-content",
    boxSizing: "border-box",
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "var(--background)",
    color: "var(--foreground)",
  };

  const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "12px 16px",
    background: "linear-gradient(var(--background), color-mix(in srgb, var(--background), transparent 60%))",
    borderBottom: "1px solid color-mix(in srgb, var(--foreground), transparent 85%)",
    backdropFilter: "blur(4px)",
  };

  const titleStyle = { margin: 0, fontSize: 16, opacity: 0.9 };

  // Precompute layer offsets and opacities
  const layerConfigs = useMemo(() => {
    const configs = [];
    for (let i = 0; i < layers; i++) {
      configs.push({
        dx: (i * tileSize) / 3,
        dy: (i * tileSize) / 4,
        opacity: Math.max(0.25, 0.6 - i * 0.1),
      });
    }
    return configs;
  }, [layers, tileSize]);

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <p style={titleStyle}>Infinite Image Babel — seeded noise tiles</p>
      </div>
      <div style={containerStyle}>
        {/* Base layer */}
        <div ref={contentRef} style={gridStyle}>
          {seeds.map((seed) => (
            <div key={`L0-${seed}`} style={{ width: tileSize, height: tileSize }}>
              <NoiseTile seed={seed} size={tileSize} mode="rgb" opacity={0.65} />
            </div>
          ))}
        </div>
        {/* Overlapping layers */}
        {layerConfigs.map((cfg, i) => (
          <div
            key={`layer-${i + 1}`}
            style={{
              ...gridStyle,
              position: "absolute",
              left: cfg.dx,
              top: cfg.dy,
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          >
            {seeds.map((seed) => (
              <div key={`L${i + 1}-${seed}`} style={{ width: tileSize, height: tileSize }}>
                <NoiseTile seed={seed * (i + 2)} size={tileSize} mode="rgb" opacity={cfg.opacity} />
              </div>
            ))}
          </div>
        ))}
        {/* Vertical and horizontal sentinels */}
        <div ref={sentinelRef} style={{ position: "absolute", left: 0, bottom: 0, width: 1, height: 1 }} />
        <div ref={sentinelRightRef} style={{ position: "absolute", right: 0, top: 0, width: 1, height: 1 }} />
      </div>
    </div>
  );
}


