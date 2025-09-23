import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: 'us-east-1'
  // Using default credential provider chain (AWS CLI, env vars, IAM roles, etc.)
});

const BUCKET_NAME = 'peppers-pantry-recipe-images';

interface ProcessedImages {
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

export async function processAndUploadImage(
  imageUrl: string,
  recipeId: number
): Promise<ProcessedImages | null> {
  try {
    console.log(`Processing image for recipe ${recipeId}: ${imageUrl}`);

    // Download the original image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PeppersPantry/1.0)',
      },
      timeout: 15000,
    });

    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Process images in parallel
    const [thumbnailBuffer, mediumBuffer, largeBuffer] = await Promise.all([
      // Thumbnail: 150x150 square, cropped from center
      sharp(buffer)
        .resize(150, 150, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toBuffer(),

      // Medium: 400x300, maintains aspect ratio
      sharp(buffer)
        .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer(),

      // Large: 800x600, maintains aspect ratio
      sharp(buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer()
    ]);

    // Upload to S3 in parallel
    const uploadPromises = [
      uploadToS3(thumbnailBuffer, `thumbnails/recipe-${recipeId}.webp`, 'image/webp'),
      uploadToS3(mediumBuffer, `medium/recipe-${recipeId}.webp`, 'image/webp'),
      uploadToS3(largeBuffer, `large/recipe-${recipeId}.webp`, 'image/webp')
    ];

    await Promise.all(uploadPromises);

    const baseUrl = `https://${BUCKET_NAME}.s3.amazonaws.com`;

    return {
      thumbnailUrl: `${baseUrl}/thumbnails/recipe-${recipeId}.webp`,
      mediumUrl: `${baseUrl}/medium/recipe-${recipeId}.webp`,
      largeUrl: `${baseUrl}/large/recipe-${recipeId}.webp`
    };

  } catch (error) {
    console.error(`Error processing image for recipe ${recipeId}:`, error);
    return null;
  }
}

async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'max-age=31536000', // 1 year cache
    Metadata: {
      'uploaded-by': 'peppers-pantry-migration',
      'upload-date': new Date().toISOString()
    }
  });

  await s3Client.send(command);
  console.log(`Uploaded: ${key}`);
}

export async function deleteImageFromS3(recipeId: number): Promise<void> {
  // Helper function to delete images if needed
  const keys = [
    `thumbnails/recipe-${recipeId}.webp`,
    `medium/recipe-${recipeId}.webp`,
    `large/recipe-${recipeId}.webp`
  ];

  // Implementation for cleanup if needed later
  console.log(`Would delete keys: ${keys.join(', ')}`);
}