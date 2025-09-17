# Canvas of Babel v2

An infinite plane of AI-generated images, where every coordinate maps to a unique visual pulled from the latent space of diffusion models.

## Overview

Inspired by Jorge Luis Borges' "The Library of Babel" and Will Depue's original CanvasofBabel.com, Canvas of Babel v2 extends the concept from pure noise to meaningful images. By leveraging FLUX.1's diffusion model, each position in the infinite canvas generates a deterministic, explorable image rather than random pixels.

## Key Features

- **Infinite Navigation**: Pan endlessly in any direction using mouse drag or trackpad
- **Deterministic Generation**: Each (x,y) coordinate always produces the same image
- **Real Image Distribution**: Uses FLUX.1 [schnell] to sample from learned visual manifolds
- **Efficient Caching**: Server and client-side caching to minimize API calls and costs
- **Seamless Experience**: Progressive loading with placeholder tiles while images generate

## Technical Implementation

### Architecture
- **Frontend**: Next.js 15 with App Router, React 19
- **Image Generation**: FAL.ai API with FLUX.1 [schnell] model
- **Rendering**: HTML5 Canvas with dynamic tile loading
- **Caching**: In-memory server cache + client-side canvas cache

### How It Works
1. Each tile position (x,y) is hashed to create a unique seed
2. Seeds are sent to FLUX.1 with an empty prompt
3. Generated 1024x1024 images are cached and served
4. Client renders 256x256 tiles on an infinite canvas

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/canvasofbabelv2.git
cd canvasofbabelv2

# Install dependencies
npm install

# Set up your FAL.ai API key in app/api/generate-tile/route.js
# Get your key at https://fal.ai

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start exploring.

## Usage

- **Click and drag** to pan around the infinite canvas
- **Two-finger scroll** on trackpad for smooth navigation
- Click **"read more"** to learn about the concept
- Each tile takes ~1 second to generate on first load

## Philosophy

The original Canvas of Babel generated random noise - philosophically interesting but rarely meaningful. This v2 implementation uses diffusion models to sample from the distribution of "possible images," creating a space where every coordinate contains a discoverable, coherent image. Somewhere in this infinite plane exists every photograph that could be taken, every artwork that could be created, every moment that could be captured.

## Cost Considerations

- Each unique tile costs ~$0.003 to generate (1 megapixel at FAL.ai rates)
- Aggressive caching ensures each position is only generated once
- Consider implementing persistent storage (Redis, database) for production

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Credits

- Concept inspired by Jorge Luis Borges' "The Library of Babel"
- Original Canvas of Babel by [Will Depue](https://www.canvasofbabel.com/)
- Powered by [FAL.ai](https://fal.ai) and FLUX.1 [schnell]

## License

MIT

---

*"The universe (which others call the Canvas) is composed of an indefinite, perhaps infinite, number of hexagonal galleries..."* - Jorge Luis Borges