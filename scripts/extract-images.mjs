// ES Module script to extract recipe images
import pkg from 'pg';
const { Pool } = pkg;
import * as cheerio from 'cheerio';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_67DItWScqmfz@ep-crimson-lab-aesmpdt3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

// Image extraction function (simplified version)
async function extractRecipeImage(recipeUrl) {
  try {
    console.log(`  Scraping: ${recipeUrl}`);

    const response = await fetch(recipeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try OpenGraph first
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      const finalUrl = ogImage.startsWith('http') ? ogImage : new URL(ogImage, recipeUrl).href;
      console.log(`  ✅ Found OG image: ${finalUrl}`);
      return finalUrl;
    }

    // Try JSON-LD structured data
    let foundImage = null;
    $('script[type="application/ld+json"]').each((_, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '');
        const recipes = Array.isArray(jsonData) ? jsonData : [jsonData];

        for (const recipe of recipes) {
          if (recipe['@type'] === 'Recipe' && recipe.image) {
            const images = Array.isArray(recipe.image) ? recipe.image : [recipe.image];
            const imageUrl = typeof images[0] === 'string' ? images[0] : images[0]?.url;
            if (imageUrl) {
              foundImage = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, recipeUrl).href;
              console.log(`  ✅ Found JSON-LD image: ${foundImage}`);
              return false; // break out of each loop
            }
          }
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    });

    if (foundImage) return foundImage;

    console.log(`  ❌ No image found`);
    return null;

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🍽️  Starting recipe image extraction for IDs 1-10...\n');

  try {
    // Get recipes 1-10
    const result = await pool.query(`
      SELECT id, title, source_url
      FROM recipes
      WHERE id BETWEEN 1 AND 10
        AND source_url IS NOT NULL
        AND source_url != '#'
      ORDER BY id
    `);

    const recipes = result.rows;
    console.log(`Found ${recipes.length} recipes to process\n`);

    for (const recipe of recipes) {
      console.log(`Recipe ${recipe.id}: ${recipe.title}`);

      if (!recipe.source_url || recipe.source_url === '#') {
        console.log(`  ⏭️  Skipping - no valid source URL\n`);
        continue;
      }

      try {
        const imageUrl = await extractRecipeImage(recipe.source_url);

        if (imageUrl) {
          // Update database
          await pool.query(`
            UPDATE recipes
            SET image_url = $1
            WHERE id = $2
          `, [imageUrl, recipe.id]);

          console.log(`  💾 Updated database\n`);
        } else {
          console.log(`  ⏭️  No image to save\n`);
        }

        // Be respectful - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }

    console.log('✨ Extraction completed!');

  } catch (error) {
    console.error('❌ Script error:', error);
  } finally {
    await pool.end();
  }
}

main();