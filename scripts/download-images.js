const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const images = [
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    filename: 'kuta-garage.jpg',
    width: 1350,
    height: 900
  },
  {
    url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    filename: 'seminyak-garage.jpg',
    width: 1350,
    height: 900
  },
  {
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    filename: 'ubud-garage.jpg',
    width: 1350,
    height: 900
  }
];

const downloadImage = (url, filename, width, height) => {
  return new Promise((resolve, reject) => {
    const tempFilepath = path.join(__dirname, '../public/images/garages', `temp-${filename}`);
    const finalFilepath = path.join(__dirname, '../public/images/garages', filename);
    const file = fs.createWriteStream(tempFilepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', async () => {
        file.close();
        try {
          // Optimize image using sharp
          await sharp(tempFilepath)
            .resize(width, height, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 80, progressive: true })
            .toFile(finalFilepath);

          // Remove temporary file
          fs.unlinkSync(tempFilepath);
          console.log(`Downloaded and optimized ${filename}`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      fs.unlink(tempFilepath, () => {}); // Delete the temp file if there's an error
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  try {
    // Create directory if it doesn't exist
    const dir = path.join(__dirname, '../public/images/garages');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create README.md in the garages directory
    const readmeContent = `# Garage Images

This directory contains optimized images for the garage spaces.

## Image Specifications
- Format: JPEG
- Quality: 80%
- Progressive: Yes
- Dimensions: 1350x900px
- Optimization: Yes (using Sharp)

## Images
- kuta-garage.jpg: Kuta Garage Space
- seminyak-garage.jpg: Seminyak Garage Space
- ubud-garage.jpg: Ubud Garage Space

## Usage
These images are used in:
- Home page location cards
- Garage listings
- Booking history
`;
    fs.writeFileSync(path.join(dir, 'README.md'), readmeContent);

    // Download all images
    for (const image of images) {
      await downloadImage(image.url, image.filename, image.width, image.height);
    }
    console.log('All images downloaded and optimized successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
    process.exit(1);
  }
};

downloadAllImages(); 