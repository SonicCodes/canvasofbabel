import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

// Configure FAL client
fal.config({
  credentials: "7550f1a8-fc37-4122-a417-2f6a6701d267:d3779dd34fdeb5b2c1e34d0656675fee"
});

// In-memory cache (in production, use Redis or similar)
const imageCache = new Map();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const seed = searchParams.get("seed");
    
    if (!seed) {
      return NextResponse.json({ error: "Seed parameter is required" }, { status: 400 });
    }

    // Check cache first
    if (imageCache.has(seed)) {
      console.log(`Cache hit for seed: ${seed}`);
      return NextResponse.json({ 
        imageUrl: imageCache.get(seed),
        cached: true 
      });
    }

    console.log(`Generating new image for seed: ${seed}`);
    
    // Generate image with FAL
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "",
        num_inference_steps: 4,
        image_size: "square", // 1024x1024
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
        output_format: "jpeg",
        seed: parseInt(seed)
      }
    });

    const imageUrl = result.data.images[0].url;
    
    // Cache the result
    imageCache.set(seed, imageUrl);
    
    // Optionally limit cache size
    if (imageCache.size > 1000) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }

    return NextResponse.json({ 
      imageUrl,
      cached: false 
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error.message },
      { status: 500 }
    );
  }
}
