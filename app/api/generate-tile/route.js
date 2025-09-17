import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { createClient } from 'redis';

// Configure FAL client
fal.config({
  credentials: "7550f1a8-fc37-4122-a417-2f6a6701d267:d3779dd34fdeb5b2c1e34d0656675fee"
});


// Create Redis client
const redis = createClient({
  username: 'default',
  password: 'v3MEAiONY4JEY0lVN3Ko6ytCJrf7I2ih',
  socket: {
      host: 'redis-11678.c38605.us-east-1-mz.ec2.cloud.rlrcp.com',
      port: 11678
  }
});

redis.on('error', err => console.log('Redis Client Error', err));

// Connect to Redis if not already connected
async function ensureRedisConnection() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const seed = searchParams.get("seed");
    
    if (!seed) {
      return NextResponse.json({ error: "Seed parameter is required" }, { status: 400 });
    }

    // Ensure Redis is connected
    await ensureRedisConnection();

    // Check Redis cache first
    const cacheKey = `tile:${seed}`;
    const cachedUrl = await redis.get(cacheKey);
    
    if (cachedUrl) {
      console.log(`Redis cache hit for seed: ${seed}`);
      return NextResponse.json({ 
        imageUrl: cachedUrl,
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
    
    // Cache in Redis with 30 day expiration
    await redis.set(cacheKey, imageUrl, {
      EX: 60 * 60 * 24 * 30 // 30 days in seconds
    });
    
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