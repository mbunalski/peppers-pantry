// ES Module script to migrate existing recipe images to S3
import { Pool } from 'pg';
import { processAndUploadImage } from '../src/lib/s3-image-processor';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_67DItWScqmfz@ep-crimson-lab-aesmpdt3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function main() {
  console.log('🍽️  Starting S3 migration for recipe images...\n');

  try {
    // Get ALL recipes with image_url but without s3 URLs
    const result = await pool.query(`
      SELECT id, title, image_url
      FROM recipes
      WHERE image_url IS NOT NULL
        AND image_url != ''
        AND (s3_thumbnail_url IS NULL OR s3_medium_url IS NULL OR s3_large_url IS NULL)
      ORDER BY id
    `);

    const recipes = result.rows;
    console.log(`Found ${recipes.length} recipes to migrate\n`);

    if (recipes.length === 0) {
      console.log('✅ No recipes need migration');
      return;
    }

    for (const recipe of recipes) {
      console.log(`Recipe ${recipe.id}: ${recipe.title}`);
      console.log(`  Original URL: ${recipe.image_url}`);

      try {
        const processedImages = await processAndUploadImage(recipe.image_url, recipe.id);

        if (processedImages) {
          // Update database with S3 URLs
          await pool.query(`
            UPDATE recipes
            SET s3_thumbnail_url = $1,
                s3_medium_url = $2,
                s3_large_url = $3,
                updated_at = NOW()
            WHERE id = $4
          `, [
            processedImages.thumbnailUrl,
            processedImages.mediumUrl,
            processedImages.largeUrl,
            recipe.id
          ]);

          console.log(`  ✅ Migrated successfully`);
          console.log(`     - Thumbnail: ${processedImages.thumbnailUrl}`);
          console.log(`     - Medium: ${processedImages.mediumUrl}`);
          console.log(`     - Large: ${processedImages.largeUrl}`);
        } else {
          console.log(`  ❌ Failed to process image`);
        }

        // Be respectful - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }

      console.log('');
    }

    console.log('✨ S3 migration completed!');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await pool.end();
  }
}

main();