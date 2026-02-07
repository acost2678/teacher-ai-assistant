// Save as: app/api/coloring-page/convert/route.js

import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image')
    const lineThickness = formData.get('lineThickness') || 'medium'
    const complexity = formData.get('complexity') || 'medium'

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Settings based on line thickness
    const edgeSettings = {
      thin: { sigma: 0.5, threshold: 30 },
      medium: { sigma: 1, threshold: 40 },
      thick: { sigma: 1.5, threshold: 50 }
    }

    const settings = edgeSettings[lineThickness] || edgeSettings.medium

    // Process image to create coloring page effect
    // 1. Convert to grayscale
    // 2. Apply edge detection using Laplacian/Sobel-like effect
    // 3. Invert to get black lines on white background
    // 4. Increase contrast to make lines clearer

    const processedImage = await sharp(buffer)
      // Resize if too large (keep aspect ratio)
      .resize(1200, 1200, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      // Convert to grayscale
      .grayscale()
      // Apply edge detection effect using convolution
      .convolve({
        width: 3,
        height: 3,
        kernel: [
          -1, -1, -1,
          -1,  8, -1,
          -1, -1, -1
        ]
      })
      // Negate to get black lines on white
      .negate()
      // Normalize to increase contrast
      .normalize()
      // Apply threshold to create clean black and white
      .threshold(settings.threshold)
      // Ensure it's black lines on white background
      .flatten({ background: '#ffffff' })
      // Output as PNG
      .png()
      .toBuffer()

    // Return the processed image
    return new NextResponse(processedImage, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="coloring_page.png"'
      }
    })

  } catch (error) {
    console.error('Image conversion error:', error)
    return NextResponse.json({ error: 'Failed to convert image' }, { status: 500 })
  }
}