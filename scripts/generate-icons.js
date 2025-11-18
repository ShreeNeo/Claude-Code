const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../src/assets/icons/clock-icon.svg');
const outputDir = path.join(__dirname, '../src/assets/icons');

const sizes = [
  { size: 16, name: 'icon16.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' }
];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('🎨 Generating extension icons...\n');

  for (const { size, name } of sizes) {
    const outputPath = path.join(outputDir, name);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size}) - ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);
