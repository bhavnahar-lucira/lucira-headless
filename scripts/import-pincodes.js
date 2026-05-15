const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
// The path provided by the user
const csvPath = 'C:\\Users\\inter\\Downloads\\Pincodes_with_LatLong (1).csv';

async function importPincodes() {
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    console.log('Please ensure the file is at the correct path.');
    return;
  }

  if (!uri) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get database name from URI or use default
    const db = client.db("next_local_db");
    const collection = db.collection('pincodes');

    // Create index on pincode for faster upserts and unique constraint
    console.log('Creating index on pincode...');
    await collection.createIndex({ pincode: 1 }, { unique: true });

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isHeader = true;
    let batch = [];
    let totalProcessed = 0;
    let totalLines = 0;

    console.log('Starting import...');

    for await (const line of rl) {
      totalLines++;
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Simple CSV split (works for this data format)
      const values = trimmedLine.split(',');
      if (values.length < 3) continue;

      const pincode = values[0].trim();
      if (!pincode) continue;

      const pincodeData = {
        pincode: pincode,
        cod: values[1] ? values[1].trim().toLowerCase() === 'true' : false,
        upi: values[2] ? values[2].trim().toLowerCase() === 'true' : false,
        latitude: values[3] && values[3].trim() ? parseFloat(values[3]) : null,
        longitude: values[4] && values[4].trim() ? parseFloat(values[4]) : null,
        updatedAt: new Date()
      };

      batch.push({
        updateOne: {
          filter: { pincode: pincodeData.pincode },
          update: { $set: pincodeData },
          upsert: true
        }
      });

      if (batch.length >= 1000) {
        await collection.bulkWrite(batch);
        totalProcessed += batch.length;
        console.log(`Imported ${totalProcessed} pincodes (line ${totalLines})...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await collection.bulkWrite(batch);
      totalProcessed += batch.length;
    }

    console.log('-----------------------------------');
    console.log(`Import completed successfully!`);
    console.log(`Total records processed: ${totalProcessed}`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await client.close();
  }
}

importPincodes();
