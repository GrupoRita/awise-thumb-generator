const { generateThumbnail } = require('./generate-orange');
const fs = require('fs').promises;

async function batchGenerate() {
  // Read from a text file (one item per line)
  const content = await fs.readFile('campanhas.txt', 'utf-8');
  const items = content.split('\n').filter(line => line.trim());

  console.log(`📋 Generating ${items.length} thumbnails...\n`);

  for (const item of items) {
    await generateThumbnail(item.trim());
    console.log('---');
  }

  console.log('\n🎉 All thumbnails generated!');
}

batchGenerate();