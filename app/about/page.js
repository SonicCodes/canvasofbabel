"use client";

import Link from "next/link";

export default function About() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: 'monospace',
      padding: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        lineHeight: '1.8'
      }}>
        <Link 
          href="/"
          style={{
            color: '#fff',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '40px',
            padding: '8px 16px',
            border: '1px solid #fff',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#fff';
            e.target.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#fff';
          }}
        >
          ← back to canvas
        </Link>

        <h1 style={{
          fontSize: '36px',
          marginBottom: '40px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          The Canvas of Babel v2
        </h1>

        <div style={{ fontSize: '16px', marginBottom: '30px' }}>
          <p style={{ marginBottom: '20px' }}>
            Inspired by Jorge Luis Borges&apos; &quot;The Library of Babel&quot; and{' '}
            <a 
              href="https://www.canvasofbabel.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#fff', textDecoration: 'underline' }}
            >
              Will Depue&apos;s original CanvasofBabel.com
            </a>, 
            The Canvas of Babel v2 extends this concept to real distribution from diffusion models.
          </p>

          <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '20px' }}>
            Why AI Generation?
          </h2>

          <p style={{ marginBottom: '20px' }}>
            The original Canvas of Babel generates random pixel noise for each coordinate. While philosophically 
            interesting, pure noise rarely produces meaningful images. The probability of randomly generating 
            even a simple recognizable shape is astronomically low.
          </p>

          <p style={{ marginBottom: '20px' }}>
            By using a diffusion model (FLUX.1), we sample from the actual distribution of &quot;possible images&quot; 
            rather than pure randomness. Each coordinate still maps to a unique, deterministic image through 
            its seed, but now these images exist within the learned manifold of visual meaning.
          </p>

          <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '20px' }}>
            The Infinite Plane
          </h2>

          <p style={{ marginBottom: '20px' }}>
            Every position (x, y) on this infinite canvas corresponds to a unique image. The same coordinate 
            will always show the same image, creating a stable, explorable universe of visual possibilities. 
            You&apos;re not just viewing random images—you&apos;re navigating a deterministic space where every image 
            has always existed at its specific location, waiting to be discovered.
          </p>

          <p style={{ marginBottom: '20px' }}>
            Somewhere in this plane exists every possible image: every photograph that could be taken, every 
            artwork that could be created, every moment that could be captured. The challenge is finding them 
            in the vastness of the infinite canvas.
          </p>

          <h2 style={{ fontSize: '24px', marginTop: '40px', marginBottom: '20px' }}>
            Technical Implementation
          </h2>

          <p style={{ marginBottom: '20px' }}>
            • Each tile position is hashed to create a deterministic seed<br/>
            • Seeds are passed to FLUX.1 [schnell] with an empty prompt<br/>
            • Generated images are cached to ensure consistency and reduce costs<br/>
            • The canvas extends infinitely in all directions
          </p>

          <p style={{ marginTop: '40px', fontStyle: 'italic', opacity: 0.8 }}>
            &quot;The universe (which others call the Canvas) is composed of an indefinite, perhaps infinite, 
            number of hexagonal galleries...&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
