const fs = require('fs');
const path = require('path');

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to create a simple colored square PNG
function createSimplePNG(width, height, color, outputPath) {
  // Create a buffer for a simple PNG
  // PNG header (8 bytes)
  const header = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (13 bytes data + 12 bytes chunk wrapper)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0); // Width
  ihdrData.writeUInt32BE(height, 4); // Height
  ihdrData.writeUInt8(8, 8); // Bit depth
  ihdrData.writeUInt8(6, 9); // Color type (6 = RGBA)
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method
  
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // Length of IHDR data
    Buffer.from('IHDR'), // Chunk type
    ihdrData, // Chunk data
    Buffer.alloc(4) // CRC (we'll ignore it for simplicity)
  ]);
  
  // Parse the color
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Create a simple IDAT chunk with a single pixel
  // For simplicity, we'll create a very basic image with a single color
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    pixelData.push(0); // Filter type for this scanline
    for (let x = 0; x < width; x++) {
      pixelData.push(r, g, b, 255); // RGBA values
    }
  }
  
  const idatData = Buffer.from(pixelData);
  const idatChunk = Buffer.concat([
    Buffer.alloc(4), // Length (we'll ignore it for simplicity)
    Buffer.from('IDAT'), // Chunk type
    idatData, // Chunk data
    Buffer.alloc(4) // CRC (we'll ignore it for simplicity)
  ]);
  
  // IEND chunk
  const iendChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // Length
    Buffer.from('IEND'), // Chunk type
    Buffer.alloc(0), // No data
    Buffer.alloc(4) // CRC (we'll ignore it for simplicity)
  ]);
  
  // Combine all chunks
  const png = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  
  // Write to file
  fs.writeFileSync(outputPath, png);
  console.log(`Created ${outputPath}`);
}

// Create a simple 1x1 pixel PNG for testing
// This is just a placeholder - in a real app, you'd want proper icons
createSimplePNG(192, 192, '#4f46e5', path.join(iconsDir, 'icon-192x192.png'));
createSimplePNG(512, 512, '#4f46e5', path.join(iconsDir, 'icon-512x512.png'));

console.log('Icon generation complete!'); 