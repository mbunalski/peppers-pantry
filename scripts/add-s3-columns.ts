// Script to add S3 columns to recipes table
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_67DItWScqmfz@ep-crimson-lab-aesmpdt3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function addS3Columns() {
  try {
    console.log('Adding S3 columns to recipes table...');

    await pool.query(`
      ALTER TABLE recipes
      ADD COLUMN IF NOT EXISTS s3_thumbnail_url TEXT,
      ADD COLUMN IF NOT EXISTS s3_medium_url TEXT,
      ADD COLUMN IF NOT EXISTS s3_large_url TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    `);

    console.log('✅ S3 columns added successfully');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

addS3Columns();